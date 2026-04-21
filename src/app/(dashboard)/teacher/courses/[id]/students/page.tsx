import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft, Users, TrendingUp, Star } from 'lucide-react'

export default async function CourseStudentsPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: course } = await supabase
    .from('courses')
    .select('id, title, emoji, category')
    .eq('id', params.id)
    .eq('teacher_id', user.id)
    .single()

  if (!course) notFound()

  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('id, student_id, progress, enrolled_at, last_accessed')
    .eq('course_id', params.id)
    .order('enrolled_at', { ascending: false })

  const studentIds = (enrollments ?? []).map(e => e.student_id).filter(Boolean)

  const { data: usersData } = studentIds.length > 0
    ? await supabase
        .from('users')
        .select('id, full_name, email, avatar_url')
        .in('id', studentIds)
    : { data: [] as { id: string; full_name: string; email: string; avatar_url: string | null }[] }

  const usersMap = Object.fromEntries((usersData ?? []).map(u => [u.id, u]))

  const { data: taskRows } = await supabase
    .from('tasks')
    .select('id')
    .eq('course_id', params.id)

  const taskIds = (taskRows ?? []).map(t => t.id)

  const submissionMap: Record<string, { total: number; graded: number; avgScore: number }> = {}

  if (taskIds.length > 0 && studentIds.length > 0) {
    const { data: subs } = await supabase
      .from('submissions')
      .select('student_id, status, score')
      .in('task_id', taskIds)
      .in('student_id', studentIds)

    for (const sid of studentIds) {
      const studentSubs = (subs ?? []).filter(s => s.student_id === sid)
      const graded = studentSubs.filter(s => s.status === 'graded')
      const scores = graded.map(s => s.score).filter((s): s is number => s !== null)
      submissionMap[sid] = {
        total: studentSubs.length,
        graded: graded.length,
        avgScore: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
      }
    }
  }

  const students = (enrollments ?? []).map(e => {
    const userData = usersMap[e.student_id]
    return {
      enrollmentId: e.id,
      progress: e.progress ?? 0,
      enrolledAt: e.enrolled_at,
      lastAccessed: e.last_accessed,
      userId: e.student_id,
      fullName: userData?.full_name ?? "O'quvchi",
      email: userData?.email ?? '',
      ...submissionMap[e.student_id] ?? { total: 0, graded: 0, avgScore: 0 },
    }
  })

  const avgProgress = students.length
    ? Math.round(students.reduce((a, s) => a + s.progress, 0) / students.length)
    : 0

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/teacher/courses"
          className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <p className="text-white/40 text-xs">{course.emoji} {course.title}</p>
          <h1 className="text-xl font-bold text-white">O&apos;quvchilar</h1>
        </div>
      </div>

      {/* Statistika */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Jami o'quvchilar", value: students.length, icon: Users, color: 'text-blue-400', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.15)' },
          { label: "O'rt. progress", value: `${avgProgress}%`, icon: TrendingUp, color: 'text-emerald-400', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.15)' },
          { label: 'Baholangan', value: students.filter(s => s.graded > 0).length, icon: Star, color: 'text-amber-400', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.15)' },
        ].map(s => {
          const Icon = s.icon
          return (
            <div key={s.label} className="rounded-2xl p-5" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                  <Icon className={`h-4 w-4 ${s.color}`} />
                </div>
                <div>
                  <p className="text-white/40 text-xs">{s.label}</p>
                  <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Jadval */}
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
        {students.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-5xl mb-4">👨‍🎓</div>
            <p className="text-white/40 text-sm">Hali hech qanday o&apos;quvchi ro&apos;yxatdan o&apos;tmagan</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <th className="text-left text-xs font-medium text-white/40 px-4 py-3">O&apos;quvchi</th>
                  <th className="text-left text-xs font-medium text-white/40 px-4 py-3 hidden sm:table-cell">Progress</th>
                  <th className="text-left text-xs font-medium text-white/40 px-4 py-3 hidden md:table-cell">Topshiriqlar</th>
                  <th className="text-left text-xs font-medium text-white/40 px-4 py-3 hidden lg:table-cell">Qo&apos;shilgan</th>
                  <th className="text-right text-xs font-medium text-white/40 px-4 py-3">Batafsil</th>
                </tr>
              </thead>
              <tbody>
                {students.map(s => {
                  const initials = s.fullName.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
                  const progressColor = s.progress >= 70 ? 'bg-emerald-500' : s.progress >= 40 ? 'bg-amber-500' : 'bg-white/20'
                  return (
                    <tr
                      key={s.enrollmentId}
                      className="hover:bg-white/[0.02] transition-colors"
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500/30 to-blue-500/30 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <p className="text-white text-sm font-medium truncate">{s.fullName}</p>
                            <p className="text-white/35 text-xs truncate">{s.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 hidden sm:table-cell">
                        <div className="w-28">
                          <div className="flex justify-between mb-1">
                            <span className="text-white/30 text-xs">Progress</span>
                            <span className="text-white/60 text-xs font-medium">{s.progress}%</span>
                          </div>
                          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                            <div className={`h-full rounded-full ${progressColor}`} style={{ width: `${s.progress}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell">
                        <div className="text-sm">
                          <span className="text-white/60">{s.graded}</span>
                          <span className="text-white/25">/{s.total} baholangan</span>
                          {s.avgScore > 0 && (
                            <span className="ml-2 text-amber-400 text-xs font-medium">⌀ {s.avgScore}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 hidden lg:table-cell">
                        <span className="text-white/30 text-xs">
                          {new Date(s.enrolledAt).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <Link
                          href={`/teacher/students/${s.userId}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-white/40 hover:text-white hover:bg-white/5 transition-all border border-white/5"
                        >
                          Ko&apos;rish
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
