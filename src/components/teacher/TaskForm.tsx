'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ClipboardList, Loader2, Calendar, FileText } from 'lucide-react'

export interface TaskFormData {
  title: string
  description: string
  deadline: string
  file_requirements: string
  max_grade: number
}

interface Props {
  open: boolean
  onClose: () => void
  onSubmit: (data: TaskFormData) => Promise<void>
  initial?: Partial<TaskFormData>
  mode?: 'create' | 'edit'
}

export default function TaskForm({ open, onClose, onSubmit, initial, mode = 'create' }: Props) {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 7)
  const defaultDeadline = tomorrow.toISOString().split('T')[0]

  const [form, setForm] = useState<TaskFormData>({
    title: '', description: '', deadline: defaultDeadline,
    file_requirements: 'PDF, DOC, ZIP — max 50MB', max_grade: 100,
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (open) {
      setForm({
        title: initial?.title ?? '',
        description: initial?.description ?? '',
        deadline: initial?.deadline ?? defaultDeadline,
        file_requirements: initial?.file_requirements ?? 'PDF, DOC, ZIP — max 50MB',
        max_grade: initial?.max_grade ?? 100,
      })
      setErrors({})
    }
  }, [open, initial])

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.title.trim()) e.title = "Topshiriq nomi kiritilishi shart"
    if (!form.description.trim()) e.description = "Tavsif kiritilishi shart"
    if (!form.deadline) e.deadline = "Muddat kiritilishi shart"
    return e
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try { await onSubmit(form) } finally { setLoading(false) }
  }

  const set = (key: keyof TaskFormData) => (val: string | number) => {
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
                  <div className="bg-amber-500/15 p-2 rounded-lg">
                    <ClipboardList className="h-4 w-4 text-amber-400" />
                  </div>
                  <h2 className="text-white font-semibold">
                    {mode === 'create' ? 'Yangi topshiriq' : 'Topshiriqni tahrirlash'}
                  </h2>
                </div>
                <button onClick={onClose} className="text-white/30 hover:text-white transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Topshiriq nomi */}
                <div>
                  <label className="text-white/60 text-xs font-medium mb-1.5 block">Topshiriq nomi *</label>
                  <input value={form.title} onChange={e => set('title')(e.target.value)}
                    placeholder="Masalan: Figmada mobile mockup yarating"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/20 outline-none focus:border-amber-500/50 transition-colors" />
                  {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
                </div>

                {/* Tavsif */}
                <div>
                  <label className="text-white/60 text-xs font-medium mb-1.5 block">Tavsif *</label>
                  <textarea value={form.description} onChange={e => set('description')(e.target.value)}
                    placeholder="Topshiriq shartlari, ko'rsatmalar va talablar..."
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/20 outline-none focus:border-amber-500/50 transition-colors resize-none" />
                  {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description}</p>}
                </div>

                {/* Deadline va Max baho */}
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-white/60 text-xs font-medium mb-1.5 flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Muddat *
                    </label>
                    <input type="date" value={form.deadline}
                      onChange={e => set('deadline')(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-amber-500/50 transition-colors [color-scheme:dark]" />
                    {errors.deadline && <p className="text-red-400 text-xs mt-1">{errors.deadline}</p>}
                  </div>
                  <div className="w-28">
                    <label className="text-white/60 text-xs font-medium mb-1.5 block">Maks. baho</label>
                    <input type="number" min={10} max={100} step={5} value={form.max_grade}
                      onChange={e => set('max_grade')(Number(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-amber-500/50 transition-colors" />
                  </div>
                </div>

                {/* Fayl talablari */}
                <div>
                  <label className="text-white/60 text-xs font-medium mb-1.5 flex items-center gap-1">
                    <FileText className="h-3 w-3" /> Fayl talablari
                  </label>
                  <input value={form.file_requirements}
                    onChange={e => set('file_requirements')(e.target.value)}
                    placeholder="PDF, DOC, ZIP — max 50MB"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/20 outline-none focus:border-amber-500/50 transition-colors" />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={onClose}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white transition-all"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    Bekor qilish
                  </button>
                  <button type="submit" disabled={loading}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-amber-600 hover:bg-amber-500 disabled:opacity-60 transition-all flex items-center justify-center gap-2">
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
