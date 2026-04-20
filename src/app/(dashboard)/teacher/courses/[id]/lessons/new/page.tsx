import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LessonFormClient from './LessonFormClient'

export default async function NewLessonPage({ params }: { params: { id: string } }) {
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

  const { count } = await supabase
    .from('lessons')
    .select('*', { count: 'exact', head: true })
    .eq('course_id', params.id)

  return (
    <LessonFormClient
      courseId={params.id}
      courseTitle={`${course.emoji} ${course.title}`}
      nextOrder={(count ?? 0) + 1}
    />
  )
}
