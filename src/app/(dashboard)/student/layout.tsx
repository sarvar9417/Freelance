import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/student/Sidebar'
import { Toaster } from 'sonner'

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
    <div
      className="flex h-screen overflow-hidden text-white"
      style={{ background: 'linear-gradient(160deg, #080c17 0%, #0d1220 50%, #120826 100%)' }}
    >
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-800/6 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-purple-800/5 rounded-full blur-3xl" />
      </div>

      <Sidebar
        userId={user.id}
        fullName={profile?.full_name ?? user.user_metadata?.full_name ?? "O'quvchi"}
        xp={xpRow?.total_xp ?? 0}
        level={xpRow?.current_level ?? 1}
        streak={streakRow?.current_streak ?? 0}
        pendingTasks={pendingTasks}
        unreadNotifications={unreadCount ?? 0}
      />

      <main className="relative z-10 flex-1 overflow-y-auto lg:ml-0">
        <div className="min-h-full p-4 sm:p-6 lg:p-8 pt-16 lg:pt-6">
          {children}
        </div>
      </main>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(10,14,28,0.96)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#fff',
            backdropFilter: 'blur(20px)',
          },
        }}
      />
    </div>
  )
}
