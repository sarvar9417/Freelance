import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import TasksClient from './TasksClient'
import { ArrowLeft, Plus } from 'lucide-react'

export default async function TasksPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: course } = await supabase
    .from('courses')
    .select('id, title, emoji')
    .eq('id', params.id)
    .eq('teacher_id', user.id)
    .single()

  if (!course) notFound()

  const { data: tasks } = await supabase
    .from('tasks')
    .select('id, title, description, deadline, max_score, allowed_formats, created_at, lesson_id')
    .eq('course_id', params.id)
    .order('created_at', { ascending: true })

  const taskIds = (tasks ?? []).map(t => t.id)
  const { data: subRows } = taskIds.length > 0
    ? await supabase
        .from('submissions')
        .select('task_id, status')
        .in('task_id', taskIds)
    : { data: [] }

  const submissionMap = Object.fromEntries(
    taskIds.map(id => [
      id,
      {
        total:   (subRows ?? []).filter(s => s.task_id === id).length,
        pending: (subRows ?? []).filter(s => s.task_id === id && s.status === 'pending').length,
      },
    ])
  )

  const enriched = (tasks ?? []).map(t => ({ ...t, ...(submissionMap[t.id] ?? { total: 0, pending: 0 }) }))

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/teacher/courses" className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <p className="text-white/40 text-xs">{course.emoji} {course.title}</p>
            <h1 className="text-xl font-bold text-white">Topshiriqlar boshqaruvi</h1>
          </div>
        </div>
        <Link href={`/teacher/courses/${params.id}/tasks/new`}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white shadow-lg"
          style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.8), rgba(217,119,6,0.8))' }}>
          <Plus className="h-4 w-4" /> Yangi topshiriq
        </Link>
      </div>

      <TasksClient courseId={params.id} tasks={enriched} />
    </div>
  )
}
