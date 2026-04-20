'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  BookOpen, Save, Trash2, Loader2, ArrowLeft,
  Image, Link as LinkIcon, Tag, BarChart2, Globe,
} from 'lucide-react'
import { createCourse, updateCourse, deleteCourse } from '../actions'

const CATEGORIES = [
  'Web Development', 'Graphic Design', 'Content Writing',
  'SMM', 'Virtual Assistant', 'Dasturlash', 'Marketing', 'Boshqa',
]
const LEVELS = ["Boshlang'ich", "O'rta", 'Yuqori']
const EMOJIS = ['📚', '🚀', '🎨', '✍️', '📱', '💻', '📊', '🎯', '💡', '🌐', '📸', '🎬']

interface FormData {
  title: string
  description: string
  full_description: string
  category: string
  level: string
  emoji: string
  image_url: string
  preview_video_url: string
  is_published: boolean
}

interface Props {
  mode: 'create' | 'edit'
  courseId?: string
  initial?: FormData
}

export default function CourseFormClient({ mode, courseId, initial }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isDeleting, startDeleting] = useTransition()
  const [error, setError] = useState('')
  const [form, setForm] = useState<FormData>(initial ?? {
    title: '', description: '', full_description: '',
    category: CATEGORIES[0], level: LEVELS[0],
    emoji: '📚', image_url: '', preview_video_url: '',
    is_published: false,
  })

  const set = <K extends keyof FormData>(key: K) => (val: FormData[K]) =>
    setForm(prev => ({ ...prev, [key]: val }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    startTransition(async () => {
      const result = mode === 'create'
        ? await createCourse(form)
        : await updateCourse(courseId!, form)
      if (result.error) { setError(result.error); return }
      router.push('/teacher/courses')
    })
  }

  const handleDelete = () => {
    if (!courseId) return
    setError('')
    startDeleting(async () => {
      const result = await deleteCourse(courseId)
      if (result.error) { setError(result.error); return }
      router.push('/teacher/courses')
    })
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Sarlavha */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">
            {mode === 'create' ? 'Yangi kurs yaratish' : 'Kursni tahrirlash'}
          </h1>
          <p className="text-white/40 text-sm mt-0.5">
            {mode === 'create' ? 'Yangi kurs ma\'lumotlarini kiriting' : 'Kurs ma\'lumotlarini yangilang'}
          </p>
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Asosiy ma'lumotlar */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-5 space-y-4"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <h2 className="text-white text-sm font-semibold flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-emerald-400" /> Asosiy ma&apos;lumotlar
          </h2>

          {/* Emoji tanlash */}
          <div>
            <label className="text-white/50 text-xs mb-2 block">Kurs ikonkasi</label>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map(em => (
                <button key={em} type="button" onClick={() => set('emoji')(em)}
                  className={`h-9 w-9 rounded-xl text-xl transition-all ${form.emoji === em ? 'bg-emerald-500/20 ring-2 ring-emerald-500/50' : 'bg-white/5 hover:bg-white/10'}`}>
                  {em}
                </button>
              ))}
            </div>
          </div>

          {/* Kurs nomi */}
          <div>
            <label className="text-white/50 text-xs mb-1.5 block">Kurs nomi *</label>
            <input type="text" value={form.title} onChange={e => set('title')(e.target.value)}
              placeholder="Masalan: Web dizayn asoslari"
              className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/25 outline-none focus:ring-1 focus:ring-emerald-500/50"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }} />
          </div>

          {/* Qisqa tavsif */}
          <div>
            <label className="text-white/50 text-xs mb-1.5 block">Qisqa tavsif * (200 belgi)</label>
            <textarea value={form.description} onChange={e => set('description')(e.target.value)}
              placeholder="Kurs haqida qisqa ma'lumot..." rows={2} maxLength={200}
              className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/25 outline-none focus:ring-1 focus:ring-emerald-500/50 resize-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }} />
            <p className="text-white/20 text-xs mt-1 text-right">{form.description.length}/200</p>
          </div>

          {/* To'liq tavsif */}
          <div>
            <label className="text-white/50 text-xs mb-1.5 block">To&apos;liq tavsif</label>
            <textarea value={form.full_description} onChange={e => set('full_description')(e.target.value)}
              placeholder="Kurs haqida batafsil ma'lumot, nima o'rganiladi, kimlar uchun..." rows={5}
              className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/25 outline-none focus:ring-1 focus:ring-emerald-500/50 resize-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }} />
          </div>

          {/* Kategoriya va daraja */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-white/50 text-xs mb-1.5 flex items-center gap-1">
                <Tag className="h-3 w-3" /> Kategoriya *
              </label>
              <select value={form.category} onChange={e => set('category')(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none appearance-none focus:ring-1 focus:ring-emerald-500/50"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                {CATEGORIES.map(c => <option key={c} value={c} className="bg-[#0d1220]">{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-white/50 text-xs mb-1.5 flex items-center gap-1">
                <BarChart2 className="h-3 w-3" /> Daraja
              </label>
              <select value={form.level} onChange={e => set('level')(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none appearance-none focus:ring-1 focus:ring-emerald-500/50"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                {LEVELS.map(l => <option key={l} value={l} className="bg-[#0d1220]">{l}</option>)}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Media */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.07 }}
          className="rounded-2xl p-5 space-y-4"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <h2 className="text-white text-sm font-semibold flex items-center gap-2">
            <Image className="h-4 w-4 text-blue-400" /> Media
          </h2>
          <div>
            <label className="text-white/50 text-xs mb-1.5 flex items-center gap-1">
              <Image className="h-3 w-3" /> Kurs rasmi URL (ixtiyoriy)
            </label>
            <input type="url" value={form.image_url} onChange={e => set('image_url')(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/25 outline-none focus:ring-1 focus:ring-blue-500/50"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }} />
          </div>
          <div>
            <label className="text-white/50 text-xs mb-1.5 flex items-center gap-1">
              <LinkIcon className="h-3 w-3" /> Preview video URL (YouTube/Vimeo, ixtiyoriy)
            </label>
            <input type="url" value={form.preview_video_url} onChange={e => set('preview_video_url')(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/25 outline-none focus:ring-1 focus:ring-blue-500/50"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }} />
          </div>
        </motion.div>

        {/* Nashr sozlamalari */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
          className="rounded-2xl p-5"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <h2 className="text-white text-sm font-semibold flex items-center gap-2 mb-4">
            <Globe className="h-4 w-4 text-purple-400" /> Nashr sozlamalari
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-sm">Kursni nashr etish</p>
              <p className="text-white/35 text-xs mt-0.5">
                {form.is_published ? 'Admin tekshirgandan so\'ng ko\'rinadi' : 'Hozircha qoralama sifatida saqlanadi'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => set('is_published')(!form.is_published)}
              className={`relative h-6 w-11 rounded-full transition-colors ${form.is_published ? 'bg-emerald-500' : 'bg-white/15'}`}
            >
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${form.is_published ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </motion.div>

        {/* Tugmalar */}
        <div className="flex gap-3">
          <button type="button" onClick={() => router.back()}
            className="flex-1 py-3 rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 transition-all border border-white/5">
            Bekor qilish
          </button>
          <button type="submit" disabled={isPending}
            className="flex-1 py-3 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
            style={{ background: 'linear-gradient(135deg, rgba(5,150,105,0.9), rgba(4,120,87,0.9))' }}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {mode === 'create' ? 'Kurs yaratish' : "O'zgarishlarni saqlash"}
          </button>
        </div>

        {/* O'chirish (faqat edit rejimida) */}
        {mode === 'edit' && (
          <button type="button" onClick={handleDelete} disabled={isDeleting}
            className="w-full py-3 rounded-xl text-sm font-medium text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-all border border-red-500/10 flex items-center justify-center gap-2">
            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            Kursni o&apos;chirish
          </button>
        )}
      </form>
    </div>
  )
}
