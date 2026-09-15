import { useState } from 'react'

interface Card {
  id: string
  name: string
  last4: string
  type: 'virtual' | 'physical'
  status: 'active' | 'frozen' | 'pending'
  balance: number
  color: string
  expiryMonth: number
  expiryYear: number
}

const cards: Card[] = [
  {
    id: '1',
    name: 'Kevin Quirk',
    last4: '4291',
    type: 'physical',
    status: 'active',
    balance: 7416.38,
    color: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    expiryMonth: 12,
    expiryYear: 28,
  },
  {
    id: '2',
    name: 'Kevin Quirk',
    last4: '7834',
    type: 'virtual',
    status: 'active',
    balance: 0,
    color: 'linear-gradient(135deg, #0d1117 0%, #1a1a2e 100%)',
    expiryMonth: 6,
    expiryYear: 27,
  },
]

export default function CardsPage() {
  const [selectedCard, setSelectedCard] = useState<Card>(cards[0])
  const [showFreezeConfirm, setShowFreezeConfirm] = useState(false)

  const toggleFreeze = () => {
    setShowFreezeConfirm(false)
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-white">Your cards</h2>
          <p className="text-sm mt-0.5" style={{ color: '#8a8a9e' }}>{cards.length} cards</p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          style={{ backgroundColor: '#ffffff', color: '#0e0e15' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#e8e8f0' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#ffffff' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" />
            <path d="M12 5v14" />
          </svg>
          New card
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card list */}
        <div className="space-y-3">
          {cards.map(card => (
            <div
              key={card.id}
              onClick={() => setSelectedCard(card)}
              className="cursor-pointer rounded-2xl p-5 border transition-all"
              style={{
                background: card.color,
                borderColor: selectedCard.id === card.id ? '#3b5bdb' : '#2a2a3d',
                boxShadow: selectedCard.id === card.id ? '0 0 0 2px rgba(59, 91, 219, 0.3)' : 'none',
              }}
            >
              <div className="flex items-start justify-between mb-8">
                <div>
                  <div
                    className="flex items-center justify-center w-8 h-8 rounded-full text-white font-bold text-base"
                    style={{ backgroundColor: '#000000' }}
                  >
                    R
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: card.status === 'active' ? 'rgba(62, 207, 110, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: card.status === 'active' ? '#3ecf6e' : '#ef4444',
                    }}
                  >
                    {card.status === 'active' ? '● Active' : '● Frozen'}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#ccccdd' }}>
                    {card.type}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm font-mono" style={{ color: '#8a8a9e' }}>
                  •••• •••• •••• {card.last4}
                </p>
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs mb-0.5" style={{ color: '#5c5c72' }}>Card holder</p>
                  <p className="text-sm font-medium text-white">{card.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs mb-0.5" style={{ color: '#5c5c72' }}>Expires</p>
                  <p className="text-sm font-medium text-white">
                    {String(card.expiryMonth).padStart(2, '0')}/{card.expiryYear}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Card actions */}
        <div>
          <div className="rounded-2xl border p-5" style={{ backgroundColor: '#1e1e2d', borderColor: '#2a2a3d' }}>
            <h3 className="text-base font-semibold text-white mb-4">Card actions</h3>

            <div className="space-y-2">
              {[
                {
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8a8a9e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  ),
                  label: selectedCard.status === 'active' ? 'Freeze card' : 'Unfreeze card',
                  action: () => setShowFreezeConfirm(true),
                },
                {
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8a8a9e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="14" x="2" y="5" rx="2" />
                      <line x1="2" x2="22" y1="10" y2="10" />
                    </svg>
                  ),
                  label: 'View card details',
                  action: () => {},
                },
                {
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8a8a9e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
                    </svg>
                  ),
                  label: 'Card settings',
                  action: () => {},
                },
                {
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  ),
                  label: 'Terminate card',
                  action: () => {},
                  danger: true,
                },
              ].map(item => (
                <button
                  key={item.label}
                  onClick={item.action}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-left transition-colors"
                  style={{
                    color: item.danger ? '#ef4444' : '#ccccdd',
                    backgroundColor: 'transparent',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#252535' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}
                >
                  {item.icon}
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Spending limit */}
          <div className="rounded-2xl border p-5 mt-4" style={{ backgroundColor: '#1e1e2d', borderColor: '#2a2a3d' }}>
            <h3 className="text-base font-semibold text-white mb-3">Spending limits</h3>
            <div className="mb-3">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-sm" style={{ color: '#8a8a9e' }}>Daily limit</span>
                <span className="text-sm font-medium text-white">£5,000</span>
              </div>
              <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#2a2a3d' }}>
                <div className="h-full rounded-full" style={{ width: '14.8%', backgroundColor: '#3b5bdb' }} />
              </div>
              <p className="text-xs mt-1" style={{ color: '#5c5c72' }}>£740 used today</p>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-sm" style={{ color: '#8a8a9e' }}>Monthly limit</span>
                <span className="text-sm font-medium text-white">£50,000</span>
              </div>
              <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#2a2a3d' }}>
                <div className="h-full rounded-full" style={{ width: '14.8%', backgroundColor: '#3b5bdb' }} />
              </div>
              <p className="text-xs mt-1" style={{ color: '#5c5c72' }}>£7,416 used this month</p>
            </div>
          </div>
        </div>
      </div>

      {/* Freeze confirm dialog */}
      {showFreezeConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-sm rounded-2xl border p-6 shadow-2xl" style={{ backgroundColor: '#13131c', borderColor: '#2a2a3d' }}>
            <h3 className="text-lg font-semibold text-white mb-2">Freeze card?</h3>
            <p className="text-sm mb-6" style={{ color: '#8a8a9e' }}>
              Freezing the card will prevent any new transactions. You can unfreeze it at any time.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowFreezeConfirm(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium border"
                style={{ borderColor: '#2a2a3d', color: '#ccccdd' }}
              >
                Cancel
              </button>
              <button
                onClick={toggleFreeze}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                style={{ backgroundColor: '#ef4444', color: '#ffffff' }}
              >
                Freeze
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
