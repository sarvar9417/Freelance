'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, BookOpen, Loader2 } from 'lucide-react'

const CATEGORIES = ["Boshlang'ich", "O'rta", 'Yuqori', 'Freelancing', 'Dizayn', 'Marketing', 'Dasturlash', 'Copywriting']
const EMOJIS = ['🚀', '🎨', '✍️', '📱', '💻', '📊', '🎯', '💡', '🌐', '📸', '🎬', '🏆']

export interface CourseFormData {
  title: string
  description: string
  category: string
  emoji: string
}

interface Props {
  open: boolean
  onClose: () => void
  onSubmit: (data: CourseFormData) => Promise<void>
  initial?: Partial<CourseFormData>
  mode?: 'create' | 'edit'
}

export default function CourseForm({ open, onClose, onSubmit, initial, mode = 'create' }: Props) {
  const [form, setForm] = useState<CourseFormData>({
    title: '', description: '', category: CATEGORIES[0], emoji: EMOJIS[0],
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (open) {
      setForm({
        title: initial?.title ?? '',
        description: initial?.description ?? '',
        category: initial?.category ?? CATEGORIES[0],
        emoji: initial?.emoji ?? EMOJIS[0],
      })
      setErrors({})
    }
  }, [open, initial])

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.title.trim()) e.title = "Kurs nomi kiritilishi shart"
    if (!form.description.trim()) e.description = "Tavsif kiritilishi shart"
    return e
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try { await onSubmit(form) } finally { setLoading(false) }
  }

  const set = (key: keyof CourseFormData) => (val: string) => {
    setForm(f => ({ ...f, [key]: val }))
    setErrors(v => ({ ...v, [key]: '' }))
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div key="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 backdrop-blur-sm" onClick={onClose} />

          <motion.div key="modal" initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">

            <div className="w-full max-w-lg rounded-2xl p-6 space-y-5 pointer-events-auto"
              style={{ background: '#0e1322', border: '1px solid rgba(255,255,255,0.1)' }}
              onClick={e => e.stopPropagation()}>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="bg-emerald-500/15 p-2 rounded-lg">
                    <BookOpen className="h-4 w-4 text-emerald-400" />
                  </div>
                  <h2 className="text-white font-semibold">
                    {mode === 'create' ? 'Yangi kurs yaratish' : 'Kursni tahrirlash'}
                  </h2>
                </div>
                <button onClick={onClose} className="text-white/30 hover:text-white transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Kurs nomi */}
                <div>
                  <label className="text-white/60 text-xs font-medium mb-1.5 block">Kurs nomi *</label>
                  <input value={form.title} onChange={e => set('title')(e.target.value)}
                    placeholder="Masalan: Figma bilan UI Dizayn"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/20 outline-none focus:border-emerald-500/50 transition-colors" />
                  {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
                </div>

                {/* Tavsif */}
                <div>
                  <label className="text-white/60 text-xs font-medium mb-1.5 block">Tavsif *</label>
                  <textarea value={form.description} onChange={e => set('description')(e.target.value)}
                    placeholder="Kurs haqida qisqacha ma'lumot..."
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/20 outline-none focus:border-emerald-500/50 transition-colors resize-none" />
                  {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description}</p>}
                </div>

                {/* Kategoriya */}
                <div>
                  <label className="text-white/60 text-xs font-medium mb-1.5 block">Kategoriya</label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(cat => (
                      <button key={cat} type="button" onClick={() => set('category')(cat)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          form.category === cat
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white/5 text-white/40 hover:text-white hover:bg-white/10'
                        }`}>
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Emoji */}
                <div>
                  <label className="text-white/60 text-xs font-medium mb-1.5 block">Kurs belgisi</label>
                  <div className="flex flex-wrap gap-2">
                    {EMOJIS.map(emoji => (
                      <button key={emoji} type="button" onClick={() => set('emoji')(emoji)}
                        className={`h-9 w-9 text-xl rounded-lg transition-all ${
                          form.emoji === emoji
                            ? 'bg-emerald-600/30 border-2 border-emerald-500'
                            : 'bg-white/5 hover:bg-white/10 border-2 border-transparent'
                        }`}>
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={onClose}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white transition-all"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    Bekor qilish
                  </button>
                  <button type="submit" disabled={loading}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 transition-all flex items-center justify-center gap-2">
                    {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    {mode === 'create' ? 'Yaratish' : 'Saqlash'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
