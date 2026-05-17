'use client'

import { redirect } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useMountedTheme } from '@/hooks/useTheme'
import { MessageSquare } from 'lucide-react'

export default function ForumPage() {
  const { isDark } = useMountedTheme()
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { redirect('/login'); return }

      const { data: postsData } = await supabase
        .from('forum_posts')
        .select('id, title, content, created_at, user_id, category')
        .order('created_at', { ascending: false })
        .limit(20)

      const userIds = Array.from(new Set((postsData ?? []).map(p => p.user_id)))
      const { data: profiles } = userIds.length > 0
        ? await supabase.from('users').select('id, full_name').in('id', userIds)
        : { data: [] }
      const profileMap = Object.fromEntries((profiles ?? []).map(p => [p.id, p.full_name]))

      setPosts((postsData ?? []).map(p => ({
        ...p,
        author: profileMap[p.user_id] || 'Noma\'lum',
      })))
      setLoading(false)
    }
    loadData()
  }, [])

  if (loading) return <div className="max-w-3xl mx-auto animate-pulse"><div className="h-8 w-48 bg-white/10 rounded mb-2" /></div>

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Forum</h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>O'quvchilar bilan muhokama</p>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className={`rounded-2xl p-12 text-center ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
          <MessageSquare className={`h-12 w-12 mx-auto mb-4 ${isDark ? 'text-white/20' : 'text-gray-300'}`} />
          <p className={isDark ? 'text-white/40' : 'text-gray-500'}>Hali postlar yo'q</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map(post => (
            <div key={post.id} className={`rounded-xl p-4 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'}`}>
              <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{post.title}</h3>
              <p className={`text-sm mt-1 line-clamp-2 ${isDark ? 'text-white/60' : 'text-gray-500'}`}>{post.content}</p>
              <div className={`flex items-center gap-3 mt-3 text-xs ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
                <span>{post.author}</span>
                <span>•</span>
                <span>{new Date(post.created_at).toLocaleDateString('uz-UZ')}</span>
                {post.category && <><span>•</span><span className={isDark ? 'text-blue-400' : 'text-blue-600'}>{post.category}</span></>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}