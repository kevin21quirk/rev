import { useState } from 'react'

interface Expense {
  id: string
  description: string
  merchant: string
  initials: string
  color: string
  amount: number
  date: string
  category: string
  status: 'approved' | 'pending' | 'rejected'
  submittedBy: string
}

const expenses: Expense[] = [
  { id: '1', description: 'Hosting services', merchant: 'Fasthosts', initials: 'FH', color: '#3b82f6', amount: 11.16, date: 'Sep 14, 2026', category: 'IT & Software', status: 'approved', submittedBy: 'Kevin Quirk' },
  { id: '2', description: 'Groceries for office', merchant: 'Tesco', initials: 'T', color: '#003087', amount: 17.75, date: 'Sep 11, 2026', category: 'Office Supplies', status: 'pending', submittedBy: 'Kevin Quirk' },
  { id: '3', description: 'Team coffee', merchant: 'Costa Coffee', initials: 'CC', color: '#5c1a24', amount: 7.25, date: 'Sep 1, 2026', category: 'Entertainment', status: 'approved', submittedBy: 'Kevin Quirk' },
  { id: '4', description: 'Data protection registration', merchant: 'ICO', initials: 'ICO', color: '#2563eb', amount: 52.00, date: 'Sep 7, 2026', category: 'Legal', status: 'approved', submittedBy: 'Kevin Quirk' },
  { id: '5', description: 'Cloud hosting bill', merchant: 'Fasthosts', initials: 'FH', color: '#3b82f6', amount: 6.14, date: 'Sep 8, 2026', category: 'IT & Software', status: 'approved', submittedBy: 'Kevin Quirk' },
  { id: '6', description: 'Weekly groceries', merchant: 'Tesco', initials: 'T', color: '#003087', amount: 80.00, date: 'Sep 1, 2026', category: 'Miscellaneous', status: 'pending', submittedBy: 'Kevin Quirk' },
  { id: '7', description: 'Steam ferry ticket', merchant: 'Isle Of Man Steam Pac', initials: 'IOM', color: '#059669', amount: 18.30, date: 'Aug 31, 2026', category: 'Travel', status: 'approved', submittedBy: 'Kevin Quirk' },
]

const statusStyle: Record<string, { bg: string; text: string }> = {
  approved: { bg: 'rgba(62,207,110,0.15)', text: '#3ecf6e' },
  pending:  { bg: 'rgba(245,158,11,0.15)',  text: '#f59e0b' },
  rejected: { bg: 'rgba(239,68,68,0.15)',   text: '#ef4444' },
}

export default function ExpensesPage() {
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all')
  const [showAddExpense, setShowAddExpense] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)

  const filtered = expenses.filter(e => filter === 'all' || e.status === filter)
  const total = filtered.reduce((s, e) => s + e.amount, 0)

  return (
    <div className="p-6 max-w-4xl">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total expenses', value: `£${expenses.reduce((s, e) => s + e.amount, 0).toFixed(2)}`, color: '#ffffff', sub: `${expenses.length} items` },
          { label: 'Pending review', value: `£${expenses.filter(e => e.status === 'pending').reduce((s, e) => s + e.amount, 0).toFixed(2)}`, color: '#f59e0b', sub: `${expenses.filter(e => e.status === 'pending').length} items` },
          { label: 'Approved', value: `£${expenses.filter(e => e.status === 'approved').reduce((s, e) => s + e.amount, 0).toFixed(2)}`, color: '#3ecf6e', sub: `${expenses.filter(e => e.status === 'approved').length} items` },
        ].map(card => (
          <div key={card.label} className="rounded-2xl border p-4" style={{ backgroundColor: '#1e1e2d', borderColor: '#2a2a3d' }}>
            <p className="text-xs mb-2" style={{ color: '#5c5c72' }}>{card.label}</p>
            <p className="text-xl font-bold" style={{ color: card.color }}>{card.value}</p>
            <p className="text-xs mt-1" style={{ color: '#5c5c72' }}>{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1 p-1 rounded-lg" style={{ backgroundColor: '#1e1e2d' }}>
          {(['all', 'approved', 'pending', 'rejected'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-colors"
              style={{ backgroundColor: filter === f ? '#2a2a3d' : 'transparent', color: filter === f ? '#ffffff' : '#8a8a9e' }}
            >
              {f}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowAddExpense(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
          style={{ backgroundColor: '#ffffff', color: '#0e0e15' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#e8e8f0' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#ffffff' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" /><path d="M12 5v14" />
          </svg>
          Add expense
        </button>
      </div>

      {/* Table */}
      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: '#2a2a3d' }}>
        <table className="w-full">
          <thead>
            <tr style={{ backgroundColor: '#1a1a28', borderBottom: '1px solid #2a2a3d' }}>
              {['Merchant', 'Description', 'Category', 'Date', 'Status', 'Amount'].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-medium" style={{ color: '#5c5c72' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((exp, i) => {
              const st = statusStyle[exp.status]
              return (
                <tr
                  key={exp.id}
                  className="cursor-pointer"
                  onClick={() => setSelectedExpense(exp)}
                  style={{ borderBottom: i < filtered.length - 1 ? '1px solid #1e1e2c' : 'none' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#191924' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold text-white shrink-0"
                        style={{ backgroundColor: exp.color }}>
                        {exp.initials}
                      </div>
                      <span className="text-sm font-medium text-white">{exp.merchant}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm" style={{ color: '#ccccdd' }}>{exp.description}</td>
                  <td className="px-5 py-3 text-sm" style={{ color: '#8a8a9e' }}>{exp.category}</td>
                  <td className="px-5 py-3 text-sm" style={{ color: '#8a8a9e' }}>{exp.date}</td>
                  <td className="px-5 py-3">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium capitalize"
                      style={{ backgroundColor: st.bg, color: st.text }}>
                      {exp.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm font-medium text-white">−£{exp.amount.toFixed(2)}</td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr style={{ borderTop: '1px solid #2a2a3d', backgroundColor: '#1a1a28' }}>
              <td colSpan={5} className="px-5 py-3 text-sm font-semibold text-white">Total</td>
              <td className="px-5 py-3 text-sm font-bold text-white">−£{total.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Expense detail modal */}
      {selectedExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-md rounded-2xl border p-6 shadow-2xl" style={{ backgroundColor: '#13131c', borderColor: '#2a2a3d' }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-white">Expense details</h3>
              <button onClick={() => setSelectedExpense(null)} style={{ color: '#8a8a9e' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                </svg>
              </button>
            </div>
            <div className="flex items-center gap-3 mb-5 p-3 rounded-xl" style={{ backgroundColor: '#1e1e2d' }}>
              <div className="flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold text-white"
                style={{ backgroundColor: selectedExpense.color }}>
                {selectedExpense.initials}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{selectedExpense.merchant}</p>
                <p className="text-xs mt-0.5" style={{ color: '#5c5c72' }}>{selectedExpense.description}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-base font-bold text-white">−£{selectedExpense.amount.toFixed(2)}</p>
                <span className="text-xs px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: statusStyle[selectedExpense.status].bg, color: statusStyle[selectedExpense.status].text }}>
                  {selectedExpense.status}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-5">
              {[
                { label: 'Date', value: selectedExpense.date },
                { label: 'Category', value: selectedExpense.category },
                { label: 'Submitted by', value: selectedExpense.submittedBy },
                { label: 'Receipt', value: 'Not uploaded' },
              ].map(item => (
                <div key={item.label} className="rounded-xl p-3" style={{ backgroundColor: '#1e1e2d' }}>
                  <p className="text-xs mb-1" style={{ color: '#5c5c72' }}>{item.label}</p>
                  <p className="text-sm font-medium text-white">{item.value}</p>
                </div>
              ))}
            </div>
            {selectedExpense.status === 'pending' && (
              <div className="flex gap-3">
                <button onClick={() => setSelectedExpense(null)} className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                  style={{ backgroundColor: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>
                  Reject
                </button>
                <button onClick={() => setSelectedExpense(null)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ backgroundColor: '#ffffff', color: '#0e0e15' }}>
                  Approve
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add expense modal */}
      {showAddExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-md rounded-2xl border p-6 shadow-2xl" style={{ backgroundColor: '#13131c', borderColor: '#2a2a3d' }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-white">Add expense</h3>
              <button onClick={() => setShowAddExpense(false)} style={{ color: '#8a8a9e' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-3 mb-5">
              {[
                { label: 'Merchant', type: 'text', placeholder: 'Who did you pay?' },
                { label: 'Description', type: 'text', placeholder: 'What was this for?' },
                { label: 'Amount (£)', type: 'number', placeholder: '0.00' },
                { label: 'Date', type: 'date', placeholder: '' },
              ].map(f => (
                <div key={f.label}>
                  <label className="text-sm font-medium text-white mb-1.5 block">{f.label}</label>
                  <input type={f.type} placeholder={f.placeholder}
                    className="w-full rounded-xl px-4 py-2.5 text-sm text-white outline-none border placeholder-[#5c5c72]"
                    style={{ backgroundColor: '#1e1e2d', borderColor: '#2a2a3d' }} />
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowAddExpense(false)} className="flex-1 py-2.5 rounded-xl text-sm font-medium border"
                style={{ borderColor: '#2a2a3d', color: '#ccccdd' }}>Cancel</button>
              <button onClick={() => setShowAddExpense(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                style={{ backgroundColor: '#ffffff', color: '#0e0e15' }}>Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
