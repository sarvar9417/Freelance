'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Plus, MessageSquare, TrendingUp,
  Loader2, Wifi, Users, FileText, X,
  Calendar, MapPin, GraduationCap,
  ChevronDown, ChevronUp, ExternalLink,
} from 'lucide-react'
import { useMountedTheme } from '@/hooks/useTheme'
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
  const { isDark } = useMountedTheme()
  const [posts, setPosts]           = useState<ForumPost[]>([])
  const [topPosts, setTopPosts]     = useState<ForumPost[]>([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [category, setCategory]     = useState('Barchasi')
  const [userId, setUserId]         = useState<string | null>(null)
  const [userLikes, setUserLikes]   = useState<Record<string, 'like' | 'dislike'>>({})
  const [newPostCount, setNewPostCount] = useState(0)
  const [masterClasses, setMasterClasses] = useState<any[]>([])
  const [teamPosts, setTeamPosts] = useState<any[]>([])
  const [masterOpen, setMasterOpen] = useState(false)
  const [teamOpen, setTeamOpen] = useState(false)
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

  /* ── Master-klass e'lonlarini yuklash ── */
  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('master_classes')
      .select('*')
      .gte('datetime', new Date().toISOString())
      .order('datetime', { ascending: true })
      .limit(5)
      .then(({ data }) => {
        if (data) setMasterClasses(data)
      })
  }, [])

  /* ── Hamkor qidirish e'lonlarini yuklash ── */
  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('team_findings')
      .select('*, users!inner(full_name, avatar_url)')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(6)
      .then(({ data }) => {
        if (data) setTeamPosts(data)
      })
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

      {/* ── Master-klass e'lonlari ── */}
      <div
        className="rounded-2xl overflow-hidden"
        style={isDark ? { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' } : { background: 'white', border: '1px solid #e5e7eb' }}
      >
        <button
          onClick={() => setMasterOpen(v => !v)}
          className={`w-full flex items-center justify-between px-4 py-3.5 transition-colors ${
            isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center shadow-lg shadow-blue-900/30">
              <GraduationCap className="h-4 w-4 text-white" />
            </div>
            <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Master-klass e'lonlari
            </span>
            {masterClasses.length > 0 && (
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                isDark ? 'bg-blue-500/15 text-blue-300' : 'bg-blue-100 text-blue-600'
              }`}>
                {masterClasses.length} ta
              </span>
            )}
          </div>
          {masterOpen ? (
            <ChevronUp className={`h-4 w-4 ${isDark ? 'text-white/40' : 'text-gray-400'}`} />
          ) : (
            <ChevronDown className={`h-4 w-4 ${isDark ? 'text-white/40' : 'text-gray-400'}`} />
          )}
        </button>

        <AnimatePresence initial={false}>
          {masterOpen && (
            <motion.div
              key="master-content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4">
                {masterClasses.length === 0 ? (
                  <p className={`text-xs text-center py-6 ${isDark ? 'text-white/20' : 'text-gray-400'}`}>
                    Hozircha master-klass e'lonlari mavjud emas
                  </p>
                ) : (
                  <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
                    {masterClasses.map(mc => (
                      <div
                        key={mc.id}
                        className="flex-shrink-0 w-72 rounded-xl p-4 space-y-3"
                        style={{
                          background: isDark
                            ? 'linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(147,51,234,0.08) 100%)'
                            : 'linear-gradient(135deg, #eff6ff 0%, #faf5ff 100%)',
                          border: isDark
                            ? '1px solid rgba(59,130,246,0.2)'
                            : '1px solid #bfdbfe',
                        }}
                      >
                        <div className="space-y-1">
                          <h4 className={`text-sm font-semibold leading-snug line-clamp-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {mc.title}
                          </h4>
                          <p className={`text-xs ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                            {mc.speaker_name}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 text-xs">
                          <span className={`flex items-center gap-1 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                            <Calendar className="h-3 w-3" />
                            {new Date(mc.datetime).toLocaleDateString('uz-UZ', {
                              day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                            })}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1 ${
                            mc.is_online
                              ? isDark ? 'text-emerald-300 bg-emerald-500/10' : 'text-emerald-700 bg-emerald-100'
                              : isDark ? 'text-amber-300 bg-amber-500/10' : 'text-amber-700 bg-amber-100'
                          }`}>
                            <MapPin className="h-2.5 w-2.5" />
                            {mc.is_online ? 'Online' : 'Offline'}
                          </span>
                        </div>

                        <a
                          href={mc.link || '#'}
                          target={mc.link ? '_blank' : undefined}
                          rel={mc.link ? 'noopener noreferrer' : undefined}
                          onClick={e => { if (!mc.link) e.preventDefault() }}
                          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-lg transition-all ${
                            mc.link
                              ? isDark
                                ? 'text-blue-300 bg-blue-500/15 hover:bg-blue-500/25'
                                : 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                              : isDark
                                ? 'text-white bg-white/8 hover:bg-white/12'
                                : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          {mc.link ? (
                            <><ExternalLink className="h-3 w-3" /> Qatnashish</>
                          ) : (
                            <>Ro'yxatdan o'tish</>
                          )}
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Hamkor qidirish ── */}
      <div
        className="rounded-2xl overflow-hidden"
        style={isDark ? { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' } : { background: 'white', border: '1px solid #e5e7eb' }}
      >
        <button
          onClick={() => setTeamOpen(v => !v)}
          className={`w-full flex items-center justify-between px-4 py-3.5 transition-colors ${
            isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-900/30">
              <Users className="h-4 w-4 text-white" />
            </div>
            <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Hamkor qidirish
            </span>
            {teamPosts.length > 0 && (
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                isDark ? 'bg-emerald-500/15 text-emerald-300' : 'bg-emerald-100 text-emerald-600'
              }`}>
                {teamPosts.length} ta
              </span>
            )}
          </div>
          {teamOpen ? (
            <ChevronUp className={`h-4 w-4 ${isDark ? 'text-white/40' : 'text-gray-400'}`} />
          ) : (
            <ChevronDown className={`h-4 w-4 ${isDark ? 'text-white/40' : 'text-gray-400'}`} />
          )}
        </button>

        <AnimatePresence initial={false}>
          {teamOpen && (
            <motion.div
              key="team-content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4">
                {teamPosts.length === 0 ? (
                  <p className={`text-xs text-center py-6 ${isDark ? 'text-white/20' : 'text-gray-400'}`}>
                    Hozircha hamkorlik e'lonlari mavjud emas
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {teamPosts.map(tp => (
                      <div
                        key={tp.id}
                        className="rounded-xl p-4 space-y-2.5"
                        style={{
                          background: isDark
                            ? 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(20,184,166,0.05) 100%)'
                            : 'linear-gradient(135deg, #ecfdf5 0%, #f0fdfa 100%)',
                          border: isDark
                            ? '1px solid rgba(16,185,129,0.15)'
                            : '1px solid #a7f3d0',
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="h-6 w-6 rounded-full bg-cover bg-center flex-shrink-0"
                            style={{
                              backgroundImage: tp.users?.avatar_url
                                ? `url(${tp.users.avatar_url})`
                                : undefined,
                              background: !tp.users?.avatar_url
                                ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                                : undefined,
                            }}
                          />
                          <span className={`text-xs font-medium ${isDark ? 'text-white/60' : 'text-gray-500'}`}>
                            {tp.users?.full_name || 'Noma\'lum'}
                          </span>
                        </div>

                        <h4 className={`text-sm font-semibold leading-snug line-clamp-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {tp.title}
                        </h4>

                        <p className={`text-xs leading-relaxed line-clamp-2 ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                          {tp.description}
                        </p>

                        {tp.skills && tp.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {tp.skills.slice(0, 4).map((skill: string, i: number) => (
                              <span
                                key={i}
                                className={`text-[10px] px-2 py-0.5 rounded-full ${
                                  isDark
                                    ? 'bg-white/8 text-white/50'
                                    : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {skill}
                              </span>
                            ))}
                            {tp.skills.length > 4 && (
                              <span className={`text-[10px] ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                                +{tp.skills.length - 4}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-1">
                          <span className={`text-[10px] ${isDark ? 'text-white/20' : 'text-gray-400'}`}>
                            {tp.contact?.slice(0, 3)}...
                          </span>
                          <button
                            className={`text-[10px] font-semibold px-3 py-1 rounded-lg transition-all ${
                              isDark
                                ? 'text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20'
                                : 'text-emerald-700 bg-emerald-100 hover:bg-emerald-200'
                            }`}
                          >
                            Murojaat qilish
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

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
