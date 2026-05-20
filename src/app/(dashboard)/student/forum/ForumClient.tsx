'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Plus, MessageSquare, TrendingUp,
  Loader2, Wifi, X, FileText,
  Calendar, MapPin, GraduationCap, Users,
  ChevronDown, ChevronUp, ExternalLink,
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

interface Props {
  userId: string
  userName: string
}

export default function StudentForumClient({ userId, userName }: Props) {
  const [posts, setPosts]               = useState<ForumPost[]>([])
  const [topPosts, setTopPosts]         = useState<ForumPost[]>([])
  const [loading, setLoading]           = useState(true)
  const [search, setSearch]             = useState('')
  const [searchInput, setSearchInput]   = useState('')
  const [category, setCategory]         = useState('Barchasi')
  const [userLikes, setUserLikes]       = useState<Record<string, 'like' | 'dislike'>>({})
  const [newPostCount, setNewPostCount] = useState(0)
  const [masterClasses, setMasterClasses] = useState<any[]>([])
  const [teamPosts, setTeamPosts] = useState<any[]>([])
  const [masterOpen, setMasterOpen] = useState(false)
  const [teamOpen, setTeamOpen] = useState(false)
  const searchTimer = useRef<ReturnType<typeof setTimeout>>()

  /* ── Postlarni yuklash ── */
  useEffect(() => {
    setLoading(true)
    setNewPostCount(0)
    fetchPosts({ search, category, limit: 30 })
      .then(async (data) => {
        setPosts(data)
        if (data.length > 0) {
          const likes = await getUserPostLikes(userId, data.map(p => p.id))
          setUserLikes(likes)
        }
      })
      .finally(() => setLoading(false))
  }, [search, category, userId])

  /* ── Eng ko'p muhokama ── */
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
        setTopPosts(prev =>
          [...prev, newPost].sort((a, b) => b.comment_count - a.comment_count).slice(0, 5)
        )
      },
      (updatedPost) => {
        setPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p))
        setTopPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p))
      }
    )
    return unsubscribe
  }, [])

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
    <div className="max-w-5xl mx-auto space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Forum</h1>
          <p className="text-white/40 text-sm mt-1">O&apos;quvchilar hamjamiyati — savol bering, tajriba ulashing</p>
        </div>
        <Link href="/forum/post/new">
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/30 flex-shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Yangi mavzu</span>
            <span className="sm:hidden">Yangi</span>
          </motion.button>
        </Link>
      </div>

      {/* Qidiruv + Kategoriya */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 pointer-events-none" />
          <input
            type="text"
            value={searchInput}
            onChange={e => handleSearchInput(e.target.value)}
            placeholder="Forum ichida qidirish..."
            className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm text-white placeholder:text-white/25 outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          />
          <AnimatePresence>
            {searchInput && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`flex-shrink-0 text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all duration-200 ${
                category === cat
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30'
                  : `border text-white/50 hover:text-white/80 ${CATEGORY_COLORS[cat] ?? ''}`
              }`}
              style={category !== cat ? { background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' } : {}}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Yangi post bildirishnomasi */}
      <AnimatePresence>
        {newPostCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-emerald-300"
            style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}
          >
            <Wifi className="h-3.5 w-3.5 animate-pulse" />
            {newPostCount} ta yangi post qo&apos;shildi
          </motion.div>
        )}
      </AnimatePresence>

      {/* Master-klass e'lonlari */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <button
          onClick={() => setMasterOpen(v => !v)}
          className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center shadow-lg shadow-blue-900/30">
              <GraduationCap className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-white">
              Master-klass e'lonlari
            </span>
            {masterClasses.length > 0 && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300">
                {masterClasses.length} ta
              </span>
            )}
          </div>
          {masterOpen ? (
            <ChevronUp className="h-4 w-4 text-white/40" />
          ) : (
            <ChevronDown className="h-4 w-4 text-white/40" />
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
                  <p className="text-xs text-center py-6 text-white/20">
                    Hozircha master-klass e'lonlari mavjud emas
                  </p>
                ) : (
                  <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
                    {masterClasses.map(mc => (
                      <div
                        key={mc.id}
                        className="flex-shrink-0 w-72 rounded-xl p-4 space-y-3"
                        style={{
                          background: 'linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(147,51,234,0.08) 100%)',
                          border: '1px solid rgba(59,130,246,0.2)',
                        }}
                      >
                        <div className="space-y-1">
                          <h4 className="text-sm font-semibold leading-snug line-clamp-2 text-white">
                            {mc.title}
                          </h4>
                          <p className="text-xs text-white/50">
                            {mc.speaker_name}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 text-xs">
                          <span className="flex items-center gap-1 text-white/40">
                            <Calendar className="h-3 w-3" />
                            {new Date(mc.datetime).toLocaleDateString('uz-UZ', {
                              day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                            })}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1 ${
                            mc.is_online ? 'text-emerald-300 bg-emerald-500/10' : 'text-amber-300 bg-amber-500/10'
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
                              ? 'text-blue-300 bg-blue-500/15 hover:bg-blue-500/25'
                              : 'text-white bg-white/8 hover:bg-white/12'
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

      {/* Hamkor qidirish */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <button
          onClick={() => setTeamOpen(v => !v)}
          className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-900/30">
              <Users className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-white">
              Hamkor qidirish
            </span>
            {teamPosts.length > 0 && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300">
                {teamPosts.length} ta
              </span>
            )}
          </div>
          {teamOpen ? (
            <ChevronUp className="h-4 w-4 text-white/40" />
          ) : (
            <ChevronDown className="h-4 w-4 text-white/40" />
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
                  <p className="text-xs text-center py-6 text-white/20">
                    Hozircha hamkorlik e'lonlari mavjud emas
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {teamPosts.map(tp => (
                      <div
                        key={tp.id}
                        className="rounded-xl p-4 space-y-2.5"
                        style={{
                          background: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(20,184,166,0.05) 100%)',
                          border: '1px solid rgba(16,185,129,0.15)',
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
                          <span className="text-xs font-medium text-white/60">
                            {tp.users?.full_name || 'Noma\'lum'}
                          </span>
                        </div>

                        <h4 className="text-sm font-semibold leading-snug line-clamp-1 text-white">
                          {tp.title}
                        </h4>

                        <p className="text-xs leading-relaxed line-clamp-2 text-white/50">
                          {tp.description}
                        </p>

                        {tp.skills && tp.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {tp.skills.slice(0, 4).map((skill: string, i: number) => (
                              <span
                                key={i}
                                className="text-[10px] px-2 py-0.5 rounded-full bg-white/8 text-white/50"
                              >
                                {skill}
                              </span>
                            ))}
                            {tp.skills.length > 4 && (
                              <span className="text-[10px] text-white/30">
                                +{tp.skills.length - 4}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[10px] text-white/20">
                            {tp.contact?.slice(0, 3)}...
                          </span>
                          <button
                            className="text-[10px] font-semibold px-3 py-1 rounded-lg text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 transition-all"
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

      {/* Asosiy kontent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Postlar */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-6 w-6 text-white/30 animate-spin" />
            </div>
          ) : posts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center py-16 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.02)', border: '2px dashed rgba(255,255,255,0.07)' }}
            >
              <MessageSquare className="h-10 w-10 text-white/12 mx-auto mb-3" />
              <p className="text-white/40 text-sm">Post topilmadi</p>
              <p className="text-white/20 text-xs mt-1">
                {search ? "Boshqa kalit so'z kiriting" : 'Birinchi bo\'ling — yangi mavzu oching!'}
              </p>
              <Link href="/forum/post/new" className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl text-xs font-semibold text-blue-300 bg-blue-500/15 hover:bg-blue-500/25 transition-all">
                <Plus className="h-3.5 w-3.5" /> Yangi mavzu
              </Link>
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
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <h3 className="text-white/50 text-[11px] font-semibold uppercase tracking-widest">Statistika</h3>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-white/40 text-sm">
                  <FileText className="h-3.5 w-3.5" /> Jami postlar
                </span>
                <span className="text-white font-bold text-sm tabular-nums">{posts.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-white/40 text-sm">
                  <MessageSquare className="h-3.5 w-3.5" /> Jami izohlar
                </span>
                <span className="text-white font-bold text-sm tabular-nums">{totalComments}</span>
              </div>
            </div>
          </div>

          {/* Eng ko'p muhokama */}
          <div
            className="rounded-2xl p-4"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <h3 className="text-white/50 text-[11px] font-semibold uppercase tracking-widest mb-3 flex items-center gap-2">
              <TrendingUp className="h-3.5 w-3.5 text-amber-400" />
              Eng ko&apos;p muhokama
            </h3>
            {topPosts.length === 0 ? (
              <p className="text-white/20 text-xs">Hali post yo&apos;q</p>
            ) : (
              <div className="space-y-1">
                {topPosts.map((post, i) => (
                  <Link
                    key={post.id}
                    href={`/forum/post/${post.id}`}
                    className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-white/5 transition-colors group"
                  >
                    <span className="text-white/20 text-[11px] font-bold mt-0.5 w-4 flex-shrink-0">{i + 1}.</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white/60 text-xs leading-snug group-hover:text-white/85 transition-colors line-clamp-2">
                        {post.title}
                      </p>
                      <span className="text-white/20 text-[10px] mt-1 flex items-center gap-1">
                        <MessageSquare className="h-2.5 w-2.5" />
                        {post.comment_count} izoh · {formatTimeAgo(post.created_at)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Yangi mavzu CTA */}
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-5 text-center"
            style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.15)' }}
          >
            <MessageSquare className="h-7 w-7 text-blue-400/50 mx-auto mb-2" />
            <p className="text-white/40 text-xs mb-3 leading-relaxed">
              Savolingiz bormi? Hamjamiyatga yozing!
            </p>
            <Link href="/forum/post/new">
              <button className="text-xs font-semibold text-blue-300 bg-blue-500/15 hover:bg-blue-500/25 px-5 py-2 rounded-xl transition-all">
                Mavzu ochish
              </button>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
