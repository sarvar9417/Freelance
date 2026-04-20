import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CourseFormClient from '../../CourseFormClient'

export default async function EditCoursePage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (!['teacher', 'admin'].includes(profile?.role ?? '')) redirect('/student')

  const { data: course } = await supabase
    .from('courses')
    .select('id, title, description, full_description, category, level, emoji, image_url, preview_video_url, is_published')
    .eq('id', params.id)
    .eq('teacher_id', user.id)
    .single()

  if (!course) notFound()

  return (
    <CourseFormClient
      mode="edit"
      courseId={params.id}
      initial={{
        title: course.title ?? '',
        description: course.description ?? '',
        full_description: course.full_description ?? '',
        category: course.category ?? '',
        level: course.level ?? "Boshlang'ich",
        emoji: course.emoji ?? '📚',
        image_url: course.image_url ?? '',
        preview_video_url: course.preview_video_url ?? '',
        is_published: course.is_published ?? false,
      }}
    />
  )
}
