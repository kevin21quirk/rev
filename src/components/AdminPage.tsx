import { useState } from 'react'
import { useTransactions } from '../context/TransactionsContext'
import { createTransaction, deleteTransaction, updateOpeningBalance } from '../lib/api'
import { MerchantAvatar } from './HomePage'

const CATEGORIES = ['Expenses', 'Income', 'Transfers', 'Travel', 'IT & Software', 'Legal', 'Office Supplies', 'Entertainment', 'Miscellaneous']
const COLORS = ['#3b82f6','#e8c547','#003087','#5c1a24','#059669','#2563eb','#7c3aed','#f97316','#10b981','#e63946']

function fmt(amount: number) {
  const abs = Math.abs(amount)
  const str = abs >= 1000
    ? abs.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : abs.toFixed(2)
  return `${amount < 0 ? '−' : '+'}£${str}`
}

export default function AdminPage() {
  const { transactions, balance, openingBalance, loading, error, refetch } = useTransactions()

  // Add form state
  const [form, setForm] = useState({
    merchant: '',
    merchant_initials: '',
    merchant_color: '#3b82f6',
    reference: '',
    amount: '',
    type: 'debit' as 'debit' | 'credit',
    category: 'Expenses',
    status: 'Completed',
    currency: 'GBP',
  })
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  const [successMsg, setSuccessMsg] = useState('')

  // Opening balance edit
  const [editingOB, setEditingOB] = useState(false)
  const [obValue, setObValue] = useState('')

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    if (!form.merchant.trim()) return setFormError('Merchant name is required')
    if (!form.amount || isNaN(parseFloat(form.amount))) return setFormError('Valid amount is required')

    setSaving(true)
    try {
      const rawAmount = parseFloat(form.amount)
      const amount = form.type === 'debit' ? -Math.abs(rawAmount) : Math.abs(rawAmount)
      const now = new Date()
      await createTransaction({
        merchant: form.merchant.trim(),
        merchant_initials: form.merchant_initials.trim() || form.merchant.slice(0, 3).toUpperCase(),
        merchant_color: form.merchant_color,
        reference: form.reference.trim() || '–',
        date_label: now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ', ' +
          now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
        date_iso: now.toISOString(),
        status: form.status,
        category: form.category,
        amount,
        currency: form.currency,
      })
      await refetch()
      setForm({ merchant: '', merchant_initials: '', merchant_color: '#3b82f6', reference: '', amount: '', type: 'debit', category: 'Expenses', status: 'Completed', currency: 'GBP' })
      setSuccessMsg('Transaction added!')
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to add transaction')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    setDeletingId(id)
    try {
      await deleteTransaction(id)
      await refetch()
      setDeleteConfirm(null)
      setSuccessMsg('Transaction deleted!')
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch {
      // ignore
    } finally {
      setDeletingId(null)
    }
  }

  const handleSaveOB = async () => {
    const v = parseFloat(obValue)
    if (isNaN(v)) return
    await updateOpeningBalance(v)
    await refetch()
    setEditingOB(false)
    setSuccessMsg('Opening balance updated!')
    setTimeout(() => setSuccessMsg(''), 3000)
  }

  const totalIn  = transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0)
  const totalOut = transactions.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0)

  return (
    <div className="p-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5b9cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Admin Dashboard
          </h2>
          <p className="text-sm mt-0.5" style={{ color: '#8a8a9e' }}>Manage transactions and account settings</p>
        </div>
        {successMsg && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
            style={{ backgroundColor: 'rgba(62,207,110,0.15)', color: '#3ecf6e' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {successMsg}
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Current balance', value: `£${balance.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: '#ffffff', sub: 'Opening + transactions' },
          { label: 'Opening balance', value: `£${openingBalance.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: '#5b9cf6', sub: 'Base amount', editable: true },
          { label: 'Total credits', value: `+£${totalIn.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: '#3ecf6e', sub: `${transactions.filter(t => t.amount > 0).length} transactions` },
          { label: 'Total debits', value: `-£${totalOut.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: '#ef4444', sub: `${transactions.filter(t => t.amount < 0).length} transactions` },
        ].map(card => (
          <div key={card.label} className="rounded-2xl border p-4" style={{ backgroundColor: '#1e1e2d', borderColor: '#2a2a3d' }}>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs" style={{ color: '#5c5c72' }}>{card.label}</p>
              {card.editable && (
                <button onClick={() => { setEditingOB(true); setObValue(String(openingBalance)) }}
                  className="text-xs px-2 py-0.5 rounded transition-colors"
                  style={{ color: '#5b9cf6', backgroundColor: 'rgba(91,156,246,0.1)' }}>
                  Edit
                </button>
              )}
            </div>
            {card.editable && editingOB ? (
              <div className="flex gap-1 mt-1">
                <input type="number" value={obValue} onChange={e => setObValue(e.target.value)}
                  className="flex-1 rounded-lg px-2 py-1 text-sm text-white outline-none border min-w-0"
                  style={{ backgroundColor: '#252535', borderColor: '#2a2a3d' }} />
                <button onClick={handleSaveOB} className="px-2 py-1 rounded-lg text-xs font-semibold"
                  style={{ backgroundColor: '#ffffff', color: '#0e0e15' }}>Save</button>
                <button onClick={() => setEditingOB(false)} className="px-2 py-1 rounded-lg text-xs"
                  style={{ backgroundColor: '#2a2a3d', color: '#8a8a9e' }}>✕</button>
              </div>
            ) : (
              <p className="text-xl font-bold mt-1" style={{ color: card.color }}>{card.value}</p>
            )}
            <p className="text-xs mt-1" style={{ color: '#5c5c72' }}>{card.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Add Transaction Form */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border p-5 sticky top-4" style={{ backgroundColor: '#1e1e2d', borderColor: '#2a2a3d' }}>
            <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#3ecf6e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" /><path d="M12 5v14" />
              </svg>
              Add Transaction
            </h3>
            <form onSubmit={handleAdd} className="space-y-3">
              {/* Type toggle */}
              <div className="flex rounded-xl overflow-hidden border" style={{ borderColor: '#2a2a3d' }}>
                {(['debit', 'credit'] as const).map(t => (
                  <button key={t} type="button" onClick={() => setForm(f => ({ ...f, type: t, category: t === 'credit' ? 'Income' : 'Expenses' }))}
                    className="flex-1 py-2 text-sm font-medium capitalize transition-colors"
                    style={{
                      backgroundColor: form.type === t ? (t === 'debit' ? 'rgba(239,68,68,0.15)' : 'rgba(62,207,110,0.15)') : 'transparent',
                      color: form.type === t ? (t === 'debit' ? '#ef4444' : '#3ecf6e') : '#8a8a9e',
                    }}>
                    {t === 'debit' ? '− Debit' : '+ Credit'}
                  </button>
                ))}
              </div>

              {/* Merchant */}
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: '#5c5c72' }}>Merchant *</label>
                <input type="text" value={form.merchant} onChange={e => setForm(f => ({ ...f, merchant: e.target.value }))}
                  placeholder="e.g. Amazon" required
                  className="w-full rounded-xl px-3 py-2 text-sm text-white outline-none border placeholder-[#5c5c72]"
                  style={{ backgroundColor: '#252535', borderColor: '#2a2a3d' }} />
              </div>

              {/* Initials + Color */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-xs font-medium block mb-1" style={{ color: '#5c5c72' }}>Initials</label>
                  <input type="text" maxLength={4} value={form.merchant_initials}
                    onChange={e => setForm(f => ({ ...f, merchant_initials: e.target.value.toUpperCase() }))}
                    placeholder="e.g. AMZ"
                    className="w-full rounded-xl px-3 py-2 text-sm text-white outline-none border uppercase placeholder-[#5c5c72]"
                    style={{ backgroundColor: '#252535', borderColor: '#2a2a3d' }} />
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: '#5c5c72' }}>Avatar color</label>
                  <div className="flex gap-1 flex-wrap" style={{ maxWidth: '120px' }}>
                    {COLORS.map(c => (
                      <button key={c} type="button" onClick={() => setForm(f => ({ ...f, merchant_color: c }))}
                        className="w-5 h-5 rounded-full transition-transform"
                        style={{ backgroundColor: c, transform: form.merchant_color === c ? 'scale(1.3)' : 'scale(1)', outline: form.merchant_color === c ? '2px solid #fff' : 'none', outlineOffset: '1px' }} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: '#5c5c72' }}>Amount (£) *</label>
                <input type="number" min="0.01" step="0.01" value={form.amount}
                  onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                  placeholder="0.00" required
                  className="w-full rounded-xl px-3 py-2 text-sm text-white outline-none border placeholder-[#5c5c72]"
                  style={{ backgroundColor: '#252535', borderColor: '#2a2a3d' }} />
              </div>

              {/* Reference */}
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: '#5c5c72' }}>Reference</label>
                <input type="text" value={form.reference} onChange={e => setForm(f => ({ ...f, reference: e.target.value }))}
                  placeholder="Optional reference"
                  className="w-full rounded-xl px-3 py-2 text-sm text-white outline-none border placeholder-[#5c5c72]"
                  style={{ backgroundColor: '#252535', borderColor: '#2a2a3d' }} />
              </div>

              {/* Category */}
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: '#5c5c72' }}>Category</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full rounded-xl px-3 py-2 text-sm text-white outline-none border appearance-none"
                  style={{ backgroundColor: '#252535', borderColor: '#2a2a3d' }}>
                  {CATEGORIES.map(c => <option key={c} value={c} style={{ backgroundColor: '#252535' }}>{c}</option>)}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: '#5c5c72' }}>Status</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  className="w-full rounded-xl px-3 py-2 text-sm text-white outline-none border appearance-none"
                  style={{ backgroundColor: '#252535', borderColor: '#2a2a3d' }}>
                  {['Completed', 'Pending', 'Declined', 'Refunded'].map(s => (
                    <option key={s} value={s} style={{ backgroundColor: '#252535' }}>{s}</option>
                  ))}
                </select>
              </div>

              {formError && <p className="text-xs" style={{ color: '#ef4444' }}>{formError}</p>}

              {/* Preview */}
              {form.merchant && form.amount && (
                <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: '#252535' }}>
                  <MerchantAvatar tx={{ merchant: form.merchant, merchant_initials: form.merchant_initials || form.merchant.slice(0, 3).toUpperCase(), merchant_color: form.merchant_color }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{form.merchant}</p>
                    <p className="text-xs" style={{ color: '#5c5c72' }}>{form.category}</p>
                  </div>
                  <span className="text-sm font-bold" style={{ color: form.type === 'credit' ? '#3ecf6e' : '#ef4444' }}>
                    {form.type === 'debit' ? '−' : '+'}£{parseFloat(form.amount || '0').toFixed(2)}
                  </span>
                </div>
              )}

              <button type="submit" disabled={saving}
                className="w-full py-2.5 rounded-xl text-sm font-semibold transition-colors"
                style={{ backgroundColor: saving ? '#2a2a3d' : '#ffffff', color: saving ? '#5c5c72' : '#0e0e15', cursor: saving ? 'not-allowed' : 'pointer' }}>
                {saving ? 'Adding…' : '+ Add Transaction'}
              </button>
            </form>
          </div>
        </div>

        {/* Transactions list */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-white">
              All Transactions
              <span className="ml-2 text-sm font-normal" style={{ color: '#5c5c72' }}>({transactions.length})</span>
            </h3>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <p className="text-sm" style={{ color: '#5c5c72' }}>Loading…</p>
            </div>
          ) : error ? (
            <div className="rounded-2xl border p-5 text-center" style={{ borderColor: '#2a2a3d' }}>
              <p className="text-sm" style={{ color: '#ef4444' }}>{error}</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="rounded-2xl border p-10 text-center" style={{ borderColor: '#2a2a3d', backgroundColor: '#1e1e2d' }}>
              <p className="text-sm" style={{ color: '#5c5c72' }}>No transactions yet. Add one using the form.</p>
            </div>
          ) : (
            <div className="rounded-2xl border overflow-hidden" style={{ borderColor: '#2a2a3d' }}>
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: '#1a1a28', borderBottom: '1px solid #2a2a3d' }}>
                    {['Transaction', 'Date', 'Category', 'Amount', ''].map(h => (
                      <th key={h} className={`px-4 py-3 text-left text-xs font-medium`} style={{ color: '#5c5c72' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx, i) => (
                    <tr key={tx.id}
                      style={{ borderBottom: i < transactions.length - 1 ? '1px solid #1e1e2c' : 'none' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#191924' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <MerchantAvatar tx={tx} />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-white truncate max-w-[130px]">{tx.merchant}</p>
                            {tx.reference !== '–' && <p className="text-xs truncate max-w-[130px]" style={{ color: '#5c5c72' }}>{tx.reference}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-xs" style={{ color: '#8a8a9e' }}>{tx.date_label}</td>
                      <td className="px-4 py-2.5">
                        <span className="text-xs px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: '#2a2a3d', color: '#8a8a9e' }}>{tx.category}</span>
                      </td>
                      <td className="px-4 py-2.5 text-sm font-medium"
                        style={{ color: tx.amount < 0 ? '#ffffff' : '#3ecf6e' }}>
                        {fmt(tx.amount)}
                      </td>
                      <td className="px-4 py-2.5">
                        {deleteConfirm === tx.id ? (
                          <div className="flex gap-1">
                            <button onClick={() => handleDelete(tx.id)} disabled={deletingId === tx.id}
                              className="px-2 py-1 rounded text-xs font-semibold"
                              style={{ backgroundColor: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>
                              {deletingId === tx.id ? '…' : 'Yes'}
                            </button>
                            <button onClick={() => setDeleteConfirm(null)} className="px-2 py-1 rounded text-xs"
                              style={{ backgroundColor: '#2a2a3d', color: '#8a8a9e' }}>No</button>
                          </div>
                        ) : (
                          <button onClick={() => setDeleteConfirm(tx.id)}
                            className="p-1.5 rounded-lg transition-colors"
                            style={{ color: '#5c5c72' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(239,68,68,0.1)'; (e.currentTarget as HTMLElement).style.color = '#ef4444' }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#5c5c72' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
