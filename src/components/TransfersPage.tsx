import { useState, useRef } from 'react'

interface Recipient {
  id: string
  name: string
  initials: string
  color: string
  paymentDetails: string
  currency: string
  lastTransfer: string
  lastTransferDate: string
  accountNumber?: string
  sortCode?: string
  revtag?: string
  isRevolut?: boolean
  defaultReference?: string
}

const recipients: Recipient[] = [
  {
    id: '1',
    name: 'Kevin Quirk',
    initials: 'KQ',
    color: '#e8c547',
    paymentDetails: '@kquirk',
    currency: 'Multiple',
    lastTransfer: 'You sent £2,000',
    lastTransferDate: 'September 17',
    revtag: '@kquirk',
    isRevolut: true,
  },
  {
    id: '2',
    name: 'Lisa Loizidou',
    initials: 'LL',
    color: '#e84393',
    paymentDetails: '41502460 · 30-12-80',
    currency: 'GBP',
    lastTransfer: 'You sent £21.50',
    lastTransferDate: 'August 28',
    accountNumber: '41502460',
    sortCode: '30-12-80',
  },
  {
    id: '3',
    name: 'HMRC Cumbernauld',
    initials: 'HC',
    color: '#1d4ed8',
    paymentDetails: '12001039 · 08-32-10',
    currency: 'GBP',
    lastTransfer: 'You sent £90.20',
    lastTransferDate: 'August 28',
    accountNumber: '12001039',
    sortCode: '08-32-10',
    defaultReference: '120PZ03880599',
  },
  {
    id: '4',
    name: 'MORRIS HEALTHCARE GROUP LIMITED',
    initials: 'MH',
    color: '#7c3aed',
    paymentDetails: '90809351 · 04-29-09',
    currency: 'GBP',
    lastTransfer: 'You sent £1,200',
    lastTransferDate: 'August 11',
    accountNumber: '90809351',
    sortCode: '04-29-09',
  },
  {
    id: '5',
    name: 'AI BRIDGE SOLUTIONS LIMITED',
    initials: 'AB',
    color: '#059669',
    paymentDetails: '20688237 · 04-29-09',
    currency: 'GBP',
    lastTransfer: 'You sent £1,560',
    lastTransferDate: 'August 3',
    accountNumber: '20688237',
    sortCode: '04-29-09',
  },
]

// Sorted alphabetically for the new-transfer list
const recipientsSorted = [...recipients].sort((a, b) => a.name.localeCompare(b.name))

type Step = 'recipients' | 'new-transfer' | 'send-detail' | 'review' | 'success'
type RecipientsTab = 'Recipients' | 'Pending' | 'Scheduled'

export default function TransfersPage() {
  const [step, setStep] = useState<Step>('recipients')
  const [activeTab, setActiveTab] = useState<RecipientsTab>('Recipients')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null)
  const [amount, setAmount] = useState('')
  const [reference, setReference] = useState('')
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null)
  const [billFile, setBillFile] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const attachInputRef = useRef<HTMLInputElement>(null)
  const billInputRef = useRef<HTMLInputElement>(null)

  const handleSelectRecipient = (r: Recipient) => {
    setSelectedRecipient(r)
    setAmount('')
    setReference(r.defaultReference || '')
    setAttachmentFile(null)
    setBillFile(null)
    setStep('send-detail')
  }

  const handleReview = () => {
    setStep('review')
  }

  const handleConfirm = () => {
    setStep('success')
    setTimeout(() => {
      setStep('recipients')
      setSelectedRecipient(null)
      setAmount('')
      setReference('')
      setAttachmentFile(null)
      setBillFile(null)
    }, 3000)
  }

  const filteredRecipients = recipientsSorted.filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.revtag && r.revtag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  // ── Step: Recipients list ─────────────────────────────────────────────────
  if (step === 'recipients') {
    return (
      <div className="flex flex-col h-full">
        {/* Page header */}
        <div className="px-6 pt-6 pb-0">
          <h1 className="text-2xl font-semibold text-white mb-4">Transfers</h1>

          {/* Tabs + actions */}
          <div className="flex items-center justify-between">
            <div className="flex gap-0">
              {(['Recipients', 'Pending', 'Scheduled'] as RecipientsTab[]).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="px-4 py-2 text-sm font-medium transition-colors border-b-2"
                  style={{
                    borderColor: activeTab === tab ? '#ffffff' : 'transparent',
                    color: activeTab === tab ? '#ffffff' : '#8a8a9e',
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 mb-1">
              {/* Search button */}
              <button
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
                style={{ backgroundColor: '#252535', color: '#ccccdd' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
                Search
              </button>

              {/* More options */}
              <button
                className="flex items-center justify-center w-8 h-8 rounded-full transition-colors"
                style={{ backgroundColor: '#252535', color: '#ccccdd' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
                </svg>
              </button>

              {/* + New */}
              <button
                onClick={() => { setSearchQuery(''); setStep('new-transfer') }}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold transition-colors"
                style={{ backgroundColor: '#ffffff', color: '#0e0e15' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" /><path d="M12 5v14" />
                </svg>
                New
              </button>
            </div>
          </div>

          {/* Table header */}
          {activeTab === 'Recipients' && (
            <div className="grid mt-3 pb-2 border-b" style={{ gridTemplateColumns: '2fr 1.5fr 1fr 1.5fr 1fr', borderColor: '#252538' }}>
              {[`Recipient · ${recipients.length}`, 'Payment details', 'Currency', 'Last transfer', 'Last transfer date'].map(col => (
                <span key={col} className="text-xs font-medium" style={{ color: '#8a8a9e' }}>{col}</span>
              ))}
            </div>
          )}
        </div>

        {/* Table body */}
        {activeTab === 'Recipients' && (
          <div className="flex-1 overflow-y-auto px-6">
            {recipients.map(r => (
              <button
                key={r.id}
                onClick={() => handleSelectRecipient(r)}
                className="grid w-full py-4 border-b text-left transition-colors"
                style={{ gridTemplateColumns: '2fr 1.5fr 1fr 1.5fr 1fr', borderColor: '#252538' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#1e1e2d' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}
              >
                {/* Recipient */}
                <div className="flex items-center gap-3">
                  <div
                    className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold text-white flex-shrink-0"
                    style={{ backgroundColor: r.color }}
                  >
                    {r.initials}
                  </div>
                  <span className="text-sm font-medium text-white truncate">{r.name}</span>
                </div>
                {/* Payment details */}
                <span className="text-sm flex items-center" style={{ color: '#8a8a9e' }}>{r.paymentDetails}</span>
                {/* Currency */}
                <span className="text-sm flex items-center" style={{ color: '#ccccdd' }}>{r.currency}</span>
                {/* Last transfer */}
                <span className="text-sm flex items-center" style={{ color: '#ccccdd' }}>{r.lastTransfer}</span>
                {/* Last transfer date */}
                <span className="text-sm flex items-center" style={{ color: '#ccccdd' }}>{r.lastTransferDate}</span>
              </button>
            ))}
          </div>
        )}

        {activeTab !== 'Recipients' && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm" style={{ color: '#5c5c72' }}>No {activeTab.toLowerCase()} transfers</p>
          </div>
        )}
      </div>
    )
  }

  // ── Step: New transfer ────────────────────────────────────────────────────
  if (step === 'new-transfer') {
    return (
      <div className="flex flex-col items-center min-h-full py-8 px-4">
        {/* Back + title */}
        <div className="w-full max-w-lg">
          <button
            onClick={() => setStep('recipients')}
            className="flex items-center mb-5 transition-colors"
            style={{ color: '#8a8a9e' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#ffffff' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#8a8a9e' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>

          <h2 className="text-xl font-semibold text-white mb-4">New transfer</h2>

          {/* Search */}
          <div className="flex items-center gap-2 rounded-full px-4 py-2.5 mb-5" style={{ backgroundColor: '#252535' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8a8a9e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Recipient, @revtag"
              className="flex-1 bg-transparent text-sm text-white outline-none placeholder-[#5c5c72]"
            />
          </div>

          {/* Category icons */}
          <div className="flex items-center justify-between mb-6 px-2">
            {[
              {
                label: 'Revolut', icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M13.5 2H6v8h5.5c1.933 0 3.5-1.567 3.5-3.5S14.933 2 13.5 2zM6 22V12h5.5c3.038 0 5.5-2.462 5.5-5.5 0-.69-.127-1.35-.357-1.96L19 6.5C19 11.747 14.747 16 9.5 16H6v6H6z" />
                  </svg>
                )
              },
              {
                label: 'Bank', icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                )
              },
              {
                label: 'Card', icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="14" x="2" y="5" rx="2" />
                    <line x1="2" x2="22" y1="10" y2="10" />
                  </svg>
                )
              },
              {
                label: 'Pay bills', icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" x2="8" y1="13" y2="13" />
                    <line x1="16" x2="8" y1="17" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                )
              },
              {
                label: 'Bulk', icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="18" cy="18" r="3" />
                    <circle cx="6" cy="6" r="3" />
                    <path d="M13 6h3a2 2 0 0 1 2 2v7" />
                    <path d="M11 18H8a2 2 0 0 1-2-2V9" />
                    <line x1="6" x2="6" y1="9" y2="9" />
                    <polyline points="3 9 6 6 9 9" />
                  </svg>
                )
              },
              {
                label: 'Link', icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                )
              },
            ].map(({ label, icon }) => (
              <button
                key={label}
                className="flex flex-col items-center gap-2 transition-opacity"
                style={{ color: '#ccccdd' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.7' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-2xl" style={{ backgroundColor: '#252535' }}>
                  {icon}
                </div>
                <span className="text-xs font-medium" style={{ color: '#8a8a9e' }}>{label}</span>
              </button>
            ))}
          </div>

          {/* Recipients list */}
          <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#1e1e2d' }}>
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: '#252538' }}>
              <span className="text-sm font-medium text-white">Recipients · {filteredRecipients.length}</span>
              <button className="text-sm font-medium" style={{ color: '#3b82f6' }}>Add new</button>
            </div>

            {filteredRecipients.map((r, i) => (
              <button
                key={r.id}
                onClick={() => handleSelectRecipient(r)}
                className="flex items-center gap-3 w-full px-4 py-3 text-left transition-colors"
                style={{ borderTop: i > 0 ? '1px solid #252538' : 'none' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#252535' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}
              >
                <div
                  className="flex items-center justify-center w-9 h-9 rounded-full text-xs font-bold text-white flex-shrink-0 relative"
                  style={{ backgroundColor: r.color }}
                >
                  {r.initials}
                  {r.isRevolut && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#0e0e15' }}>
                      <div className="w-3 h-3 rounded-full flex items-center justify-center" style={{ backgroundColor: '#ffffff' }}>
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="#0e0e15">
                          <circle cx="12" cy="12" r="10" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium text-white truncate">{r.name}</span>
                  <span className="text-xs" style={{ color: '#8a8a9e' }}>
                    {r.isRevolut
                      ? `Revolut Personal · ${r.revtag}`
                      : `GBP · ${r.accountNumber} · ${r.sortCode}`}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ── Step: Send detail ─────────────────────────────────────────────────────
  if (step === 'send-detail' && selectedRecipient) {
    const r = selectedRecipient
    const parsedAmount = parseFloat(amount) || 0

    return (
      <div className="flex flex-col min-h-full">
        {/* Recipient header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: '#252538' }}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setStep('new-transfer')}
              className="transition-colors"
              style={{ color: '#8a8a9e' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#ffffff' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#8a8a9e' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="text-sm font-semibold text-white">{r.name}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8a8a9e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>
              <span className="text-xs" style={{ color: '#8a8a9e' }}>
                {r.isRevolut ? r.revtag : `${r.currency} · ${r.accountNumber} · ${r.sortCode}`}
              </span>
            </div>
          </div>
          <button className="text-sm font-semibold" style={{ color: '#3b82f6' }}>Save</button>
        </div>

        {/* Amount area */}
        <div className="flex flex-col items-center py-8 px-6">
          {/* Large amount input */}
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-5xl font-bold text-white">£</span>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0"
              min="0"
              step="0.01"
              className="bg-transparent text-5xl font-bold text-white outline-none text-center placeholder-white"
              style={{ width: Math.max(60, (amount || '0').length * 32) + 'px' }}
            />
          </div>
          <p className="text-sm mb-3" style={{ color: '#8a8a9e' }}>No fees</p>

          {/* Account selector */}
          <button
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors"
            style={{ backgroundColor: '#252535', borderColor: '#3a3a50' }}
          >
            <span className="text-base">🇬🇧</span>
            <span className="text-sm font-medium text-white">Main · £5,252.66</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8a8a9e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </div>

        {/* Fields */}
        <div className="flex-1 px-6 pb-6 max-w-lg mx-auto w-full">
          {/* Reference */}
          <div className="rounded-xl border mb-3 px-4 py-3" style={{ backgroundColor: '#1e1e2d', borderColor: '#2a2a3d' }}>
            <label className="block text-xs font-medium mb-1" style={{ color: '#8a8a9e' }}>Reference</label>
            <input
              type="text"
              value={reference}
              onChange={e => setReference(e.target.value)}
              placeholder="Add a reference"
              className="w-full bg-transparent text-sm text-white outline-none placeholder-[#5c5c72]"
            />
          </div>

          {/* Attachment */}
          <div className="flex items-center justify-between rounded-xl border px-4 py-3 mb-3 cursor-pointer" style={{ backgroundColor: '#1e1e2d', borderColor: '#2a2a3d' }}
            onClick={() => attachInputRef.current?.click()}>
            <span className="text-sm" style={{ color: attachmentFile ? '#ffffff' : '#8a8a9e' }}>
              {attachmentFile ? attachmentFile.name : 'Attachment (optional)'}
            </span>
            <div className="flex items-center gap-1" style={{ color: '#3b82f6' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
              </svg>
              <span className="text-sm font-medium">Upload</span>
            </div>
            <input ref={attachInputRef} type="file" className="hidden" onChange={e => setAttachmentFile(e.target.files?.[0] || null)} />
          </div>

          {/* Bill */}
          <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: '#1e1e2d', borderColor: '#2a2a3d' }}>
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: '#2a2a3d' }}>
              <span className="text-sm font-medium text-white">Bill</span>
              <button className="text-sm font-medium" style={{ color: '#3b82f6' }}>Link bill</button>
            </div>
            <div
              className="flex flex-col items-center justify-center py-8 px-4 cursor-pointer transition-colors"
              style={{ backgroundColor: dragOver ? '#252535' : 'transparent' }}
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => {
                e.preventDefault()
                setDragOver(false)
                const file = e.dataTransfer.files?.[0]
                if (file) setBillFile(file)
              }}
              onClick={() => billInputRef.current?.click()}
            >
              {billFile ? (
                <p className="text-sm text-white">{billFile.name}</p>
              ) : (
                <>
                  <div className="mb-2" style={{ color: '#5c5c72' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" x2="12" y1="3" y2="15" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium" style={{ color: '#3b82f6' }}>Drag & drop or click to upload file</p>
                  <p className="text-xs mt-1" style={{ color: '#8a8a9e' }}>We'll extract and prefill the details for you</p>
                </>
              )}
              <input ref={billInputRef} type="file" className="hidden" onChange={e => setBillFile(e.target.files?.[0] || null)} />
            </div>
          </div>
        </div>

        {/* Review button */}
        <div className="sticky bottom-0 flex items-center justify-center gap-3 py-4 px-6" style={{ backgroundColor: '#1a1a24' }}>
          <button
            className="flex items-center justify-center w-10 h-10 rounded-full border transition-colors"
            style={{ borderColor: '#3a3a50', backgroundColor: '#252535' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8a8a9e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
              <line x1="16" x2="16" y1="2" y2="6" />
              <line x1="8" x2="8" y1="2" y2="6" />
              <line x1="3" x2="21" y1="10" y2="10" />
            </svg>
          </button>
          <button
            onClick={handleReview}
            className="flex-1 max-w-xs py-3 rounded-full text-sm font-semibold transition-colors"
            style={{ backgroundColor: '#ffffff', color: '#0e0e15' }}
          >
            Review
          </button>
        </div>
      </div>
    )
  }

  // ── Step: Review ──────────────────────────────────────────────────────────
  if (step === 'review' && selectedRecipient) {
    const r = selectedRecipient
    const parsedAmount = parseFloat(amount) || 0

    return (
      <div className="flex flex-col items-center min-h-full py-8 px-4">
        <div className="w-full max-w-lg">
          <button
            onClick={() => setStep('send-detail')}
            className="flex items-center mb-5 transition-colors"
            style={{ color: '#8a8a9e' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#ffffff' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#8a8a9e' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>

          <h2 className="text-xl font-semibold text-white mb-6">Review transfer</h2>

          {/* Amount display */}
          <div className="text-center mb-6">
            <div className="text-5xl font-bold text-white mb-1">
              £{parsedAmount > 0 ? parsedAmount.toFixed(2) : '0.00'}
            </div>
            <p className="text-sm" style={{ color: '#8a8a9e' }}>to {r.name}</p>
          </div>

          {/* Summary */}
          <div className="rounded-2xl overflow-hidden mb-4" style={{ backgroundColor: '#1e1e2d' }}>
            {[
              { label: 'From', value: 'Main · GBP' },
              { label: 'To', value: r.name },
              { label: 'Account', value: r.isRevolut ? r.revtag! : `${r.accountNumber} · ${r.sortCode}` },
              { label: 'Amount', value: `£${parsedAmount > 0 ? parsedAmount.toFixed(2) : '0.00'}` },
              { label: 'Fee', value: 'Free' },
              { label: 'Reference', value: reference || 'No reference' },
            ].map((item, i) => (
              <div
                key={item.label}
                className="flex justify-between items-center px-4 py-3"
                style={{ borderTop: i > 0 ? '1px solid #252538' : 'none' }}
              >
                <span className="text-sm" style={{ color: '#8a8a9e' }}>{item.label}</span>
                <span className="text-sm font-medium text-white">{item.value}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep('send-detail')}
              className="flex-1 py-3 rounded-full text-sm font-medium border transition-colors"
              style={{ borderColor: '#2a2a3d', color: '#ccccdd', backgroundColor: '#252535' }}
            >
              Back
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 py-3 rounded-full text-sm font-semibold transition-colors"
              style={{ backgroundColor: '#ffffff', color: '#0e0e15' }}
            >
              Send now
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Step: Success ─────────────────────────────────────────────────────────
  if (step === 'success' && selectedRecipient) {
    const parsedAmount = parseFloat(amount) || 0

    return (
      <div className="flex flex-col items-center justify-center min-h-full py-12">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5" style={{ backgroundColor: '#0d2e1a' }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#3ecf6e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h3 className="text-2xl font-semibold text-white mb-2">Transfer sent!</h3>
        <p className="text-sm" style={{ color: '#8a8a9e' }}>
          £{parsedAmount > 0 ? parsedAmount.toFixed(2) : '0.00'} sent to {selectedRecipient.name}
        </p>
      </div>
    )
  }

  return null
}
