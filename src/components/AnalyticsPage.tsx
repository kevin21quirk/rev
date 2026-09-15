import { useState } from 'react'
import { useTransactions } from '../context/TransactionsContext'

type Period = '1M' | '3M' | '6M' | '1Y'

const CATEGORY_COLORS = ['#3b82f6','#a78bfa','#f59e0b','#34d399','#f97316','#e63946','#059669','#5c5c72']

export default function AnalyticsPage() {
  const { transactions } = useTransactions()
  const [period, setPeriod] = useState<Period>('6M')
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)

  // Build monthly buckets from real transactions
  const monthlyMap = new Map<string, { month: string; sort: number; expenses: number; income: number }>()
  transactions.forEach(t => {
    const d = new Date(t.date_iso)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleDateString('en-GB', { month: 'short' })
    const entry = monthlyMap.get(key) ?? { month: label, sort: d.getFullYear() * 100 + d.getMonth(), expenses: 0, income: 0 }
    if (t.amount < 0) entry.expenses += Math.abs(t.amount)
    else entry.income += t.amount
    monthlyMap.set(key, entry)
  })
  const allMonths = Array.from(monthlyMap.values()).sort((a, b) => a.sort - b.sort)
  const periodCount = period === '1M' ? 1 : period === '3M' ? 3 : period === '6M' ? 6 : 12
  const monthlyData = allMonths.slice(-periodCount)

  // Category breakdown from real transactions (debits only)
  const catMap = new Map<string, number>()
  transactions.filter(t => t.amount < 0).forEach(t => {
    catMap.set(t.category, (catMap.get(t.category) ?? 0) + Math.abs(t.amount))
  })
  const catTotal = Array.from(catMap.values()).reduce((s, v) => s + v, 0)
  const categories = Array.from(catMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([name, amount], i) => ({
      name,
      amount,
      pct: catTotal > 0 ? Math.round(amount / catTotal * 100) : 0,
      color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
    }))

  // Top merchants from real transactions (debits only)
  const merchantMap = new Map<string, { amount: number; color: string; initials: string; count: number }>()
  transactions.filter(t => t.amount < 0).forEach(t => {
    const entry = merchantMap.get(t.merchant) ?? { amount: 0, color: t.merchant_color, initials: t.merchant_initials, count: 0 }
    entry.amount += Math.abs(t.amount)
    entry.count += 1
    merchantMap.set(t.merchant, entry)
  })
  const topMerchants = Array.from(merchantMap.entries())
    .sort((a, b) => b[1].amount - a[1].amount)
    .slice(0, 5)
    .map(([name, data]) => ({ name, ...data }))

  const maxVal = Math.max(...monthlyData.flatMap(d => [d.expenses, d.income]), 1)
  const barHeight = 180
  const totalExpenses = monthlyData.reduce((a, d) => a + d.expenses, 0)
  const totalIncome   = monthlyData.reduce((a, d) => a + d.income, 0)
  const net = totalIncome - totalExpenses

  return (
    <div className="p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-white">Spending overview</h2>
          <p className="text-sm mt-0.5" style={{ color: '#8a8a9e' }}>Main · GBP account</p>
        </div>
        <div className="flex items-center gap-1 p-1 rounded-lg" style={{ backgroundColor: '#1e1e2d' }}>
          {(['1M', '3M', '6M', '1Y'] as Period[]).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
              style={{ backgroundColor: period === p ? '#2a2a3d' : 'transparent', color: period === p ? '#ffffff' : '#8a8a9e' }}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Bar chart */}
      <div className="rounded-2xl border p-5 mb-6" style={{ backgroundColor: '#1e1e2d', borderColor: '#2a2a3d' }}>
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#3b82f6' }} />
            <span className="text-xs" style={{ color: '#8a8a9e' }}>Expenses</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#3ecf6e' }} />
            <span className="text-xs" style={{ color: '#8a8a9e' }}>Income</span>
          </div>
        </div>

        {monthlyData.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-sm" style={{ color: '#5c5c72' }}>No transaction data available.</p>
          </div>
        ) : (
          <div className="flex items-end gap-3" style={{ height: `${barHeight + 30}px` }}>
            {monthlyData.map((d, i) => {
              const isHovered = hoverIdx === i
              const expH = Math.round((d.expenses / maxVal) * barHeight)
              const incH = Math.round((d.income / maxVal) * barHeight)
              return (
                <div key={d.month + i} className="flex-1 flex flex-col items-center gap-1 cursor-pointer"
                  onMouseEnter={() => setHoverIdx(i)} onMouseLeave={() => setHoverIdx(null)}>
                  {isHovered && (
                    <div className="absolute text-xs rounded-lg px-2 py-1 pointer-events-none z-10 whitespace-nowrap shadow-lg border"
                      style={{ backgroundColor: '#252535', borderColor: '#2a2a3d', color: '#fff', marginTop: '-50px', position: 'relative' }}>
                      <div>Expenses: £{d.expenses.toFixed(2)}</div>
                      <div style={{ color: '#3ecf6e' }}>Income: £{d.income.toFixed(2)}</div>
                    </div>
                  )}
                  <div className="flex items-end gap-1 w-full" style={{ height: `${barHeight}px` }}>
                    <div className="flex-1 rounded-t-lg transition-all duration-200"
                      style={{ height: `${expH}px`, backgroundColor: isHovered ? '#5b9cf6' : '#3b82f6' }} />
                    <div className="flex-1 rounded-t-lg transition-all duration-200"
                      style={{ height: `${incH}px`, backgroundColor: isHovered ? '#5de87c' : '#3ecf6e' }} />
                  </div>
                  <span className="text-xs" style={{ color: '#5c5c72' }}>{d.month}</span>
                </div>
              )
            })}
          </div>
        )}

        <div className="flex gap-6 mt-5 pt-4 border-t" style={{ borderColor: '#2a2a3d' }}>
          <div>
            <p className="text-xs mb-1" style={{ color: '#5c5c72' }}>Total spent ({period})</p>
            <p className="text-lg font-bold text-white">£{totalExpenses.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div>
            <p className="text-xs mb-1" style={{ color: '#5c5c72' }}>Total received ({period})</p>
            <p className="text-lg font-bold" style={{ color: '#3ecf6e' }}>£{totalIncome.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div>
            <p className="text-xs mb-1" style={{ color: '#5c5c72' }}>Net</p>
            <p className="text-lg font-bold" style={{ color: net >= 0 ? '#3ecf6e' : '#ef4444' }}>
              {net >= 0 ? '+' : '−'}£{Math.abs(net).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      {/* Category + Top merchants */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="rounded-2xl border p-5" style={{ backgroundColor: '#1e1e2d', borderColor: '#2a2a3d' }}>
          <h3 className="text-sm font-semibold text-white mb-4">Spending by category</h3>
          {categories.length === 0 ? (
            <p className="text-sm" style={{ color: '#5c5c72' }}>No data yet.</p>
          ) : (
            <div className="space-y-3">
              {categories.map(cat => (
                <div key={cat.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="text-sm text-white">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs" style={{ color: '#5c5c72' }}>{cat.pct}%</span>
                      <span className="text-sm font-medium text-white">£{cat.amount.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#2a2a3d' }}>
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${cat.pct}%`, backgroundColor: cat.color }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border p-5" style={{ backgroundColor: '#1e1e2d', borderColor: '#2a2a3d' }}>
          <h3 className="text-sm font-semibold text-white mb-4">Top merchants</h3>
          {topMerchants.length === 0 ? (
            <p className="text-sm" style={{ color: '#5c5c72' }}>No data yet.</p>
          ) : (
            <div className="space-y-3">
              {topMerchants.map(m => (
                <div key={m.name} className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold text-white shrink-0"
                    style={{ backgroundColor: m.color }}>
                    {m.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{m.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#5c5c72' }}>{m.count} transaction{m.count > 1 ? 's' : ''}</p>
                  </div>
                  <span className="text-sm font-medium text-white">£{m.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Monthly breakdown table */}
      {monthlyData.length > 0 && (
        <div className="rounded-2xl border mt-5 overflow-hidden" style={{ borderColor: '#2a2a3d' }}>
          <div className="px-5 py-4 border-b" style={{ borderColor: '#2a2a3d' }}>
            <h3 className="text-sm font-semibold text-white">Monthly breakdown</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid #2a2a3d', backgroundColor: '#1a1a28' }}>
                {['Month', 'Expenses', 'Income', 'Net'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium" style={{ color: '#5c5c72' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...monthlyData].reverse().map((d, i) => {
                const rowNet = d.income - d.expenses
                return (
                  <tr key={i} style={{ borderBottom: i < monthlyData.length - 1 ? '1px solid #1e1e2c' : 'none' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#191924' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}>
                    <td className="px-5 py-3 text-sm font-medium text-white">{d.month}</td>
                    <td className="px-5 py-3 text-sm text-white">−£{d.expenses.toFixed(2)}</td>
                    <td className="px-5 py-3 text-sm" style={{ color: '#3ecf6e' }}>+£{d.income.toFixed(2)}</td>
                    <td className="px-5 py-3 text-sm font-medium" style={{ color: rowNet >= 0 ? '#3ecf6e' : '#ef4444' }}>
                      {rowNet >= 0 ? '+' : '−'}£{Math.abs(rowNet).toFixed(2)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
