'use client'

import { redirect } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useMountedTheme } from '@/hooks/useTheme'
import { MessageSquare, Search } from 'lucide-react'

export default function AdminForumPage() {
  const { isDark } = useMountedTheme()
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { redirect('/login'); return }

      const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
      if (profile?.role !== 'admin') { redirect('/login'); return }

      const { data: postsData } = await supabase.from('forum_posts').select('id, title, content, category, created_at, user_id').order('created_at', { ascending: false }).limit(50)

      const userIds = Array.from(new Set((postsData ?? []).map(p => p.user_id)))
      const { data: users } = userIds.length > 0
        ? await supabase.from('users').select('id, full_name').in('id', userIds)
        : { data: [] }
      const userMap = Object.fromEntries((users ?? []).map(u => [u.id, u.full_name]))

      setPosts((postsData ?? []).map(p => ({ ...p, authorName: userMap[p.user_id] || 'Noma\'lum' })))
      setLoading(false)
    }
    loadData()
  }, [])

  const filteredPosts = posts.filter(p => !search || p.title.toLowerCase().includes(search.toLowerCase()))

  if (loading) return <div className="max-w-5xl mx-auto animate-pulse"><div className="h-8 w-48 bg-white/10 rounded mb-4" /></div>

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Forum</h1>
        <p className={`text-sm mt-1 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>{posts.length} ta post</p>
      </div>

      <div className="relative">
        <Search className={`absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 ${isDark ? 'text-white/30' : 'text-gray-400'}`} />
        <input
          type="text"
          placeholder="Post qidirish..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className={`w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none ${
            isDark ? 'text-white placeholder-white/25 bg-white/5 border border-white/10' : 'text-gray-900 placeholder-gray-400 bg-white border border-gray-200'
          }`}
        />
      </div>

      <div className="space-y-3">
        {filteredPosts.map(post => (
          <div key={post.id} className={`p-4 rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'}`}>
            <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{post.title}</h3>
            <p className={`text-sm mt-1 line-clamp-2 ${isDark ? 'text-white/60' : 'text-gray-500'}`}>{post.content}</p>
            <div className={`flex items-center gap-3 mt-2 text-xs ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
              <span>{post.authorName}</span>
              <span>•</span>
              <span>{new Date(post.created_at).toLocaleDateString('uz-UZ')}</span>
              {post.category && <><span>•</span><span>{post.category}</span></>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}