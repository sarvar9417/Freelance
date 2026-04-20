import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ForumClient from './ForumClient'

export default async function AdminForumPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/admin')

  const { data: posts, error } = await supabase
    .from('forum_posts')
    .select('id, title, content, category, author_name, author_avatar, likes, dislikes, comment_count, created_at')
    .order('created_at', { ascending: false })

  return <ForumClient posts={posts ?? []} error={error?.message} />
}
