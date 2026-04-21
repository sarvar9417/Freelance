import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Users, TrendingUp, AlertCircle, CheckCircle2, BookOpen } from 'lucide-react'

export default async function StudentsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (!['teacher', 'admin'].includes(profile?.role ?? '')) redirect('/student')

  const { data: courses } = await supabase
    .from('courses')
    .select('id, title, emoji')
    .eq('teacher_id', user.id)

  const courseIds = (courses ?? []).map(c => c.id)
  const courseMap = Object.fromEntries((courses ?? []).map(c => [c.id, c]))

  if (courseIds.length === 0) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">O&apos;quvchilarim</h1>
          <p className="text-white/40 text-sm mt-1">Barcha kurslardagi o&apos;quvchilar</p>
        </div>
        <div
          className="rounded-2xl p-12 text-center"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="text-5xl mb-4">👨‍🎓</div>
          <p className="text-white/40 text-sm mb-3">Hali kurs yaratilmagan</p>
          <Link
            href="/teacher/courses/new"
            className="inline-block text-emerald-400 text-sm hover:text-emerald-300 transition-colors"
          >
            Kurs yaratish →
          </Link>
        </div>
      </div>
    )
  }

  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('id, course_id, student_id, progress, enrolled_at, last_accessed')
    .in('course_id', courseIds)
    .order('enrolled_at', { ascending: false })

  const uniqueStudentIds = Array.from(new Set((enrollments ?? []).map(e => e.student_id).filter(Boolean)))

  const { data: usersData } = uniqueStudentIds.length > 0
    ? await supabase.from('users').select('id, full_name, email, avatar_url').in('id', uniqueStudentIds)
    : { data: [] as { id: string; full_name: string; email: string; avatar_url: string | null }[] }

  const usersMap = Object.fromEntries((usersData ?? []).map(u => [u.id, u]))

  const { data: taskRows } = await supabase
    .from('tasks')
    .select('id, course_id')
    .in('course_id', courseIds)

  const taskIds = (taskRows ?? []).map(t => t.id)

  let submissionStats: Record<string, { total: number; graded: number; pending: number; avgScore: number }> = {}

  if (taskIds.length > 0 && uniqueStudentIds.length > 0) {
    const { data: subs } = await supabase
      .from('submissions')
      .select('student_id, status, score')
      .in('task_id', taskIds)
      .in('student_id', uniqueStudentIds)

    for (const sid of uniqueStudentIds) {
      const studentSubs = (subs ?? []).filter(s => s.student_id === sid)
      const graded = studentSubs.filter(s => s.status === 'graded')
      const scores = graded.map(s => s.score).filter((s): s is number => s !== null)
      submissionStats[sid] = {
        total: studentSubs.length,
        graded: graded.length,
        pending: studentSubs.filter(s => s.status === 'pending').length,
        avgScore: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
      }
    }
  }

  // Unique students with aggregated data
  const studentMap: Record<string, {
    userId: string; fullName: string; email: string
    courses: string[]; totalProgress: number; enrollmentCount: number
    enrolledAt: string; lastAccessed: string | null
  }> = {}

  for (const e of enrollments ?? []) {
    const sid = e.student_id
    if (!sid) continue
    const userData = usersMap[sid]
    if (!studentMap[sid]) {
      studentMap[sid] = {
        userId: sid,
        fullName: userData?.full_name ?? "O'quvchi",
        email: userData?.email ?? '',
        courses: [],
        totalProgress: 0,
        enrollmentCount: 0,
        enrolledAt: e.enrolled_at,
        lastAccessed: e.last_accessed,
      }
    }
    studentMap[sid].courses.push(courseMap[e.course_id]?.title ?? '')
    studentMap[sid].totalProgress += e.progress ?? 0
    studentMap[sid].enrollmentCount += 1
    if (e.last_accessed && (!studentMap[sid].lastAccessed || e.last_accessed > studentMap[sid].lastAccessed!)) {
      studentMap[sid].lastAccessed = e.last_accessed
    }
  }

  const students = Object.values(studentMap).map(s => ({
    ...s,
    avgProgress: s.enrollmentCount > 0 ? Math.round(s.totalProgress / s.enrollmentCount) : 0,
    ...submissionStats[s.userId] ?? { total: 0, graded: 0, pending: 0, avgScore: 0 },
  }))

  const totalPending = students.reduce((a, s) => a + s.pending, 0)
  const globalAvgProgress = students.length
    ? Math.round(students.reduce((a, s) => a + s.avgProgress, 0) / students.length)
    : 0

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">O&apos;quvchilarim</h1>
        <p className="text-white/40 text-sm mt-1">Barcha kurslardagi o&apos;quvchilar</p>
      </div>

      {/* Statistika */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Users,        val: students.length,         label: "Jami o'quvchilar",  color: 'text-blue-400',    bg: 'rgba(59,130,246,0.08)',    border: 'rgba(59,130,246,0.15)'    },
          { icon: TrendingUp,   val: `${globalAvgProgress}%`, label: "O'rt. progress",    color: 'text-emerald-400', bg: 'rgba(16,185,129,0.08)',    border: 'rgba(16,185,129,0.15)'    },
          { icon: AlertCircle,  val: totalPending,            label: 'Baholanmagan',      color: 'text-amber-400',   bg: 'rgba(245,158,11,0.08)',    border: 'rgba(245,158,11,0.15)'    },
          { icon: CheckCircle2, val: students.filter(s => s.graded > 0).length, label: "Baholangan o'quvchi", color: 'text-purple-400', bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.15)' },
        ].map(({ icon: Icon, val, label, color, bg, border }) => (
          <div key={label} className="rounded-2xl p-5" style={{ background: bg, border: `1px solid ${border}` }}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl" style={{ background: bg, border: `1px solid ${border}` }}>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <div>
                <p className="text-white/40 text-xs">{label}</p>
                <p className={`text-2xl font-bold ${color}`}>{val}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* O'quvchilar jadvali */}
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
                  <th className="text-left text-xs font-medium text-white/40 px-4 py-3 hidden sm:table-cell">Kurslar</th>
                  <th className="text-left text-xs font-medium text-white/40 px-4 py-3 hidden md:table-cell">Progress</th>
                  <th className="text-left text-xs font-medium text-white/40 px-4 py-3 hidden lg:table-cell">Topshiriqlar</th>
                  <th className="text-right text-xs font-medium text-white/40 px-4 py-3">Batafsil</th>
                </tr>
              </thead>
              <tbody>
                {students.map(s => {
                  const initials = s.fullName.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
                  const progressColor = s.avgProgress >= 70 ? 'from-emerald-600 to-emerald-400' : s.avgProgress >= 40 ? 'from-amber-600 to-amber-400' : 'from-white/20 to-white/10'
                  const gradeColor = s.avgScore >= 80 ? 'text-emerald-400' : s.avgScore >= 60 ? 'text-blue-400' : s.avgScore > 0 ? 'text-amber-400' : 'text-white/25'
                  return (
                    <tr
                      key={s.userId}
                      className="hover:bg-white/[0.02] transition-colors"
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500/30 to-blue-500/30 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-white text-sm font-medium truncate">{s.fullName}</p>
                              {s.pending > 0 && (
                                <span className="bg-amber-500 text-white text-[10px] font-bold h-4 min-w-4 px-1 rounded-full flex items-center justify-center flex-shrink-0">
                                  {s.pending}
                                </span>
                              )}
                            </div>
                            <p className="text-white/35 text-xs truncate">{s.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 hidden sm:table-cell">
                        <div className="flex items-center gap-1 text-white/40 text-xs">
                          <BookOpen className="h-3 w-3 text-emerald-400" />
                          {s.enrollmentCount} ta kurs
                        </div>
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell">
                        <div className="w-28">
                          <div className="flex justify-between mb-1">
                            <span className="text-white/30 text-xs">Progress</span>
                            <span className="text-white/60 text-xs font-medium">{s.avgProgress}%</span>
                          </div>
                          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                            <div className={`h-full rounded-full bg-gradient-to-r ${progressColor}`} style={{ width: `${s.avgProgress}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 hidden lg:table-cell">
                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-white/50">{s.total} ta topshirilgan</span>
                          {s.avgScore > 0 && (
                            <span className={`font-semibold ${gradeColor}`}>⌀ {s.avgScore}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <Link
                          href={`/teacher/students/${s.userId}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-white/40 hover:text-white hover:bg-white/5 transition-all border border-white/5"
                        >
                          Batafsil
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <div className="px-4 py-3" style={{ background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <span className="text-white/30 text-xs">
                Jami: <span className="text-white/50 font-medium">{students.length}</span> ta o&apos;quvchi
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
