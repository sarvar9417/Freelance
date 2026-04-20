import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import {
  ArrowLeft, BookOpen, ClipboardCheck, Star,
  CheckCircle2, Clock, RotateCcw, Calendar,
} from 'lucide-react'

const STATUS_MAP: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending:  { label: 'Kutilmoqda',       color: 'text-amber-400',   icon: Clock },
  graded:   { label: 'Baholandi',         color: 'text-emerald-400', icon: CheckCircle2 },
  revision: { label: 'Qayta topshirish', color: 'text-red-400',     icon: RotateCcw },
}

export default async function StudentDetailPage({
  params,
}: {
  params: { studentId: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: teacherProfile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!['teacher', 'admin'].includes(teacherProfile?.role ?? '')) redirect('/student')

  // O'quvchi profili
  const { data: student } = await supabase
    .from('users')
    .select('id, full_name, email, avatar_url, bio, age, created_at')
    .eq('id', params.studentId)
    .single()

  if (!student) notFound()

  // O'qituvchining kurslari
  const { data: myCourses } = await supabase
    .from('courses')
    .select('id, title, emoji, category')
    .eq('teacher_id', user.id)

  const myCourseIds = (myCourses ?? []).map(c => c.id)
  const courseMap = Object.fromEntries((myCourses ?? []).map(c => [c.id, c]))

  if (myCourseIds.length === 0) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/teacher/students" className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-xl font-bold text-white">{student.full_name}</h1>
        </div>
        <p className="text-white/40 text-sm">Kurs mavjud emas</p>
      </div>
    )
  }

  // O'quvchining yozilgan kurslari (faqat ushbu o'qituvchiniki)
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('course_id, progress, enrolled_at, last_accessed')
    .eq('student_id', params.studentId)
    .in('course_id', myCourseIds)

  const enrolledCourseIds = (enrollments ?? []).map(e => e.course_id)
  const enrollMap = Object.fromEntries((enrollments ?? []).map(e => [e.course_id, e]))

  // Topshiriqlar
  const { data: taskRows } = enrolledCourseIds.length > 0
    ? await supabase.from('tasks').select('id, title, course_id, max_score').in('course_id', enrolledCourseIds)
    : { data: [] }

  const taskIds = (taskRows ?? []).map(t => t.id)
  const taskMap = Object.fromEntries((taskRows ?? []).map(t => [t.id, t]))

  // Topshirilgan ishlar
  const { data: submissions } = taskIds.length > 0
    ? await supabase
        .from('submissions')
        .select('id, task_id, submitted_at, status, score, feedback')
        .eq('student_id', params.studentId)
        .in('task_id', taskIds)
        .order('submitted_at', { ascending: false })
    : { data: [] }

  // Per-course stats
  const courseStats = enrolledCourseIds.map(cid => {
    const courseTasks = (taskRows ?? []).filter(t => t.course_id === cid)
    const courseTaskIds = courseTasks.map(t => t.id)
    const courseSubs = (submissions ?? []).filter(s => courseTaskIds.includes(s.task_id))
    const graded = courseSubs.filter(s => s.status === 'graded')
    const scores = graded.map(s => s.score).filter((s): s is number => s !== null)
    const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null
    return {
      courseId: cid,
      course: courseMap[cid],
      enroll: enrollMap[cid],
      taskCount: courseTasks.length,
      submitted: courseSubs.length,
      graded: graded.length,
      avgScore,
    }
  })

  const totalSubs = (submissions ?? []).length
  const totalGraded = (submissions ?? []).filter(s => s.status === 'graded').length
  const allScores = (submissions ?? []).map(s => s.score).filter((s): s is number => s !== null)
  const overallAvg = allScores.length ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : null

  const initials = (student.full_name ?? 'OQ').split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/teacher/students" className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white">{student.full_name}</h1>
          <p className="text-white/40 text-xs">{student.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Profil */}
        <div className="space-y-4">
          {/* Profil kartochka */}
          <div
            className="rounded-2xl p-5 space-y-4"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="flex flex-col items-center text-center gap-3">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500/40 to-blue-600/40 flex items-center justify-center text-xl font-bold text-white">
                {initials}
              </div>
              <div>
                <p className="text-white font-semibold">{student.full_name}</p>
                <p className="text-white/40 text-xs mt-0.5">{student.email}</p>
                {student.age && (
                  <p className="text-white/30 text-xs mt-0.5">{student.age} yosh</p>
                )}
              </div>
            </div>
            {student.bio && (
              <p className="text-white/50 text-xs leading-relaxed border-t border-white/5 pt-3">{student.bio}</p>
            )}
            <div className="text-xs text-white/25 border-t border-white/5 pt-3">
              Ro&apos;yxatdan o&apos;tgan:{' '}
              {new Date(student.created_at).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>

          {/* Umumiy statistika */}
          <div
            className="rounded-2xl p-5 space-y-3"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <p className="text-white/40 text-xs font-medium uppercase tracking-wide">Umumiy statistika</p>
            {[
              { label: 'Yozilgan kurslar', value: enrolledCourseIds.length, icon: BookOpen, color: 'text-blue-400' },
              { label: 'Topshiriqlar', value: totalSubs, icon: ClipboardCheck, color: 'text-amber-400' },
              { label: 'Baholangan', value: totalGraded, icon: CheckCircle2, color: 'text-emerald-400' },
              { label: "O'rt. baho", value: overallAvg !== null ? `${overallAvg}/100` : '—', icon: Star, color: 'text-purple-400' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={`h-3.5 w-3.5 ${color}`} />
                  <span className="text-white/50 text-sm">{label}</span>
                </div>
                <span className={`text-sm font-semibold ${color}`}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Kurslar va topshiriqlar */}
        <div className="lg:col-span-2 space-y-5">
          {/* Kurslar progress */}
          <div
            className="rounded-2xl p-5"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <p className="text-white/40 text-xs font-medium mb-4 flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5" /> Mening kurslarim bo&apos;yicha holat
            </p>
            {courseStats.length === 0 ? (
              <p className="text-white/25 text-sm text-center py-4">Bu o&apos;quvchi hali kursga yozilmagan</p>
            ) : (
              <div className="space-y-4">
                {courseStats.map(cs => {
                  const progress = cs.enroll?.progress ?? 0
                  return (
                    <div key={cs.courseId}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{cs.course?.emoji ?? '📚'}</span>
                          <span className="text-white text-sm font-medium">{cs.course?.title}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-white/40">{cs.submitted}/{cs.taskCount} topshirdi</span>
                          {cs.avgScore !== null && (
                            <span className="text-emerald-400 font-semibold">⌀ {cs.avgScore}</span>
                          )}
                          <span className="text-white/50 font-semibold">{progress}%</span>
                        </div>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Topshiriqlar tarixi */}
          <div
            className="rounded-2xl p-5"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <p className="text-white/40 text-xs font-medium mb-4 flex items-center gap-1.5">
              <ClipboardCheck className="h-3.5 w-3.5" /> Topshiriqlar tarixi
            </p>
            {(submissions ?? []).length === 0 ? (
              <p className="text-white/25 text-sm text-center py-4">Hali topshiriq topshirilmagan</p>
            ) : (
              <div className="space-y-2">
                {(submissions ?? []).map(sub => {
                  const task = taskMap[sub.task_id]
                  const course = task ? courseMap[task.course_id] : null
                  const st = STATUS_MAP[sub.status] ?? STATUS_MAP.pending
                  const StatusIcon = st.icon
                  return (
                    <div
                      key={sub.id}
                      className="flex items-start gap-3 p-3 rounded-xl"
                      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-white text-xs font-medium truncate">{task?.title ?? '—'}</p>
                          {sub.score !== null && (
                            <span className="text-emerald-400 text-xs font-bold flex-shrink-0">
                              {sub.score}/{task?.max_score ?? 100}
                            </span>
                          )}
                        </div>
                        {course && (
                          <p className="text-white/30 text-xs">{course.emoji} {course.title}</p>
                        )}
                        {sub.feedback && (
                          <p className="text-white/40 text-xs mt-1 line-clamp-1 italic">&ldquo;{sub.feedback}&rdquo;</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span className={`flex items-center gap-1 text-xs ${st.color}`}>
                          <StatusIcon className="h-3 w-3" />
                          {st.label}
                        </span>
                        <span className="text-white/20 text-xs flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(sub.submitted_at).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
