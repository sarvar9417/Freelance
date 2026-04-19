'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send, Loader2, MessageSquare, ThumbsUp,
  Wifi, WifiOff, Sparkles,
} from 'lucide-react'
import {
  fetchComments, createComment, subscribeToComments,
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
}

export default function CommentSection({ postId, currentUser }: Props) {
  const [comments, setComments] = useState<ForumComment[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [text, setText] = useState('')
  const [connected, setConnected] = useState(false)
  const [newCount, setNewCount] = useState(0)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const myCommentIds = useRef<Set<string>>(new Set())

  /* ── Load comments ── */
  useEffect(() => {
    let mounted = true
    fetchComments(postId)
      .then(data => { if (mounted) { setComments(data); setLoading(false) } })
      .catch(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [postId])

  /* ── Real-time subscription ── */
  useEffect(() => {
    const channel = subscribeToComments(postId, (newComment) => {
      setComments(prev => {
        if (prev.some(c => c.id === newComment.id)) return prev
        const isMine = myCommentIds.current.has(newComment.id)
        if (!isMine) setNewCount(n => n + 1)
        return [...prev, newComment]
      })
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    })

    const timer = setTimeout(() => setConnected(true), 800)
    return () => {
      clearTimeout(timer)
      channel.unsubscribe()
    }
  }, [postId])

  /* ── Auto-resize textarea ── */
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
    const ta = textareaRef.current
    if (ta) { ta.style.height = 'auto'; ta.style.height = ta.scrollHeight + 'px' }
  }

  /* ── Submit ── */
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
      setText('')
      if (textareaRef.current) textareaRef.current.style.height = 'auto'
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    } catch {
      // silently fail — user sees no change
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
        <Loader2 className="h-6 w-6 text-white/30 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-white font-semibold flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-blue-400" />
          Izohlar
          <span className="text-white/30 font-normal text-sm">({comments.length})</span>
        </h2>

        {/* Connection status */}
        <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full transition-all ${
          connected
            ? 'text-emerald-400 bg-emerald-400/10'
            : 'text-white/30 bg-white/5'
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
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)' }}
          >
            <Sparkles className="h-3.5 w-3.5 text-blue-400" />
            <span className="text-blue-300">{newCount} ta yangi izoh — ko&apos;rish</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Comments list */}
      {comments.length === 0 ? (
        <div className="text-center py-12 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.02)', border: '2px dashed rgba(255,255,255,0.07)' }}>
          <MessageSquare className="h-8 w-8 text-white/15 mx-auto mb-3" />
          <p className="text-white/30 text-sm">Hali izoh yo&apos;q</p>
          <p className="text-white/20 text-xs mt-1">Birinchi izoh yozing!</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {comments.map((comment, i) => {
              const isNew  = i >= comments.length - newCount
              const isMine = comment.author_id === currentUser?.id
              const colorIdx = comment.author_name.charCodeAt(0) % AVATAR_COLORS.length
              const initials = comment.author_name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)

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
                      <span className="text-white/70 text-xs font-semibold">{comment.author_name}</span>
                      {isMine && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full text-blue-300 bg-blue-400/10">Sen</span>
                      )}
                      {isNew && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full text-emerald-300 bg-emerald-400/10 animate-pulse">Yangi</span>
                      )}
                      <span className="text-white/20 text-[10px]">{formatTimeAgo(comment.created_at)}</span>
                    </div>

                    <div
                      className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        isMine
                          ? 'rounded-tr-sm text-white'
                          : 'rounded-tl-sm text-white/80'
                      }`}
                      style={{
                        background: isMine
                          ? 'linear-gradient(135deg, rgba(59,130,246,0.25), rgba(99,102,241,0.2))'
                          : 'rgba(255,255,255,0.06)',
                        border: isMine
                          ? '1px solid rgba(59,130,246,0.3)'
                          : '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      {comment.content}
                    </div>

                    {/* Like comment */}
                    <button className="flex items-center gap-1 text-white/20 hover:text-emerald-400 transition-colors text-xs px-1">
                      <ThumbsUp className="h-3 w-3" />
                      {comment.likes > 0 && <span>{comment.likes}</span>}
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
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)' }}>
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
              className="flex-1 bg-transparent text-white text-sm placeholder:text-white/20 outline-none resize-none min-h-[36px] max-h-40 leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-white/20 text-xs hidden sm:block">Ctrl+Enter — tez yuborish</span>
            <button type="submit" disabled={!text.trim() || sending}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-900/30 ml-auto">
              {sending
                ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Yuborilmoqda</>
                : <><Send className="h-3.5 w-3.5" /> Yuborish</>
              }
            </button>
          </div>
        </form>
      ) : (
        <div className="text-center py-6 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.08)' }}>
          <p className="text-white/40 text-sm">
            Izoh yozish uchun{' '}
            <a href="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
              kirish
            </a>{' '}
            kerak
          </p>
        </div>
      )}
    </div>
  )
}
