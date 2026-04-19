'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, PlayCircle, Loader2, Hash, AlignLeft } from 'lucide-react'

export interface LessonFormData {
  title: string
  video_url: string
  content: string
  order: number
}

interface Props {
  open: boolean
  onClose: () => void
  onSubmit: (data: LessonFormData) => Promise<void>
  initial?: Partial<LessonFormData>
  defaultOrder?: number
  mode?: 'create' | 'edit'
}

export default function LessonForm({ open, onClose, onSubmit, initial, defaultOrder = 1, mode = 'create' }: Props) {
  const [form, setForm] = useState<LessonFormData>({
    title: '', video_url: '', content: '', order: defaultOrder,
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (open) {
      setForm({
        title: initial?.title ?? '',
        video_url: initial?.video_url ?? '',
        content: initial?.content ?? '',
        order: initial?.order ?? defaultOrder,
      })
      setErrors({})
    }
  }, [open, initial, defaultOrder])

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.title.trim()) e.title = "Dars nomi kiritilishi shart"
    if (form.video_url && !form.video_url.startsWith('http')) e.video_url = "To'g'ri URL kiriting"
    return e
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try { await onSubmit(form) } finally { setLoading(false) }
  }

  const set = (key: keyof LessonFormData) => (val: string | number) => {
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
                  <div className="bg-blue-500/15 p-2 rounded-lg">
                    <PlayCircle className="h-4 w-4 text-blue-400" />
                  </div>
                  <h2 className="text-white font-semibold">
                    {mode === 'create' ? 'Yangi dars qo\'shish' : 'Darsni tahrirlash'}
                  </h2>
                </div>
                <button onClick={onClose} className="text-white/30 hover:text-white transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Tartib raqami va Dars nomi */}
                <div className="flex gap-3">
                  <div className="w-24">
                    <label className="text-white/60 text-xs font-medium mb-1.5 flex items-center gap-1">
                      <Hash className="h-3 w-3" /> Tartib
                    </label>
                    <input type="number" min={1} value={form.order}
                      onChange={e => set('order')(Number(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-blue-500/50 transition-colors" />
                  </div>
                  <div className="flex-1">
                    <label className="text-white/60 text-xs font-medium mb-1.5 block">Dars nomi *</label>
                    <input value={form.title} onChange={e => set('title')(e.target.value)}
                      placeholder="Masalan: Figmaga kirish"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/20 outline-none focus:border-blue-500/50 transition-colors" />
                    {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
                  </div>
                </div>

                {/* Video URL */}
                <div>
                  <label className="text-white/60 text-xs font-medium mb-1.5 block">
                    Video URL (YouTube / Vimeo)
                  </label>
                  <input value={form.video_url} onChange={e => set('video_url')(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/20 outline-none focus:border-blue-500/50 transition-colors" />
                  {errors.video_url && <p className="text-red-400 text-xs mt-1">{errors.video_url}</p>}
                  {form.video_url && !errors.video_url && (
                    <p className="text-emerald-400/70 text-xs mt-1 flex items-center gap-1">
                      <PlayCircle className="h-3 w-3" /> Video URL qabul qilindi
                    </p>
                  )}
                </div>

                {/* Matn kontenti */}
                <div>
                  <label className="text-white/60 text-xs font-medium mb-1.5 flex items-center gap-1">
                    <AlignLeft className="h-3 w-3" /> Matn kontenti
                  </label>
                  <textarea value={form.content} onChange={e => set('content')(e.target.value)}
                    placeholder="Dars haqida batafsil ma'lumot, qo'shimcha izohlar..."
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/20 outline-none focus:border-blue-500/50 transition-colors resize-none" />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={onClose}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white transition-all"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    Bekor qilish
                  </button>
                  <button type="submit" disabled={loading}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-60 transition-all flex items-center justify-center gap-2">
                    {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    {mode === 'create' ? 'Qo\'shish' : 'Saqlash'}
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
