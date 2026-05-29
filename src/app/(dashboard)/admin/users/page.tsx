'use client'

import { redirect } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useMountedTheme } from '@/hooks/useTheme'
import { changeUserRole, deleteUser, resetUserPassword } from '../actions'
import {
  Users, Search, Shield, Trash2, KeyRound, X, Loader2, AlertTriangle, CheckCircle,
} from 'lucide-react'

const ROLES = ['student', 'teacher', 'admin'] as const

function ChangeRoleModal({ user, onClose, onConfirm }: {
  user: any; onClose: () => void; onConfirm: (role: string) => Promise<void>
}) {
  const { isDark } = useMountedTheme()
  const [selectedRole, setSelectedRole] = useState(user.role)
  const [loading, setLoading] = useState(false)
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={e => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl p-6 space-y-4"
        style={isDark ? { background: '#10141f', border: '1px solid rgba(255,255,255,0.1)' } : { background: '#ffffff', border: '1px solid rgba(0,0,0,0.1)' }}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-500/10"><Shield className="h-5 w-5 text-purple-400" /></div>
          <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Rolni o'zgartirish</h3>
          <button onClick={onClose} className={`ml-auto ${isDark ? 'text-white/30 hover:text-white' : 'text-gray-400 hover:text-gray-600'}`}><X className="h-4 w-4" /></button>
        </div>
        <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
          <span className="font-medium">{user.full_name || user.email}</span>
        </p>
        <div className="flex gap-2">
          {ROLES.map(role => (
            <button key={role} onClick={() => setSelectedRole(role)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                selectedRole === role
                  ? 'bg-purple-600 text-white'
                  : isDark ? 'bg-white/5 text-white/50 hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>{role}</button>
          ))}
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border ${
            isDark ? 'text-white/50 hover:text-white hover:bg-white/5 border-white/5' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 border-gray-200'
          }`}>Bekor qilish</button>
          <button onClick={async () => { setLoading(true); await onConfirm(selectedRole); setLoading(false) }}
            disabled={loading || selectedRole === user.role}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
            Saqlash
          </button>
        </div>
      </div>
    </div>
  )
}

function ConfirmModal({ title, message, confirmLabel, icon: Icon, onClose, onConfirm, loading }: {
  title: string; message: string; confirmLabel: string; icon: typeof Trash2; onClose: () => void; onConfirm: () => void; loading: boolean
}) {
  const { isDark } = useMountedTheme()
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={e => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl p-6 space-y-4"
        style={isDark ? { background: '#10141f', border: '1px solid rgba(255,255,255,0.1)' } : { background: '#ffffff', border: '1px solid rgba(0,0,0,0.1)' }}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-red-500/10"><Icon className="h-5 w-5 text-red-400" /></div>
          <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
          <button onClick={onClose} className={`ml-auto ${isDark ? 'text-white/30 hover:text-white' : 'text-gray-400 hover:text-gray-600'}`}><X className="h-4 w-4" /></button>
        </div>
        <p className={`text-sm ${isDark ? 'text-white/50' : 'text-gray-600'}`}>{message}</p>
        <div className="flex gap-3">
          <button onClick={onClose} className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border ${
            isDark ? 'text-white/50 hover:text-white hover:bg-white/5 border-white/5' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 border-gray-200'
          }`}>Bekor qilish</button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-500 text-white disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

function SuccessToast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t) }, [])
  return (
    <div className="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl bg-emerald-600 text-white text-sm shadow-2xl animate-in slide-in-from-top-2">
      <CheckCircle className="h-4 w-4 flex-shrink-0" />
      {message}
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100"><X className="h-3.5 w-3.5" /></button>
    </div>
  )
}

export default function AdminUsersPage() {
  const { isDark } = useMountedTheme()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [currentAdminId, setCurrentAdminId] = useState<string | null>(null)
  const [roleTarget, setRoleTarget] = useState<any | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null)
  const [resetTarget, setResetTarget] = useState<any | null>(null)
  const [successMsg, setSuccessMsg] = useState('')
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { redirect('/login'); return }
      setCurrentAdminId(user.id)

      const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
      if (profile?.role !== 'admin') { redirect('/login'); return }

      const { data: usersData } = await supabase.from('users').select('id, full_name, email, role, created_at').order('created_at', { ascending: false })
      setUsers(usersData ?? [])
      setLoading(false)
    }
    loadData()
  }, [])

  const handleRoleChange = async (role: string) => {
    if (!roleTarget) return
    const result = await changeUserRole(roleTarget.id, role as any)
    if (result.error) return
    setUsers(prev => prev.map(u => u.id === roleTarget.id ? { ...u, role } : u))
    setRoleTarget(null)
    setSuccessMsg('Rol muvaffaqiyatli o\'zgartirildi')
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    const id = deleteTarget.id
    startTransition(async () => {
      const result = await deleteUser(id)
      if (result.error) return
      setUsers(prev => prev.filter(u => u.id !== id))
      setDeleteTarget(null)
      setSuccessMsg('Foydalanuvchi o\'chirildi')
    })
  }

  const handleResetPassword = () => {
    if (!resetTarget) return
    startTransition(async () => {
      const result = await resetUserPassword(resetTarget.id)
      if (result.error) return
      setResetTarget(null)
      setSuccessMsg(result.message ?? 'Tiklash havolasi yuborildi')
    })
  }

  const filteredUsers = users.filter(u => {
    const matchSearch = !search || (u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()))
    const matchRole = roleFilter === 'all' || u.role === roleFilter
    return matchSearch && matchRole
  })

  if (loading) return <div className="max-w-5xl mx-auto animate-pulse"><div className="h-8 w-48 bg-white/10 rounded mb-4" /></div>

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {successMsg && <SuccessToast message={successMsg} onClose={() => setSuccessMsg('')} />}

      <div>
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Foydalanuvchilar</h1>
        <p className={`text-sm mt-1 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>{users.length} ta foydalanuvchi</p>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className={`absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 ${isDark ? 'text-white/30' : 'text-gray-400'}`} />
          <input type="text" placeholder="Qidirish..." value={search} onChange={e => setSearch(e.target.value)}
            className={`w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none ${
              isDark ? 'text-white placeholder-white/25 bg-white/5 border border-white/10' : 'text-gray-900 placeholder-gray-400 bg-white border border-gray-200'
            }`} />
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
          className={`px-4 py-3 rounded-xl text-sm outline-none ${
            isDark ? 'text-white bg-white/5 border border-white/10' : 'text-gray-900 bg-white border border-gray-200'
          }`}>
          <option value="all">Barcha rollar</option>
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div className={`rounded-2xl overflow-hidden ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'}`}>
        <table className="w-full">
          <thead className={isDark ? 'bg-white/5' : 'bg-gray-50'}>
            <tr>
              <th className={`text-left p-4 text-xs font-medium ${isDark ? 'text-white/60' : 'text-gray-500'}`}>Ism</th>
              <th className={`text-left p-4 text-xs font-medium ${isDark ? 'text-white/60' : 'text-gray-500'}`}>Email</th>
              <th className={`text-left p-4 text-xs font-medium ${isDark ? 'text-white/60' : 'text-gray-500'}`}>Rol</th>
              <th className={`text-left p-4 text-xs font-medium ${isDark ? 'text-white/60' : 'text-gray-500'}`}>Qo'shilgan</th>
              <th className={`text-right p-4 text-xs font-medium ${isDark ? 'text-white/60' : 'text-gray-500'}`}>Amallar</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id} className={`border-t ${isDark ? 'border-white/10' : 'border-gray-100'}`}>
                <td className={`p-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{user.full_name || '—'}</td>
                <td className={`p-4 ${isDark ? 'text-white/60' : 'text-gray-500'}`}>{user.email}</td>
                <td className="p-4">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    user.role === 'admin' ? isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600'
                    : user.role === 'teacher' ? isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600'
                    : isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'
                  }`}>{user.role}</span>
                </td>
                <td className={`p-4 text-sm ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
                  {user.created_at ? new Date(user.created_at).toLocaleDateString('uz-UZ') : '—'}
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => setRoleTarget(user)}
                      className={`p-1.5 rounded-lg transition-all ${isDark ? 'text-white/30 hover:text-purple-400 hover:bg-purple-500/10' : 'text-gray-400 hover:text-purple-600 hover:bg-purple-100'}`}
                      title="Rolni o'zgartirish">
                      <Shield className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => setResetTarget(user)}
                      className={`p-1.5 rounded-lg transition-all ${isDark ? 'text-white/30 hover:text-blue-400 hover:bg-blue-500/10' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-100'}`}
                      title="Parolni tiklash">
                      <KeyRound className="h-3.5 w-3.5" />
                    </button>
                    {user.id !== currentAdminId && (
                      <button onClick={() => setDeleteTarget(user)}
                        className={`p-1.5 rounded-lg transition-all ${isDark ? 'text-white/30 hover:text-red-400 hover:bg-red-500/10' : 'text-gray-400 hover:text-red-600 hover:bg-red-100'}`}
                        title="O'chirish">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {roleTarget && <ChangeRoleModal user={roleTarget} onClose={() => setRoleTarget(null)} onConfirm={handleRoleChange} />}
      {deleteTarget && (
        <ConfirmModal title="Foydalanuvchini o'chirish"
          message={`${deleteTarget.full_name || deleteTarget.email} ni tizimdan o'chirishni tasdiqlaysizmi?`}
          confirmLabel="O'chirish" icon={Trash2}
          onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={isPending} />
      )}
      {resetTarget && (
        <ConfirmModal title="Parolni tiklash"
          message={`${resetTarget.full_name || resetTarget.email} ga parolni tiklash havolasini yuborishni tasdiqlaysizmi?`}
          confirmLabel="Yuborish" icon={KeyRound}
          onClose={() => setResetTarget(null)} onConfirm={handleResetPassword} loading={isPending} />
      )}
    </div>
  )
}
