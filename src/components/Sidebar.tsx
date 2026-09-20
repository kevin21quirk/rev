import { useState } from 'react'
import type { NavItem } from '../App'

interface SidebarProps {
  activeNav: NavItem
  setActiveNav: (nav: NavItem) => void
}

const navItems: { label: NavItem; icon: JSX.Element }[] = [
  {
    label: 'Home',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    label: 'Cards',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="14" x="2" y="5" rx="2" />
        <line x1="2" x2="22" y1="10" y2="10" />
      </svg>
    ),
  },
  {
    label: 'Merchant',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
        <line x1="3" x2="21" y1="6" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
  },
  {
    label: 'Transfers',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m16 3 4 4-4 4" />
        <path d="M20 7H4" />
        <path d="m8 21-4-4 4-4" />
        <path d="M4 17h16" />
      </svg>
    ),
  },
  {
    label: 'Treasury',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" x2="12" y1="2" y2="22" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    label: 'Bills',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" x2="8" y1="13" y2="13" />
        <line x1="16" x2="8" y1="17" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    label: 'Expenses',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
        <rect width="6" height="4" x="9" y="3" rx="2" />
        <line x1="9" x2="15" y1="12" y2="12" />
        <line x1="9" x2="13" y1="16" y2="16" />
      </svg>
    ),
  },
  {
    label: 'Team',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    label: 'RevPoints',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
  {
    label: 'Analytics',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" x2="18" y1="20" y2="10" />
        <line x1="12" x2="12" y1="20" y2="4" />
        <line x1="6" x2="6" y1="20" y2="14" />
      </svg>
    ),
  },
  {
    label: 'Admin',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
]

export default function Sidebar({ activeNav, setActiveNav }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div
      className="flex flex-col shrink-0 h-full border-r transition-all duration-200"
      style={{
        width: collapsed ? '56px' : '220px',
        backgroundColor: '#13131c',
        borderColor: '#1e1e2c',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-4 mb-2 overflow-hidden">
        <div
          className="flex items-center justify-center w-8 h-8 rounded-full text-white font-bold text-base select-none shrink-0"
          style={{ backgroundColor: '#000000' }}
        >
          R
        </div>
        {!collapsed && <span className="text-white font-semibold text-base tracking-tight whitespace-nowrap">Business</span>}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-2 overflow-y-auto">
        {navItems.filter(n => n.label !== 'Admin').map(({ label, icon }) => {
          const isActive = activeNav === label
          return (
            <button
              key={label}
              onClick={() => setActiveNav(label)}
              title={collapsed ? label : undefined}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg mb-0.5 text-left transition-colors duration-100"
              style={{
                backgroundColor: 'transparent',
                color: isActive ? '#ffffff' : '#8a8a9e',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  ;(e.currentTarget as HTMLElement).style.backgroundColor = '#1a1a28'
                  ;(e.currentTarget as HTMLElement).style.color = '#ccccdd'
                } else {
                  ;(e.currentTarget as HTMLElement).style.backgroundColor = '#1a1a28'
                }
              }}
              onMouseLeave={e => {
                ;(e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'
                if (!isActive) {
                  ;(e.currentTarget as HTMLElement).style.color = '#8a8a9e'
                }
              }}
            >
              <span className="shrink-0">{icon}</span>
              {!collapsed && <span className="text-sm font-medium">{label}</span>}
            </button>
          )
        })}
      </nav>

      {/* Admin — pinned at bottom, only visible on the admin page */}
      {activeNav === 'Admin' && (
        <div className="px-2 py-3 border-t" style={{ borderColor: '#1e1e2c' }}>
          <button
            onClick={() => setActiveNav('Admin')}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-left transition-colors duration-100"
            style={{ backgroundColor: 'rgba(239,68,68,0.15)', color: '#ef4444' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            {!collapsed && <span className="text-sm font-medium">Admin</span>}
          </button>
        </div>
      )}

      {/* Collapse toggle */}
      <div className="px-2 py-3 border-t" style={{ borderColor: '#1e1e2c' }}>
        <button
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="flex items-center justify-center w-full px-3 py-2 rounded-lg transition-colors duration-100"
          style={{ color: '#5c5c72' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#1a1a28'; (e.currentTarget as HTMLElement).style.color = '#ccccdd' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#5c5c72' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {collapsed
              ? <><path d="m9 18 6-6-6-6" /><path d="M3 6v12" /></>
              : <><path d="m15 18-6-6 6-6" /><path d="M21 6v12" /></>
            }
          </svg>
        </button>
      </div>
    </div>
  )
}
