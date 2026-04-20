import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SettingsClient from './SettingsClient'

export default async function TeacherSettingsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('full_name, email, bio, age, avatar_url, role')
    .eq('id', user.id)
    .single()

  if (!['teacher', 'admin'].includes(profile?.role ?? '')) redirect('/student')

  return (
    <SettingsClient
      initial={{
        full_name: profile?.full_name ?? '',
        email: profile?.email ?? user.email ?? '',
        bio: profile?.bio ?? '',
        age: profile?.age ?? null,
        avatar_url: profile?.avatar_url ?? null,
      }}
    />
  )
}
