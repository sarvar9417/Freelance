import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CoursesClient from './CoursesClient'

export default async function AdminCoursesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/admin')

  const { data: courses, error } = await supabase
    .from('courses')
    .select('id, title, description, category, emoji, status, created_at, teacher_id')
    .order('created_at', { ascending: false })

  return (
    <CoursesClient
      courses={courses ?? []}
      error={error?.message}
    />
  )
}
