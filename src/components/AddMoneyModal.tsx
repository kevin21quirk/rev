import { useState } from 'react'
import { createTransaction } from '../lib/api'
import { useTransactions } from '../context/TransactionsContext'

interface AddMoneyModalProps {
  onClose: () => void
}

type Method = 'bank' | 'card' | 'crypto'
type Step = 'select' | 'confirm' | 'success'

export default function AddMoneyModal({ onClose }: AddMoneyModalProps) {
  const { refetch } = useTransactions()
  const [method, setMethod] = useState<Method>('bank')
  const [amount, setAmount] = useState('')
  const [step, setStep] = useState<Step>('select')
  const [loading, setLoading] = useState(false)

  const fee = method === 'card' ? parseFloat(amount || '0') * 0.015 : 0
  const total = parseFloat(amount || '0') + fee

  const handleConfirm = async () => {
    setLoading(true)
    try {
      const now = new Date()
      await createTransaction({
        merchant: method === 'bank' ? 'Bank Transfer' : method === 'card' ? 'Card Top-Up' : 'Crypto Deposit',
        merchant_initials: method === 'bank' ? 'BT' : method === 'card' ? 'CT' : 'CR',
        merchant_color: '#3ecf6e',
        reference: 'Add money',
        date_label: now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ', ' +
          now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
        date_iso: now.toISOString(),
        status: 'Completed',
        category: 'Income',
        amount: parseFloat(amount),
        currency: 'GBP',
      })
      await refetch()
      setStep('success')
      setTimeout(onClose, 2000)
    } catch {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
      <div className="w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden"
        style={{ backgroundColor: '#13131c', borderColor: '#2a2a3d' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: '#1e1e2c' }}>
          <h2 className="text-lg font-semibold text-white">Add money</h2>
          <button onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
            style={{ color: '#8a8a9e' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#1a1a28'; (e.currentTarget as HTMLElement).style.color = '#fff' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#8a8a9e' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" /><path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {step === 'select' && (
            <>
              <p className="text-sm font-medium text-white mb-3">Choose payment method</p>
              <div className="space-y-2 mb-5">
                {([
                  { id: 'bank',   label: 'Bank Transfer',       desc: 'Free · 1-3 business days', icon: '🏦' },
                  { id: 'card',   label: 'Debit / Credit Card', desc: '1.5% fee · Instant',       icon: '💳' },
                  { id: 'crypto', label: 'Crypto',               desc: 'Variable fee · Fast',      icon: '₿' },
                ] as const).map(m => (
                  <button key={m.id} onClick={() => setMethod(m.id)}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border text-left transition-colors"
                    style={{ backgroundColor: method === m.id ? '#1a2c3d' : '#1e1e2d', borderColor: method === m.id ? '#3b5bdb' : '#2a2a3d' }}>
                    <span className="text-xl">{m.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{m.label}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#5c5c72' }}>{m.desc}</p>
                    </div>
                    <div className="w-4 h-4 rounded-full border flex items-center justify-center"
                      style={{ borderColor: method === m.id ? '#3b5bdb' : '#2a2a3d' }}>
                      {method === m.id && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#3b5bdb' }} />}
                    </div>
                  </button>
                ))}
              </div>

              <p className="text-sm font-medium text-white mb-2">Amount</p>
              <div className="flex items-center gap-2 rounded-xl border px-4 py-3 mb-5"
                style={{ backgroundColor: '#1e1e2d', borderColor: '#2a2a3d' }}>
                <span className="text-white font-medium">£</span>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                  placeholder="0.00" min="0.01" step="0.01"
                  className="flex-1 bg-transparent text-white outline-none text-lg font-medium placeholder-[#5c5c72]" />
                <span className="text-sm" style={{ color: '#5c5c72' }}>GBP</span>
              </div>

              <button onClick={() => amount && parseFloat(amount) > 0 && setStep('confirm')}
                className="w-full py-3 rounded-xl text-sm font-semibold transition-colors"
                style={{
                  backgroundColor: amount && parseFloat(amount) > 0 ? '#ffffff' : '#2a2a3d',
                  color: amount && parseFloat(amount) > 0 ? '#0e0e15' : '#5c5c72',
                }}>
                Continue
              </button>
            </>
          )}

          {step === 'confirm' && (
            <>
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-white mb-1">£{parseFloat(amount).toFixed(2)}</div>
                <p className="text-sm" style={{ color: '#8a8a9e' }}>
                  via {method === 'bank' ? 'Bank Transfer' : method === 'card' ? 'Card' : 'Crypto'}
                </p>
              </div>
              <div className="rounded-xl p-4 mb-5 space-y-2" style={{ backgroundColor: '#1e1e2d' }}>
                {[
                  { label: 'Amount',     value: `£${parseFloat(amount).toFixed(2)}` },
                  { label: 'Fee',        value: fee > 0 ? `£${fee.toFixed(2)}` : 'Free', green: fee === 0 },
                  { label: 'Total',      value: `£${total.toFixed(2)}`, bold: true },
                ].map(row => (
                  <div key={row.label} className={`flex justify-between ${row.bold ? 'border-t pt-2 mt-2' : ''}`}
                    style={row.bold ? { borderColor: '#2a2a3d' } : {}}>
                    <span className="text-sm" style={{ color: row.bold ? '#ffffff' : '#8a8a9e' }}>{row.label}</span>
                    <span className="text-sm font-medium"
                      style={{ color: row.green ? '#3ecf6e' : '#ffffff' }}>{row.value}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep('select')}
                  className="flex-1 py-3 rounded-xl text-sm font-medium border transition-colors"
                  style={{ borderColor: '#2a2a3d', color: '#ccccdd', backgroundColor: '#1e1e2d' }}>
                  Back
                </button>
                <button onClick={handleConfirm} disabled={loading}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold transition-colors"
                  style={{ backgroundColor: loading ? '#2a2a3d' : '#ffffff', color: loading ? '#5c5c72' : '#0e0e15' }}>
                  {loading ? 'Processing…' : 'Confirm'}
                </button>
              </div>
            </>
          )}

          {step === 'success' && (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: '#0d2e1a' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3ecf6e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Money added!</h3>
              <p className="text-sm" style={{ color: '#8a8a9e' }}>
                £{parseFloat(amount).toFixed(2)} has been added to your account
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
