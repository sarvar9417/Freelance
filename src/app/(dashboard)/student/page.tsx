import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardInner from './DashboardInner'

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

  const pendingTasks = pendingTaskList.map(t => ({
    id: t.id,
    title: t.title,
    deadline: t.deadline,
    course_id: t.course_id,
    course: courseMap[t.course_id] ? { title: courseMap[t.course_id].title, emoji: courseMap[t.course_id].emoji } : undefined,
  }))

  const ongoingEnrollmentsData = ongoingEnrollments.map(e => ({
    course_id: e.course_id,
    progress: e.progress ?? 0,
    course: courseMap[e.course_id] ? { id: courseMap[e.course_id].id, title: courseMap[e.course_id].title, emoji: courseMap[e.course_id].emoji, category: courseMap[e.course_id].category } : undefined,
  }))

  return (
    <DashboardInner
      fullName={profile?.full_name ?? "O'quvchi"}
      totalXp={totalXp}
      currentLevel={currentLevel}
      streak={streakRow?.current_streak ?? 0}
      activeCourses={activeCourses}
      completedCourses={completedCourses}
      submittedCount={submittedCount}
      avgScore={avgScore}
      pendingTasks={pendingTasks}
      ongoingEnrollments={ongoingEnrollmentsData}
      xpInLevel={xpInLevel}
      xpPct={xpPct}
    />
  )
}
