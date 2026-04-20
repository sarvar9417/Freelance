import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import {
  BookOpen, Users, ClipboardCheck, Star,
  Plus, ArrowRight, Clock, CheckCircle2, AlertCircle,
} from 'lucide-react'

export default async function TeacherDashboard() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('full_name, role')
    .eq('id', user.id)
    .single()

  if (!['teacher', 'admin'].includes(profile?.role ?? '')) redirect('/student')

  // ── Kurslar ────────────────────────────────────────────────────────
  const { data: courses } = await supabase
    .from('courses')
    .select('id, title, emoji, category, is_published, status, created_at')
    .eq('teacher_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  const courseIds = (courses ?? []).map(c => c.id)

  // ── Statistikalar ──────────────────────────────────────────────────
  const [
    { count: totalCourses },
    { count: totalStudents },
    { count: pendingSubmissions },
  ] = await Promise.all([
    supabase.from('courses').select('*', { count: 'exact', head: true }).eq('teacher_id', user.id),
    courseIds.length > 0
      ? supabase.from('enrollments').select('student_id', { count: 'exact', head: true }).in('course_id', courseIds)
      : Promise.resolve({ count: 0 }),
    courseIds.length > 0
      ? (async () => {
          const { data: taskRows } = await supabase.from('tasks').select('id').in('course_id', courseIds)
          const taskIds = (taskRows ?? []).map(t => t.id)
          if (taskIds.length === 0) return { count: 0 }
          return supabase.from('submissions').select('*', { count: 'exact', head: true }).in('task_id', taskIds).eq('status', 'pending')
        })()
      : Promise.resolve({ count: 0 }),
  ])

  // ── O'rtacha baho ─────────────────────────────────────────────────
  let avgScore = 0
  if (courseIds.length > 0) {
    const { data: taskRows } = await supabase.from('tasks').select('id').in('course_id', courseIds)
    const taskIds = (taskRows ?? []).map(t => t.id)
    if (taskIds.length > 0) {
      const { data: scores } = await supabase
        .from('submissions')
        .select('score')
        .in('task_id', taskIds)
        .not('score', 'is', null)
      const nums = (scores ?? []).map(s => s.score).filter(Boolean)
      if (nums.length) avgScore = Math.round(nums.reduce((a, b) => a + b, 0) / nums.length)
    }
  }

  // ── Oxirgi topshirilgan ishlar ────────────────────────────────────
  let recentSubmissions: Array<{
    id: string; submitted_at: string; status: string
    tasks: { title: string; courses: { title: string } | null } | null
    users: { full_name: string } | null
  }> = []
  if (courseIds.length > 0) {
    const { data: taskRows } = await supabase.from('tasks').select('id').in('course_id', courseIds)
    const taskIds = (taskRows ?? []).map(t => t.id)
    if (taskIds.length > 0) {
      const { data } = await supabase
        .from('submissions')
        .select('id, submitted_at, status, tasks(title, courses(title)), users!student_id(full_name)')
        .in('task_id', taskIds)
        .order('submitted_at', { ascending: false })
        .limit(5)
      recentSubmissions = (data as any) ?? []
    }
  }

  const fullName = profile?.full_name ?? "O'qituvchi"
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Xayrli tong' : hour < 18 ? 'Xayrli kun' : 'Xayrli kech'

  const stats = [
    { label: 'Mening kurslarim', value: totalCourses ?? 0, icon: BookOpen, color: 'text-emerald-400', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.15)' },
    { label: "Jami o'quvchilar", value: totalStudents ?? 0, icon: Users, color: 'text-blue-400', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.15)' },
    { label: 'Kutilayotgan topshiriqlar', value: pendingSubmissions ?? 0, icon: ClipboardCheck, color: 'text-amber-400', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.15)' },
    { label: "O'rtacha baho", value: avgScore ? `${avgScore}/100` : '—', icon: Star, color: 'text-purple-400', bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.15)' },
  ]

  const STATUS_MAP: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
    pending:  { label: 'Kutilmoqda', color: 'text-amber-400',   icon: Clock },
    graded:   { label: 'Baholandi',  color: 'text-emerald-400', icon: CheckCircle2 },
    revision: { label: 'Qayta topshiring', color: 'text-red-400', icon: AlertCircle },
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Salom */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          {greeting}, <span className="text-emerald-400">{fullName}!</span>
        </h1>
        <p className="text-white/40 text-sm mt-1">
          {new Date().toLocaleDateString('uz-UZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Statistika */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon
          return (
            <div
              key={s.label}
              className="rounded-2xl p-5"
              style={{ background: s.bg, border: `1px solid ${s.border}` }}
            >
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

      {/* Tezkor harakatlar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link
          href="/teacher/courses/new"
          className="flex items-center gap-3 px-5 py-4 rounded-2xl text-white font-medium transition-all hover:opacity-90 shadow-lg shadow-emerald-900/20"
          style={{ background: 'linear-gradient(135deg, rgba(5,150,105,0.8), rgba(4,120,87,0.8))', border: '1px solid rgba(16,185,129,0.3)' }}
        >
          <div className="p-2 rounded-xl bg-white/10">
            <Plus className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold">Yangi kurs yaratish</p>
            <p className="text-white/60 text-xs">Yangi kurs qo&apos;shish</p>
          </div>
          <ArrowRight className="h-4 w-4 ml-auto opacity-60" />
        </Link>
        <Link
          href="/teacher/tasks/review"
          className="flex items-center gap-3 px-5 py-4 rounded-2xl text-white font-medium transition-all hover:bg-white/[0.06]"
          style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}
        >
          <div className="p-2 rounded-xl" style={{ background: 'rgba(245,158,11,0.15)' }}>
            <ClipboardCheck className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <p className="font-semibold">Topshiriqlarni tekshirish</p>
            <p className="text-amber-400/80 text-xs">{pendingSubmissions ?? 0} ta kutilmoqda</p>
          </div>
          <ArrowRight className="h-4 w-4 ml-auto text-white/30" />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Oxirgi topshirilgan ishlar */}
        <div
          className="rounded-2xl p-5"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white text-sm font-semibold">Oxirgi topshirilgan ishlar</h2>
            <Link href="/teacher/tasks/review" className="text-xs text-white/30 hover:text-emerald-400 transition-colors flex items-center gap-1">
              Barchasi <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {recentSubmissions.length === 0 ? (
              <p className="text-white/25 text-sm text-center py-6">Hali topshirilgan ishlar yo&apos;q</p>
            ) : recentSubmissions.map(sub => {
              const st = STATUS_MAP[sub.status] ?? STATUS_MAP.pending
              const StatusIcon = st.icon
              return (
                <Link
                  key={sub.id}
                  href={`/teacher/submissions/${sub.id}/review`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-colors"
                >
                  <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-white/60">
                      {(sub.users?.full_name ?? 'N')[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-medium truncate">{sub.users?.full_name ?? 'O\'quvchi'}</p>
                    <p className="text-white/35 text-xs truncate">{(sub.tasks as any)?.title ?? '—'}</p>
                  </div>
                  <div className={`flex items-center gap-1 text-xs ${st.color} flex-shrink-0`}>
                    <StatusIcon className="h-3 w-3" />
                    {st.label}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Faol kurslar */}
        <div
          className="rounded-2xl p-5"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white text-sm font-semibold">Faol kurslarim</h2>
            <Link href="/teacher/courses" className="text-xs text-white/30 hover:text-emerald-400 transition-colors flex items-center gap-1">
              Barchasi <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {(courses ?? []).length === 0 ? (
              <div className="text-center py-6">
                <p className="text-white/25 text-sm mb-3">Hali kurs yaratilmagan</p>
                <Link
                  href="/teacher/courses/new"
                  className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  Birinchi kursni yaratish →
                </Link>
              </div>
            ) : (courses ?? []).map(course => (
              <Link
                key={course.id}
                href={`/teacher/courses/${course.id}`}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-colors"
              >
                <span className="text-xl flex-shrink-0">{course.emoji ?? '📚'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-medium truncate">{course.title}</p>
                  <p className="text-white/35 text-xs">{course.category}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full border flex-shrink-0 ${
                  course.is_published
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-white/5 text-white/30 border-white/10'
                }`}>
                  {course.is_published ? 'Nashr' : 'Qoralama'}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
