import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import {
  BookOpen, ClipboardCheck, Star, Flame, Zap,
  ArrowRight, Clock, CheckCircle2, AlertCircle, TrendingUp,
} from 'lucide-react'

const QUOTES = [
  "Har bir katta yutuq kichik qadamlardan boshlanadi.",
  "Bugun o'rganganingiz — ertangi muvaffaqiyatingiz.",
  "Freelancer bo'lish — o'z kelajagingizni o'zingiz qurishdir.",
  "Bilim — sarmoya, lekin u hech qachon yo'qolmaydi.",
  "Har kun bir narsa o'rganing va yil oxirida 365 yangi narsa bilasiz.",
  "Qiyinchilik — rivojlanishning belgisi.",
  "Muvaffaqiyat — bu odatlarning mahsuli.",
]

const XP_PER_LEVEL = 1000

export default async function StudentDashboard() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [
    { data: profile },
    { data: xpRow },
    { data: streakRow },
    { data: enrollments },
  ] = await Promise.all([
    supabase.from('users').select('full_name').eq('id', user.id).single(),
    supabase.from('user_xp').select('total_xp, current_level').eq('user_id', user.id).single(),
    supabase.from('user_streaks').select('current_streak').eq('user_id', user.id).single(),
    supabase
      .from('enrollments')
      .select('course_id, progress, enrolled_at, last_accessed')
      .eq('student_id', user.id)
      .order('last_accessed', { ascending: false }),
  ])

  const courseIds = (enrollments ?? []).map(e => e.course_id)

  const { data: courses } = courseIds.length > 0
    ? await supabase
        .from('courses')
        .select('id, title, emoji, category, teacher_id')
        .in('id', courseIds)
    : { data: [] }

  const courseMap = Object.fromEntries((courses ?? []).map(c => [c.id, c]))

  const teacherIds = Array.from(new Set((courses ?? []).map(c => c.teacher_id).filter(Boolean)))
  const { data: teachers } = teacherIds.length > 0
    ? await supabase.from('users').select('id, full_name').in('id', teacherIds)
    : { data: [] }
  const teacherMap = Object.fromEntries((teachers ?? []).map(t => [t.id, t.full_name]))

  const { data: tasks } = courseIds.length > 0
    ? await supabase.from('tasks').select('id, title, deadline, course_id').in('course_id', courseIds)
    : { data: [] }

  const taskIds = (tasks ?? []).map(t => t.id)

  const { data: submissions } = taskIds.length > 0
    ? await supabase
        .from('submissions')
        .select('task_id, status, score')
        .eq('student_id', user.id)
        .in('task_id', taskIds)
    : { data: [] }

  const submittedMap = Object.fromEntries((submissions ?? []).map(s => [s.task_id, s]))

  const completedCourses = (enrollments ?? []).filter(e => e.progress >= 100).length
  const activeCourses = (enrollments ?? []).filter(e => e.progress < 100).length
  const submittedCount = (submissions ?? []).length
  const gradedSubs = (submissions ?? []).filter(s => s.status === 'graded' && s.score !== null)
  const avgScore = gradedSubs.length
    ? Math.round(gradedSubs.reduce((a, s) => a + (s.score ?? 0), 0) / gradedSubs.length)
    : 0

  const pendingTaskList = (tasks ?? [])
    .filter(t => !submittedMap[t.id] && t.deadline)
    .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
    .slice(0, 4)

  const ongoingEnrollments = (enrollments ?? []).filter(e => e.progress < 100).slice(0, 3)

  const totalXp = xpRow?.total_xp ?? 0
  const currentLevel = xpRow?.current_level ?? 1
  const xpInLevel = totalXp % XP_PER_LEVEL
  const xpPct = (xpInLevel / XP_PER_LEVEL) * 100

  const quote = QUOTES[new Date().getDay() % QUOTES.length]
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Xayrli tong' : hour < 18 ? 'Xayrli kun' : 'Xayrli kech'

  const stats = [
    { label: "O'qiyotgan kurslar", value: activeCourses, icon: BookOpen, color: 'text-blue-400', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.15)' },
    { label: 'Tugatgan kurslar', value: completedCourses, icon: CheckCircle2, color: 'text-emerald-400', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.15)' },
    { label: 'Topshirilgan ishlar', value: submittedCount, icon: ClipboardCheck, color: 'text-purple-400', bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.15)' },
    { label: "O'rtacha baho", value: avgScore ? `${avgScore}/100` : '—', icon: Star, color: 'text-amber-400', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.15)' },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {greeting}, <span className="text-blue-400">{profile?.full_name ?? "O'quvchi"}!</span>
          </h1>
          <p className="text-white/40 text-sm mt-1">
            {new Date().toLocaleDateString('uz-UZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)' }}>
            <Flame className="h-4 w-4 text-orange-400" />
            <span className="text-orange-400 text-sm font-semibold">{streakRow?.current_streak ?? 0} kun</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <Zap className="h-4 w-4 text-amber-400" />
            <span className="text-amber-400 text-sm font-semibold">{totalXp.toLocaleString()} XP</span>
          </div>
        </div>
      </div>

      {/* Motivatsion iqtibos */}
      <div className="rounded-2xl px-5 py-4"
        style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(139,92,246,0.08))', border: '1px solid rgba(99,102,241,0.15)' }}>
        <p className="text-white/70 text-sm italic">💡 &ldquo;{quote}&rdquo;</p>
      </div>

      {/* XP Progress */}
      <div className="rounded-2xl p-5"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-xs font-bold text-white">
              {currentLevel}
            </div>
            <div>
              <p className="text-white text-sm font-semibold">Level {currentLevel}</p>
              <p className="text-white/40 text-xs">Keyingi levelga: {XP_PER_LEVEL - xpInLevel} XP</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-amber-400 font-bold">{xpInLevel.toLocaleString()}</p>
            <p className="text-white/30 text-xs">/ {XP_PER_LEVEL.toLocaleString()} XP</p>
          </div>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full"
            style={{ width: `${xpPct}%` }}
          />
        </div>
      </div>

      {/* Statistika */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => {
          const Icon = s.icon
          return (
            <div key={s.label} className="rounded-2xl p-5"
              style={{ background: s.bg, border: `1px solid ${s.border}` }}>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                  <Icon className={`h-4 w-4 ${s.color}`} />
                </div>
                <div>
                  <p className="text-white/40 text-xs mb-1">{s.label}</p>
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Davom etayotgan kurslar */}
        <div className="rounded-2xl p-5"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-400" /> Davom etayotgan kurslar
            </h2>
            <Link href="/student/my-courses"
              className="text-xs text-white/30 hover:text-blue-400 transition-colors flex items-center gap-1">
              Barchasi <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {ongoingEnrollments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-white/30 text-sm mb-3">Hali kursga yozilmagansiz</p>
              <Link href="/student/courses" className="text-blue-400 text-xs hover:text-blue-300 transition-colors">
                Kurslarni ko&apos;rish →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {ongoingEnrollments.map(enroll => {
                const course = courseMap[enroll.course_id]
                if (!course) return null
                return (
                  <div key={enroll.course_id}>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xl flex-shrink-0">{course.emoji ?? '📚'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{course.title}</p>
                        <p className="text-white/35 text-xs">{teacherMap[course.teacher_id] ?? "O'qituvchi"}</p>
                      </div>
                      <span className="text-blue-400 text-xs font-semibold flex-shrink-0">{enroll.progress ?? 0}%</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full"
                        style={{ width: `${enroll.progress ?? 0}%` }} />
                    </div>
                    <div className="mt-2">
                      <Link href={`/student/courses/${enroll.course_id}`}
                        className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                        Davom etish →
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Kutilayotgan topshiriqlar */}
        <div className="rounded-2xl p-5"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white text-sm font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-400" /> Kutilayotgan topshiriqlar
            </h2>
            <Link href="/student/tasks"
              className="text-xs text-white/30 hover:text-amber-400 transition-colors flex items-center gap-1">
              Barchasi <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {pendingTaskList.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2 className="h-8 w-8 text-emerald-400/50 mx-auto mb-2" />
              <p className="text-white/30 text-sm">Barcha topshiriqlar bajarilgan!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingTaskList.map(task => {
                const course = courseMap[task.course_id]
                const deadline = task.deadline ? new Date(task.deadline) : null
                const daysLeft = deadline
                  ? Math.ceil((deadline.getTime() - Date.now()) / 86400000)
                  : null
                const isUrgent = daysLeft !== null && daysLeft <= 2
                return (
                  <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className={`p-1.5 rounded-lg flex-shrink-0 ${isUrgent ? 'bg-red-500/15' : 'bg-amber-500/15'}`}>
                      <AlertCircle className={`h-3.5 w-3.5 ${isUrgent ? 'text-red-400' : 'text-amber-400'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-medium truncate">{task.title}</p>
                      <p className="text-white/35 text-xs truncate">{course?.title ?? '—'}</p>
                    </div>
                    {daysLeft !== null && (
                      <span className={`text-xs font-medium flex-shrink-0 ${isUrgent ? 'text-red-400' : 'text-white/40'}`}>
                        {daysLeft <= 0 ? 'Bugun!' : `${daysLeft} kun`}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Tezkor harakatlar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { href: '/student/courses', label: 'Kurslar katalogi', sub: 'Yangi kurslarni ko\'ring', icon: BookOpen, color: 'text-blue-400', bg: 'rgba(59,130,246,0.08)', border: 'rgba(99,102,241,0.2)' },
          { href: '/student/tasks', label: 'Topshiriqlar', sub: 'Ishlarni topshiring', icon: ClipboardCheck, color: 'text-amber-400', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)' },
          { href: '/student/leaderboard', label: 'Reyting', sub: "O'z o'rningizni biling", icon: Star, color: 'text-purple-400', bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.2)' },
        ].map(item => {
          const Icon = item.icon
          return (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-3 p-4 rounded-2xl transition-all hover:opacity-90"
              style={{ background: item.bg, border: `1px solid ${item.border}` }}>
              <Icon className={`h-5 w-5 ${item.color}`} />
              <div>
                <p className="text-white text-sm font-medium">{item.label}</p>
                <p className="text-white/40 text-xs">{item.sub}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-white/30 ml-auto" />
            </Link>
          )
        })}
      </div>
    </div>
  )
}
