import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TrendingUp, BookOpen, Star, Award, CheckCircle2, Zap, Target } from 'lucide-react'

const XP_PER_LEVEL = 1000

export default async function ProgressPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [
    { data: xpRow },
    { data: streakRow },
    { data: enrollments },
    { data: xpHistory },
    { data: userAchievements },
    { data: allAchievements },
  ] = await Promise.all([
    supabase.from('user_xp').select('total_xp, current_level').eq('user_id', user.id).single(),
    supabase.from('user_streaks').select('current_streak, longest_streak').eq('user_id', user.id).single(),
    supabase.from('enrollments').select('course_id, progress').eq('student_id', user.id),
    supabase.from('xp_history').select('amount, source, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(30),
    supabase.from('user_achievements').select('achievement_id, earned_at').eq('user_id', user.id),
    supabase.from('achievements').select('id, name, description, icon, xp_reward'),
  ])

  const courseIds = (enrollments ?? []).map(e => e.course_id)
  const { data: courses } = courseIds.length > 0
    ? await supabase.from('courses').select('id, title, emoji').in('id', courseIds)
    : { data: [] }

  const taskIds: string[] = []
  if (courseIds.length > 0) {
    const { data: tasks } = await supabase.from('tasks').select('id').in('course_id', courseIds)
    taskIds.push(...(tasks ?? []).map(t => t.id))
  }

  const { data: submissions } = taskIds.length > 0
    ? await supabase
        .from('submissions')
        .select('status, score')
        .eq('student_id', user.id)
        .in('task_id', taskIds)
    : { data: [] }

  const totalXp = xpRow?.total_xp ?? 0
  const currentLevel = xpRow?.current_level ?? 1
  const xpInLevel = totalXp % XP_PER_LEVEL
  const xpPct = Math.round((xpInLevel / XP_PER_LEVEL) * 100)

  const completedCourses = (enrollments ?? []).filter(e => e.progress >= 100).length
  const gradedSubs = (submissions ?? []).filter(s => s.status === 'graded' && s.score !== null)
  const avgScore = gradedSubs.length
    ? Math.round(gradedSubs.reduce((a, s) => a + (s.score ?? 0), 0) / gradedSubs.length)
    : 0

  const earnedIds = new Set((userAchievements ?? []).map(a => a.achievement_id))
  const earnedMap = Object.fromEntries((userAchievements ?? []).map(a => [a.achievement_id, a.earned_at]))

  // Haftalik XP (oxirgi 7 kun)
  const weeklyXp: number[] = Array(7).fill(0)
  const now = new Date()
  for (const h of xpHistory ?? []) {
    const daysAgo = Math.floor((now.getTime() - new Date(h.created_at).getTime()) / 86400000)
    if (daysAgo < 7) weeklyXp[6 - daysAgo] += h.amount
  }
  const maxWeeklyXp = Math.max(...weeklyXp, 1)
  const DAYS = ['Ya', 'Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh']
  const todayDay = now.getDay()
  const weekDays = Array.from({ length: 7 }, (_, i) => DAYS[(todayDay - 6 + i + 7) % 7])

  const courseMap = Object.fromEntries((courses ?? []).map(c => [c.id, c]))

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Mening progressim</h1>
        <p className="text-white/40 text-sm mt-1">O&apos;qish statistikasi va yutuqlaringiz</p>
      </div>

      {/* XP & Level */}
      <div className="rounded-2xl p-6"
        style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(234,88,12,0.1))', border: '1px solid rgba(245,158,11,0.2)' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-amber-900/30">
              {currentLevel}
            </div>
            <div>
              <p className="text-white font-bold text-lg">Level {currentLevel}</p>
              <p className="text-white/50 text-sm">{totalXp.toLocaleString()} XP jami</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-amber-400 font-bold text-xl">{xpInLevel.toLocaleString()}</p>
            <p className="text-white/30 text-xs">/ {XP_PER_LEVEL.toLocaleString()} XP</p>
          </div>
        </div>
        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all"
            style={{ width: `${xpPct}%` }} />
        </div>
        <p className="text-white/30 text-xs mt-2 text-right">
          Keyingi levelga {XP_PER_LEVEL - xpInLevel} XP kerak
        </p>
      </div>

      {/* Statistika */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "O'qigan kurslar", value: (enrollments ?? []).length, icon: BookOpen, color: 'text-blue-400', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)' },
          { label: 'Tugatgan', value: completedCourses, icon: CheckCircle2, color: 'text-emerald-400', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)' },
          { label: 'Streak', value: `${streakRow?.current_streak ?? 0} kun`, icon: Target, color: 'text-orange-400', bg: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.2)' },
          { label: "O'rt. baho", value: avgScore ? `${avgScore}/100` : '—', icon: Star, color: 'text-amber-400', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)' },
        ].map(s => {
          const Icon = s.icon
          return (
            <div key={s.label} className="rounded-2xl p-5"
              style={{ background: s.bg, border: `1px solid ${s.border}` }}>
              <Icon className={`h-5 w-5 ${s.color} mb-2`} />
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-white/40 text-xs mt-0.5">{s.label}</p>
            </div>
          )
        })}
      </div>

      {/* Haftalik XP grafigi */}
      <div className="rounded-2xl p-5"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <h2 className="text-white font-semibold flex items-center gap-2 mb-5">
          <TrendingUp className="h-4 w-4 text-blue-400" /> Haftalik faollik
        </h2>
        <div className="flex items-end gap-2 h-32">
          {weeklyXp.map((xp, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-white/30 text-xs">{xp > 0 ? xp : ''}</span>
              <div className="w-full rounded-t-lg transition-all"
                style={{
                  height: `${Math.max((xp / maxWeeklyXp) * 100, xp > 0 ? 8 : 4)}%`,
                  background: xp > 0
                    ? 'linear-gradient(to top, rgba(59,130,246,0.8), rgba(99,102,241,0.8))'
                    : 'rgba(255,255,255,0.06)',
                  minHeight: '4px',
                }} />
              <span className="text-white/30 text-xs">{weekDays[i]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Kurslar bo'yicha progress */}
      {(enrollments ?? []).length > 0 && (
        <div className="rounded-2xl p-5"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <h2 className="text-white font-semibold flex items-center gap-2 mb-4">
            <BookOpen className="h-4 w-4 text-emerald-400" /> Kurslar bo&apos;yicha
          </h2>
          <div className="space-y-4">
            {(enrollments ?? []).map(e => {
              const course = courseMap[e.course_id]
              if (!course) return null
              return (
                <div key={e.course_id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-white/70 text-sm flex items-center gap-2">
                      <span>{course.emoji ?? '📚'}</span> {course.title}
                    </span>
                    <span className={`text-xs font-semibold ${e.progress >= 100 ? 'text-emerald-400' : 'text-blue-400'}`}>
                      {e.progress ?? 0}%
                    </span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${e.progress >= 100 ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' : 'bg-gradient-to-r from-blue-600 to-blue-400'}`}
                      style={{ width: `${e.progress ?? 0}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Yutuqlar */}
      <div className="rounded-2xl p-5"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <h2 className="text-white font-semibold flex items-center gap-2 mb-4">
          <Award className="h-4 w-4 text-purple-400" /> Yutuqlar
        </h2>
        {(allAchievements ?? []).length === 0 ? (
          <p className="text-white/30 text-sm text-center py-6">Hali yutuq mavjud emas</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(allAchievements ?? []).map(a => {
              const earned = earnedIds.has(a.id)
              return (
                <div key={a.id}
                  className={`p-4 rounded-xl text-center transition-all ${earned ? '' : 'opacity-40'}`}
                  style={{ background: earned ? 'rgba(139,92,246,0.1)' : 'rgba(255,255,255,0.02)', border: `1px solid ${earned ? 'rgba(139,92,246,0.25)' : 'rgba(255,255,255,0.07)'}` }}>
                  <p className="text-3xl mb-2">{a.icon ?? '🏆'}</p>
                  <p className={`text-xs font-semibold ${earned ? 'text-white' : 'text-white/40'}`}>{a.name}</p>
                  {a.description && <p className="text-white/30 text-xs mt-0.5 line-clamp-2">{a.description}</p>}
                  <p className="text-amber-400 text-xs mt-1 flex items-center justify-center gap-1">
                    <Zap className="h-3 w-3" /> +{a.xp_reward}
                  </p>
                  {earned && earnedMap[a.id] && (
                    <p className="text-white/25 text-xs mt-1">
                      {new Date(earnedMap[a.id]).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' })}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
