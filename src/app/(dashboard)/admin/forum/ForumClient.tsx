'use client'

import { useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquare, Trash2, AlertOctagon, Search, ThumbsUp,
  ThumbsDown, MessageCircle, AlertTriangle, X, Loader2, ChevronDown,
} from 'lucide-react'
import { deleteForumPost, markPostAsSpam } from '../actions'
import { useMountedTheme } from '@/hooks/useTheme'

interface Post {
  id: string; title: string; content: string; category: string
  author_name: string; author_avatar: string; likes: number
  dislikes: number; comment_count: number; created_at: string
}

const CATEGORY_COLORS: Record<string, string> = {
  Savol: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  Muhokama: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
  Yangilik: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  Tavsiya: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  Yordam: 'bg-pink-500/15 text-pink-400 border-pink-500/20',
  Spam: 'bg-red-500/15 text-red-400 border-red-500/20',
}

function ConfirmModal({ post, action, onClose, onConfirm, loading, isDark }: {
  post: Post; action: 'delete' | 'spam'; onClose: () => void
  onConfirm: () => void; loading: boolean; isDark: boolean
}) {
  const isDelete = action === 'delete'
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}>
      <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className={`rounded-2xl p-6 w-full max-w-sm ${isDark ? 'border border-white/10' : 'border border-gray-200 shadow-xl'}`}
        style={{ background: isDark ? '#10141f' : '#ffffff' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${isDelete ? 'bg-red-500/10' : 'bg-amber-500/10'}`}>
              <AlertTriangle className={`h-5 w-5 ${isDelete ? 'text-red-400' : 'text-amber-400'}`} />
            </div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {isDelete ? "Postni o'chirish" : 'Spam belgilash'}
            </h3>
          </div>
          <button onClick={onClose} className={isDark ? 'text-white/30 hover:text-white' : 'text-gray-400 hover:text-gray-600'}>
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className={`text-sm mb-2 ${isDark ? 'text-white/50' : 'text-gray-600'}`}>
          {isDelete ? "Ushbu postni o'chirishni tasdiqlaysizmi?" : 'Ushbu postni spam deb belgilaysizmi?'}
        </p>
        <p className={`text-sm font-medium mb-6 line-clamp-2 ${isDark ? 'text-white/70' : 'text-gray-800'}`}>&ldquo;{post.title}&rdquo;</p>
        <div className="flex gap-3">
          <button onClick={onClose}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
              isDark ? 'text-white/50 hover:text-white hover:bg-white/5 border-white/5' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-gray-200'
            }`}>Bekor qilish</button>
          <button onClick={onConfirm} disabled={loading}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${
              isDelete ? 'bg-red-500/80 hover:bg-red-500' : 'bg-amber-500/80 hover:bg-amber-500'
            }`}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : isDelete ? <Trash2 className="h-4 w-4" /> : <AlertOctagon className="h-4 w-4" />}
            {isDelete ? "O'chirish" : 'Spam belgilash'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function ForumClient({ posts: initialPosts, error }: { posts: Post[]; error?: string }) {
  const { isDark } = useMountedTheme()
  const [posts, setPosts] = useState(initialPosts)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [modal, setModal] = useState<{ post: Post; action: 'delete' | 'spam' } | null>(null)
  const [actionError, setActionError] = useState('')
  const [isPending, startTransition] = useTransition()

  const categories = ['all', ...Array.from(new Set(initialPosts.map(p => p.category)))]
  const filtered = posts.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.author_name.toLowerCase().includes(search.toLowerCase())
    return matchSearch && (categoryFilter === 'all' || p.category === categoryFilter)
  })

  const handleAction = (action: 'delete' | 'spam') => {
    if (!modal) return
    const postId = modal.post.id
    setActionError('')
    startTransition(async () => {
      const result = action === 'delete' ? await deleteForumPost(postId) : await markPostAsSpam(postId)
      if (result.error) { setActionError(result.error) }
      else if (action === 'delete') { setPosts(prev => prev.filter(p => p.id !== postId)); setModal(null) }
      else { setPosts(prev => prev.map(p => p.id === postId ? { ...p, category: 'Spam' } : p)); setModal(null) }
    })
  }

  const inputStyle = isDark ? { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' } : {}
  const inputCls = `py-2.5 rounded-xl text-sm outline-none focus:ring-1 focus:ring-purple-500/50 transition-colors ${
    isDark ? 'text-white placeholder-white/30' : 'bg-white border border-gray-200 text-gray-900 placeholder-gray-400'
  }`

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Forum moderatsiyasi</h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>Barcha forum postlarini boshqarish</p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm ${isDark ? 'bg-amber-500/8 border border-amber-500/15' : 'bg-amber-50 border border-amber-200'}`}>
          <MessageSquare className="h-4 w-4 text-amber-400" />
          <span className="text-amber-500 font-semibold">{posts.length}</span>
          <span className={isDark ? 'text-white/40' : 'text-gray-500'}>ta post</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isDark ? 'text-white/30' : 'text-gray-400'}`} />
          <input type="text" placeholder="Sarlavha yoki muallif bo'yicha qidirish..." value={search}
            onChange={e => setSearch(e.target.value)} style={inputStyle}
            className={`w-full pl-9 pr-4 ${inputCls}`} />
        </div>
        <div className="relative">
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} style={inputStyle}
            className={`pl-4 pr-8 ${inputCls} appearance-none cursor-pointer`}>
            <option value="all" className={isDark ? 'bg-[#10141f]' : 'bg-white'}>Barcha kategoriyalar</option>
            {categories.filter(c => c !== 'all').map(c => (
              <option key={c} value={c} className={isDark ? 'bg-[#10141f]' : 'bg-white'}>{c}</option>
            ))}
          </select>
          <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none ${isDark ? 'text-white/30' : 'text-gray-400'}`} />
        </div>
      </div>

      {(error || actionError) && (
        <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error || actionError}</div>
      )}

      <div className={`rounded-2xl overflow-hidden ${isDark ? 'border border-white/7' : 'border border-gray-200'}`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={isDark
                ? { background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }
                : { background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                {[['Post', ''], ['Muallif', 'hidden sm:table-cell'], ['Kategoriya', ''], ['Statistika', 'hidden lg:table-cell'], ['Sana', 'hidden md:table-cell'], ['Amallar', 'text-right']].map(([h, cls]) => (
                  <th key={h} className={`text-xs font-medium px-4 py-3 text-left ${cls} ${isDark ? 'text-white/40' : 'text-gray-500'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className={`text-center py-12 text-sm ${isDark ? 'text-white/30' : 'text-gray-400'}`}>Postlar topilmadi</td></tr>
              ) : filtered.map((post, i) => (
                <motion.tr key={post.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: i * 0.03 }}
                  className={`transition-colors ${isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-gray-50'}`}
                  style={isDark ? { borderBottom: '1px solid rgba(255,255,255,0.04)' } : { borderBottom: '1px solid #f3f4f6' }}>
                  <td className="px-4 py-3.5">
                    <p className={`text-sm font-medium truncate max-w-[200px] ${isDark ? 'text-white' : 'text-gray-900'}`}>{post.title}</p>
                    <p className={`text-xs truncate max-w-[200px] mt-0.5 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>{post.content}</p>
                  </td>
                  <td className="px-4 py-3.5 hidden sm:table-cell">
                    <span className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>{post.author_name}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${CATEGORY_COLORS[post.category] ?? (isDark ? 'bg-white/5 text-white/40 border-white/10' : 'bg-gray-100 text-gray-500 border-gray-200')}`}>
                      {post.category}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 hidden lg:table-cell">
                    <div className={`flex items-center gap-3 text-xs ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                      <span className="flex items-center gap-1"><ThumbsUp className="h-3 w-3 text-emerald-400" />{post.likes}</span>
                      <span className="flex items-center gap-1"><ThumbsDown className="h-3 w-3 text-red-400" />{post.dislikes}</span>
                      <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3 text-blue-400" />{post.comment_count}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 hidden md:table-cell">
                    <span className={`text-sm ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                      {new Date(post.created_at).toLocaleDateString('uz-UZ', { month: 'short', day: 'numeric' })}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      {post.category !== 'Spam' && (
                        <button onClick={() => setModal({ post, action: 'spam' })} title="Spam belgilash"
                          className={`p-1.5 rounded-lg transition-all hover:text-amber-400 hover:bg-amber-500/10 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                          <AlertOctagon className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button onClick={() => setModal({ post, action: 'delete' })} title="O'chirish"
                        className={`p-1.5 rounded-lg transition-all hover:text-red-400 hover:bg-red-500/10 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3" style={isDark ? { background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)' } : { background: '#f9fafb', borderTop: '1px solid #e5e7eb' }}>
          <span className={`text-xs ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
            Jami: <span className={`font-medium ${isDark ? 'text-white/50' : 'text-gray-600'}`}>{filtered.length}</span> ta post
          </span>
        </div>
      </div>

      <AnimatePresence>
        {modal && (
          <ConfirmModal post={modal.post} action={modal.action} isDark={isDark}
            onClose={() => setModal(null)} onConfirm={() => handleAction(modal.action)} loading={isPending} />
        )}
      </AnimatePresence>
    </div>
  )
}
