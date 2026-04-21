import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import StudentForumClient from './ForumClient'

export const metadata = { title: 'Forum | Student Dashboard' }

export default async function StudentForumPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const userName =
    profile?.full_name ??
    user.user_metadata?.full_name ??
    user.email?.split('@')[0] ??
    'Foydalanuvchi'

  return <StudentForumClient userId={user.id} userName={userName} />
}
