'use client'

import { useState, useEffect } from 'react'
import { ThumbsUp, ThumbsDown } from 'lucide-react'
import { togglePostLike, getUserLike } from '@/lib/supabase/realtime'

interface Props {
  postId: string
  initialLikes: number
  initialDislikes: number
  userId: string | null
}

export default function PostLikeBar({ postId, initialLikes, initialDislikes, userId }: Props) {
  const [likes, setLikes]       = useState(initialLikes)
  const [dislikes, setDislikes] = useState(initialDislikes)
  const [myLike, setMyLike]     = useState<'like' | 'dislike' | null>(null)
  const [voting, setVoting]     = useState(false)

  useEffect(() => {
    if (!userId) return
    getUserLike(postId, userId).then(setMyLike)
  }, [postId, userId])

  const handleVote = async (type: 'like' | 'dislike') => {
    if (!userId || voting) return
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
      await togglePostLike(postId, userId, type)
    } catch {
      setLikes(initialLikes)
      setDislikes(initialDislikes)
      setMyLike(null)
    } finally {
      setVoting(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => handleVote('like')}
        disabled={!userId || voting}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
          myLike === 'like'
            ? 'text-emerald-300 bg-emerald-500/15 border border-emerald-500/30'
            : 'text-white/40 hover:text-emerald-300 border border-white/8 hover:border-emerald-500/30 hover:bg-emerald-500/8 disabled:cursor-not-allowed'
        }`}
      >
        <ThumbsUp className="h-4 w-4" />
        <span>{likes}</span>
      </button>

      <button
        onClick={() => handleVote('dislike')}
        disabled={!userId || voting}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
          myLike === 'dislike'
            ? 'text-red-300 bg-red-500/15 border border-red-500/30'
            : 'text-white/40 hover:text-red-300 border border-white/8 hover:border-red-500/30 hover:bg-red-500/8 disabled:cursor-not-allowed'
        }`}
      >
        <ThumbsDown className="h-4 w-4" />
        <span>{dislikes}</span>
      </button>

      {!userId && (
        <span className="text-white/20 text-xs ml-1">
          (baholash uchun kiring)
        </span>
      )}
    </div>
  )
}
