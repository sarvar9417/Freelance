import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SubmissionReviewClient from './SubmissionReviewClient'

export default async function SubmissionReviewPage({ params }: { params: { submissionId: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (!['teacher', 'admin'].includes(profile?.role ?? '')) redirect('/student')

  const { data: sub } = await supabase
    .from('submissions')
    .select(`
      id, student_id, task_id, submitted_at, status, score, feedback, file_urls,
      users!student_id(full_name, email, avatar_url),
      tasks(id, title, description, max_score, allowed_formats, deadline,
        courses(id, title, emoji, teacher_id)
      )
    `)
    .eq('id', params.submissionId)
    .single()

  if (!sub) notFound()

  const task = sub.tasks as any
  const course = task?.courses as any

  if (course?.teacher_id !== user.id && profile?.role !== 'admin') redirect('/teacher/tasks/review')

  const student = sub.users as any

  return (
    <SubmissionReviewClient
      submission={{
        id: sub.id,
        student_id: sub.student_id,
        task_id: sub.task_id,
        submitted_at: sub.submitted_at,
        status: sub.status,
        score: sub.score,
        feedback: sub.feedback ?? '',
        file_urls: (sub.file_urls as string[]) ?? [],
        student_name: student?.full_name ?? "O'quvchi",
        student_email: student?.email ?? '',
        student_avatar: student?.avatar_url ?? null,
        task_title: task?.title ?? '—',
        task_description: task?.description ?? '',
        max_score: task?.max_score ?? 100,
        allowed_formats: task?.allowed_formats ?? [],
        deadline: task?.deadline ?? null,
        course_title: course?.title ?? '—',
        course_emoji: course?.emoji ?? '📚',
        course_id: course?.id ?? '',
      }}
    />
  )
}
