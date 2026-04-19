import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import TeacherSidebar from '@/components/teacher/TeacherSidebar'

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
  if (!['teacher', 'admin'].includes(role)) {
    redirect('/student')
  }

  const fullName = profile?.full_name ?? user.user_metadata?.full_name ?? "O'qituvchi"

  return (
    <div
      className="flex h-screen overflow-hidden text-white"
      style={{ background: 'linear-gradient(160deg, #060c10 0%, #0a1018 50%, #071020 100%)' }}
    >
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-emerald-900/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-900/6 rounded-full blur-3xl" />
      </div>

      <TeacherSidebar fullName={fullName} />

      <main className="relative z-10 flex-1 overflow-y-auto lg:ml-0">
        <div className="min-h-full p-4 sm:p-6 lg:p-8 pt-16 lg:pt-6">
          {children}
        </div>
      </main>
    </div>
  )
}
