import { useState } from 'react'

const savingsAccounts = [
  { id: '1', name: 'Flexible Savings', rate: '4.75', balance: 0, currency: 'GBP', type: 'flexible', minDeposit: 1 },
  { id: '2', name: '90-Day Notice', rate: '5.10', balance: 0, currency: 'GBP', type: 'notice', minDeposit: 500 },
  { id: '3', name: '1-Year Fixed Term', rate: '5.40', balance: 0, currency: 'GBP', type: 'fixed', minDeposit: 1000 },
]

const fxRates = [
  { from: 'GBP', to: 'USD', rate: '1.2734', change: '+0.18%', positive: true },
  { from: 'GBP', to: 'EUR', rate: '1.1842', change: '-0.05%', positive: false },
  { from: 'GBP', to: 'JPY', rate: '190.24', change: '+0.42%', positive: true },
  { from: 'GBP', to: 'CHF', rate: '1.1156', change: '-0.12%', positive: false },
  { from: 'GBP', to: 'AUD', rate: '1.9312', change: '+0.31%', positive: true },
]

export default function TreasuryPage() {
  const [activeTab, setActiveTab] = useState<'savings' | 'fx' | 'forwards'>('savings')
  const [showOpenAccount, setShowOpenAccount] = useState<string | null>(null)
  const [depositAmount, setDepositAmount] = useState('')

  return (
    <div className="p-6 max-w-4xl">
      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl mb-6 w-fit" style={{ backgroundColor: '#1e1e2d' }}>
        {([
          { key: 'savings', label: 'Savings' },
          { key: 'fx', label: 'FX Exchange' },
          { key: 'forwards', label: 'FX Forwards' },
        ] as const).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="px-5 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{ backgroundColor: activeTab === tab.key ? '#2a2a3d' : 'transparent', color: activeTab === tab.key ? '#ffffff' : '#8a8a9e' }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'savings' && (
        <>
          {/* Info banner */}
          <div className="rounded-2xl border p-5 mb-6 flex items-center gap-4"
            style={{ backgroundColor: 'rgba(59,91,219,0.08)', borderColor: 'rgba(59,91,219,0.2)' }}>
            <div className="flex items-center justify-center w-10 h-10 rounded-full shrink-0"
              style={{ backgroundColor: 'rgba(59,91,219,0.15)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5b9cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Start earning today</p>
              <p className="text-xs mt-0.5" style={{ color: '#8a8a9e' }}>
                Move funds from your main account to a savings account and earn competitive interest rates.
              </p>
            </div>
          </div>

          {/* Savings products */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {savingsAccounts.map(acc => (
              <div key={acc.id} className="rounded-2xl border p-5 flex flex-col" style={{ backgroundColor: '#1e1e2d', borderColor: '#2a2a3d' }}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs px-2.5 py-1 rounded-full capitalize"
                    style={{ backgroundColor: '#2a2a3d', color: '#8a8a9e' }}>
                    {acc.type === 'flexible' ? 'Flexible' : acc.type === 'notice' ? 'Notice' : 'Fixed term'}
                  </span>
                  <span className="text-xs" style={{ color: '#5c5c72' }}>Min £{acc.minDeposit.toLocaleString()}</span>
                </div>
                <h3 className="text-base font-semibold text-white mb-1">{acc.name}</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold" style={{ color: '#3ecf6e' }}>{acc.rate}%</span>
                  <span className="text-sm ml-1" style={{ color: '#5c5c72' }}>AER</span>
                </div>
                <p className="text-xs mb-4 flex-1" style={{ color: '#5c5c72' }}>
                  {acc.type === 'flexible' && 'Access your money any time. Interest paid monthly.'}
                  {acc.type === 'notice' && 'Give 90 days notice to withdraw. Higher rate reward.'}
                  {acc.type === 'fixed' && 'Lock in your rate for 1 year. Best rate available.'}
                </p>
                <button
                  onClick={() => setShowOpenAccount(acc.id)}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold transition-colors"
                  style={{ backgroundColor: '#ffffff', color: '#0e0e15' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#e8e8f0' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#ffffff' }}
                >
                  Open account
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === 'fx' && (
        <>
          {/* Exchange widget */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="rounded-2xl border p-5" style={{ backgroundColor: '#1e1e2d', borderColor: '#2a2a3d' }}>
              <h3 className="text-sm font-semibold text-white mb-4">Exchange currency</h3>
              <div className="space-y-3 mb-4">
                <div>
                  <label className="text-xs mb-1.5 block" style={{ color: '#5c5c72' }}>You sell</label>
                  <div className="flex gap-2">
                    <select className="rounded-xl px-3 py-2.5 text-sm text-white outline-none border w-24"
                      style={{ backgroundColor: '#252535', borderColor: '#2a2a3d' }}>
                      <option style={{ backgroundColor: '#252535' }}>GBP</option>
                    </select>
                    <input
                      type="number"
                      value={depositAmount}
                      onChange={e => setDepositAmount(e.target.value)}
                      placeholder="0.00"
                      className="flex-1 rounded-xl px-3 py-2.5 text-sm text-white outline-none border placeholder-[#5c5c72]"
                      style={{ backgroundColor: '#252535', borderColor: '#2a2a3d' }}
                    />
                  </div>
                </div>
                <div className="flex justify-center">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full" style={{ backgroundColor: '#2a2a3d' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8a8a9e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m7 16 4-4-4-4" /><path d="m17 8-4 4 4 4" />
                    </svg>
                  </div>
                </div>
                <div>
                  <label className="text-xs mb-1.5 block" style={{ color: '#5c5c72' }}>You get</label>
                  <div className="flex gap-2">
                    <select className="rounded-xl px-3 py-2.5 text-sm text-white outline-none border w-24"
                      style={{ backgroundColor: '#252535', borderColor: '#2a2a3d' }}>
                      <option style={{ backgroundColor: '#252535' }}>USD</option>
                      <option style={{ backgroundColor: '#252535' }}>EUR</option>
                      <option style={{ backgroundColor: '#252535' }}>JPY</option>
                    </select>
                    <div className="flex-1 rounded-xl px-3 py-2.5 text-sm border" style={{ backgroundColor: '#1a1a28', borderColor: '#2a2a3d', color: '#3ecf6e' }}>
                      {depositAmount ? (parseFloat(depositAmount) * 1.2734).toFixed(2) : '0.00'}
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-xs mb-4" style={{ color: '#5c5c72' }}>Rate: 1 GBP = 1.2734 USD · No fee</p>
              <button className="w-full py-2.5 rounded-xl text-sm font-semibold"
                style={{ backgroundColor: '#ffffff', color: '#0e0e15' }}>
                Exchange now
              </button>
            </div>

            <div className="rounded-2xl border p-5" style={{ backgroundColor: '#1e1e2d', borderColor: '#2a2a3d' }}>
              <h3 className="text-sm font-semibold text-white mb-4">Live exchange rates</h3>
              <div className="space-y-3">
                {fxRates.map(rate => (
                  <div key={rate.to} className="flex items-center justify-between py-2 border-b" style={{ borderColor: '#1e1e2c' }}>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">{rate.from}/{rate.to}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-white">{rate.rate}</p>
                      <p className="text-xs" style={{ color: rate.positive ? '#3ecf6e' : '#ef4444' }}>{rate.change}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'forwards' && (
        <div className="flex flex-col items-center py-16">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
            style={{ backgroundColor: '#1e1e2d' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#5b9cf6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Hedge against currency risk</h3>
          <p className="text-sm text-center max-w-sm mb-6" style={{ color: '#8a8a9e' }}>
            Lock in today's exchange rates for future transactions. Protect your business from currency fluctuations.
          </p>
          <button
            className="px-6 py-3 rounded-xl text-sm font-semibold"
            style={{ backgroundColor: '#ffffff', color: '#0e0e15' }}
          >
            Get started with FX Forwards
          </button>
        </div>
      )}

      {/* Open account modal */}
      {showOpenAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-sm rounded-2xl border p-6 shadow-2xl" style={{ backgroundColor: '#13131c', borderColor: '#2a2a3d' }}>
            <h3 className="text-lg font-semibold text-white mb-2">
              Open {savingsAccounts.find(a => a.id === showOpenAccount)?.name}
            </h3>
            <p className="text-sm mb-4" style={{ color: '#8a8a9e' }}>
              Earn {savingsAccounts.find(a => a.id === showOpenAccount)?.rate}% AER on your savings.
            </p>
            <label className="text-sm font-medium text-white mb-1.5 block">Initial deposit (£)</label>
            <input
              type="number"
              value={depositAmount}
              onChange={e => setDepositAmount(e.target.value)}
              placeholder={`Min £${savingsAccounts.find(a => a.id === showOpenAccount)?.minDeposit}`}
              className="w-full rounded-xl px-4 py-2.5 text-sm text-white outline-none border placeholder-[#5c5c72] mb-5"
              style={{ backgroundColor: '#1e1e2d', borderColor: '#2a2a3d' }}
            />
            <div className="flex gap-3">
              <button onClick={() => setShowOpenAccount(null)} className="flex-1 py-2.5 rounded-xl text-sm font-medium border"
                style={{ borderColor: '#2a2a3d', color: '#ccccdd' }}>Cancel</button>
              <button onClick={() => { setShowOpenAccount(null); setDepositAmount('') }} className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                style={{ backgroundColor: '#ffffff', color: '#0e0e15' }}>Open account</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
