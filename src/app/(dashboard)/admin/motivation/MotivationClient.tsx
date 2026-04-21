'use client'

import { useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles, Quote, BookHeart, Plus, Trash2, Check,
  Loader2, Info,
} from 'lucide-react'
import { addDailyQuote, deleteQuote, approveStory, deleteStory } from '../actions'

interface Quote {
  id: string
  text: string
  author: string
  is_active: boolean
  created_at: string
}

interface Story {
  id: string
  title: string
  content: string
  author_name: string
  approved: boolean
  created_at: string
}

interface Props {
  quotes: Quote[]
  stories: Story[]
}

function AddQuoteForm({ onAdd }: { onAdd: (q: Quote) => void }) {
  const [text, setText] = useState('')
  const [author, setAuthor] = useState('')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) { setError('Iqtibos matni kiritilishi shart'); return }
    if (!author.trim()) { setError('Muallif kiritilishi shart'); return }
    setError('')

    startTransition(async () => {
      const result = await addDailyQuote(text.trim(), author.trim())
      if (result.error) {
        setError(result.error)
      } else {
        onAdd({
          id: Date.now().toString(),
          text: text.trim(),
          author: author.trim(),
          is_active: true,
          created_at: new Date().toISOString(),
        })
        setText('')
        setAuthor('')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Iqtibos matni..."
          rows={3}
          className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/30 outline-none focus:ring-1 focus:ring-purple-500/50 resize-none"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        />
      </div>
      <div className="flex gap-3">
        <input
          type="text"
          value={author}
          onChange={e => setAuthor(e.target.value)}
          placeholder="Muallif ismi..."
          className="flex-1 px-4 py-2.5 rounded-xl text-sm text-white placeholder-white/30 outline-none focus:ring-1 focus:ring-purple-500/50"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        />
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-purple-600/80 hover:bg-purple-600 text-white transition-all disabled:opacity-50"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Qo&apos;shish
        </button>
      </div>
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </form>
  )
}

export default function MotivationClient({ quotes: initialQuotes, stories: initialStories }: Props) {
  const [quotes, setQuotes] = useState(initialQuotes)
  const [stories, setStories] = useState(initialStories)
  const [activeTab, setActiveTab] = useState<'quotes' | 'stories'>('quotes')
  const [isPending, startTransition] = useTransition()
  const [actionError, setActionError] = useState('')

  const handleDeleteQuote = (id: string) => {
    setActionError('')
    startTransition(async () => {
      const result = await deleteQuote(id)
      if (result.error) setActionError(result.error)
      else setQuotes(prev => prev.filter(q => q.id !== id))
    })
  }

  const handleApproveStory = (id: string) => {
    setActionError('')
    startTransition(async () => {
      const result = await approveStory(id)
      if (result.error) setActionError(result.error)
      else setStories(prev => prev.map(s => s.id === id ? { ...s, approved: true } : s))
    })
  }

  const handleDeleteStory = (id: string) => {
    setActionError('')
    startTransition(async () => {
      const result = await deleteStory(id)
      if (result.error) setActionError(result.error)
      else setStories(prev => prev.filter(s => s.id !== id))
    })
  }

  const tabsData = [
    { key: 'quotes' as const, label: 'Kunlik iqtiboslar', icon: Quote, count: quotes.length },
    { key: 'stories' as const, label: 'Muvaffaqiyat hikoyalari', icon: BookHeart, count: stories.length },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Motivatsiya boshqaruvi</h1>
        <p className="text-white/40 text-sm mt-1">Kunlik iqtiboslar va muvaffaqiyat hikoyalari</p>
      </div>

      {/* Tablar */}
      <div
        className="flex gap-1 p-1 rounded-xl"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        {tabsData.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === tab.key
                  ? 'bg-purple-600/80 text-white shadow-lg'
                  : 'text-white/40 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === tab.key ? 'bg-white/20' : 'bg-white/5'
              }`}>
                {tab.count}
              </span>
            </button>
          )
        })}
      </div>

      {actionError && (
        <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {actionError}
        </div>
      )}

      {/* Iqtiboslar tab */}
      <AnimatePresence mode="wait">
        {activeTab === 'quotes' && (
          <motion.div
            key="quotes"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Yangi iqtibos qo'shish */}
            <div
              className="rounded-2xl p-5"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Plus className="h-4 w-4 text-purple-400" />
                <h2 className="text-white text-sm font-semibold">Yangi iqtibos qo&apos;shish</h2>
              </div>
              <AddQuoteForm onAdd={q => setQuotes(prev => [q, ...prev])} />
            </div>

            {/* DB jadval yo'q bo'lsa */}
            {quotes.length === 0 && (
              <div
                className="rounded-2xl p-5 flex items-start gap-3"
                style={{ background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.15)' }}
              >
                <Info className="h-4 w-4 text-purple-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white/60 text-sm">
                    Hali iqtiboslar qo&apos;shilmagan. Yuqoridagi forma orqali birinchi iqtibosni qo&apos;shing.
                  </p>
                  <p className="text-white/30 text-xs mt-1">
                    Eslatma: <code className="text-purple-400">daily_quotes</code> jadvali Supabase&apos;da mavjud bo&apos;lishi kerak.
                  </p>
                </div>
              </div>
            )}

            {/* Iqtiboslar ro'yxati */}
            <div className="space-y-2">
              {quotes.map((quote, i) => (
                <motion.div
                  key={quote.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-start gap-4 p-4 rounded-xl group"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <Sparkles className="h-4 w-4 text-purple-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white/80 text-sm italic leading-relaxed">&ldquo;{quote.text}&rdquo;</p>
                    <p className="text-white/40 text-xs mt-1.5">— {quote.author}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteQuote(quote.id)}
                    disabled={isPending}
                    className="p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100 flex-shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Hikoyalar tab */}
        {activeTab === 'stories' && (
          <motion.div
            key="stories"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            {stories.length === 0 && (
              <div
                className="rounded-2xl p-5 flex items-start gap-3"
                style={{ background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.15)' }}
              >
                <Info className="h-4 w-4 text-purple-400 flex-shrink-0 mt-0.5" />
                <p className="text-white/60 text-sm">
                  Hali tasdiqlash uchun hikoyalar yo&apos;q. Foydalanuvchilar hikoya yuborishi bilan bu yerda ko&apos;rinadi.
                </p>
              </div>
            )}

            {stories.map((story, i) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-5 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="min-w-0">
                    <h3 className="text-white font-medium text-sm">{story.title}</h3>
                    <p className="text-white/40 text-xs mt-0.5">{story.author_name}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {story.approved ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                        <Check className="h-3 w-3" />
                        Tasdiqlangan
                      </span>
                    ) : (
                      <button
                        onClick={() => handleApproveStory(story.id)}
                        disabled={isPending}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/20 transition-all disabled:opacity-50"
                      >
                        {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                        Tasdiqlash
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteStory(story.id)}
                      disabled={isPending}
                      className="p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-white/50 text-sm line-clamp-3 leading-relaxed">{story.content}</p>
                <p className="text-white/25 text-xs mt-3">
                  {new Date(story.created_at).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
