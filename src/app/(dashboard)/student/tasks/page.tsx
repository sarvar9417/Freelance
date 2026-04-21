import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import TasksClient from './TasksClient'

export default async function TasksPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('course_id')
    .eq('student_id', user.id)

  const courseIds = (enrollments ?? []).map(e => e.course_id)

  if (courseIds.length === 0) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Topshiriqlarim</h1>
          <p className="text-white/40 text-sm mt-1">Barcha topshiriqlaringiz</p>
        </div>
        <div className="rounded-2xl p-12 text-center"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="text-5xl mb-4">📝</p>
          <p className="text-white/40 text-sm">Hali kursga yozilmagansiz</p>
        </div>
      </div>
    )
  }

  const [{ data: tasks }, { data: courses }] = await Promise.all([
    supabase
      .from('tasks')
      .select('id, title, description, deadline, max_score, allowed_formats, task_file_urls, course_id, lesson_id')
      .in('course_id', courseIds),
    supabase
      .from('courses')
      .select('id, title, emoji')
      .in('id', courseIds),
  ])

  const taskIds = (tasks ?? []).map(t => t.id)
  const { data: submissions } = taskIds.length > 0
    ? await supabase
        .from('submissions')
        .select('id, task_id, status, score, feedback, submitted_at, file_urls')
        .eq('student_id', user.id)
        .in('task_id', taskIds)
    : { data: [] }

  const submissionMap = Object.fromEntries((submissions ?? []).map(s => [s.task_id, s]))
  const courseMap = Object.fromEntries((courses ?? []).map(c => [c.id, c]))

  const enriched = (tasks ?? []).map(t => ({
    ...t,
    course: courseMap[t.course_id] ?? null,
    submission: submissionMap[t.id] ?? null,
  }))

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Topshiriqlarim</h1>
        <p className="text-white/40 text-sm mt-1">Barcha topshiriqlaringiz</p>
      </div>
      <TasksClient tasks={enriched} userId={user.id} />
    </div>
  )
}
