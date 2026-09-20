import { useState } from 'react'
import type { NavItem } from '../App'

interface HeaderProps {
  activeNav: NavItem
}

export default function Header({ activeNav }: HeaderProps) {
  const [showSearch, setShowSearch] = useState(false)
  const [showAccountMenu, setShowAccountMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div
      className="flex items-center justify-between px-6 py-3 border-b shrink-0"
      style={{ backgroundColor: '#0e0e15', borderColor: '#1e1e2c', minHeight: '56px' }}
    >
      {/* Page title */}
      <h1 className="text-xl font-semibold text-white">{activeNav}</h1>

      {/* Right controls */}
      <div className="flex items-center gap-2">
        {/* Search */}
        {showSearch ? (
          <div className="flex items-center gap-2 rounded-lg px-3 py-1.5" style={{ backgroundColor: '#1e1e2d' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8a8a9e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              autoFocus
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onBlur={() => { setShowSearch(false); setSearchQuery('') }}
              placeholder="Search..."
              className="bg-transparent text-white text-sm outline-none w-40 placeholder-[#5c5c72]"
            />
          </div>
        ) : (
          <button
            onClick={() => setShowSearch(true)}
            className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
            style={{ color: '#8a8a9e' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#1a1a28'; (e.currentTarget as HTMLElement).style.color = '#fff' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#8a8a9e' }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </button>
        )}

        {/* Grid / Apps button */}
        <button
          className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
          style={{ color: '#8a8a9e' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#1a1a28'; (e.currentTarget as HTMLElement).style.color = '#fff' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#8a8a9e' }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="5" cy="5" r="1.5" />
            <circle cx="12" cy="5" r="1.5" />
            <circle cx="19" cy="5" r="1.5" />
            <circle cx="5" cy="12" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="19" cy="12" r="1.5" />
            <circle cx="5" cy="19" r="1.5" />
            <circle cx="12" cy="19" r="1.5" />
            <circle cx="19" cy="19" r="1.5" />
          </svg>
        </button>

        {/* Account selector */}
        <div className="relative">
          <button
            onClick={() => setShowAccountMenu(!showAccountMenu)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors"
            style={{ backgroundColor: '#1e1e2d', color: '#ffffff' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#252535' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#1e1e2d' }}
          >
            {/* SL Avatar */}
            <div
              className="flex items-center justify-center w-6 h-6 rounded-full text-white text-xs font-bold"
              style={{ backgroundColor: '#3b5bdb' }}
            >
              SL
            </div>
            <span className="text-sm font-medium tracking-wide">SCANVAULT LIMITED</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8a8a9e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>

          {/* Dropdown */}
          {showAccountMenu && (
            <div
              className="absolute right-0 top-full mt-1 w-64 rounded-xl shadow-2xl z-50 border py-1"
              style={{ backgroundColor: '#1e1e2d', borderColor: '#2a2a3d' }}
            >
              <div className="px-4 py-2 border-b" style={{ borderColor: '#2a2a3d' }}>
                <p className="text-xs font-medium" style={{ color: '#8a8a9e' }}>CURRENT ACCOUNT</p>
                <p className="text-sm font-semibold text-white mt-1">SCANVAULT LIMITED</p>
              </div>
              <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors" style={{ color: '#8a8a9e' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#252535'; (e.currentTarget as HTMLElement).style.color = '#fff' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#8a8a9e' }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" /><path d="M4.93 4.93a10 10 0 0 0 0 14.14" /></svg>
                Account settings
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors" style={{ color: '#8a8a9e' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#252535'; (e.currentTarget as HTMLElement).style.color = '#fff' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#8a8a9e' }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
                Sign out
              </button>
            </div>
          )}
        </div>

        {/* User avatar */}
        <button
          className="flex items-center justify-center w-8 h-8 rounded-full text-white text-xs font-bold transition-opacity"
          style={{ backgroundColor: '#e8c547' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.85' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
        >
          KQ
        </button>
      </div>

      {/* Click outside to close dropdown */}
      {showAccountMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowAccountMenu(false)}
        />
      )}
    </div>
  )
}
