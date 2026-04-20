import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import MotivationClient from './MotivationClient'

interface Quote {
  id: string
  text: string
  author: string
  is_active: boolean
  created_at: string
}

interface Story {
  id: string
  title: string
  content: string
  author_name: string
  approved: boolean
  created_at: string
}

export default async function AdminMotivationPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/admin')

  const [{ data: quotes }, { data: stories }] = await Promise.all([
    supabase
      .from('daily_quotes')
      .select('id, text, author, is_active, created_at')
      .order('created_at', { ascending: false })
      .limit(50),
    supabase
      .from('success_stories')
      .select('id, title, content, author_name, approved, created_at')
      .order('created_at', { ascending: false })
      .limit(50),
  ])

  return (
    <MotivationClient
      quotes={(quotes ?? []) as Quote[]}
      stories={(stories ?? []) as Story[]}
    />
  )
}
