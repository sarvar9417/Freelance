'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from 'next-themes'
import {
  Search, Plus, MessageSquare, TrendingUp,
  Loader2, Wifi, Users, FileText, X,
} from 'lucide-react'
import {
  fetchPosts, fetchTopPosts, subscribeToPosts,
  getUserPostLikes, formatTimeAgo, type ForumPost,
} from '@/lib/supabase/realtime'
import PostCard from '@/components/forum/PostCard'
import { createClient } from '@/lib/supabase/client'

const CATEGORIES = ['Barchasi', 'Savol', 'Muhokama', 'Yangilik', 'Tavsiya', 'Yordam']

const CATEGORY_COLORS: Record<string, string> = {
  Savol:    'text-blue-400',
  Muhokama: 'text-purple-400',
  Yangilik: 'text-emerald-400',
  Tavsiya:  'text-amber-400',
  Yordam:   'text-rose-400',
}

export default function ForumPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark' || theme === undefined || theme === null
  const [posts, setPosts]           = useState<ForumPost[]>([])
  const [topPosts, setTopPosts]     = useState<ForumPost[]>([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [category, setCategory]     = useState('Barchasi')
  const [userId, setUserId]         = useState<string | null>(null)
  const [userLikes, setUserLikes]   = useState<Record<string, 'like' | 'dislike'>>({})
  const [newPostCount, setNewPostCount] = useState(0)
  const searchTimer = useRef<ReturnType<typeof setTimeout>>()

  /* ── Foydalanuvchini aniqlash ── */
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null))
  }, [])

  /* ── Postlarni yuklash ── */
  useEffect(() => {
    setLoading(true)
    setNewPostCount(0)
    fetchPosts({ search, category, limit: 30 })
      .then(async (data) => {
        setPosts(data)
        if (userId && data.length > 0) {
          const likes = await getUserPostLikes(userId, data.map(p => p.id))
          setUserLikes(likes)
        }
      })
      .finally(() => setLoading(false))
  }, [search, category, userId])

  /* ── Eng ko'p muhokama qilinganlar ── */
  useEffect(() => {
    fetchTopPosts(5).then(setTopPosts).catch(() => {})
  }, [])

  /* ── Real-time yangilash ── */
  useEffect(() => {
    const unsubscribe = subscribeToPosts(
      (newPost) => {
        setPosts(prev => {
          if (prev.some(p => p.id === newPost.id)) return prev
          setNewPostCount(n => n + 1)
          return [newPost, ...prev]
        })
        setTopPosts(prev => {
          const updated = [...prev, newPost].sort((a, b) => b.comment_count - a.comment_count).slice(0, 5)
          return updated
        })
      },
      (updatedPost) => {
        setPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p))
        setTopPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p))
      }
    )
    return unsubscribe
  }, [])

  /* ── Qidiruv (debounce 400ms) ── */
  const handleSearchInput = (val: string) => {
    setSearchInput(val)
    clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => setSearch(val), 400)
  }

  const clearSearch = () => { setSearchInput(''); setSearch('') }

  const handleLikeChange = (postId: string, likes: number, dislikes: number) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes, dislikes } : p))
  }

  const totalComments = posts.reduce((sum, p) => sum + p.comment_count, 0)

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 ${isDark ? '' : 'bg-gray-50/50 min-h-screen'}`}>

      {/* ── Sarlavha ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Forum
          </h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
            Freelancerlik haqida savol bering, tajriba ulashing
          </p>
        </div>
        {userId ? (
          <Link href="/forum/post/new">
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors flex-shrink-0 ${
                isDark
                  ? 'text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-900/30'
                  : 'text-white bg-blue-600 hover:bg-blue-700 shadow-md'
              }`}
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Post yaratish</span>
              <span className="sm:hidden">Yangi</span>
            </motion.button>
          </Link>
        ) : (
          <Link href="/login">
            <button className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex-shrink-0 ${
              isDark
                ? 'text-white/70 border border-white/10 hover:border-white/20 hover:text-white'
                : 'text-gray-600 border border-gray-200 hover:border-gray-300 hover:text-gray-900'
            }`}>
              Kirish
            </button>
          </Link>
        )}
      </div>

      {/* ── Qidiruv + Kategoriyalar ── */}
      <div className="space-y-3">
        <div className="relative">
          <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none ${
            isDark ? 'text-white/30' : 'text-gray-400'
          }`} />
          <input
            type="text"
            value={searchInput}
            onChange={e => handleSearchInput(e.target.value)}
            placeholder="Postlarni qidirish..."
            className={`w-full pl-10 pr-10 py-2.5 rounded-xl text-sm outline-none focus:ring-1 focus:ring-blue-500/50 transition-all ${
              isDark
                ? 'text-white placeholder:text-white/25 bg-white/5 border border-white/8'
                : 'text-gray-900 placeholder:text-gray-400 bg-white border border-gray-200'
            }`}
          />
          <AnimatePresence>
            {searchInput && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                onClick={clearSearch}
                className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${
                  isDark ? 'text-white/30 hover:text-white/60' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <X className="h-3.5 w-3.5" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Kategoriya filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`flex-shrink-0 text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all duration-200 ${
                category === cat
                  ? isDark
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30'
                    : 'bg-blue-600 text-white shadow-md'
                  : isDark
                    ? `border text-white/50 hover:text-white/80 hover:bg-white/6 ${CATEGORY_COLORS[cat] ?? ''}`
                    : `border text-gray-500 hover:text-gray-900 hover:bg-gray-100 ${CATEGORY_COLORS[cat]?.replace('400', '600') ?? ''}`
              }`}
              style={category !== cat ? (isDark ? { background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' } : { background: 'transparent', borderColor: '#e5e7eb' }) : {}}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Yangi post bildirishnomasi ── */}
      <AnimatePresence>
        {newPostCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium ${
              isDark ? 'text-emerald-300' : 'text-emerald-600'
            }`}
            style={isDark ? { background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' } : { background: '#ecfdf5', border: '1px solid #a7f3d0' }}
          >
            <Wifi className="h-3.5 w-3.5 animate-pulse" />
            {newPostCount} ta yangi post real-time qo&apos;shildi
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Asosiy kontent ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Postlar ro'yxati */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className={`h-6 w-6 animate-spin ${isDark ? 'text-white/30' : 'text-gray-400'}`} />
            </div>
          ) : posts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center py-20 rounded-2xl"
              style={isDark ? { background: 'rgba(255,255,255,0.02)', border: '2px dashed rgba(255,255,255,0.07)' } : { background: '#f9fafb', border: '2px dashed #e5e7eb' }}
            >
              <MessageSquare className={`h-10 w-10 mx-auto mb-3 ${isDark ? 'text-white/12' : 'text-gray-300'}`} />
              <p className={`text-sm ${isDark ? 'text-white/40' : 'text-gray-500'}`}>Post topilmadi</p>
              <p className={`text-xs mt-1 ${isDark ? 'text-white/20' : 'text-gray-400'}`}>
                {search ? 'Boshqa kalit so\'z kiriting' : 'Kategoriya tanlang yoki post yarating'}
              </p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {posts.map((post, i) => (
                <PostCard
                  key={post.id}
                  post={post}
                  index={i}
                  currentUserId={userId}
                  userLike={userLikes[post.id] ?? null}
                  onLikeChange={handleLikeChange}
                  isDark={isDark}
                />
              ))}
            </div>
          )}
        </div>

        {/* Yon panel */}
        <div className="space-y-4">

          {/* Statistika */}
          <div
            className="rounded-2xl p-4 space-y-3"
            style={isDark ? { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' } : { background: 'white', border: '1px solid #e5e7eb' }}
          >
            <h3 className={`text-[11px] font-semibold uppercase tracking-widest ${
              isDark ? 'text-white/50' : 'text-gray-500'
            }`}>
              Statistika
            </h3>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className={`flex items-center gap-2 text-sm ${
                  isDark ? 'text-white/40' : 'text-gray-500'
                }`}>
                  <FileText className="h-3.5 w-3.5" /> Jami postlar
                </span>
                <span className={`font-bold text-sm tabular-nums ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {posts.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`flex items-center gap-2 text-sm ${
                  isDark ? 'text-white/40' : 'text-gray-500'
                }`}>
                  <MessageSquare className="h-3.5 w-3.5" /> Jami izohlar
                </span>
                <span className={`font-bold text-sm tabular-nums ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {totalComments}
                </span>
              </div>
            </div>
          </div>

          {/* Eng ko'p muhokama */}
          <div
            className="rounded-2xl p-4"
            style={isDark ? { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' } : { background: 'white', border: '1px solid #e5e7eb' }}
          >
            <h3 className={`text-[11px] font-semibold uppercase tracking-widest mb-3 flex items-center gap-2 ${
              isDark ? 'text-white/50' : 'text-gray-500'
            }`}>
              <TrendingUp className={`h-3.5 w-3.5 ${isDark ? 'text-amber-400' : 'text-amber-500'}`} />
              Eng ko&apos;p muhokama
            </h3>
            {topPosts.length === 0 ? (
              <p className={`text-xs ${isDark ? 'text-white/20' : 'text-gray-400'}`}>Hali post yo&apos;q</p>
            ) : (
              <div className="space-y-1">
                {topPosts.map((post, i) => (
                  <Link
                    key={post.id}
                    href={`/forum/post/${post.id}`}
                    className={`flex items-start gap-2.5 p-2 rounded-xl transition-colors group ${
                      isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'
                    }`}
                  >
                    <span className={`text-[11px] font-bold mt-0.5 w-4 flex-shrink-0 ${
                      isDark ? 'text-white/20' : 'text-gray-400'
                    }`}>
                      {i + 1}.
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs leading-snug transition-colors line-clamp-2 ${
                        isDark ? 'text-white/60 group-hover:text-white/85' : 'text-gray-600 group-hover:text-gray-900'
                      }`}>
                        {post.title}
                      </p>
                      <span className={`text-[10px] mt-1 flex items-center gap-1 ${
                        isDark ? 'text-white/20' : 'text-gray-400'
                      }`}>
                        <MessageSquare className="h-2.5 w-2.5" />
                        {post.comment_count} izoh · {formatTimeAgo(post.created_at)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Kirish taklifi (autentifikatsiya yo'q) */}
          {!userId && (
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl p-5 text-center"
              style={isDark ? { background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.15)' } : { background: '#eff6ff', border: '1px solid #bfdbfe' }}
            >
              <Users className={`h-7 w-7 mx-auto mb-2 ${isDark ? 'text-blue-400/50' : 'text-blue-500'}`} />
              <p className={`text-xs mb-3 leading-relaxed ${
                isDark ? 'text-white/40' : 'text-gray-600'
              }`}>
                Post yaratish va izoh yozish uchun tizimga kiring
              </p>
              <Link href="/login">
                <button className={`text-xs font-semibold px-5 py-2 rounded-xl transition-all ${
                  isDark
                    ? 'text-blue-300 bg-blue-500/15 hover:bg-blue-500/25'
                    : 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                }`}>
                  Kirish
                </button>
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
