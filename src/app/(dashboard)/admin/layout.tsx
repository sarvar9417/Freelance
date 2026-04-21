import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import AdminSidebar from '@/components/admin/AdminSidebar'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'Admin Panel | Freelancer School',
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('full_name, email, role')
    .eq('id', user.id)
    .single()

  const role = profile?.role ?? user.user_metadata?.role ?? 'student'
  if (role !== 'admin') redirect('/login')

  return (
    <div
      className="flex h-screen overflow-hidden text-white"
      style={{ background: 'linear-gradient(160deg, #080c17 0%, #0d1220 50%, #120826 100%)' }}
    >
      {/* Fon orblari */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-800/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-blue-800/4 rounded-full blur-3xl" />
      </div>

      {/* Admin Sidebar */}
      <AdminSidebar
        fullName={profile?.full_name ?? user.user_metadata?.full_name ?? 'Admin'}
        email={profile?.email ?? user.email ?? ''}
      />

      {/* Asosiy kontent */}
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
