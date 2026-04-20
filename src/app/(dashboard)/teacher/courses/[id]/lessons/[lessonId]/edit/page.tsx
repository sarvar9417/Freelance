import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LessonEditClient from './LessonEditClient'

export default async function EditLessonPage({
  params,
}: {
  params: { id: string; lessonId: string }
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

  const { data: lesson } = await supabase
    .from('lessons')
    .select('id, title, order_num, video_url, content')
    .eq('id', params.lessonId)
    .eq('course_id', params.id)
    .single()

  if (!lesson) notFound()

  return (
    <LessonEditClient
      courseId={params.id}
      lessonId={params.lessonId}
      courseTitle={`${course.emoji} ${course.title}`}
      initial={{
        title: lesson.title ?? '',
        order_num: lesson.order_num ?? 1,
        video_url: lesson.video_url ?? '',
        content: lesson.content ?? '',
      }}
    />
  )
}
