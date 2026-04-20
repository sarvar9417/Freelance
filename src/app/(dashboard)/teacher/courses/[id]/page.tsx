import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import {
  ArrowLeft, BookOpen, Users, ClipboardList, PlayCircle,
  ChevronRight, TrendingUp, Star, CheckCircle2, AlertCircle, Edit2,
} from 'lucide-react'

export default async function CourseDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: course } = await supabase
    .from('courses')
    .select('id, title, emoji, description, full_description, category, level, image_url, is_published, status, created_at')
    .eq('id', params.id)
    .eq('teacher_id', user.id)
    .single()

  if (!course) notFound()

  const [
    { count: lessonCount },
    { count: taskCount },
    { data: enrollments },
  ] = await Promise.all([
    supabase.from('lessons').select('*', { count: 'exact', head: true }).eq('course_id', params.id),
    supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('course_id', params.id),
    supabase
      .from('enrollments')
      .select('student_id, progress, last_accessed, users!student_id(full_name, email)')
      .eq('course_id', params.id)
      .order('progress', { ascending: false })
      .limit(20),
  ])

  // Tasks va submissions
  const { data: taskRows } = await supabase
    .from('tasks')
    .select('id')
    .eq('course_id', params.id)

  const taskIds = (taskRows ?? []).map(t => t.id)
  let pendingCount = 0
  let gradedCount = 0
  let avgScore: number | null = null

  if (taskIds.length > 0) {
    const { data: subs } = await supabase
      .from('submissions')
      .select('status, score')
      .in('task_id', taskIds)

    pendingCount = (subs ?? []).filter(s => s.status === 'pending').length
    gradedCount = (subs ?? []).filter(s => s.status === 'graded').length
    const scores = (subs ?? []).filter(s => s.status === 'graded').map(s => s.score).filter((s): s is number => s !== null)
    if (scores.length) avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
  }

  const avgProgress = (enrollments ?? []).length
    ? Math.round((enrollments ?? []).reduce((a, e) => a + (e.progress ?? 0), 0) / (enrollments ?? []).length)
    : 0

  const STATUS_COLORS: Record<string, string> = {
    approved: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    rejected: 'bg-red-500/15 text-red-400 border-red-500/20',
    pending: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  }
  const STATUS_LABELS: Record<string, string> = {
    approved: 'Tasdiqlangan', rejected: 'Rad etilgan', pending: 'Tekshirmoqda',
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/teacher/courses" className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <p className="text-white/40 text-xs">{course.category}</p>
          <h1 className="text-xl font-bold text-white truncate">{course.emoji} {course.title}</h1>
        </div>
        <Link
          href={`/teacher/courses/${params.id}/edit`}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all border border-white/10"
        >
          <Edit2 className="h-3.5 w-3.5" /> Tahrirlash
        </Link>
      </div>

      {/* Kurs ma'lumoti */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        {course.image_url ? (
          <img src={course.image_url} alt={course.title} className="w-full h-32 object-cover" />
        ) : (
          <div className="h-32 flex items-center justify-center text-6xl"
            style={{ background: 'linear-gradient(135deg, rgba(5,150,105,0.2), rgba(59,130,246,0.15))' }}>
            {course.emoji}
          </div>
        )}
        <div className="p-5">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${
              course.is_published ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-white/5 text-white/40 border-white/10'
            }`}>
              {course.is_published ? 'Nashr etilgan' : 'Qoralama'}
            </span>
            <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${STATUS_COLORS[course.status ?? 'pending'] ?? ''}`}>
              {STATUS_LABELS[course.status ?? 'pending'] ?? course.status}
            </span>
            <span className="text-xs text-white/30">{course.level}</span>
          </div>
          {course.description && (
            <p className="text-white/50 text-sm leading-relaxed">{course.description}</p>
          )}
        </div>
      </div>

      {/* Statistika */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: Users,         val: (enrollments ?? []).length, label: "O'quvchilar",    color: 'text-blue-400',    bg: 'rgba(59,130,246,0.08)',    border: 'rgba(59,130,246,0.15)'    },
          { icon: PlayCircle,    val: lessonCount ?? 0,            label: 'Darslar',        color: 'text-purple-400',  bg: 'rgba(139,92,246,0.08)',    border: 'rgba(139,92,246,0.15)'    },
          { icon: ClipboardList, val: taskCount ?? 0,              label: 'Topshiriqlar',   color: 'text-amber-400',   bg: 'rgba(245,158,11,0.08)',    border: 'rgba(245,158,11,0.15)'    },
          { icon: TrendingUp,    val: `${avgProgress}%`,           label: "O'rt. progress", color: 'text-emerald-400', bg: 'rgba(16,185,129,0.08)',    border: 'rgba(16,185,129,0.15)'    },
        ].map(({ icon: Icon, val, label, color, bg, border }) => (
          <div key={label} className="rounded-2xl p-4 text-center" style={{ background: bg, border: `1px solid ${border}` }}>
            <Icon className={`h-4 w-4 ${color} mx-auto mb-2`} />
            <p className={`text-xl font-bold ${color}`}>{val}</p>
            <p className="text-white/40 text-xs mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Tez harakatlar */}
      <div className="grid sm:grid-cols-3 gap-3">
        {[
          { href: `/teacher/courses/${params.id}/lessons`, label: 'Darslarni boshqarish', icon: PlayCircle,    color: 'text-blue-400',   border: 'rgba(59,130,246,0.2)',   bg: 'rgba(59,130,246,0.08)'   },
          { href: `/teacher/courses/${params.id}/tasks`,   label: 'Topshiriqlar',          icon: ClipboardList, color: 'text-amber-400',  border: 'rgba(245,158,11,0.2)',   bg: 'rgba(245,158,11,0.08)'   },
          { href: `/teacher/courses/${params.id}/students`,label: "O'quvchilar",           icon: Users,         color: 'text-emerald-400',border: 'rgba(16,185,129,0.2)',   bg: 'rgba(16,185,129,0.08)'   },
        ].map(({ href, label, icon: Icon, color, border, bg }) => (
          <Link key={href} href={href}>
            <div
              className="flex items-center gap-3 p-4 rounded-xl hover:bg-white/5 transition-all group"
              style={{ background: bg, border: `1px solid ${border}` }}
            >
              <Icon className={`h-4 w-4 ${color} flex-shrink-0`} />
              <span className="text-white text-sm font-medium flex-1">{label}</span>
              <ChevronRight className="h-3.5 w-3.5 text-white/20 group-hover:text-white/50 transition-colors" />
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* O'quvchilar progressi */}
        <div
          className="rounded-2xl p-5"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white text-sm font-semibold flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-emerald-400" /> O&apos;quvchilar progressi
            </h2>
            <Link href={`/teacher/courses/${params.id}/students`} className="text-xs text-white/30 hover:text-emerald-400 transition-colors">
              Barchasi →
            </Link>
          </div>
          {(enrollments ?? []).length === 0 ? (
            <p className="text-white/25 text-sm text-center py-6">Hali o&apos;quvchi yo&apos;q</p>
          ) : (
            <div className="space-y-3">
              {(enrollments ?? []).slice(0, 5).map((e: any) => {
                const name = e.users?.full_name ?? "O'quvchi"
                const initials = name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
                const progress = e.progress ?? 0
                return (
                  <div key={e.student_id} className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500/30 to-blue-500/30 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between mb-1">
                        <p className="text-white text-xs font-medium truncate">{name}</p>
                        <span className="text-emerald-400 text-xs font-semibold ml-2">{progress}%</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                        <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Topshiriqlar statistikasi */}
        <div
          className="rounded-2xl p-5"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <h2 className="text-white text-sm font-semibold flex items-center gap-1.5 mb-4">
            <ClipboardList className="h-4 w-4 text-amber-400" /> Topshiriqlar statistikasi
          </h2>
          <div className="space-y-3">
            {[
              { icon: AlertCircle,  label: 'Tekshirilmagan',  val: pendingCount, color: 'text-amber-400',   bg: 'rgba(245,158,11,0.1)'    },
              { icon: CheckCircle2, label: 'Baholangan',       val: gradedCount,  color: 'text-emerald-400', bg: 'rgba(16,185,129,0.1)'    },
              { icon: Star,         label: "O'rtacha baho",   val: avgScore !== null ? `${avgScore}/100` : '—', color: 'text-purple-400', bg: 'rgba(139,92,246,0.1)' },
              { icon: BookOpen,     label: 'Jami darslar',    val: lessonCount ?? 0, color: 'text-blue-400', bg: 'rgba(59,130,246,0.1)'   },
            ].map(({ icon: Icon, label, val, color, bg }) => (
              <div
                key={label}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl"
                style={{ background: bg }}
              >
                <div className="flex items-center gap-2">
                  <Icon className={`h-3.5 w-3.5 ${color}`} />
                  <span className="text-white/50 text-sm">{label}</span>
                </div>
                <span className={`text-sm font-bold ${color}`}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
