import { useState } from 'react'

const recentPayments = [
  { id: '1', from: 'John Smith', amount: 250.00, date: 'Sep 12, 2026', method: 'Card', status: 'completed', ref: 'INV-001' },
  { id: '2', from: 'Acme Corp', amount: 1500.00, date: 'Sep 10, 2026', method: 'Bank transfer', status: 'completed', ref: 'INV-002' },
  { id: '3', from: 'Jane Doe', amount: 89.99, date: 'Sep 8, 2026', method: 'Card', status: 'completed', ref: 'INV-003' },
  { id: '4', from: 'Tech Solutions Ltd', amount: 3200.00, date: 'Sep 5, 2026', method: 'Bank transfer', status: 'pending', ref: 'INV-004' },
]

const paymentLinks = [
  { id: '1', name: 'Website Services', amount: 500, created: 'Sep 1, 2026', uses: 3, active: true },
  { id: '2', name: 'Monthly Retainer', amount: 1200, created: 'Aug 15, 2026', uses: 1, active: true },
  { id: '3', name: 'Consultation Fee', amount: 150, created: 'Aug 1, 2026', uses: 5, active: false },
]

export default function MerchantPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'links' | 'payments'>('overview')
  const [showCreateLink, setShowCreateLink] = useState(false)
  const [linkName, setLinkName] = useState('')
  const [linkAmount, setLinkAmount] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const copyLink = (id: string) => {
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const totalRevenue = recentPayments.filter(p => p.status === 'completed').reduce((s, p) => s + p.amount, 0)

  return (
    <div className="p-6 max-w-4xl">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total received', value: `£${totalRevenue.toFixed(2)}`, color: '#3ecf6e', sub: 'This month' },
          { label: 'Pending', value: `£${recentPayments.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0).toFixed(2)}`, color: '#f59e0b', sub: `${recentPayments.filter(p => p.status === 'pending').length} payments` },
          { label: 'Active links', value: paymentLinks.filter(l => l.active).length.toString(), color: '#5b9cf6', sub: `${paymentLinks.reduce((s, l) => s + l.uses, 0)} total uses` },
        ].map(s => (
          <div key={s.label} className="rounded-2xl border p-4" style={{ backgroundColor: '#1e1e2d', borderColor: '#2a2a3d' }}>
            <p className="text-xs mb-2" style={{ color: '#5c5c72' }}>{s.label}</p>
            <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs mt-1" style={{ color: '#5c5c72' }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl mb-5 w-fit" style={{ backgroundColor: '#1e1e2d' }}>
        {([
          { key: 'overview', label: 'Overview' },
          { key: 'links', label: 'Payment links' },
          { key: 'payments', label: 'Received payments' },
        ] as const).map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{ backgroundColor: activeTab === tab.key ? '#2a2a3d' : 'transparent', color: activeTab === tab.key ? '#ffffff' : '#8a8a9e' }}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-2 gap-4">
          {[
            { icon: '🔗', title: 'Payment links', desc: 'Create shareable links to accept payments instantly', action: () => setActiveTab('links') },
            { icon: '💳', title: 'Card reader', desc: 'Accept in-person payments with a Revolut card reader', action: () => {} },
            { icon: '📧', title: 'Invoice', desc: 'Send professional invoices directly to your customers', action: () => {} },
            { icon: '🔄', title: 'Recurring payments', desc: 'Set up automatic subscription billing for customers', action: () => {} },
          ].map(item => (
            <button
              key={item.title}
              onClick={item.action}
              className="flex items-start gap-4 p-5 rounded-2xl border text-left transition-colors"
              style={{ backgroundColor: '#1e1e2d', borderColor: '#2a2a3d' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#252535' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#1e1e2d' }}
            >
              <span className="text-2xl">{item.icon}</span>
              <div>
                <p className="text-sm font-semibold text-white mb-1">{item.title}</p>
                <p className="text-xs" style={{ color: '#5c5c72' }}>{item.desc}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {activeTab === 'links' && (
        <>
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setShowCreateLink(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
              style={{ backgroundColor: '#ffffff', color: '#0e0e15' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#e8e8f0' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#ffffff' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" /><path d="M12 5v14" />
              </svg>
              Create payment link
            </button>
          </div>
          <div className="space-y-3">
            {paymentLinks.map(link => (
              <div key={link.id} className="flex items-center gap-4 p-4 rounded-2xl border"
                style={{ backgroundColor: '#1e1e2d', borderColor: '#2a2a3d' }}>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-white">{link.name}</p>
                    <span className="px-2 py-0.5 rounded-full text-xs"
                      style={{ backgroundColor: link.active ? 'rgba(62,207,110,0.15)' : 'rgba(92,92,114,0.2)', color: link.active ? '#3ecf6e' : '#5c5c72' }}>
                      {link.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-xs" style={{ color: '#5c5c72' }}>£{link.amount} · {link.uses} use{link.uses !== 1 ? 's' : ''} · Created {link.created}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyLink(link.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                    style={{ backgroundColor: '#2a2a3d', color: copiedId === link.id ? '#3ecf6e' : '#ccccdd' }}
                  >
                    {copiedId === link.id ? (
                      <>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Copied
                      </>
                    ) : (
                      <>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                        </svg>
                        Copy link
                      </>
                    )}
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                    style={{ backgroundColor: '#2a2a3d', color: '#ccccdd' }}>
                    Share
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === 'payments' && (
        <div className="rounded-2xl border overflow-hidden" style={{ borderColor: '#2a2a3d' }}>
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: '#1a1a28', borderBottom: '1px solid #2a2a3d' }}>
                {['From', 'Reference', 'Method', 'Date', 'Status', 'Amount'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium" style={{ color: '#5c5c72' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentPayments.map((p, i) => (
                <tr key={p.id} style={{ borderBottom: i < recentPayments.length - 1 ? '1px solid #1e1e2c' : 'none' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#191924' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}>
                  <td className="px-5 py-3 text-sm font-medium text-white">{p.from}</td>
                  <td className="px-5 py-3 text-sm" style={{ color: '#5c5c72' }}>{p.ref}</td>
                  <td className="px-5 py-3 text-sm" style={{ color: '#8a8a9e' }}>{p.method}</td>
                  <td className="px-5 py-3 text-sm" style={{ color: '#8a8a9e' }}>{p.date}</td>
                  <td className="px-5 py-3">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium capitalize"
                      style={{ backgroundColor: p.status === 'completed' ? 'rgba(62,207,110,0.15)' : 'rgba(245,158,11,0.15)', color: p.status === 'completed' ? '#3ecf6e' : '#f59e0b' }}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm font-semibold" style={{ color: '#3ecf6e' }}>+£{p.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create link modal */}
      {showCreateLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-md rounded-2xl border p-6 shadow-2xl" style={{ backgroundColor: '#13131c', borderColor: '#2a2a3d' }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-white">Create payment link</h3>
              <button onClick={() => setShowCreateLink(false)} style={{ color: '#8a8a9e' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4 mb-5">
              <div>
                <label className="text-sm font-medium text-white mb-1.5 block">Link name</label>
                <input value={linkName} onChange={e => setLinkName(e.target.value)} type="text" placeholder="e.g. Website Design"
                  className="w-full rounded-xl px-4 py-2.5 text-sm text-white outline-none border placeholder-[#5c5c72]"
                  style={{ backgroundColor: '#1e1e2d', borderColor: '#2a2a3d' }} />
              </div>
              <div>
                <label className="text-sm font-medium text-white mb-1.5 block">Amount (£)</label>
                <input value={linkAmount} onChange={e => setLinkAmount(e.target.value)} type="number" placeholder="0.00"
                  className="w-full rounded-xl px-4 py-2.5 text-sm text-white outline-none border placeholder-[#5c5c72]"
                  style={{ backgroundColor: '#1e1e2d', borderColor: '#2a2a3d' }} />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowCreateLink(false)} className="flex-1 py-2.5 rounded-xl text-sm font-medium border"
                style={{ borderColor: '#2a2a3d', color: '#ccccdd' }}>Cancel</button>
              <button onClick={() => { setShowCreateLink(false); setLinkName(''); setLinkAmount('') }}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                style={{ backgroundColor: '#ffffff', color: '#0e0e15' }}>Create link</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
