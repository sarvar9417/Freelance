'use client'

import { useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Quote, BookHeart, Plus, Trash2, Check, Loader2, Info } from 'lucide-react'
import { addDailyQuote, deleteQuote, approveStory, deleteStory } from '../actions'
import { useMountedTheme } from '@/hooks/useTheme'

interface QuoteItem { id: string; text: string; author: string; is_active: boolean; created_at: string }
interface Story { id: string; title: string; content: string; author_name: string; approved: boolean; created_at: string }

function AddQuoteForm({ onAdd, isDark }: { onAdd: (q: QuoteItem) => void; isDark: boolean }) {
  const [text, setText] = useState('')
  const [author, setAuthor] = useState('')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  const inputStyle = isDark ? { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' } : {}
  const inputCls = `px-4 py-2.5 rounded-xl text-sm outline-none focus:ring-1 focus:ring-purple-500/50 transition-colors ${
    isDark ? 'text-white placeholder-white/30' : 'bg-white border border-gray-200 text-gray-900 placeholder-gray-400'
  }`

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) { setError('Iqtibos matni kiritilishi shart'); return }
    if (!author.trim()) { setError('Muallif kiritilishi shart'); return }
    setError('')
    startTransition(async () => {
      const result = await addDailyQuote(text.trim(), author.trim())
      if (result.error) { setError(result.error) }
      else {
        onAdd({ id: Date.now().toString(), text: text.trim(), author: author.trim(), is_active: true, created_at: new Date().toISOString() })
        setText(''); setAuthor('')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Iqtibos matni..." rows={3}
        style={inputStyle} className={`w-full ${inputCls} resize-none`} />
      <div className="flex gap-3">
        <input type="text" value={author} onChange={e => setAuthor(e.target.value)} placeholder="Muallif ismi..."
          style={inputStyle} className={`flex-1 ${inputCls}`} />
        <button type="submit" disabled={isPending}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white transition-all disabled:opacity-50">
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Qo&apos;shish
        </button>
      </div>
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </form>
  )
}

export default function MotivationClient({ quotes: initialQuotes, stories: initialStories }: { quotes: QuoteItem[]; stories: Story[] }) {
  const { isDark } = useMountedTheme()
  const [quotes, setQuotes] = useState(initialQuotes)
  const [stories, setStories] = useState(initialStories)
  const [activeTab, setActiveTab] = useState<'quotes' | 'stories'>('quotes')
  const [isPending, startTransition] = useTransition()
  const [actionError, setActionError] = useState('')

  const handleDeleteQuote = (id: string) => {
    setActionError('')
    startTransition(async () => {
      const r = await deleteQuote(id)
      if (r.error) setActionError(r.error)
      else setQuotes(prev => prev.filter(q => q.id !== id))
    })
  }
  const handleApproveStory = (id: string) => {
    setActionError('')
    startTransition(async () => {
      const r = await approveStory(id)
      if (r.error) setActionError(r.error)
      else setStories(prev => prev.map(s => s.id === id ? { ...s, approved: true } : s))
    })
  }
  const handleDeleteStory = (id: string) => {
    setActionError('')
    startTransition(async () => {
      const r = await deleteStory(id)
      if (r.error) setActionError(r.error)
      else setStories(prev => prev.filter(s => s.id !== id))
    })
  }

  const cardCls = `rounded-2xl p-5 ${isDark ? 'border border-white/7' : 'bg-white border border-gray-200'}`
  const cardStyle = isDark ? { background: 'rgba(255,255,255,0.03)' } : {}

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Motivatsiya boshqaruvi</h1>
        <p className={`text-sm mt-1 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>Kunlik iqtiboslar va muvaffaqiyat hikoyalari</p>
      </div>

      {/* Tabs */}
      <div className={`flex gap-1 p-1 rounded-xl ${isDark ? 'border border-white/7' : 'bg-gray-100 border border-gray-200'}`}
        style={isDark ? { background: 'rgba(255,255,255,0.04)' } : {}}>
        {[
          { key: 'quotes' as const, label: 'Kunlik iqtiboslar', icon: Quote, count: quotes.length },
          { key: 'stories' as const, label: 'Muvaffaqiyat hikoyalari', icon: BookHeart, count: stories.length },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === tab.key
                ? 'bg-purple-600 text-white shadow-lg'
                : isDark ? 'text-white/40 hover:text-white' : 'text-gray-500 hover:text-gray-900'
            }`}>
            <tab.icon className="h-4 w-4" />
            {tab.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              activeTab === tab.key ? 'bg-white/20' : isDark ? 'bg-white/5' : 'bg-gray-200'
            }`}>{tab.count}</span>
          </button>
        ))}
      </div>

      {actionError && <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{actionError}</div>}

      <AnimatePresence mode="wait">
        {activeTab === 'quotes' && (
          <motion.div key="quotes" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
            <div className={cardCls} style={cardStyle}>
              <div className="flex items-center gap-2 mb-4">
                <Plus className="h-4 w-4 text-purple-400" />
                <h2 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Yangi iqtibos qo&apos;shish</h2>
              </div>
              <AddQuoteForm onAdd={q => setQuotes(prev => [q, ...prev])} isDark={isDark} />
            </div>

            {quotes.length === 0 && (
              <div className="rounded-2xl p-5 flex items-start gap-3"
                style={isDark ? { background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.15)' } : { background: '#f5f3ff', border: '1px solid #ddd6fe' }}>
                <Info className="h-4 w-4 text-purple-400 flex-shrink-0 mt-0.5" />
                <p className={`text-sm ${isDark ? 'text-white/60' : 'text-purple-700'}`}>Hali iqtiboslar qo&apos;shilmagan.</p>
              </div>
            )}

            <div className="space-y-2">
              {quotes.map((quote, i) => (
                <motion.div key={quote.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: i * 0.04 }}
                  className={`flex items-start gap-4 p-4 rounded-xl group ${isDark ? 'border border-white/6' : 'bg-white border border-gray-200'}`}
                  style={isDark ? { background: 'rgba(255,255,255,0.03)' } : {}}>
                  <Sparkles className="h-4 w-4 text-purple-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm italic leading-relaxed ${isDark ? 'text-white/80' : 'text-gray-700'}`}>&ldquo;{quote.text}&rdquo;</p>
                    <p className={`text-xs mt-1.5 ${isDark ? 'text-white/40' : 'text-gray-400'}`}>— {quote.author}</p>
                  </div>
                  <button onClick={() => handleDeleteQuote(quote.id)} disabled={isPending}
                    className={`p-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100 hover:text-red-400 hover:bg-red-500/10 flex-shrink-0 ${isDark ? 'text-white/20' : 'text-gray-300'}`}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'stories' && (
          <motion.div key="stories" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
            {stories.length === 0 && (
              <div className="rounded-2xl p-5 flex items-start gap-3"
                style={isDark ? { background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.15)' } : { background: '#f5f3ff', border: '1px solid #ddd6fe' }}>
                <Info className="h-4 w-4 text-purple-400 flex-shrink-0 mt-0.5" />
                <p className={`text-sm ${isDark ? 'text-white/60' : 'text-purple-700'}`}>Hali tasdiqlash uchun hikoyalar yo&apos;q.</p>
              </div>
            )}
            {stories.map((story, i) => (
              <motion.div key={story.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className={cardCls} style={cardStyle}>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="min-w-0">
                    <h3 className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{story.title}</h3>
                    <p className={`text-xs mt-0.5 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>{story.author_name}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {story.approved ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                        <Check className="h-3 w-3" />Tasdiqlangan
                      </span>
                    ) : (
                      <button onClick={() => handleApproveStory(story.id)} disabled={isPending}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/20 transition-all disabled:opacity-50">
                        {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}Tasdiqlash
                      </button>
                    )}
                    <button onClick={() => handleDeleteStory(story.id)} disabled={isPending}
                      className={`p-1.5 rounded-lg transition-all disabled:opacity-50 hover:text-red-400 hover:bg-red-500/10 ${isDark ? 'text-white/20' : 'text-gray-300'}`}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <p className={`text-sm line-clamp-3 leading-relaxed ${isDark ? 'text-white/50' : 'text-gray-600'}`}>{story.content}</p>
                <p className={`text-xs mt-3 ${isDark ? 'text-white/25' : 'text-gray-400'}`}>
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
