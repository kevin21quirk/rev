import { useState } from 'react'

const rewards = [
  { id: '1', name: 'Xero Accounting', desc: '6 months free', category: 'Software', points: 0, type: 'partner', color: '#1a7de1', logo: 'X' },
  { id: '2', name: 'GlobalHire', desc: '20% discount', category: 'HR', points: 0, type: 'partner', color: '#2a2a3d', logo: 'GH' },
  { id: '3', name: 'Revolut People', desc: '30% off first year', category: 'HR', points: 0, type: 'revolut', color: '#1e1e2d', logo: 'R' },
  { id: '4', name: 'AWS Credits', desc: '$300 in credits', category: 'Cloud', points: 500, type: 'points', color: '#f59e0b', logo: 'AWS' },
  { id: '5', name: 'Google Workspace', desc: '3 months free', category: 'Productivity', points: 0, type: 'partner', color: '#0284c7', logo: 'G' },
  { id: '6', name: 'Shopify', desc: '3 months free trial', category: 'E-commerce', points: 0, type: 'partner', color: '#95bf47', logo: 'S' },
]

const history = [
  { id: '1', desc: 'Card payment bonus', points: '+120', date: 'Sep 14, 2026', type: 'earned' },
  { id: '2', desc: 'Transfer bonus', points: '+50', date: 'Sep 10, 2026', type: 'earned' },
  { id: '3', desc: 'Monthly subscription bonus', points: '+30', date: 'Sep 1, 2026', type: 'earned' },
  { id: '4', desc: 'Reward redemption – AWS Credits', points: '−500', date: 'Aug 28, 2026', type: 'spent' },
  { id: '5', desc: 'Card payment bonus', points: '+200', date: 'Aug 15, 2026', type: 'earned' },
]

export default function RevPointsPage() {
  const [activeTab, setActiveTab] = useState<'rewards' | 'history'>('rewards')
  const [claimedId, setClaimedId] = useState<string | null>(null)

  const totalPoints = 3_250

  return (
    <div className="p-6 max-w-4xl">
      {/* Points balance */}
      <div
        className="rounded-2xl p-6 mb-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1a2c3d 0%, #0e1a2a 100%)' }}
      >
        <div className="absolute inset-0 opacity-5"
          style={{ background: 'radial-gradient(circle at 80% 50%, #5b9cf6 0%, transparent 60%)' }} />
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e8c547" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span className="text-sm font-medium" style={{ color: '#8a8a9e' }}>RevPoints balance</span>
          </div>
          <p className="text-4xl font-bold text-white mb-4">{totalPoints.toLocaleString()}</p>
          <div className="flex gap-4">
            <div className="rounded-xl px-3 py-2" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
              <p className="text-xs" style={{ color: '#5c5c72' }}>Earned this month</p>
              <p className="text-sm font-semibold text-white">+200 pts</p>
            </div>
            <div className="rounded-xl px-3 py-2" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
              <p className="text-xs" style={{ color: '#5c5c72' }}>Tier</p>
              <p className="text-sm font-semibold" style={{ color: '#e8c547' }}>Gold</p>
            </div>
            <div className="rounded-xl px-3 py-2" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
              <p className="text-xs" style={{ color: '#5c5c72' }}>To next tier</p>
              <p className="text-sm font-semibold text-white">1,750 pts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress to next tier */}
      <div className="rounded-2xl border p-5 mb-6" style={{ backgroundColor: '#1e1e2d', borderColor: '#2a2a3d' }}>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-white">Progress to Platinum</span>
          <span className="text-sm" style={{ color: '#8a8a9e' }}>{totalPoints.toLocaleString()} / 5,000</span>
        </div>
        <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#2a2a3d' }}>
          <div className="h-full rounded-full" style={{ width: `${(totalPoints / 5000) * 100}%`, background: 'linear-gradient(to right, #e8c547, #f59e0b)' }} />
        </div>
        <p className="text-xs mt-2" style={{ color: '#5c5c72' }}>Earn 1,750 more points to reach Platinum status</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl mb-5 w-fit" style={{ backgroundColor: '#1e1e2d' }}>
        {(['rewards', 'history'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="px-5 py-2 rounded-lg text-sm font-medium capitalize transition-colors"
            style={{ backgroundColor: activeTab === tab ? '#2a2a3d' : 'transparent', color: activeTab === tab ? '#ffffff' : '#8a8a9e' }}
          >
            {tab === 'rewards' ? 'Available rewards' : 'Points history'}
          </button>
        ))}
      </div>

      {activeTab === 'rewards' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {rewards.map(r => (
            <div
              key={r.id}
              className="rounded-2xl border p-4 flex flex-col"
              style={{ backgroundColor: '#1e1e2d', borderColor: '#2a2a3d' }}
            >
              <div
                className="flex items-center justify-center w-10 h-10 rounded-xl text-sm font-bold text-white mb-3"
                style={{ backgroundColor: r.color }}
              >
                {r.logo}
              </div>
              <p className="text-sm font-semibold text-white mb-1">{r.name}</p>
              <p className="text-xs mb-1" style={{ color: '#3ecf6e' }}>{r.desc}</p>
              <p className="text-xs mb-3" style={{ color: '#5c5c72' }}>{r.category}</p>
              {r.points > 0 && (
                <p className="text-xs mb-3" style={{ color: '#8a8a9e' }}>{r.points} points required</p>
              )}
              <button
                onClick={() => setClaimedId(r.id)}
                className="mt-auto py-2 rounded-xl text-xs font-semibold transition-colors"
                style={{
                  backgroundColor: claimedId === r.id ? 'rgba(62,207,110,0.15)' : '#2a2a3d',
                  color: claimedId === r.id ? '#3ecf6e' : '#ccccdd',
                }}
              >
                {claimedId === r.id ? '✓ Claimed' : r.points > 0 ? `Redeem (${r.points} pts)` : 'Claim offer'}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border overflow-hidden" style={{ borderColor: '#2a2a3d' }}>
          {history.map((h, i) => (
            <div
              key={h.id}
              className="flex items-center justify-between px-5 py-4 transition-colors"
              style={{ borderBottom: i < history.length - 1 ? '1px solid #1e1e2c' : 'none' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#191924' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center w-9 h-9 rounded-full"
                  style={{ backgroundColor: h.type === 'earned' ? 'rgba(62,207,110,0.15)' : 'rgba(239,68,68,0.15)' }}
                >
                  {h.type === 'earned' ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3ecf6e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m18 15-6-6-6 6" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{h.desc}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#5c5c72' }}>{h.date}</p>
                </div>
              </div>
              <span className="text-sm font-semibold" style={{ color: h.type === 'earned' ? '#3ecf6e' : '#ef4444' }}>
                {h.points} pts
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
