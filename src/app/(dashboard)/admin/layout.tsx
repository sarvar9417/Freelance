import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import AdminLayoutClient from './AdminLayoutClient'

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
    <AdminLayoutClient
      fullName={profile?.full_name ?? user.user_metadata?.full_name ?? 'Admin'}
      email={profile?.email ?? user.email ?? ''}
    >
      {children}
    </AdminLayoutClient>
  )
}
