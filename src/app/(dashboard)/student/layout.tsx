import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import StudentLayoutClient from './StudentLayoutClient'

export const metadata: Metadata = {
  title: 'Dashboard | Freelancer School',
}

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('full_name, role')
    .eq('id', user.id)
    .single()

  const role = profile?.role ?? user.user_metadata?.role ?? 'student'
  if (role !== 'student') {
    await supabase.auth.signOut()
    redirect('/login')
  }

  const [{ data: xpRow }, { data: streakRow }, enrollResult, { count: unreadCount }] = await Promise.all([
    supabase.from('user_xp').select('total_xp, current_level').eq('user_id', user.id).single(),
    supabase.from('user_streaks').select('current_streak').eq('user_id', user.id).single(),
    supabase.from('enrollments').select('course_id').eq('student_id', user.id),
    supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false),
  ])

  let pendingTasks = 0
  const courseIds = (enrollResult.data ?? []).map((e: { course_id: string }) => e.course_id)
  if (courseIds.length > 0) {
    const { data: tasks } = await supabase.from('tasks').select('id').in('course_id', courseIds)
    const taskIds = (tasks ?? []).map((t: { id: string }) => t.id)
    if (taskIds.length > 0) {
      const { data: subs } = await supabase
        .from('submissions')
        .select('task_id')
        .eq('student_id', user.id)
        .in('task_id', taskIds)
      const submittedIds = new Set((subs ?? []).map((s: { task_id: string }) => s.task_id))
      pendingTasks = taskIds.filter(id => !submittedIds.has(id)).length
    }
  }

return (
    <StudentLayoutClient
      userId={user.id}
      fullName={profile?.full_name ?? user.user_metadata?.full_name ?? "O'quvchi"}
      xp={xpRow?.total_xp ?? 0}
      level={xpRow?.current_level ?? 1}
      streak={streakRow?.current_streak ?? 0}
      pendingTasks={pendingTasks}
      unreadNotifications={unreadCount ?? 0}
    >
      {children}
    </StudentLayoutClient>
  )
}
