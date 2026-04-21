import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import TaskEditClient from './TaskEditClient'

export default async function EditTaskPage({
  params,
}: {
  params: { id: string; taskId: string }
}) {
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

  const { data: task } = await supabase
    .from('tasks')
    .select('id, title, description, deadline, max_score, allowed_formats, lesson_id, task_file_urls')
    .eq('id', params.taskId)
    .eq('course_id', params.id)
    .single()

  if (!task) notFound()

  const { data: lessons } = await supabase
    .from('lessons')
    .select('id, title, order_num')
    .eq('course_id', params.id)
    .order('order_num', { ascending: true })

  return (
    <TaskEditClient
      courseId={params.id}
      taskId={params.taskId}
      courseTitle={`${course.emoji} ${course.title}`}
      lessons={lessons ?? []}
      initial={{
        title: task.title ?? '',
        lesson_id: task.lesson_id ?? '',
        description: task.description ?? '',
        deadline: task.deadline ?? '',
        max_score: task.max_score ?? 100,
        allowed_formats: (task.allowed_formats as string[]) ?? [],
        task_file_urls: (task.task_file_urls as string[]) ?? [],
      }}
    />
  )
}
