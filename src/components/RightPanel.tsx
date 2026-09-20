import { useState } from 'react'
import { useTransactions } from '../context/TransactionsContext'

interface RightPanelProps {
  onAddMoney: () => void
}

function AssetRow({
  icon,
  title,
  subtitle,
  value,
  onClick,
}: {
  icon: JSX.Element
  title: string
  subtitle: string
  value?: string
  onClick?: () => void
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      className="flex items-center gap-3 py-2.5 px-1 rounded-lg cursor-pointer transition-colors"
      style={{ backgroundColor: hovered ? '#1a1a28' : 'transparent' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      <div
        className="flex items-center justify-center w-8 h-8 rounded-full shrink-0"
        style={{ backgroundColor: '#1e1e2d' }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white">{title}</p>
        {subtitle && <p className="text-xs mt-0.5" style={{ color: '#5c5c72' }}>{subtitle}</p>}
      </div>
      {value && <span className="text-sm font-medium text-white shrink-0">{value}</span>}
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5c5c72" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m9 18 6-6-6-6" />
      </svg>
    </div>
  )
}

const trendingRewards = [
  {
    id: 1,
    name: 'Xero',
    months: '6 months',
    bg: 'linear-gradient(135deg, #1a7de1 0%, #0d6bc5 100%)',
    logo: 'X',
  },
  {
    id: 2,
    name: 'GlobalHire',
    discount: '20%',
    bg: 'linear-gradient(135deg, #0e0e15 0%, #1a1a2d 100%)',
    logo: 'R',
    logoColor: '#e8c547',
  },
  {
    id: 3,
    name: 'Revolut People',
    discount: '30%',
    bg: 'linear-gradient(135deg, #1a2a3d 0%, #0e1a2a 100%)',
    logo: 'R',
    logoColor: '#ffffff',
  },
]

export default function RightPanel({ onAddMoney }: RightPanelProps) {
  const { balance } = useTransactions()
  const [showPaymentLinkForm, setShowPaymentLinkForm] = useState(false)

  return (
    <div
      className="w-[280px] shrink-0 h-full overflow-y-auto border-l flex flex-col"
      style={{ backgroundColor: '#13131c', borderColor: '#1e1e2c' }}
    >
      <div className="flex-1 px-4 py-4">
        {/* Payment links */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-3">
            <button
              className="flex items-center gap-1 text-sm font-semibold text-white hover:opacity-75 transition-opacity"
              onClick={() => setShowPaymentLinkForm(false)}
            >
              Payment links
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>

          {showPaymentLinkForm ? (
            <div
              className="rounded-xl p-4 border"
              style={{ backgroundColor: '#1e1e2d', borderColor: '#2a2a3d' }}
            >
              <h4 className="text-sm font-semibold text-white mb-3">New payment link</h4>
              <div className="mb-3">
                <label className="text-xs mb-1 block" style={{ color: '#5c5c72' }}>Amount</label>
                <input
                  type="number"
                  placeholder="0.00"
                  className="w-full bg-transparent border rounded-lg px-3 py-2 text-sm text-white outline-none placeholder-[#5c5c72]"
                  style={{ borderColor: '#2a2a3d' }}
                />
              </div>
              <div className="mb-3">
                <label className="text-xs mb-1 block" style={{ color: '#5c5c72' }}>Description</label>
                <input
                  type="text"
                  placeholder="Payment description"
                  className="w-full bg-transparent border rounded-lg px-3 py-2 text-sm text-white outline-none placeholder-[#5c5c72]"
                  style={{ borderColor: '#2a2a3d' }}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowPaymentLinkForm(false)}
                  className="flex-1 py-2 rounded-lg text-sm font-medium border transition-colors"
                  style={{ borderColor: '#2a2a3d', color: '#8a8a9e' }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowPaymentLinkForm(false)}
                  className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={{ backgroundColor: '#ffffff', color: '#0e0e15' }}
                >
                  Create
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowPaymentLinkForm(true)}
              className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors"
              style={{ borderColor: '#2a2a3d', color: '#ccccdd', backgroundColor: '#1e1e2d' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#252535' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#1e1e2d' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8a8a9e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="M12 5v14" />
              </svg>
              Create payment link
            </button>
          )}
        </div>

        {/* Divider */}
        <div className="mb-4" style={{ height: '1px', backgroundColor: '#1e1e2c' }} />

        {/* Total assets */}
        <div className="mb-4">
          <p className="text-xs font-medium mb-1" style={{ color: '#5c5c72' }}>Total assets</p>
          <p className="text-xl font-bold text-white">
            £{balance.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        {/* Asset rows */}
        <div className="space-y-0.5 mb-5">
          <AssetRow
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3ecf6e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
                <path d="M12 18V6" />
              </svg>
            }
            title="Cash"
            subtitle=""
            value={`£${balance.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          />
          <AssetRow
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5b9cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
                <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
              </svg>
            }
            title="Savings"
            subtitle="Start saving"
          />
          <AssetRow
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                <line x1="3" x2="21" y1="6" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            }
            title="Merchant"
            subtitle="Accept payments"
          />
          <AssetRow
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11.767 19.089c4.924.868 6.14-6.025 1.216-6.894m-1.216 6.894L5.86 18.047m5.908 1.042-.074 4.492m-5.908-5.488-.074-4.49m0 0 5.908 1.042M5.785 13.559C.86 12.69 2.076 5.798 7 6.667m-1.215 6.892L11.018 2.064" />
              </svg>
            }
            title="Crypto"
            subtitle="Trade crypto"
          />
          <AssetRow
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="14" x="2" y="5" rx="2" />
                <line x1="2" x2="22" y1="10" y2="10" />
              </svg>
            }
            title="FX Forwards"
            subtitle="Start hedging"
          />
          <AssetRow
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            }
            title="Linked"
            subtitle="Link external account"
          />
        </div>

        {/* Divider */}
        <div className="mb-4" style={{ height: '1px', backgroundColor: '#1e1e2c' }} />

        {/* Trending rewards */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <button className="flex items-center gap-1 text-sm font-semibold text-white hover:opacity-75 transition-opacity">
              Trending rewards
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>

          <div className="flex gap-2">
            {trendingRewards.map(reward => (
              <button
                key={reward.id}
                className="flex-1 rounded-xl overflow-hidden text-left transition-opacity hover:opacity-80"
                style={{ background: reward.bg, minHeight: '80px' }}
              >
                <div className="p-2.5">
                  <div
                    className="flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold mb-2"
                    style={{
                      backgroundColor: reward.logoColor ? 'transparent' : '#1a3a6a',
                      color: reward.logoColor || '#ffffff',
                      border: reward.logoColor === '#ffffff' ? '1px solid #2a3a4a' : 'none',
                    }}
                  >
                    {reward.logo}
                  </div>
                  <p className="text-white text-xs font-semibold leading-tight">{reward.name}</p>
                  {reward.months && (
                    <div className="flex items-center gap-1 mt-1">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#5b9cf6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <p className="text-xs" style={{ color: '#5b9cf6' }}>{reward.months}</p>
                    </div>
                  )}
                  {reward.discount && (
                    <div className="flex items-center gap-1 mt-1">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#3ecf6e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <p className="text-xs" style={{ color: '#3ecf6e' }}>{reward.discount}</p>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
