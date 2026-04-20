import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import TaskFormClient from './TaskFormClient'

export default async function NewTaskPage({ params }: { params: { id: string } }) {
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

  const { data: lessons } = await supabase
    .from('lessons')
    .select('id, title, order_num')
    .eq('course_id', params.id)
    .order('order_num', { ascending: true })

  return (
    <TaskFormClient
      courseId={params.id}
      courseTitle={`${course.emoji} ${course.title}`}
      lessons={lessons ?? []}
    />
  )
}
