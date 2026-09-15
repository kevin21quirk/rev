import { useState } from 'react'

type TransferType = 'send' | 'request' | 'exchange'

interface Contact {
  id: string
  name: string
  initials: string
  color: string
  accountNumber?: string
  sortCode?: string
}

const recentContacts: Contact[] = [
  { id: '1', name: 'Kevin Quirk', initials: 'KQ', color: '#e8c547' },
  { id: '2', name: 'Fasthosts', initials: 'FH', color: '#3b82f6' },
  { id: '3', name: 'ICO', initials: 'ICO', color: '#2563eb' },
]

export default function TransfersPage() {
  const [transferType, setTransferType] = useState<TransferType>('send')
  const [amount, setAmount] = useState('')
  const [recipient, setRecipient] = useState('')
  const [reference, setReference] = useState('')
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [step, setStep] = useState<'form' | 'confirm' | 'success'>('form')

  const handleContinue = () => {
    if (!amount || parseFloat(amount) <= 0) return
    if (!recipient && !selectedContact) return
    setStep('confirm')
  }

  const handleConfirm = () => {
    setStep('success')
    setTimeout(() => {
      setStep('form')
      setAmount('')
      setRecipient('')
      setReference('')
      setSelectedContact(null)
    }, 3000)
  }

  const recipientName = selectedContact ? selectedContact.name : recipient

  return (
    <div className="p-6 max-w-2xl">
      {/* Transfer type tabs */}
      <div className="flex gap-1 p-1 rounded-xl mb-6 w-fit" style={{ backgroundColor: '#1e1e2d' }}>
        {(['send', 'request', 'exchange'] as const).map(t => (
          <button
            key={t}
            onClick={() => { setTransferType(t); setStep('form') }}
            className="px-5 py-2 rounded-lg text-sm font-medium capitalize transition-colors"
            style={{
              backgroundColor: transferType === t ? '#2a2a3d' : 'transparent',
              color: transferType === t ? '#ffffff' : '#8a8a9e',
            }}
          >
            {t === 'send' ? 'Send money' : t === 'request' ? 'Request' : 'Exchange'}
          </button>
        ))}
      </div>

      {step === 'form' && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Form */}
          <div className="md:col-span-3">
            <div className="rounded-2xl border p-5" style={{ backgroundColor: '#1e1e2d', borderColor: '#2a2a3d' }}>
              {/* Recipient */}
              <div className="mb-4">
                <label className="text-sm font-medium text-white mb-2 block">
                  {transferType === 'send' ? 'To' : transferType === 'request' ? 'Request from' : 'Exchange'}
                </label>
                {selectedContact ? (
                  <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: '#252535' }}>
                    <div className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold text-white"
                      style={{ backgroundColor: selectedContact.color }}>
                      {selectedContact.initials}
                    </div>
                    <span className="text-sm font-medium text-white flex-1">{selectedContact.name}</span>
                    <button onClick={() => setSelectedContact(null)} style={{ color: '#5c5c72' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <input
                    type="text"
                    value={recipient}
                    onChange={e => setRecipient(e.target.value)}
                    placeholder={transferType === 'exchange' ? 'Select currency...' : 'Name, account number, email...'}
                    className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none placeholder-[#5c5c72] border"
                    style={{ backgroundColor: '#252535', borderColor: '#2a2a3d' }}
                  />
                )}
              </div>

              {/* Amount */}
              <div className="mb-4">
                <label className="text-sm font-medium text-white mb-2 block">Amount</label>
                <div className="flex items-center gap-2 rounded-xl border px-4 py-3" style={{ backgroundColor: '#252535', borderColor: '#2a2a3d' }}>
                  <span className="text-lg font-medium" style={{ color: '#8a8a9e' }}>£</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="flex-1 bg-transparent text-white outline-none text-xl font-medium placeholder-[#5c5c72]"
                  />
                  <span className="text-sm font-medium" style={{ color: '#5c5c72' }}>GBP</span>
                </div>
                <p className="text-xs mt-1.5" style={{ color: '#5c5c72' }}>
                  Available: £7,416.38
                </p>
              </div>

              {/* Reference */}
              {transferType !== 'exchange' && (
                <div className="mb-5">
                  <label className="text-sm font-medium text-white mb-2 block">Reference (optional)</label>
                  <input
                    type="text"
                    value={reference}
                    onChange={e => setReference(e.target.value)}
                    placeholder="What's this payment for?"
                    className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none placeholder-[#5c5c72] border"
                    style={{ backgroundColor: '#252535', borderColor: '#2a2a3d' }}
                  />
                </div>
              )}

              <button
                onClick={handleContinue}
                disabled={!amount || parseFloat(amount) <= 0 || (!recipient && !selectedContact)}
                className="w-full py-3 rounded-xl text-sm font-semibold transition-colors"
                style={{
                  backgroundColor: amount && parseFloat(amount) > 0 && (recipient || selectedContact) ? '#ffffff' : '#2a2a3d',
                  color: amount && parseFloat(amount) > 0 && (recipient || selectedContact) ? '#0e0e15' : '#5c5c72',
                  cursor: amount && parseFloat(amount) > 0 && (recipient || selectedContact) ? 'pointer' : 'not-allowed',
                }}
              >
                {transferType === 'send' ? 'Continue' : transferType === 'request' ? 'Send request' : 'Review exchange'}
              </button>
            </div>
          </div>

          {/* Recent contacts */}
          <div className="md:col-span-2">
            <h3 className="text-sm font-semibold text-white mb-3">Recent</h3>
            <div className="space-y-2">
              {recentContacts.map(contact => (
                <button
                  key={contact.id}
                  onClick={() => setSelectedContact(contact)}
                  className="flex items-center gap-3 w-full p-3 rounded-xl text-left transition-colors"
                  style={{ backgroundColor: 'transparent' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#1a1a28' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}
                >
                  <div className="flex items-center justify-center w-9 h-9 rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: contact.color }}>
                    {contact.initials}
                  </div>
                  <span className="text-sm font-medium text-white">{contact.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 'confirm' && (
        <div className="rounded-2xl border p-6 max-w-md" style={{ backgroundColor: '#1e1e2d', borderColor: '#2a2a3d' }}>
          <h3 className="text-lg font-semibold text-white mb-5">Confirm transfer</h3>

          <div className="text-center mb-6">
            <div className="text-4xl font-bold text-white">£{parseFloat(amount).toFixed(2)}</div>
            <p className="text-sm mt-1" style={{ color: '#8a8a9e' }}>to {recipientName}</p>
          </div>

          <div className="space-y-3 mb-6">
            {[
              { label: 'From', value: 'Main · GBP' },
              { label: 'To', value: recipientName },
              { label: 'Amount', value: `£${parseFloat(amount).toFixed(2)}` },
              { label: 'Fee', value: 'Free' },
              { label: 'Reference', value: reference || 'No reference' },
            ].map(item => (
              <div key={item.label} className="flex justify-between">
                <span className="text-sm" style={{ color: '#8a8a9e' }}>{item.label}</span>
                <span className="text-sm font-medium text-white">{item.value}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep('form')}
              className="flex-1 py-3 rounded-xl text-sm font-medium border transition-colors"
              style={{ borderColor: '#2a2a3d', color: '#ccccdd', backgroundColor: '#252535' }}
            >
              Back
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 py-3 rounded-xl text-sm font-semibold transition-colors"
              style={{ backgroundColor: '#ffffff', color: '#0e0e15' }}
            >
              Send now
            </button>
          </div>
        </div>
      )}

      {step === 'success' && (
        <div className="text-center py-12">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ backgroundColor: '#0d2e1a' }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#3ecf6e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h3 className="text-2xl font-semibold text-white mb-2">Transfer sent!</h3>
          <p className="text-sm" style={{ color: '#8a8a9e' }}>
            £{parseFloat(amount).toFixed(2)} sent to {recipientName}
          </p>
        </div>
      )}
    </div>
  )
}
