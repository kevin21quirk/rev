import { useState } from 'react'

interface TeamMember {
  id: string
  name: string
  initials: string
  color: string
  role: string
  email: string
  status: 'active' | 'invited' | 'suspended'
  permissions: string[]
  lastActive: string
}

const team: TeamMember[] = [
  {
    id: '1',
    name: 'Kevin Quirk',
    initials: 'KQ',
    color: '#e8c547',
    role: 'Owner',
    email: 'kevin@scanvault.co.uk',
    status: 'active',
    permissions: ['Full access', 'Admin', 'Cards'],
    lastActive: 'Now',
  },
]

const roleColors: Record<string, { bg: string; text: string }> = {
  Owner:      { bg: 'rgba(232,197,71,0.15)',  text: '#e8c547' },
  Admin:      { bg: 'rgba(91,156,246,0.15)',  text: '#5b9cf6' },
  Employee:   { bg: 'rgba(62,207,110,0.15)',  text: '#3ecf6e' },
  Accountant: { bg: 'rgba(167,139,250,0.15)', text: '#a78bfa' },
}

const statusStyle: Record<string, { bg: string; text: string }> = {
  active:    { bg: 'rgba(62,207,110,0.15)', text: '#3ecf6e' },
  invited:   { bg: 'rgba(245,158,11,0.15)',  text: '#f59e0b' },
  suspended: { bg: 'rgba(239,68,68,0.15)',   text: '#ef4444' },
}

export default function TeamPage() {
  const [showInvite, setShowInvite] = useState(false)
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('Employee')

  return (
    <div className="p-6 max-w-4xl">
      {/* Header stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total members', value: team.length.toString(), sub: 'across all roles' },
          { label: 'Active', value: team.filter(m => m.status === 'active').length.toString(), sub: 'currently active' },
          { label: 'Pending invites', value: team.filter(m => m.status === 'invited').length.toString(), sub: 'awaiting response' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl border p-4" style={{ backgroundColor: '#1e1e2d', borderColor: '#2a2a3d' }}>
            <p className="text-xs mb-2" style={{ color: '#5c5c72' }}>{s.label}</p>
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-xs mt-1" style={{ color: '#5c5c72' }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Actions bar */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">Members</h3>
        <button
          onClick={() => setShowInvite(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
          style={{ backgroundColor: '#ffffff', color: '#0e0e15' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#e8e8f0' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#ffffff' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" /><path d="M12 5v14" />
          </svg>
          Invite member
        </button>
      </div>

      {/* Members list */}
      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: '#2a2a3d' }}>
        <table className="w-full">
          <thead>
            <tr style={{ backgroundColor: '#1a1a28', borderBottom: '1px solid #2a2a3d' }}>
              {['Member', 'Role', 'Permissions', 'Status', 'Last active', ''].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-medium" style={{ color: '#5c5c72' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {team.map((member, i) => {
              const rs = roleColors[member.role]
              const ss = statusStyle[member.status]
              return (
                <tr
                  key={member.id}
                  className="cursor-pointer"
                  onClick={() => setSelectedMember(member)}
                  style={{ borderBottom: i < team.length - 1 ? '1px solid #1e1e2c' : 'none' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#191924' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold text-white shrink-0"
                        style={{ backgroundColor: member.color }}>
                        {member.initials}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{member.name}</p>
                        <p className="text-xs" style={{ color: '#5c5c72' }}>{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium"
                      style={{ backgroundColor: rs.bg, color: rs.text }}>
                      {member.role}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {member.permissions.slice(0, 2).map(p => (
                        <span key={p} className="px-2 py-0.5 rounded text-xs"
                          style={{ backgroundColor: '#2a2a3d', color: '#8a8a9e' }}>
                          {p}
                        </span>
                      ))}
                      {member.permissions.length > 2 && (
                        <span className="px-2 py-0.5 rounded text-xs" style={{ backgroundColor: '#2a2a3d', color: '#5c5c72' }}>
                          +{member.permissions.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium capitalize"
                      style={{ backgroundColor: ss.bg, color: ss.text }}>
                      {member.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm" style={{ color: '#8a8a9e' }}>{member.lastActive}</td>
                  <td className="px-5 py-3">
                    <button
                      className="p-1.5 rounded-lg transition-colors"
                      style={{ color: '#5c5c72' }}
                      onClick={e => { e.stopPropagation(); setSelectedMember(member) }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#2a2a3d'; (e.currentTarget as HTMLElement).style.color = '#fff' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#5c5c72' }}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />
                      </svg>
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Member detail */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-sm rounded-2xl border p-6 shadow-2xl" style={{ backgroundColor: '#13131c', borderColor: '#2a2a3d' }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-white">Team member</h3>
              <button onClick={() => setSelectedMember(null)} style={{ color: '#8a8a9e' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                </svg>
              </button>
            </div>
            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center justify-center w-12 h-12 rounded-full text-base font-bold text-white"
                style={{ backgroundColor: selectedMember.color }}>
                {selectedMember.initials}
              </div>
              <div>
                <p className="text-base font-semibold text-white">{selectedMember.name}</p>
                <p className="text-sm" style={{ color: '#5c5c72' }}>{selectedMember.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-5">
              {[
                { label: 'Role', value: selectedMember.role },
                { label: 'Status', value: selectedMember.status },
                { label: 'Last active', value: selectedMember.lastActive },
                { label: 'Permissions', value: selectedMember.permissions.join(', ') },
              ].map(item => (
                <div key={item.label} className="rounded-xl p-3" style={{ backgroundColor: '#1e1e2d' }}>
                  <p className="text-xs mb-1" style={{ color: '#5c5c72' }}>{item.label}</p>
                  <p className="text-sm font-medium text-white capitalize">{item.value}</p>
                </div>
              ))}
            </div>
            {selectedMember.role !== 'Owner' && (
              <div className="flex gap-3">
                <button onClick={() => setSelectedMember(null)} className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                  style={{ backgroundColor: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>
                  Remove
                </button>
                <button onClick={() => setSelectedMember(null)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ backgroundColor: '#ffffff', color: '#0e0e15' }}>
                  Edit permissions
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Invite modal */}
      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-md rounded-2xl border p-6 shadow-2xl" style={{ backgroundColor: '#13131c', borderColor: '#2a2a3d' }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-white">Invite team member</h3>
              <button onClick={() => setShowInvite(false)} style={{ color: '#8a8a9e' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4 mb-5">
              <div>
                <label className="text-sm font-medium text-white mb-1.5 block">Email address</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  className="w-full rounded-xl px-4 py-2.5 text-sm text-white outline-none border placeholder-[#5c5c72]"
                  style={{ backgroundColor: '#1e1e2d', borderColor: '#2a2a3d' }}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-white mb-1.5 block">Role</label>
                <select
                  value={inviteRole}
                  onChange={e => setInviteRole(e.target.value)}
                  className="w-full rounded-xl px-4 py-2.5 text-sm text-white outline-none border appearance-none"
                  style={{ backgroundColor: '#1e1e2d', borderColor: '#2a2a3d' }}
                >
                  {['Admin', 'Employee', 'Accountant'].map(r => (
                    <option key={r} value={r} style={{ backgroundColor: '#1e1e2d' }}>{r}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowInvite(false)} className="flex-1 py-2.5 rounded-xl text-sm font-medium border"
                style={{ borderColor: '#2a2a3d', color: '#ccccdd' }}>Cancel</button>
              <button onClick={() => { setShowInvite(false); setInviteEmail('') }} className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                style={{ backgroundColor: '#ffffff', color: '#0e0e15' }}>Send invite</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
