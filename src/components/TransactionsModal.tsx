import { useState } from 'react'
import { useTransactions } from '../context/TransactionsContext'
import { MerchantAvatar } from './HomePage'
import type { Transaction } from '../lib/api'

interface TransactionsModalProps {
  onClose: () => void
}

function fmt(amount: number, currency = 'GBP') {
  const abs = Math.abs(amount)
  const str = abs >= 1000
    ? abs.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : abs.toFixed(2)
  return `${amount < 0 ? '−' : '+'}${currency === 'GBP' ? '£' : '$'}${str}`
}

export default function TransactionsModal({ onClose }: TransactionsModalProps) {
  const { transactions } = useTransactions()
  const [filter, setFilter] = useState<'all' | 'income' | 'expenses'>('all')
  const [search, setSearch] = useState('')
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null)

  const filtered = transactions.filter(tx => {
    if (filter === 'income'   && tx.amount <= 0) return false
    if (filter === 'expenses' && tx.amount >  0) return false
    if (search && !tx.merchant.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
      <div className="w-full max-w-3xl max-h-[85vh] rounded-2xl border flex flex-col overflow-hidden shadow-2xl"
        style={{ backgroundColor: '#13131c', borderColor: '#2a2a3d' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: '#1e1e2c' }}>
          <h2 className="text-lg font-semibold text-white">All Transactions</h2>
          <button onClick={onClose} className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
            style={{ color: '#8a8a9e' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#1a1a28'; (e.currentTarget as HTMLElement).style.color = '#fff' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#8a8a9e' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" /><path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 px-6 py-3 border-b" style={{ borderColor: '#1e1e2c' }}>
          <div className="flex items-center gap-1 rounded-lg p-1" style={{ backgroundColor: '#1e1e2d' }}>
            {(['all', 'income', 'expenses'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className="px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-colors"
                style={{ backgroundColor: filter === f ? '#2a2a3d' : 'transparent', color: filter === f ? '#ffffff' : '#8a8a9e' }}>
                {f}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 rounded-lg px-3 py-2 flex-1 max-w-xs" style={{ backgroundColor: '#1e1e2d' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5c5c72" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search transactions…"
              className="bg-transparent text-sm text-white outline-none flex-1 placeholder-[#5c5c72]" />
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {selectedTx ? (
            <TransactionDetail tx={selectedTx} onBack={() => setSelectedTx(null)} />
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr style={{ borderBottom: '1px solid #1e1e2c' }}>
                  {['Transaction', 'Reference', 'Date', 'Status', 'Amount'].map(h => (
                    <th key={h} className={`px-${h === 'Amount' ? '6' : '4'} py-3 ${h === 'Amount' ? 'text-right' : 'text-left'} text-xs font-medium`} style={{ color: '#5c5c72' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-sm" style={{ color: '#5c5c72' }}>No transactions found</td></tr>
                ) : filtered.map(tx => (
                  <tr key={tx.id} className="cursor-pointer transition-colors"
                    style={{ borderBottom: '1px solid #1a1a24' }}
                    onClick={() => setSelectedTx(tx)}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#191924' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <MerchantAvatar tx={tx} />
                        <span className="text-sm font-medium text-white truncate max-w-[160px]">{tx.merchant}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: '#5c5c72' }}>{tx.reference}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: '#8a8a9e' }}>{tx.date_label}</td>
                    <td className="px-4 py-3 text-sm">
                      <span style={{ color: '#ccccdd' }}>{tx.status}</span>{' · '}
                      <span style={{ color: '#3ecf6e' }}>{tx.category}</span>
                    </td>
                    <td className="px-6 py-3 text-right text-sm font-medium"
                      style={{ color: tx.amount < 0 ? '#ffffff' : '#3ecf6e' }}>
                      {fmt(tx.amount, tx.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

function TransactionDetail({ tx, onBack }: { tx: Transaction; onBack: () => void }) {
  return (
    <div className="p-6">
      <button onClick={onBack} className="flex items-center gap-2 text-sm mb-6 transition-colors"
        style={{ color: '#8a8a9e' }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#8a8a9e' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 18-6-6 6-6" />
        </svg>
        Back to transactions
      </button>

      <div className="flex items-center gap-4 mb-6">
        <MerchantAvatar tx={tx} />
        <div>
          <h3 className="text-xl font-semibold text-white">{tx.merchant}</h3>
          <p className="text-sm mt-0.5" style={{ color: '#8a8a9e' }}>{tx.date_label}</p>
        </div>
      </div>

      <div className="text-3xl font-bold mb-8" style={{ color: tx.amount < 0 ? '#ffffff' : '#3ecf6e' }}>
        {fmt(tx.amount, tx.currency)}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {[
          { label: 'Status',    value: tx.status,    color: '#3ecf6e' },
          { label: 'Category',  value: tx.category,  color: '#ffffff' },
          { label: 'Reference', value: tx.reference === '–' ? 'No reference' : tx.reference, color: '#ffffff' },
          { label: 'Currency',  value: tx.currency,  color: '#ffffff' },
        ].map(item => (
          <div key={item.label} className="rounded-xl p-4" style={{ backgroundColor: '#1e1e2d' }}>
            <p className="text-xs mb-1" style={{ color: '#5c5c72' }}>{item.label}</p>
            <p className="text-sm font-medium" style={{ color: item.color }}>{item.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors"
          style={{ borderColor: '#2a2a3d', color: '#ccccdd', backgroundColor: '#1e1e2d' }}>
          Add note
        </button>
        <button onClick={onBack} className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors"
          style={{ backgroundColor: '#ffffff', color: '#0e0e15' }}>
          Download receipt
        </button>
      </div>
    </div>
  )
}
