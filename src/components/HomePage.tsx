import { useState } from 'react'
import { useTransactions } from '../context/TransactionsContext'
import type { Transaction } from '../lib/api'

interface HomePageProps {
  onSeeAll: () => void
  onAddMoney: () => void
}

export function MerchantAvatar({ tx }: { tx: Pick<Transaction, 'merchant' | 'merchant_initials' | 'merchant_color'> }) {
  const name = tx.merchant.toLowerCase()
  if (name.includes('fasthosts')) {
    return (
      <div className="flex items-center justify-center w-8 h-8 rounded-full shrink-0" style={{ backgroundColor: '#10243e' }}>
        <div className="flex flex-col gap-0.5 justify-center">
          <div className="h-0.5 rounded-full" style={{ width: '14px', backgroundColor: '#60a5fa' }} />
          <div className="h-0.5 rounded-full" style={{ width: '11px', backgroundColor: '#34d399' }} />
          <div className="h-0.5 rounded-full" style={{ width: '14px', backgroundColor: '#818cf8' }} />
          <div className="h-0.5 rounded-full" style={{ width: '9px',  backgroundColor: '#f472b6' }} />
        </div>
      </div>
    )
  }
  if (name.includes('tesco')) {
    return (
      <div className="flex items-center justify-center w-8 h-8 rounded-full shrink-0 text-white text-xs font-bold"
        style={{ backgroundColor: '#003087' }}>T</div>
    )
  }
  if (name.includes('costa')) {
    return (
      <div className="flex items-center justify-center w-8 h-8 rounded-full shrink-0"
        style={{ backgroundColor: '#5c1a24' }}>
        <span className="text-white text-xs font-bold">CC</span>
      </div>
    )
  }
  return (
    <div className="flex items-center justify-center w-8 h-8 rounded-full shrink-0 text-white text-xs font-bold"
      style={{ backgroundColor: tx.merchant_color || '#3b82f6' }}>
      {tx.merchant_initials || tx.merchant.slice(0, 2).toUpperCase()}
    </div>
  )
}

function fmt(amount: number, currency = 'GBP') {
  const abs = Math.abs(amount)
  const str = abs >= 1000
    ? abs.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : abs.toFixed(2)
  return `${amount < 0 ? '−' : '+'}${currency === 'GBP' ? '£' : '$'}${str}`
}

function TransactionRow({ tx }: { tx: Transaction }) {
  const [hovered, setHovered] = useState(false)
  return (
    <tr
      className="cursor-pointer transition-colors"
      style={{ borderBottom: '1px solid #1a1a24', backgroundColor: hovered ? '#191924' : 'transparent' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <td className="px-6 py-2.5">
        <div className="flex items-center gap-3">
          <MerchantAvatar tx={tx} />
          <span className="text-sm font-medium text-white truncate max-w-[160px]">{tx.merchant}</span>
        </div>
      </td>
      <td className="px-4 py-2.5 text-sm" style={{ color: '#5c5c72' }}>{tx.reference || '–'}</td>
      <td className="px-4 py-2.5 text-sm" style={{ color: '#8a8a9e' }}>{tx.date_label}</td>
      <td className="px-4 py-2.5 text-sm max-w-[140px] truncate">
        <span style={{ color: '#ccccdd' }}>{tx.status}</span>
        {tx.category && <><span style={{ color: '#5c5c72' }}> · </span><span style={{ color: '#3ecf6e' }}>{tx.category}</span></>}
      </td>
      <td className="px-6 py-2.5 text-right text-sm font-medium"
        style={{ color: tx.amount < 0 ? '#ffffff' : '#3ecf6e' }}>
        {fmt(tx.amount, tx.currency)}
      </td>
    </tr>
  )
}

export default function HomePage({ onSeeAll, onAddMoney }: HomePageProps) {
  const { transactions, balance, loading, error } = useTransactions()
  const [showMoreMenu, setShowMoreMenu] = useState(false)
  const [showDetailsPanel, setShowDetailsPanel] = useState(false)

  const visible = transactions.slice(0, 13)

  return (
    <div className="flex flex-col h-full">
      {/* Account header */}
      <div className="px-6 py-4 border-b" style={{ borderColor: '#1e1e2c' }}>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              {loading ? (
                <div className="h-8 w-32 rounded animate-pulse" style={{ backgroundColor: '#1e1e2d' }} />
              ) : error ? (
                <span className="text-2xl font-bold" style={{ color: '#ef4444' }}>Error</span>
              ) : (
                <span className="text-2xl font-bold text-white">
                  £{balance.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              )}
              <button className="rounded-full p-0.5" style={{ color: '#8a8a9e' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              {/* Union Jack flag */}
              <svg viewBox="0 0 60 30" width="22" height="14" className="shrink-0 rounded-sm overflow-hidden">
                <rect width="60" height="30" fill="#012169"/>
                <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
                <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="4"/>
                <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
                <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
              </svg>
              <span className="text-sm" style={{ color: '#8a8a9e' }}>Main · GBP · Default</span>
              <button style={{ color: '#5c5c72' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
                </svg>
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {/* More (...) */}
            <div className="relative">
              <button
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className="flex items-center justify-center w-8 h-8 rounded-full border transition-colors"
                style={{ borderColor: '#2a2a3d', color: '#8a8a9e', backgroundColor: '#1e1e2d' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#252535' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#1e1e2d' }}
              >
                <span className="text-sm font-bold" style={{ letterSpacing: '2px' }}>···</span>
              </button>
              {showMoreMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowMoreMenu(false)} />
                  <div className="absolute left-0 top-full mt-1 w-48 rounded-xl shadow-2xl z-50 border py-1"
                    style={{ backgroundColor: '#1e1e2d', borderColor: '#2a2a3d' }}>
                    {['Account details', 'Move money', 'Manage account', 'Statements'].map(item => (
                      <button key={item}
                        className="w-full px-4 py-2.5 text-sm text-left transition-colors"
                        style={{ color: '#ccccdd' }}
                        onClick={() => { setShowMoreMenu(false); setShowDetailsPanel(item === 'Account details') }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#252535' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}>
                        {item}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Details */}
            <button
              onClick={() => setShowDetailsPanel(!showDetailsPanel)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium transition-colors"
              style={{ borderColor: '#2a2a3d', color: '#ccccdd', backgroundColor: showDetailsPanel ? '#252535' : '#1e1e2d' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#252535' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = showDetailsPanel ? '#252535' : '#1e1e2d' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Details
            </button>

            {/* Move */}
            <button
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium transition-colors"
              style={{ borderColor: '#2a2a3d', color: '#ccccdd', backgroundColor: '#1e1e2d' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#252535' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#1e1e2d' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m16 3 4 4-4 4" /><path d="M20 7H4" /><path d="m8 21-4-4 4-4" /><path d="M4 17h16" />
              </svg>
              Move
            </button>

            {/* Add money */}
            <button
              onClick={onAddMoney}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-colors"
              style={{ backgroundColor: '#ffffff', color: '#0e0e15' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#e8e8f0' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#ffffff' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" /><path d="M12 5v14" />
              </svg>
              Add money
            </button>
          </div>
        </div>

        {/* Details panel */}
        {showDetailsPanel && (
          <div className="mt-4 p-4 rounded-xl border" style={{ backgroundColor: '#1a1a28', borderColor: '#2a2a3d' }}>
            <h3 className="text-sm font-semibold text-white mb-3">Account Details</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Account name', value: 'SCANVAULT LIMITED' },
                { label: 'Sort code', value: '04-00-75' },
                { label: 'Account number', value: '71842931' },
                { label: 'IBAN', value: 'GB29 REVO 0040 0071 8429 31' },
                { label: 'BIC/SWIFT', value: 'REVOGB21' },
                { label: 'Currency', value: 'British Pound (GBP)' },
              ].map(item => (
                <div key={item.label}>
                  <p className="text-xs" style={{ color: '#5c5c72' }}>{item.label}</p>
                  <p className="text-sm text-white mt-0.5">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Transactions table */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-sm" style={{ color: '#5c5c72' }}>Loading transactions…</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <p className="text-sm" style={{ color: '#ef4444' }}>Failed to load transactions</p>
              <p className="text-xs mt-1" style={{ color: '#5c5c72' }}>{error}</p>
            </div>
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr style={{ borderBottom: '1px solid #1e1e2c' }}>
                <th className="px-6 py-2.5 text-left text-xs font-medium" style={{ color: '#8a8a9e' }}>Transaction</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium" style={{ color: '#8a8a9e' }}>Reference</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium" style={{ color: '#8a8a9e' }}>Date</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium" style={{ color: '#8a8a9e' }}>Status</th>
                <th className="px-6 py-2.5 text-right text-xs font-medium" style={{ color: '#8a8a9e' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {visible.map(tx => <TransactionRow key={tx.id} tx={tx} />)}
            </tbody>
          </table>
        )}

        {!loading && !error && transactions.length > 13 && (
          <div className="flex justify-center py-4" style={{ borderTop: '1px solid #1e1e2c' }}>
            <button
              onClick={onSeeAll}
              className="text-sm font-medium transition-colors px-4 py-2 rounded-lg"
              style={{ color: '#8a8a9e' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff'; (e.currentTarget as HTMLElement).style.backgroundColor = '#1a1a28' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#8a8a9e'; (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}>
              See all
            </button>
          </div>
        )}
        {!loading && !error && transactions.length <= 13 && transactions.length > 0 && (
          <div className="flex justify-center py-4" style={{ borderTop: '1px solid #1e1e2c' }}>
            <button
              onClick={onSeeAll}
              className="text-sm font-medium transition-colors px-4 py-2 rounded-lg"
              style={{ color: '#8a8a9e' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff'; (e.currentTarget as HTMLElement).style.backgroundColor = '#1a1a28' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#8a8a9e'; (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}>
              See all
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
