import { useRef, useState } from 'react'
import { useTransactions } from '../context/TransactionsContext'
import { clearAllTransactions, createTransaction, deleteTransaction, updateOpeningBalance } from '../lib/api'
import type { NewTransaction } from '../lib/api'
import { MerchantAvatar } from './HomePage'

const CATEGORIES = ['Expenses', 'Income', 'Transfers', 'Travel', 'IT & Software', 'Legal', 'Office Supplies', 'Entertainment', 'Miscellaneous']
const COLORS = ['#3b82f6','#e8c547','#003087','#5c1a24','#059669','#2563eb','#7c3aed','#f97316','#10b981','#e63946']

// ── CSV helpers ──────────────────────────────────────────────────────────────

function parseCSVRows(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQ = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (inQ) {
      if (ch === '"' && text[i + 1] === '"') { field += '"'; i++ }
      else if (ch === '"') { inQ = false }
      else field += ch
    } else {
      if (ch === '"') { inQ = true }
      else if (ch === ',') { row.push(field); field = '' }
      else if (ch === '\n' || ch === '\r') {
        if (ch === '\r' && text[i + 1] === '\n') i++
        row.push(field); field = ''
        if (row.some(c => c !== '')) rows.push(row)
        row = []
      } else field += ch
    }
  }
  if (row.length || field) { row.push(field); if (row.some(c => c !== '')) rows.push(row) }
  return rows
}

const MERCHANT_MAP: Record<string, string> = {
  'tesco pfs': 'Tesco',
  'costa coffee': 'Costa Coffee',
  'www.ico.org.uk': 'ICO',
  'the isle of man steam': 'Isle of Man Steam Pac',
  'revolut business fee': 'Revolut Business Fee',
  'domicilium iom limited': 'Domicilium IOM',
  'kettering park hotel': 'Kettering Park Hotel',
  'axa insurance': 'AXA Insurance',
  'morris healthcare': 'Morris Healthcare',
  'ai bridge solutions': 'AI Bridge Solutions',
  'abbey healthcare': 'Abbey Healthcare',
  'hmrc cumbernauld': 'HMRC',
  'disclosure and barring': 'DBS',
}

function cleanMerchant(raw: string): string {
  const lower = raw.toLowerCase()
  for (const [key, val] of Object.entries(MERCHANT_MAP)) {
    if (lower.startsWith(key)) return val
  }
  // Remove trailing Pfs XXXXXX or trailing long numbers
  return raw.replace(/\s+Pfs\s+\d+/i, '').replace(/\s+\d{5,}$/, '').trim()
}

function getInitials(name: string): string {
  return name.split(/\s+/).map(w => w[0] ?? '').join('').toUpperCase().slice(0, 3) || '?'
}

const COLOR_PALETTE = ['#3b82f6','#e8c547','#059669','#7c3aed','#f97316','#10b981','#e63946','#0284c7','#2563eb','#f59e0b','#5c1a24','#003087']
function colorFromMerchant(name: string): string {
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return COLOR_PALETTE[Math.abs(h) % COLOR_PALETTE.length]
}

// Override colors for known merchants
const KNOWN_COLORS: Record<string, string> = {
  'Tesco': '#003087', 'Costa Coffee': '#5c1a24', 'Fasthosts': '#3b82f6',
  'ICO': '#2563eb', 'HMRC': '#ef4444', 'Abbey Healthcare': '#059669',
  'Morris Healthcare': '#059669', 'Revolut Business Fee': '#000000',
  'AI Bridge Solutions': '#7c3aed',
}

function getCategory(type: string, amount: number): string {
  if (type === 'TOPUP') return 'Income'
  if (type === 'FEE') return 'Expenses'
  if (type === 'TRANSFER') return amount > 0 ? 'Income' : 'Transfers'
  return 'Expenses' // CARD_PAYMENT
}

function parseRevolutCSV(text: string): NewTransaction[] {
  const rows = parseCSVRows(text)
  if (rows.length < 2) return []
  const data = rows.slice(1) // skip header
  return data.flatMap(row => {
    const dateStr  = row[0]?.trim()  // Date started
    const type     = row[3]?.trim()  // Type
    const state    = row[4]?.trim()  // State
    const desc     = row[5]?.trim()  // Description
    const ref      = row[6]?.trim()  // Reference
    const amtStr   = row[14]?.trim() // Amount (signed)
    if (!dateStr || !desc || amtStr === undefined) return []
    const amount = parseFloat(amtStr)
    if (isNaN(amount)) return []
    const merchant = cleanMerchant(desc)
    const color    = KNOWN_COLORS[merchant] ?? colorFromMerchant(merchant)
    const dateObj  = new Date(dateStr + 'T12:00:00Z')
    const date_label = dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) +
      ', ' + dateObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    return [{
      merchant,
      merchant_initials: getInitials(merchant),
      merchant_color:    color,
      reference:         ref || '–',
      date_label,
      date_iso:  dateObj.toISOString(),
      status:    state === 'COMPLETED' ? 'Completed' : (state ?? 'Completed'),
      category:  getCategory(type, amount),
      amount,
      currency:  'GBP',
    }]
  })
}

// ── Formatting ───────────────────────────────────────────────────────────────

function fmt(amount: number) {
  const abs = Math.abs(amount)
  const str = abs >= 1000
    ? abs.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : abs.toFixed(2)
  return `${amount < 0 ? '−' : '+'}£${str}`
}

// ── Component ────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const { transactions, balance, openingBalance, loading, error, refetch } = useTransactions()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Add form
  const [form, setForm] = useState({
    merchant: '', merchant_initials: '', merchant_color: '#3b82f6',
    reference: '', amount: '', type: 'debit' as 'debit' | 'credit',
    category: 'Expenses', status: 'Completed', currency: 'GBP',
  })
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  const [successMsg, setSuccessMsg] = useState('')

  // Opening balance
  const [editingOB, setEditingOB] = useState(false)
  const [obValue, setObValue] = useState('')

  // Clear all
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [clearing, setClearing] = useState(false)

  // CSV import
  const [importPreview, setImportPreview] = useState<NewTransaction[] | null>(null)
  const [importing, setImporting] = useState(false)
  const [importProgress, setImportProgress] = useState(0)

  // ── Handlers ──

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
    } catch (err) {
      setDeleteConfirm(null)
      setFormError(err instanceof Error ? err.message : 'Failed to delete transaction')
      setTimeout(() => setFormError(''), 5000)
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

  const handleClearAll = async () => {
    setClearing(true)
    try {
      await clearAllTransactions()
      await refetch()
      setShowClearConfirm(false)
      setSuccessMsg('All transactions cleared!')
      setTimeout(() => setSuccessMsg(''), 4000)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to clear transactions')
      setTimeout(() => setFormError(''), 5000)
    } finally {
      setClearing(false)
    }
  }

  const handleCSVFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const text = ev.target?.result as string
      const parsed = parseRevolutCSV(text)
      setImportPreview(parsed)
    }
    reader.readAsText(file)
    // Reset so same file can be re-selected
    e.target.value = ''
  }

  const handleImport = async () => {
    if (!importPreview) return
    setImporting(true)
    setImportProgress(0)
    const BATCH = 5
    let done = 0
    try {
      for (let i = 0; i < importPreview.length; i += BATCH) {
        const batch = importPreview.slice(i, i + BATCH)
        await Promise.all(batch.map(tx => createTransaction(tx)))
        done += batch.length
        setImportProgress(Math.round((done / importPreview.length) * 100))
      }
      await refetch()
      setSuccessMsg(`Imported ${done} transactions!`)
      setTimeout(() => setSuccessMsg(''), 5000)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Import failed')
      setTimeout(() => setFormError(''), 5000)
    } finally {
      setImporting(false)
      setImportProgress(0)
      setImportPreview(null)
    }
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

        <div className="flex items-center gap-2">
          {successMsg && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
              style={{ backgroundColor: 'rgba(62,207,110,0.15)', color: '#3ecf6e' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {successMsg}
            </div>
          )}

          {/* Import CSV button */}
          <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleCSVFile} />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border transition-colors"
            style={{ borderColor: '#2a2a3d', color: '#ccccdd', backgroundColor: '#1e1e2d' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#252535' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#1e1e2d' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" x2="12" y1="3" y2="15" />
            </svg>
            Import CSV
          </button>

          {/* Clear all button */}
          <button
            onClick={() => setShowClearConfirm(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors"
            style={{ backgroundColor: 'rgba(239,68,68,0.15)', color: '#ef4444' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(239,68,68,0.25)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(239,68,68,0.15)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            Clear all
          </button>
        </div>
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

              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: '#5c5c72' }}>Merchant *</label>
                <input type="text" value={form.merchant} onChange={e => setForm(f => ({ ...f, merchant: e.target.value }))}
                  placeholder="e.g. Amazon" required
                  className="w-full rounded-xl px-3 py-2 text-sm text-white outline-none border placeholder-[#5c5c72]"
                  style={{ backgroundColor: '#252535', borderColor: '#2a2a3d' }} />
              </div>

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

              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: '#5c5c72' }}>Amount (£) *</label>
                <input type="number" min="0.01" step="0.01" value={form.amount}
                  onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                  placeholder="0.00" required
                  className="w-full rounded-xl px-3 py-2 text-sm text-white outline-none border placeholder-[#5c5c72]"
                  style={{ backgroundColor: '#252535', borderColor: '#2a2a3d' }} />
              </div>

              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: '#5c5c72' }}>Reference</label>
                <input type="text" value={form.reference} onChange={e => setForm(f => ({ ...f, reference: e.target.value }))}
                  placeholder="Optional reference"
                  className="w-full rounded-xl px-3 py-2 text-sm text-white outline-none border placeholder-[#5c5c72]"
                  style={{ backgroundColor: '#252535', borderColor: '#2a2a3d' }} />
              </div>

              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: '#5c5c72' }}>Category</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full rounded-xl px-3 py-2 text-sm text-white outline-none border appearance-none"
                  style={{ backgroundColor: '#252535', borderColor: '#2a2a3d' }}>
                  {CATEGORIES.map(c => <option key={c} value={c} style={{ backgroundColor: '#252535' }}>{c}</option>)}
                </select>
              </div>

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
              <p className="text-sm" style={{ color: '#5c5c72' }}>No transactions yet. Add one or import a CSV.</p>
            </div>
          ) : (
            <div className="rounded-2xl border overflow-hidden" style={{ borderColor: '#2a2a3d' }}>
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: '#1a1a28', borderBottom: '1px solid #2a2a3d' }}>
                    {['Transaction', 'Date', 'Category', 'Amount', ''].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#5c5c72' }}>{h}</th>
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

      {/* ── Clear all confirmation modal ── */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}>
          <div className="w-full max-w-sm rounded-2xl border p-6 shadow-2xl" style={{ backgroundColor: '#13131c', borderColor: '#2a2a3d' }}>
            <h3 className="text-lg font-semibold text-white mb-2">Clear all transactions?</h3>
            <p className="text-sm mb-6" style={{ color: '#8a8a9e' }}>
              This will permanently delete all {transactions.length} transaction{transactions.length !== 1 ? 's' : ''} from the database. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowClearConfirm(false)} disabled={clearing}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium border"
                style={{ borderColor: '#2a2a3d', color: '#ccccdd' }}>
                Cancel
              </button>
              <button onClick={handleClearAll} disabled={clearing}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                style={{ backgroundColor: '#ef4444', color: '#ffffff', opacity: clearing ? 0.6 : 1 }}>
                {clearing ? 'Clearing…' : 'Yes, clear all'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CSV import preview modal ── */}
      {importPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}>
          <div className="w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden" style={{ backgroundColor: '#13131c', borderColor: '#2a2a3d' }}>
            <div className="px-6 py-5 border-b" style={{ borderColor: '#2a2a3d' }}>
              <h3 className="text-lg font-semibold text-white">Import CSV</h3>
              <p className="text-sm mt-1" style={{ color: '#8a8a9e' }}>
                {importPreview.length} transactions found — preview below
              </p>
            </div>

            {/* Preview table */}
            <div className="overflow-y-auto" style={{ maxHeight: '320px' }}>
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: '#1a1a28', position: 'sticky', top: 0 }}>
                    {['Merchant', 'Date', 'Category', 'Amount'].map(h => (
                      <th key={h} className="px-4 py-2 text-left text-xs font-medium" style={{ color: '#5c5c72' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {importPreview.slice(0, 50).map((tx, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #1e1e2c' }}>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                            style={{ backgroundColor: tx.merchant_color }}>
                            {(tx.merchant_initials || tx.merchant.slice(0, 1)).slice(0, 2)}
                          </div>
                          <span className="text-xs text-white truncate max-w-[120px]">{tx.merchant}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2 text-xs" style={{ color: '#8a8a9e' }}>{tx.date_label?.split(',')[0]}</td>
                      <td className="px-4 py-2 text-xs" style={{ color: '#8a8a9e' }}>{tx.category}</td>
                      <td className="px-4 py-2 text-xs font-medium" style={{ color: (tx.amount ?? 0) < 0 ? '#ffffff' : '#3ecf6e' }}>
                        {fmt(tx.amount ?? 0)}
                      </td>
                    </tr>
                  ))}
                  {importPreview.length > 50 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-2 text-xs text-center" style={{ color: '#5c5c72' }}>
                        …and {importPreview.length - 50} more
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Progress bar (while importing) */}
            {importing && (
              <div className="px-6 py-3 border-t" style={{ borderColor: '#2a2a3d' }}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs" style={{ color: '#8a8a9e' }}>Importing…</span>
                  <span className="text-xs font-medium text-white">{importProgress}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#2a2a3d' }}>
                  <div className="h-full rounded-full transition-all duration-300" style={{ width: `${importProgress}%`, backgroundColor: '#3ecf6e' }} />
                </div>
              </div>
            )}

            <div className="px-6 py-4 border-t flex gap-3" style={{ borderColor: '#2a2a3d' }}>
              <button onClick={() => setImportPreview(null)} disabled={importing}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium border"
                style={{ borderColor: '#2a2a3d', color: '#ccccdd' }}>
                Cancel
              </button>
              <button onClick={handleImport} disabled={importing}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                style={{ backgroundColor: importing ? '#2a2a3d' : '#ffffff', color: importing ? '#5c5c72' : '#0e0e15', cursor: importing ? 'not-allowed' : 'pointer' }}>
                {importing ? `Importing… ${importProgress}%` : `Import ${importPreview.length} transactions`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
