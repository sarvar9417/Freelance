'use client'

import { redirect } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useMountedTheme } from '@/hooks/useTheme'
import { Users, BookOpen, MessageSquare, ArrowRight } from 'lucide-react'

export default function AdminDashboard() {
  const { isDark } = useMountedTheme()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { redirect('/login'); return }

      const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
      if (profile?.role !== 'admin') { redirect('/login'); return }

      const [{ count: usersCount }, { count: coursesCount }, { count: postsCount }, { data: recentUsers }] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('courses').select('*', { count: 'exact', head: true }),
        supabase.from('forum_posts').select('*', { count: 'exact', head: true }),
        supabase.from('users').select('id, full_name, role').order('created_at', { ascending: false }).limit(5),
      ])

      setData({
        usersCount: usersCount ?? 0,
        coursesCount: coursesCount ?? 0,
        postsCount: postsCount ?? 0,
        recentUsers: recentUsers ?? [],
      })
      setLoading(false)
    }
    loadData()
  }, [])

  if (loading) return <div className="max-w-5xl mx-auto animate-pulse"><div className="h-8 w-48 bg-white/10 rounded mb-4" /></div>

  const stats = [
    { label: 'Foydalanuvchilar', value: data?.usersCount || 0, icon: Users, color: isDark ? 'text-blue-400' : 'text-blue-600', bg: isDark ? 'bg-blue-500/10' : 'bg-blue-50' },
    { label: 'Kurslar', value: data?.coursesCount || 0, icon: BookOpen, color: isDark ? 'text-emerald-400' : 'text-emerald-600', bg: isDark ? 'bg-emerald-500/10' : 'bg-emerald-50' },
    { label: 'Forum postlar', value: data?.postsCount || 0, icon: MessageSquare, color: isDark ? 'text-purple-400' : 'text-purple-600', bg: isDark ? 'bg-purple-500/10' : 'bg-purple-50' },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Admin panel</h1>
        <p className={`text-sm mt-1 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>Platformani boshqaring</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className={`rounded-2xl p-5 ${stat.bg}`}>
            <stat.icon className={`h-6 w-6 ${stat.color} mb-3`} />
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stat.value}</p>
            <p className={`text-xs ${isDark ? 'text-white/60' : 'text-gray-600'}`}>{stat.label}</p>
          </div>
        ))}
      </div>

      <div className={`rounded-2xl p-6 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'}`}>
        <h2 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>So'nggi foydalanuvchilar</h2>
        <div className="space-y-3">
          {data?.recentUsers?.map((user: any) => (
            <div key={user.id} className={`flex items-center gap-3 p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${isDark ? 'bg-purple-500' : 'bg-purple-500'}`}>
                {user.full_name?.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() || 'A'}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{user.full_name || 'Noma\'lum'}</p>
                <p className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-500'}`}>{user.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <a href="/admin/users" className={`flex items-center justify-between p-5 rounded-2xl transition-all ${isDark ? 'bg-white/5 border border-white/10 hover:bg-white/10' : 'bg-white border border-gray-200 hover:bg-gray-50'}`}>
          <div className="flex items-center gap-3">
            <Users className={`h-6 w-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Foydalanuvchilar</span>
          </div>
          <ArrowRight className={`h-5 w-5 ${isDark ? 'text-white/40' : 'text-gray-400'}`} />
        </a>
        <a href="/admin/courses" className={`flex items-center justify-between p-5 rounded-2xl transition-all ${isDark ? 'bg-white/5 border border-white/10 hover:bg-white/10' : 'bg-white border border-gray-200 hover:bg-gray-50'}`}>
          <div className="flex items-center gap-3">
            <BookOpen className={`h-6 w-6 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Kurslar</span>
          </div>
          <ArrowRight className={`h-5 w-5 ${isDark ? 'text-white/40' : 'text-gray-400'}`} />
        </a>
      </div>
    </div>
  )
}