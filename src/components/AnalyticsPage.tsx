import { useState } from 'react'

const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep']

const monthlyData = [
  { month: 'Apr', expenses: 4200, income: 6800 },
  { month: 'May', expenses: 3800, income: 7200 },
  { month: 'Jun', expenses: 5100, income: 5900 },
  { month: 'Jul', expenses: 4600, income: 8100 },
  { month: 'Aug', expenses: 6200, income: 9400 },
  { month: 'Sep', expenses: 7416, income: 4700 },
]

const categories = [
  { name: 'Transfers', amount: 7000, color: '#3b82f6', pct: 44 },
  { name: 'Subscriptions', amount: 2800, color: '#a78bfa', pct: 18 },
  { name: 'Food & Drink', amount: 1900, color: '#f59e0b', pct: 12 },
  { name: 'Utilities', amount: 1400, color: '#34d399', pct: 9 },
  { name: 'Other', amount: 2500, color: '#5c5c72', pct: 17 },
]

type Period = '1M' | '3M' | '6M' | '1Y'

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>('6M')
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)

  const maxVal = Math.max(...monthlyData.flatMap(d => [d.expenses, d.income]))
  const barHeight = 180

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
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
              style={{
                backgroundColor: period === p ? '#2a2a3d' : 'transparent',
                color: period === p ? '#ffffff' : '#8a8a9e',
              }}
            >
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

        <div className="flex items-end gap-3" style={{ height: `${barHeight + 30}px` }}>
          {monthlyData.map((d, i) => {
            const isHovered = hoverIdx === i
            const expH = Math.round((d.expenses / maxVal) * barHeight)
            const incH = Math.round((d.income / maxVal) * barHeight)
            return (
              <div
                key={d.month}
                className="flex-1 flex flex-col items-center gap-1 cursor-pointer"
                onMouseEnter={() => setHoverIdx(i)}
                onMouseLeave={() => setHoverIdx(null)}
              >
                {isHovered && (
                  <div
                    className="absolute text-xs rounded-lg px-2 py-1 pointer-events-none z-10 whitespace-nowrap shadow-lg border"
                    style={{ backgroundColor: '#252535', borderColor: '#2a2a3d', color: '#fff', marginTop: '-50px', position: 'relative' }}
                  >
                    <div>Expenses: £{d.expenses.toLocaleString()}</div>
                    <div style={{ color: '#3ecf6e' }}>Income: £{d.income.toLocaleString()}</div>
                  </div>
                )}
                <div className="flex items-end gap-1 w-full" style={{ height: `${barHeight}px` }}>
                  <div
                    className="flex-1 rounded-t-lg transition-all duration-200"
                    style={{
                      height: `${expH}px`,
                      backgroundColor: isHovered ? '#5b9cf6' : '#3b82f6',
                    }}
                  />
                  <div
                    className="flex-1 rounded-t-lg transition-all duration-200"
                    style={{
                      height: `${incH}px`,
                      backgroundColor: isHovered ? '#5de87c' : '#3ecf6e',
                    }}
                  />
                </div>
                <span className="text-xs" style={{ color: '#5c5c72' }}>{d.month}</span>
              </div>
            )
          })}
        </div>

        {/* Summary */}
        <div className="flex gap-6 mt-5 pt-4 border-t" style={{ borderColor: '#2a2a3d' }}>
          <div>
            <p className="text-xs mb-1" style={{ color: '#5c5c72' }}>Total spent (6M)</p>
            <p className="text-lg font-bold text-white">
              £{monthlyData.reduce((a, d) => a + d.expenses, 0).toLocaleString('en-GB')}
            </p>
          </div>
          <div>
            <p className="text-xs mb-1" style={{ color: '#5c5c72' }}>Total received (6M)</p>
            <p className="text-lg font-bold" style={{ color: '#3ecf6e' }}>
              £{monthlyData.reduce((a, d) => a + d.income, 0).toLocaleString('en-GB')}
            </p>
          </div>
          <div>
            <p className="text-xs mb-1" style={{ color: '#5c5c72' }}>Net</p>
            <p className="text-lg font-bold" style={{
              color: monthlyData.reduce((a, d) => a + d.income - d.expenses, 0) >= 0 ? '#3ecf6e' : '#ef4444'
            }}>
              £{Math.abs(monthlyData.reduce((a, d) => a + d.income - d.expenses, 0)).toLocaleString('en-GB')}
            </p>
          </div>
        </div>
      </div>

      {/* Spending by category */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="rounded-2xl border p-5" style={{ backgroundColor: '#1e1e2d', borderColor: '#2a2a3d' }}>
          <h3 className="text-sm font-semibold text-white mb-4">Spending by category</h3>
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
                    <span className="text-sm font-medium text-white">£{cat.amount.toLocaleString()}</span>
                  </div>
                </div>
                <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#2a2a3d' }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${cat.pct}%`, backgroundColor: cat.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top merchants */}
        <div className="rounded-2xl border p-5" style={{ backgroundColor: '#1e1e2d', borderColor: '#2a2a3d' }}>
          <h3 className="text-sm font-semibold text-white mb-4">Top merchants</h3>
          <div className="space-y-3">
            {[
              { name: 'Kevin Quirk (Directors Loan)', amount: 7000, color: '#e8c547', initials: 'KQ', count: 3 },
              { name: 'Fasthosts', amount: 34.04, color: '#3b82f6', initials: 'FH', count: 5 },
              { name: 'Tesco', amount: 97.75, color: '#003087', initials: 'T', count: 2 },
              { name: 'ICO', amount: 52, color: '#2563eb', initials: 'ICO', count: 1 },
              { name: 'Costa Coffee', amount: 7.25, color: '#5c1a24', initials: 'CC', count: 2 },
            ].map(m => (
              <div key={m.name} className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold text-white shrink-0"
                  style={{ backgroundColor: m.color }}
                >
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
        </div>
      </div>

      {/* Monthly breakdown table */}
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
              const net = d.income - d.expenses
              return (
                <tr
                  key={d.month}
                  style={{ borderBottom: i < months.length - 1 ? '1px solid #1e1e2c' : 'none' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#191924' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}
                >
                  <td className="px-5 py-3 text-sm font-medium text-white">{d.month} 2026</td>
                  <td className="px-5 py-3 text-sm text-white">−£{d.expenses.toLocaleString('en-GB')}</td>
                  <td className="px-5 py-3 text-sm" style={{ color: '#3ecf6e' }}>+£{d.income.toLocaleString('en-GB')}</td>
                  <td className="px-5 py-3 text-sm font-medium" style={{ color: net >= 0 ? '#3ecf6e' : '#ef4444' }}>
                    {net >= 0 ? '+' : '−'}£{Math.abs(net).toLocaleString('en-GB')}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
