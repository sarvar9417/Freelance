import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import TeacherLayoutClient from './TeacherLayoutClient'

export const metadata: Metadata = {
  title: "O'qituvchi paneli | Freelancer School",
}

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('full_name, role')
    .eq('id', user.id)
    .single()

  const role = profile?.role ?? user.user_metadata?.role ?? 'student'
  if (!['teacher', 'admin'].includes(role)) redirect('/student')

  const fullName = profile?.full_name ?? user.user_metadata?.full_name ?? "O'qituvchi"

  const { data: myCourses } = await supabase
    .from('courses')
    .select('id')
    .eq('teacher_id', user.id)

  const courseIds = (myCourses ?? []).map((c: { id: string }) => c.id)
  let pendingCount = 0

  const [
    unreadResult,
    ...submissionCountParts
  ] = await Promise.all([
    supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false),
    ...(courseIds.length > 0
      ? [
          supabase
            .from('tasks')
            .select('id')
            .in('course_id', courseIds),
        ]
      : [Promise.resolve({ data: [] })]),
  ])

  const taskRows = (submissionCountParts[0] as { data: { id: string }[] | null })?.data ?? []
  const taskIds = taskRows.map((t: { id: string }) => t.id)

  if (taskIds.length > 0) {
    const { count } = await supabase
      .from('submissions')
      .select('*', { count: 'exact', head: true })
      .in('task_id', taskIds)
      .eq('status', 'pending')
    pendingCount = count ?? 0
  }

  return (
    <TeacherLayoutClient
      userId={user.id}
      fullName={fullName}
      pendingCount={pendingCount}
      unreadNotifications={(unreadResult as { count: number | null }).count ?? 0}
    >
      {children}
    </TeacherLayoutClient>
  )
}
