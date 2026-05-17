'use client'

import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import TaskEditClient from './TaskEditClient'

export default async function EditTaskPage({ params }: { params: { id: string; taskId: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: course } = await supabase
    .from('courses')
    .select('id, title, emoji, teacher_id')
    .eq('id', params.id)
    .single()

  if (!course || course.teacher_id !== user.id) notFound()

  const { data: task } = await supabase
    .from('tasks')
    .select('*')
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
      initial={task}
    />
  )
}