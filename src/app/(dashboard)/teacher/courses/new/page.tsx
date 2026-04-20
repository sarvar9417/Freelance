import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CourseFormClient from '../CourseFormClient'

export default async function NewCoursePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (!['teacher', 'admin'].includes(profile?.role ?? '')) redirect('/student')

  return <CourseFormClient mode="create" />
}
