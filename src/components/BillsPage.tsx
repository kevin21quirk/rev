import { useState } from 'react'

interface Bill {
  id: string
  vendor: string
  initials: string
  color: string
  amount: number
  dueDate: string
  status: 'due' | 'paid' | 'overdue' | 'scheduled'
  category: string
  frequency: string
}

const bills: Bill[] = [
  { id: '1', vendor: 'Fasthosts', initials: 'FH', color: '#3b82f6', amount: 11.16, dueDate: 'Oct 1, 2026', status: 'scheduled', category: 'Hosting', frequency: 'Monthly' },
  { id: '4', vendor: 'ICO Registration', initials: 'ICO', color: '#2563eb', amount: 52.00, dueDate: 'Sep 7, 2027', status: 'paid', category: 'Legal', frequency: 'Annually' },
]

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  due:       { bg: 'rgba(245,158,11,0.15)', text: '#f59e0b', label: 'Due soon' },
  paid:      { bg: 'rgba(62,207,110,0.15)', text: '#3ecf6e', label: 'Paid' },
  overdue:   { bg: 'rgba(239,68,68,0.15)',  text: '#ef4444', label: 'Overdue' },
  scheduled: { bg: 'rgba(91,156,246,0.15)', text: '#5b9cf6', label: 'Scheduled' },
}

export default function BillsPage() {
  const [filter, setFilter] = useState<'all' | 'due' | 'paid' | 'scheduled'>('all')
  const [showAddBill, setShowAddBill] = useState(false)
  const [paying, setPaying] = useState<string | null>(null)

  const filtered = bills.filter(b => filter === 'all' || b.status === filter || (filter === 'due' && b.status === 'overdue'))

  const totalDue = bills.filter(b => b.status === 'due' || b.status === 'overdue').reduce((s, b) => s + b.amount, 0)
  const totalScheduled = bills.filter(b => b.status === 'scheduled').reduce((s, b) => s + b.amount, 0)

  return (
    <div className="p-6 max-w-4xl">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Due now', value: `£${totalDue.toFixed(2)}`, color: '#f59e0b', sub: `${bills.filter(b => b.status === 'due').length} bills` },
          { label: 'Scheduled', value: `£${totalScheduled.toFixed(2)}`, color: '#5b9cf6', sub: `${bills.filter(b => b.status === 'scheduled').length} bills` },
          { label: 'Paid this month', value: `£${bills.filter(b => b.status === 'paid').reduce((s, b) => s + b.amount, 0).toFixed(2)}`, color: '#3ecf6e', sub: `${bills.filter(b => b.status === 'paid').length} bills` },
        ].map(card => (
          <div key={card.label} className="rounded-2xl border p-4" style={{ backgroundColor: '#1e1e2d', borderColor: '#2a2a3d' }}>
            <p className="text-xs mb-2" style={{ color: '#5c5c72' }}>{card.label}</p>
            <p className="text-xl font-bold" style={{ color: card.color }}>{card.value}</p>
            <p className="text-xs mt-1" style={{ color: '#5c5c72' }}>{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Filter + Add */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1 p-1 rounded-lg" style={{ backgroundColor: '#1e1e2d' }}>
          {(['all', 'due', 'paid', 'scheduled'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-colors"
              style={{
                backgroundColor: filter === f ? '#2a2a3d' : 'transparent',
                color: filter === f ? '#ffffff' : '#8a8a9e',
              }}
            >
              {f === 'all' ? 'All' : f === 'due' ? 'Due' : f === 'paid' ? 'Paid' : 'Scheduled'}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowAddBill(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          style={{ backgroundColor: '#ffffff', color: '#0e0e15' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#e8e8f0' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#ffffff' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" /><path d="M12 5v14" />
          </svg>
          Add bill
        </button>
      </div>

      {/* Bills list */}
      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: '#2a2a3d' }}>
        <table className="w-full">
          <thead>
            <tr style={{ backgroundColor: '#1a1a28', borderBottom: '1px solid #2a2a3d' }}>
              {['Vendor', 'Category', 'Frequency', 'Due date', 'Status', 'Amount', ''].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-medium" style={{ color: '#5c5c72' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((bill, i) => {
              const st = statusColors[bill.status]
              return (
                <tr
                  key={bill.id}
                  style={{ borderBottom: i < filtered.length - 1 ? '1px solid #1e1e2c' : 'none' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#191924' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold text-white shrink-0"
                        style={{ backgroundColor: bill.color }}>
                        {bill.initials}
                      </div>
                      <span className="text-sm font-medium text-white">{bill.vendor}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm" style={{ color: '#8a8a9e' }}>{bill.category}</td>
                  <td className="px-5 py-3 text-sm" style={{ color: '#8a8a9e' }}>{bill.frequency}</td>
                  <td className="px-5 py-3 text-sm" style={{ color: '#ccccdd' }}>{bill.dueDate}</td>
                  <td className="px-5 py-3">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: st.bg, color: st.text }}>
                      {st.label}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm font-medium text-white">£{bill.amount.toFixed(2)}</td>
                  <td className="px-5 py-3">
                    {bill.status !== 'paid' && (
                      <button
                        onClick={() => setPaying(bill.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                        style={{ backgroundColor: '#1a2c3d', color: '#5b9cf6' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#1e3550' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#1a2c3d' }}
                      >
                        Pay now
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Add bill modal */}
      {showAddBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-md rounded-2xl border p-6 shadow-2xl" style={{ backgroundColor: '#13131c', borderColor: '#2a2a3d' }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-white">Add new bill</h3>
              <button onClick={() => setShowAddBill(false)} style={{ color: '#8a8a9e' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Vendor name', placeholder: 'e.g. Netflix', type: 'text' },
                { label: 'Amount (£)', placeholder: '0.00', type: 'number' },
                { label: 'Due date', placeholder: '', type: 'date' },
              ].map(field => (
                <div key={field.label}>
                  <label className="text-sm font-medium text-white mb-1.5 block">{field.label}</label>
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    className="w-full rounded-xl px-4 py-2.5 text-sm text-white outline-none border placeholder-[#5c5c72]"
                    style={{ backgroundColor: '#1e1e2d', borderColor: '#2a2a3d' }}
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowAddBill(false)} className="flex-1 py-2.5 rounded-xl text-sm font-medium border"
                style={{ borderColor: '#2a2a3d', color: '#ccccdd' }}>Cancel</button>
              <button onClick={() => setShowAddBill(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                style={{ backgroundColor: '#ffffff', color: '#0e0e15' }}>Add bill</button>
            </div>
          </div>
        </div>
      )}

      {/* Pay confirmation */}
      {paying && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-sm rounded-2xl border p-6 shadow-2xl" style={{ backgroundColor: '#13131c', borderColor: '#2a2a3d' }}>
            <h3 className="text-lg font-semibold text-white mb-2">Confirm payment</h3>
            <p className="text-sm mb-5" style={{ color: '#8a8a9e' }}>
              Pay £{bills.find(b => b.id === paying)?.amount.toFixed(2)} to {bills.find(b => b.id === paying)?.vendor}?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setPaying(null)} className="flex-1 py-2.5 rounded-xl text-sm font-medium border"
                style={{ borderColor: '#2a2a3d', color: '#ccccdd' }}>Cancel</button>
              <button onClick={() => setPaying(null)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                style={{ backgroundColor: '#ffffff', color: '#0e0e15' }}>Pay</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
