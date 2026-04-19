'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ThumbsUp, ThumbsDown, MessageSquare, Eye,
  Pin, Clock, Tag, ChevronRight,
} from 'lucide-react'
import type { ForumPost } from '@/lib/supabase/realtime'
import { formatTimeAgo, togglePostLike } from '@/lib/supabase/realtime'

const CATEGORY_STYLES: Record<string, { text: string; bg: string }> = {
  'Savol':    { text: 'text-blue-300',   bg: 'bg-blue-500/12 border border-blue-500/25'    },
  'Muhokama': { text: 'text-purple-300', bg: 'bg-purple-500/12 border border-purple-500/25' },
  'Yangilik': { text: 'text-emerald-300',bg: 'bg-emerald-500/12 border border-emerald-500/25'},
  'Tavsiya':  { text: 'text-amber-300',  bg: 'bg-amber-500/12 border border-amber-500/25'   },
  'Yordam':   { text: 'text-rose-300',   bg: 'bg-rose-500/12 border border-rose-500/25'     },
}

const AVATAR_COLORS = [
  'from-blue-600 to-blue-800',
  'from-purple-600 to-purple-800',
  'from-emerald-600 to-emerald-800',
  'from-rose-600 to-rose-800',
  'from-amber-600 to-amber-800',
]

interface Props {
  post: ForumPost
  index?: number
  pinned?: boolean
  currentUserId?: string | null
  userLike?: 'like' | 'dislike' | null
  onLikeChange?: (postId: string, likes: number, dislikes: number) => void
}

export default function PostCard({
  post, index = 0, pinned = false, currentUserId, userLike: initialLike, onLikeChange,
}: Props) {
  const [likes, setLikes] = useState(post.likes)
  const [dislikes, setDislikes] = useState(post.dislikes)
  const [myLike, setMyLike] = useState<'like' | 'dislike' | null>(initialLike ?? null)
  const [voting, setVoting] = useState(false)

  const colorIdx = post.author_name.charCodeAt(0) % AVATAR_COLORS.length
  const initials = post.author_name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  const catStyle = CATEGORY_STYLES[post.category] ?? CATEGORY_STYLES['Savol']

  const handleVote = async (type: 'like' | 'dislike') => {
    if (!currentUserId || voting) return
    setVoting(true)
    try {
      const isRemoving = myLike === type
      const isSwitch   = myLike !== null && myLike !== type

      let newLikes = likes
      let newDislikes = dislikes

      if (isRemoving) {
        type === 'like' ? newLikes-- : newDislikes--
        setMyLike(null)
      } else if (isSwitch) {
        if (type === 'like') { newLikes++; newDislikes-- }
        else                 { newDislikes++; newLikes-- }
        setMyLike(type)
      } else {
        type === 'like' ? newLikes++ : newDislikes++
        setMyLike(type)
      }

      setLikes(Math.max(0, newLikes))
      setDislikes(Math.max(0, newDislikes))
      onLikeChange?.(post.id, Math.max(0, newLikes), Math.max(0, newDislikes))

      await togglePostLike(post.id, currentUserId, type)
    } catch {
      setLikes(post.likes)
      setDislikes(post.dislikes)
      setMyLike(initialLike ?? null)
    } finally {
      setVoting(false)
    }
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      className="group rounded-2xl transition-all duration-200 hover:translate-y-[-2px]"
      style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${pinned ? 'rgba(245,158,11,0.25)' : 'rgba(255,255,255,0.08)'}` }}
    >
      <Link href={`/forum/post/${post.id}`} className="block p-5">
        {/* Top row */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {pinned && (
            <span className="flex items-center gap-1 text-amber-400 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-400/10">
              <Pin className="h-2.5 w-2.5" /> Muhim
            </span>
          )}
          <span className={`flex items-center gap-1 text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${catStyle.bg} ${catStyle.text}`}>
            <Tag className="h-2.5 w-2.5" />{post.category}
          </span>
          <span className="text-white/20 text-xs flex items-center gap-1 ml-auto">
            <Clock className="h-3 w-3" />
            {formatTimeAgo(post.created_at)}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-white font-semibold text-sm leading-snug mb-2 group-hover:text-blue-300 transition-colors line-clamp-2">
          {post.title}
        </h3>

        {/* Preview */}
        <p className="text-white/40 text-xs leading-relaxed line-clamp-2 mb-4">
          {post.content}
        </p>

        {/* Author */}
        <div className="flex items-center gap-2">
          <div className={`h-6 w-6 rounded-full bg-gradient-to-br ${AVATAR_COLORS[colorIdx]} flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0`}>
            {initials}
          </div>
          <span className="text-white/40 text-xs">{post.author_name}</span>
          <ChevronRight className="h-3 w-3 text-white/15 ml-auto group-hover:text-white/40 transition-colors" />
        </div>
      </Link>

      {/* Footer actions */}
      <div className="flex items-center gap-4 px-5 py-3 border-t border-white/5">
        {/* Like */}
        <button
          onClick={() => handleVote('like')}
          disabled={!currentUserId || voting}
          className={`flex items-center gap-1.5 text-xs font-medium transition-all rounded-lg px-2 py-1 ${
            myLike === 'like'
              ? 'text-emerald-400 bg-emerald-400/10'
              : 'text-white/30 hover:text-emerald-400 hover:bg-emerald-400/8 disabled:cursor-not-allowed'
          }`}
        >
          <ThumbsUp className="h-3.5 w-3.5" /> {likes}
        </button>

        {/* Dislike */}
        <button
          onClick={() => handleVote('dislike')}
          disabled={!currentUserId || voting}
          className={`flex items-center gap-1.5 text-xs font-medium transition-all rounded-lg px-2 py-1 ${
            myLike === 'dislike'
              ? 'text-red-400 bg-red-400/10'
              : 'text-white/30 hover:text-red-400 hover:bg-red-400/8 disabled:cursor-not-allowed'
          }`}
        >
          <ThumbsDown className="h-3.5 w-3.5" /> {dislikes}
        </button>

        <Link href={`/forum/post/${post.id}`} className="flex items-center gap-1.5 text-xs text-white/30 hover:text-blue-400 transition-colors ml-auto">
          <MessageSquare className="h-3.5 w-3.5" /> {post.comment_count} javob
        </Link>

        <span className="flex items-center gap-1 text-xs text-white/20">
          <Eye className="h-3 w-3" />
          {Math.floor(Math.random() * 200 + 50)}
        </span>
      </div>
    </motion.article>
  )
}
