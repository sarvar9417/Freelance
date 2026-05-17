'use client'

import { redirect } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useMountedTheme } from '@/hooks/useTheme'
import { Users, Search, Shield, BookOpen, Trash2 } from 'lucide-react'

export default function AdminUsersPage() {
  const { isDark } = useMountedTheme()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { redirect('/login'); return }

      const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
      if (profile?.role !== 'admin') { redirect('/login'); return }

      const { data: usersData } = await supabase.from('users').select('id, full_name, email, role, created_at').order('created_at', { ascending: false })
      setUsers(usersData ?? [])
      setLoading(false)
    }
    loadData()
  }, [])

  const filteredUsers = users.filter(u => {
    const matchSearch = !search || (u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()))
    const matchRole = roleFilter === 'all' || u.role === roleFilter
    return matchSearch && matchRole
  })

  if (loading) return <div className="max-w-5xl mx-auto animate-pulse"><div className="h-8 w-48 bg-white/10 rounded mb-4" /></div>

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Foydalanuvchilar</h1>
        <p className={`text-sm mt-1 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>{users.length} ta foydalanuvchi</p>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className={`absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 ${isDark ? 'text-white/30' : 'text-gray-400'}`} />
          <input
            type="text"
            placeholder="Qidirish..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={`w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none ${
              isDark ? 'text-white placeholder-white/25 bg-white/5 border border-white/10' : 'text-gray-900 placeholder-gray-400 bg-white border border-gray-200'
            }`}
          />
        </div>
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className={`px-4 py-3 rounded-xl text-sm outline-none ${
            isDark ? 'text-white bg-white/5 border border-white/10' : 'text-gray-900 bg-white border border-gray-200'
          }`}
        >
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
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className={`p-4 text-sm ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
                  {user.created_at ? new Date(user.created_at).toLocaleDateString('uz-UZ') : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}