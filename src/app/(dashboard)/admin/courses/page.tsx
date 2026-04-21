import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
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

  // Service role key mavjud bo'lsa, RLS bypass qilib barcha kurslarni olamiz
  // Aks holda, oddiy client bilan (RLS politikasi ruxsat berganda)
  let courses = null
  let errorMsg: string | undefined

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (serviceKey) {
    const adminClient = createAdminClient()
    const { data, error } = await adminClient
      .from('courses')
      .select('id, title, description, category, emoji, status, created_at, teacher_id')
      .order('created_at', { ascending: false })
    courses = data
    if (error) errorMsg = error.message
  } else {
    const { data, error } = await supabase
      .from('courses')
      .select('id, title, description, category, emoji, status, created_at, teacher_id')
      .order('created_at', { ascending: false })
    courses = data
    if (error) errorMsg = error.message
  }

  return (
    <CoursesClient
      courses={courses ?? []}
      error={errorMsg}
    />
  )
}
