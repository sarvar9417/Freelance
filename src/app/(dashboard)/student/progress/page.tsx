'use client'

import { redirect } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useMountedTheme } from '@/hooks/useTheme'
import { TrendingUp, Award, Target, BookOpen, CheckCircle2, Zap } from 'lucide-react'

export default function ProgressPage() {
  const { isDark } = useMountedTheme()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { redirect('/login'); return }

      const [{ data: enrollments }, { data: xpData }, { data: submissions }, { data: streaks }] = await Promise.all([
        supabase.from('enrollments').select('progress, course_id').eq('student_id', user.id),
        supabase.from('user_xp').select('total_xp, current_level').eq('user_id', user.id).single(),
        supabase.from('submissions').select('status, score').eq('student_id', user.id),
        supabase.from('user_streaks').select('current_streak, longest_streak').eq('user_id', user.id).single(),
      ])

      const completedCourses = (enrollments ?? []).filter(e => e.progress >= 100).length
      const avgProgress = enrollments?.length ? Math.round((enrollments ?? []).reduce((a, e) => a + (e.progress || 0), 0) / enrollments.length) : 0
      const gradedSubs = (submissions ?? []).filter(s => s.status === 'graded' && s.score !== null)
      const avgScore = gradedSubs.length ? Math.round(gradedSubs.reduce((a, s) => a + (s.score || 0), 0) / gradedSubs.length) : 0

      setData({
        completedCourses,
        avgProgress,
        totalXp: xpData?.total_xp || 0,
        level: xpData?.current_level || 1,
        avgScore,
        submissionsCount: submissions?.length || 0,
        currentStreak: streaks?.current_streak || 0,
        longestStreak: streaks?.longest_streak || 0,
      })
      setLoading(false)
    }
    loadData()
  }, [])

  if (loading) return <div className="max-w-4xl mx-auto animate-pulse"><div className="h-8 w-48 bg-white/10 rounded mb-2" /></div>

  const stats = [
    { label: 'Tugatilgan kurslar', value: data?.completedCourses || 0, icon: CheckCircle2, color: isDark ? 'text-emerald-400' : 'text-emerald-600', bg: isDark ? 'bg-emerald-500/10' : 'bg-emerald-50' },
    { label: "O'rtacha progress", value: `${data?.avgProgress || 0}%`, icon: TrendingUp, color: isDark ? 'text-blue-400' : 'text-blue-600', bg: isDark ? 'bg-blue-500/10' : 'bg-blue-50' },
    { label: "O'rtacha baho", value: data?.avgScore ? `${data.avgScore}/100` : '—', icon: Award, color: isDark ? 'text-amber-400' : 'text-amber-600', bg: isDark ? 'bg-amber-500/10' : 'bg-amber-50' },
    { label: 'Jami XP', value: (data?.totalXp || 0).toLocaleString(), icon: Zap, color: isDark ? 'text-purple-400' : 'text-purple-600', bg: isDark ? 'bg-purple-500/10' : 'bg-purple-50' },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Mening progressim</h1>
        <p className={`text-sm mt-1 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>Sizning muvaffaqiyatlaringiz</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className={`rounded-2xl p-5 ${stat.bg}`}>
            <stat.icon className={`h-6 w-6 ${stat.color} mb-3`} />
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stat.value}</p>
            <p className={`text-xs ${isDark ? 'text-white/60' : 'text-gray-600'}`}>{stat.label}</p>
          </div>
        ))}
      </div>

      <div className={`rounded-2xl p-6 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'}`}>
        <h2 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Level va XP</h2>
        <div className="flex items-center gap-4">
          <div className={`h-14 w-14 rounded-2xl flex items-center justify-center text-xl font-bold text-white ${
            isDark ? 'bg-gradient-to-br from-amber-500 to-amber-600' : 'bg-gradient-to-br from-amber-400 to-amber-500'
          }`}>
            {data?.level || 1}
          </div>
          <div className="flex-1">
            <div className="flex justify-between mb-1">
              <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>Level {data?.level || 1}</span>
              <span className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-500'}`}>{data?.totalXp || 0} XP</span>
            </div>
            <div className={`h-2 rounded-full ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}>
              <div className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full" style={{ width: `${(data?.totalXp || 0) % 1000 / 10}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className={`rounded-2xl p-6 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'}`}>
        <h2 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Streak</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-xl ${isDark ? 'bg-orange-500/10' : 'bg-orange-50'}`}>
            <p className={`text-3xl font-bold ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>{data?.currentStreak || 0}</p>
            <p className={`text-xs ${isDark ? 'text-white/60' : 'text-gray-600'}`}>Joriy streak</p>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-purple-500/10' : 'bg-purple-50'}`}>
            <p className={`text-3xl font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>{data?.longestStreak || 0}</p>
            <p className={`text-xs ${isDark ? 'text-white/60' : 'text-gray-600'}`}>Eng uzun streak</p>
          </div>
        </div>
      </div>
    </div>
  )
}