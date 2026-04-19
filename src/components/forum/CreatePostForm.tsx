'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Send, Loader2, ChevronDown, AlertCircle } from 'lucide-react'
import { createPost } from '@/lib/supabase/realtime'

const CATEGORIES = ['Savol', 'Muhokama', 'Yangilik', 'Tavsiya', 'Yordam']

const CATEGORY_STYLES: Record<string, { dot: string; text: string }> = {
  Savol:    { dot: 'bg-blue-500',    text: 'Savol' },
  Muhokama: { dot: 'bg-purple-500',  text: 'Muhokama' },
  Yangilik: { dot: 'bg-emerald-500', text: 'Yangilik' },
  Tavsiya:  { dot: 'bg-amber-500',   text: 'Tavsiya' },
  Yordam:   { dot: 'bg-rose-500',    text: 'Yordam' },
}

interface Props {
  userId: string
  userName: string
  userAvatar?: string
}

export default function CreatePostForm({ userId, userName, userAvatar = '' }: Props) {
  const router = useRouter()
  const [title, setTitle]       = useState('')
  const [content, setContent]   = useState('')
  const [category, setCategory] = useState('Savol')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [catOpen, setCatOpen]   = useState(false)

  const canSubmit = title.trim().length >= 5 && content.trim().length >= 10 && !loading

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setLoading(true)
    setError(null)
    try {
      const post = await createPost({
        title: title.trim(),
        content: content.trim(),
        category,
        author_id: userId,
        author_name: userName,
        author_avatar: userAvatar,
      })
      router.push(`/forum/post/${post.id}`)
    } catch {
      setError('Post yaratishda xatolik yuz berdi. Qayta urinib ko\'ring.')
      setLoading(false)
    }
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-5"
    >
      {/* Xatolik */}
      {error && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-rose-300 text-sm"
          style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)' }}>
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Sarlavha */}
      <div className="space-y-1.5">
        <label className="text-white/50 text-xs font-semibold uppercase tracking-wider">
          Sarlavha <span className="text-rose-400">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Post sarlavhasini kiriting..."
          maxLength={200}
          className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder:text-white/20 outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
        />
        <div className="flex justify-end">
          <span className={`text-[10px] ${title.length > 180 ? 'text-amber-400' : 'text-white/20'}`}>
            {title.length}/200
          </span>
        </div>
      </div>

      {/* Kategoriya */}
      <div className="space-y-1.5">
        <label className="text-white/50 text-xs font-semibold uppercase tracking-wider">
          Kategoriya <span className="text-rose-400">*</span>
        </label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setCatOpen(v => !v)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm text-white outline-none transition-all"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <span className="flex items-center gap-2.5">
              <span className={`h-2 w-2 rounded-full ${CATEGORY_STYLES[category]?.dot}`} />
              {CATEGORY_STYLES[category]?.text}
            </span>
            <ChevronDown className={`h-4 w-4 text-white/30 transition-transform ${catOpen ? 'rotate-180' : ''}`} />
          </button>

          {catOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
              className="absolute z-20 top-full left-0 right-0 mt-1.5 rounded-xl overflow-hidden shadow-2xl"
              style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => { setCategory(cat); setCatOpen(false) }}
                  className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors text-left ${
                    category === cat ? 'text-white bg-white/8' : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${CATEGORY_STYLES[cat]?.dot}`} />
                  {CATEGORY_STYLES[cat]?.text}
                </button>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Kontent */}
      <div className="space-y-1.5">
        <label className="text-white/50 text-xs font-semibold uppercase tracking-wider">
          Kontent <span className="text-rose-400">*</span>
        </label>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Postingiz mazmunini kiriting. Savolingizni batafsil yozing — boshqalar tushunishi oson bo'lsin..."
          rows={8}
          className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder:text-white/20 outline-none focus:ring-1 focus:ring-blue-500/50 transition-all resize-none leading-relaxed"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
        />
        <div className="flex items-center justify-between">
          <span className="text-white/20 text-[10px]">Kamida 10 ta belgi</span>
          <span className={`text-[10px] ${content.length > 0 && content.length < 10 ? 'text-amber-400' : 'text-white/20'}`}>
            {content.length} belgi
          </span>
        </div>
      </div>

      {/* Yuborish */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm text-white/40 hover:text-white/70 transition-colors"
        >
          Bekor qilish
        </button>
        <motion.button
          type="submit"
          disabled={!canSubmit}
          whileHover={canSubmit ? { scale: 1.02 } : {}}
          whileTap={canSubmit ? { scale: 0.97 } : {}}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-900/30"
        >
          {loading
            ? <><Loader2 className="h-4 w-4 animate-spin" /> Yaratilmoqda...</>
            : <><Send className="h-4 w-4" /> Post e&apos;lon qilish</>
          }
        </motion.button>
      </div>
    </motion.form>
  )
}
