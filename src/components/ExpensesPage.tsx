import { useState } from 'react'
import { useTransactions } from '../context/TransactionsContext'

type ExpenseStatus = 'approved' | 'pending' | 'rejected'

interface Expense {
  id: string
  description: string
  merchant: string
  initials: string
  color: string
  amount: number
  date: string
  category: string
  status: ExpenseStatus
  submittedBy: string
}

const statusStyle: Record<string, { bg: string; text: string }> = {
  approved: { bg: 'rgba(62,207,110,0.15)', text: '#3ecf6e' },
  pending:  { bg: 'rgba(245,158,11,0.15)',  text: '#f59e0b' },
  rejected: { bg: 'rgba(239,68,68,0.15)',   text: '#ef4444' },
}

export default function ExpensesPage() {
  const { transactions } = useTransactions()
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all')
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)

  // Derive expenses from real transactions (debits only)
  const expenses: Expense[] = transactions
    .filter(t => t.amount < 0)
    .map(t => ({
      id: String(t.id),
      description: t.reference !== '–' && t.reference !== '-' ? t.reference : t.merchant,
      merchant: t.merchant,
      initials: t.merchant_initials,
      color: t.merchant_color,
      amount: Math.abs(t.amount),
      date: t.date_label,
      category: t.category,
      status: (t.status.toLowerCase() === 'completed' ? 'approved' : t.status.toLowerCase()) as ExpenseStatus,
      submittedBy: 'Kevin Quirk',
    }))

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
            <button key={f} onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-colors"
              style={{ backgroundColor: filter === f ? '#2a2a3d' : 'transparent', color: filter === f ? '#ffffff' : '#8a8a9e' }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {expenses.length === 0 ? (
        <div className="rounded-2xl border p-12 text-center" style={{ borderColor: '#2a2a3d', backgroundColor: '#1e1e2d' }}>
          <p className="text-sm" style={{ color: '#5c5c72' }}>No expenses yet. Add transactions via the Admin dashboard.</p>
        </div>
      ) : (
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
                const st = statusStyle[exp.status] ?? statusStyle.approved
                return (
                  <tr key={exp.id} className="cursor-pointer"
                    onClick={() => setSelectedExpense(exp)}
                    style={{ borderBottom: i < filtered.length - 1 ? '1px solid #1e1e2c' : 'none' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#191924' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}>
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
      )}

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
          </div>
        </div>
      )}
    </div>
  )
}
