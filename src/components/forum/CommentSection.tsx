'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send, Loader2, MessageSquare,
  Wifi, WifiOff, Sparkles, Heart,
} from 'lucide-react'
import {
  fetchComments, createComment, subscribeToComments,
  toggleCommentLike, getUserCommentLikes,
  formatTimeAgo, type ForumComment,
} from '@/lib/supabase/realtime'

const AVATAR_COLORS = [
  'from-blue-600 to-blue-800',
  'from-purple-600 to-purple-800',
  'from-emerald-600 to-emerald-800',
  'from-rose-600 to-rose-800',
  'from-amber-600 to-amber-800',
  'from-cyan-600 to-cyan-800',
]

interface Props {
  postId: string
  currentUser: { id: string; name: string; avatar: string } | null
  isDark?: boolean
}

export default function CommentSection({ postId, currentUser, isDark = true }: Props) {
  const [comments, setComments]   = useState<ForumComment[]>([])
  const [loading, setLoading]     = useState(true)
  const [sending, setSending]     = useState(false)
  const [text, setText]           = useState('')
  const [connected, setConnected] = useState(false)
  const [newCount, setNewCount]   = useState(0)

  // commentId → { count, liked }
  const [commentLikes, setCommentLikes] = useState<Record<string, { count: number; liked: boolean }>>({})
  const votingRef = useRef<Set<string>>(new Set())

  const bottomRef    = useRef<HTMLDivElement>(null)
  const textareaRef  = useRef<HTMLTextAreaElement>(null)
  const myCommentIds = useRef<Set<string>>(new Set())

  /* ── Load comments ── */
  useEffect(() => {
    let mounted = true
    fetchComments(postId)
      .then(async (data) => {
        if (!mounted) return
        setComments(data)
        setLoading(false)

        // Foydalanuvchi like holati
        if (currentUser && data.length > 0) {
          const ids = data.map(c => c.id)
          const likedSet = await getUserCommentLikes(currentUser.id, ids)
          const map: Record<string, { count: number; liked: boolean }> = {}
          data.forEach(c => { map[c.id] = { count: c.likes, liked: likedSet.has(c.id) } })
          setCommentLikes(map)
        } else {
          const map: Record<string, { count: number; liked: boolean }> = {}
          data.forEach(c => { map[c.id] = { count: c.likes, liked: false } })
          setCommentLikes(map)
        }
      })
      .catch(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [postId, currentUser])

  /* ── Real-time subscription ── */
  useEffect(() => {
    const unsubscribe = subscribeToComments(postId, (newComment) => {
      setComments(prev => {
        if (prev.some(c => c.id === newComment.id)) return prev
        const isMine = myCommentIds.current.has(newComment.id)
        if (!isMine) setNewCount(n => n + 1)
        return [...prev, newComment]
      })
      setCommentLikes(prev => ({
        ...prev,
        [newComment.id]: { count: newComment.likes, liked: false },
      }))
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    })

    const timer = setTimeout(() => setConnected(true), 800)
    return () => { clearTimeout(timer); unsubscribe() }
  }, [postId])

  /* ── Comment like toggle ── */
  const handleCommentLike = useCallback(async (commentId: string) => {
    if (!currentUser || votingRef.current.has(commentId)) return
    votingRef.current.add(commentId)

    setCommentLikes(prev => {
      const cur = prev[commentId] ?? { count: 0, liked: false }
      return {
        ...prev,
        [commentId]: {
          count: cur.liked ? Math.max(0, cur.count - 1) : cur.count + 1,
          liked: !cur.liked,
        },
      }
    })

    try {
      await toggleCommentLike(commentId, currentUser.id)
    } catch {
      // revert
      setCommentLikes(prev => {
        const cur = prev[commentId] ?? { count: 0, liked: false }
        return {
          ...prev,
          [commentId]: {
            count: cur.liked ? Math.max(0, cur.count - 1) : cur.count + 1,
            liked: !cur.liked,
          },
        }
      })
    } finally {
      votingRef.current.delete(commentId)
    }
  }, [currentUser])

  /* ── Auto-resize textarea ── */
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
    const ta = textareaRef.current
    if (ta) { ta.style.height = 'auto'; ta.style.height = ta.scrollHeight + 'px' }
  }

  /* ── Submit comment ── */
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!text.trim() || !currentUser || sending) return
    setSending(true)
    try {
      const comment = await createComment({
        post_id: postId,
        author_id: currentUser.id,
        author_name: currentUser.name,
        author_avatar: currentUser.avatar,
        content: text.trim(),
      })
      myCommentIds.current.add(comment.id)
      setComments(prev => prev.some(c => c.id === comment.id) ? prev : [...prev, comment])
      setCommentLikes(prev => ({ ...prev, [comment.id]: { count: 0, liked: false } }))
      setText('')
      if (textareaRef.current) textareaRef.current.style.height = 'auto'
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    } catch {
      // silently fail
    } finally {
      setSending(false)
    }
  }, [text, currentUser, postId, sending])

  /* ── Ctrl+Enter shortcut ── */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
  }

  const scrollToNew = () => {
    setNewCount(0)
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className={`h-6 w-6 animate-spin ${isDark ? 'text-white/30' : 'text-gray-400'}`} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className={`font-semibold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          <MessageSquare className={`h-4 w-4 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
          Izohlar
          <span className={`font-normal text-sm ${isDark ? 'text-white/30' : 'text-gray-400'}`}>({comments.length})</span>
        </h2>

        <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full transition-all ${
          connected
            ? isDark
              ? 'text-emerald-400 bg-emerald-400/10'
              : 'text-emerald-600 bg-emerald-50'
            : isDark
              ? 'text-white/30 bg-white/5'
              : 'text-gray-400 bg-gray-100'
        }`}>
          {connected
            ? <><Wifi className="h-3 w-3" /> Jonli</>
            : <><WifiOff className="h-3 w-3" /> Ulanmoqda...</>
          }
        </div>
      </div>

      {/* New comments badge */}
      <AnimatePresence>
        {newCount > 0 && (
          <motion.button
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            onClick={scrollToNew}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}
            style={isDark ? { background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)' } : { background: '#eff6ff', border: '1px solid #bfdbfe' }}
          >
            <Sparkles className={`h-3.5 w-3.5 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
            <span className={isDark ? 'text-blue-300' : 'text-blue-600'}>{newCount} ta yangi izoh — ko&apos;rish</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Comments list */}
      {comments.length === 0 ? (
        <div className="text-center py-12 rounded-2xl"
          style={isDark ? { background: 'rgba(255,255,255,0.02)', border: '2px dashed rgba(255,255,255,0.07)' } : { background: '#f9fafb', border: '2px dashed #e5e7eb' }}>
          <MessageSquare className={`h-8 w-8 mx-auto mb-3 ${isDark ? 'text-white/15' : 'text-gray-300'}`} />
          <p className={`text-sm ${isDark ? 'text-white/30' : 'text-gray-500'}`}>Hali izoh yo&apos;q</p>
          <p className={`text-xs mt-1 ${isDark ? 'text-white/20' : 'text-gray-400'}`}>Birinchi izoh yozing!</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {comments.map((comment, i) => {
              const isNew    = i >= comments.length - newCount
              const isMine   = comment.author_id === currentUser?.id
              const colorIdx = comment.author_name.charCodeAt(0) % AVATAR_COLORS.length
              const initials = comment.author_name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
              const likeState = commentLikes[comment.id] ?? { count: comment.likes, liked: false }

              return (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 20, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className={`flex gap-3 ${isMine ? 'flex-row-reverse' : ''}`}
                >
                  {/* Avatar */}
                  <div className={`h-9 w-9 rounded-xl bg-gradient-to-br ${AVATAR_COLORS[colorIdx]} flex items-center justify-center text-white text-xs font-bold flex-shrink-0 self-start mt-0.5 shadow-lg`}>
                    {initials}
                  </div>

                  {/* Bubble */}
                  <div className={`flex-1 max-w-[85%] ${isMine ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                    <div className={`flex items-center gap-2 ${isMine ? 'flex-row-reverse' : ''}`}>
                      <span className={`text-xs font-semibold ${isDark ? 'text-white/70' : 'text-gray-700'}`}>{comment.author_name}</span>
                      {isMine && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                          isDark ? 'text-blue-300 bg-blue-400/10' : 'text-blue-600 bg-blue-50'
                        }`}>Sen</span>
                      )}
                      {isNew && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full animate-pulse ${
                          isDark ? 'text-emerald-300 bg-emerald-400/10' : 'text-emerald-600 bg-emerald-50'
                        }`}>Yangi</span>
                      )}
                      <span className={`text-[10px] ${isDark ? 'text-white/20' : 'text-gray-400'}`}>{formatTimeAgo(comment.created_at)}</span>
                    </div>

                    <div
                      className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        isMine
                          ? isDark ? 'rounded-tr-sm text-white' : 'rounded-tr-sm text-gray-900'
                          : isDark ? 'rounded-tl-sm text-white/80' : 'rounded-tl-sm text-gray-700'
                      }`}
                      style={isMine
                        ? isDark
                          ? { background: 'linear-gradient(135deg, rgba(59,130,246,0.25), rgba(99,102,241,0.2))', border: '1px solid rgba(59,130,246,0.3)' }
                          : { background: 'linear-gradient(135deg, #eff6ff, #e0e7ff)', border: '1px solid #bfdbfe' }
                        : isDark
                          ? { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }
                          : { background: '#f9fafb', border: '1px solid #e5e7eb' }
                      }
                    >
                      {comment.content}
                    </div>

                    {/* Like button */}
                    <button
                      onClick={() => handleCommentLike(comment.id)}
                      disabled={!currentUser}
                      className={`flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded-lg transition-all ${
                        likeState.liked
                          ? isDark
                            ? 'text-rose-400 bg-rose-400/10'
                            : 'text-rose-600 bg-rose-50'
                          : isDark
                            ? 'text-white/25 hover:text-rose-400 hover:bg-rose-400/8 disabled:cursor-not-allowed disabled:hover:text-white/25 disabled:hover:bg-transparent'
                            : 'text-gray-400 hover:text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:hover:text-gray-400 disabled:hover:bg-transparent'
                      }`}
                    >
                      {likeState.liked
                        ? <Heart className={`h-3 w-3 ${isDark ? 'fill-rose-400' : 'fill-rose-500'}`} />
                        : <Heart className="h-3 w-3" />
                      }
                      {likeState.count > 0 && <span>{likeState.count}</span>}
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>
      )}

      {/* Write comment */}
      {currentUser ? (
        <form onSubmit={handleSubmit} className="rounded-2xl p-4 space-y-3"
          style={isDark ? { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)' } : { background: '#f9fafb', border: '1px solid #e5e7eb' }}>
          <div className="flex items-start gap-3">
            <div className={`h-8 w-8 rounded-xl bg-gradient-to-br ${AVATAR_COLORS[currentUser.name.charCodeAt(0) % AVATAR_COLORS.length]} flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5`}>
              {currentUser.name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <textarea
              ref={textareaRef}
              value={text}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              placeholder="Izoh yozing... (Ctrl+Enter — yuborish)"
              rows={1}
              className={`flex-1 bg-transparent text-sm outline-none resize-none min-h-[36px] max-h-40 leading-relaxed ${
                isDark ? 'text-white placeholder:text-white/20' : 'text-gray-900 placeholder:text-gray-400'
              }`}
            />
          </div>

          <div className="flex items-center justify-between">
            <span className={`text-xs hidden sm:block ${isDark ? 'text-white/20' : 'text-gray-400'}`}>Ctrl+Enter — tez yuborish</span>
            <button type="submit" disabled={!text.trim() || sending}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all ml-auto ${
                isDark
                  ? 'text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-blue-900/30'
                  : 'text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed'
              }`}>
              {sending
                ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Yuborilmoqda</>
                : <><Send className="h-3.5 w-3.5" /> Yuborish</>
              }
            </button>
          </div>
        </form>
      ) : (
        <div className="text-center py-6 rounded-2xl"
          style={isDark ? { background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.08)' } : { background: '#f9fafb', border: '1px dashed #e5e7eb' }}>
          <p className={`text-sm ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
            Izoh yozish uchun{' '}
            <a href="/login" className={`font-medium transition-colors ${
              isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
            }`}>
              kirish
            </a>{' '}
            kerak
          </p>
        </div>
      )}
    </div>
  )
}
