'use client'

import { redirect } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useMountedTheme } from '@/hooks/useTheme'
import { User, Mail, Calendar, Award, Zap, Flame } from 'lucide-react'

export default function ProfilePage() {
  const { isDark } = useMountedTheme()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { redirect('/login'); return }

      const [{ data: profileData }, { data: xpData }, { data: streakData }, { data: enrollments }] = await Promise.all([
        supabase.from('users').select('full_name, created_at').eq('id', user.id).single(),
        supabase.from('user_xp').select('total_xp, current_level').eq('user_id', user.id).single(),
        supabase.from('user_streaks').select('current_streak').eq('user_id', user.id).single(),
        supabase.from('enrollments').select('course_id').eq('student_id', user.id),
      ])

      setProfile({
        name: profileData?.full_name || user.user_metadata?.full_name || 'O\'quvchi',
        email: user.email,
        joined: profileData?.created_at ? new Date(profileData.created_at).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long' }) : '—',
        xp: xpData?.total_xp || 0,
        level: xpData?.current_level || 1,
        streak: streakData?.current_streak || 0,
        courses: enrollments?.length || 0,
      })
      setLoading(false)
    }
    loadData()
  }, [])

  if (loading) return <div className="max-w-2xl mx-auto animate-pulse"><div className="h-8 w-48 bg-white/10 rounded mb-2" /></div>

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Profil</h1>
        <p className={`text-sm mt-1 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>Shaxsiy ma'lumotlar</p>
      </div>

      <div className={`rounded-2xl p-6 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'}`}>
        <div className="flex items-center gap-4 mb-6">
          <div className={`h-16 w-16 rounded-full flex items-center justify-center text-2xl font-bold text-white ${
            isDark ? 'bg-gradient-to-br from-blue-500 to-purple-500' : 'bg-gradient-to-br from-blue-400 to-purple-500'
          }`}>
            {profile?.name?.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{profile?.name}</h2>
            <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-500'}`}>Level {profile?.level || 1}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Mail className={`h-5 w-5 ${isDark ? 'text-white/40' : 'text-gray-400'}`} />
            <span className={isDark ? 'text-white/80' : 'text-gray-700'}>{profile?.email}</span>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className={`h-5 w-5 ${isDark ? 'text-white/40' : 'text-gray-400'}`} />
            <span className={isDark ? 'text-white/80' : 'text-gray-700'}>Qo'shilgan: {profile?.joined}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className={`rounded-xl p-4 ${isDark ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-200'}`}>
          <Zap className={`h-5 w-5 ${isDark ? 'text-blue-400' : 'text-blue-600'} mb-2`} />
          <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{profile?.xp?.toLocaleString() || 0}</p>
          <p className={`text-xs ${isDark ? 'text-white/60' : 'text-gray-600'}`}>XP</p>
        </div>
        <div className={`rounded-xl p-4 ${isDark ? 'bg-orange-500/10 border border-orange-500/20' : 'bg-orange-50 border border-orange-200'}`}>
          <Flame className={`h-5 w-5 ${isDark ? 'text-orange-400' : 'text-orange-600'} mb-2`} />
          <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{profile?.streak || 0}</p>
          <p className={`text-xs ${isDark ? 'text-white/60' : 'text-gray-600'}`}>Streak</p>
        </div>
        <div className={`rounded-xl p-4 ${isDark ? 'bg-purple-500/10 border border-purple-500/20' : 'bg-purple-50 border border-purple-200'}`}>
          <Award className={`h-5 w-5 ${isDark ? 'text-purple-400' : 'text-purple-600'} mb-2`} />
          <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{profile?.courses || 0}</p>
          <p className={`text-xs ${isDark ? 'text-white/60' : 'text-gray-600'}`}>Kurslar</p>
        </div>
      </div>
    </div>
  )
}