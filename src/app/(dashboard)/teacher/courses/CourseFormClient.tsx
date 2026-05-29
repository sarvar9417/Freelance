'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  BookOpen, Save, Trash2, Loader2, ArrowLeft,
  Image, Link as LinkIcon, Tag, BarChart2, Globe,
} from 'lucide-react'
import { createCourse, updateCourse, deleteCourse } from '../actions'
import { useMountedTheme } from '@/hooks/useTheme'
import type { Methodology } from '@/types'
import { METHODOLOGY_LABELS } from '@/types'

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
  methodologies: string[]
  is_published: boolean
}

interface Props {
  mode: 'create' | 'edit'
  courseId?: string
  initial?: FormData
}

export default function CourseFormClient({ mode, courseId, initial }: Props) {
  const { isDark } = useMountedTheme()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isDeleting, startDeleting] = useTransition()
  const [error, setError] = useState('')
  const [form, setForm] = useState<FormData>(initial ?? {
    title: '', description: '', full_description: '',
    category: CATEGORIES[0], level: LEVELS[0],
    emoji: '📚', image_url: '', preview_video_url: '',
    methodologies: [],
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
        <button onClick={() => router.back()} className={`p-2 rounded-xl transition-all ${isDark ? 'text-white/40 hover:text-white hover:bg-white/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}>
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {mode === 'create' ? 'Yangi kurs yaratish' : 'Kursni tahrirlash'}
          </h1>
          <p className={`text-sm mt-0.5 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
            {mode === 'create' ? "Yangi kurs ma'lumotlarini kiriting" : "Kurs ma'lumotlarini yangilang"}
          </p>
        </div>
      </div>

      {error && (
        <div className={`px-4 py-3 rounded-xl text-sm ${isDark ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-red-50 border border-red-200 text-red-600'}`}>{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Asosiy ma'lumotlar */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl p-5 space-y-4 ${isDark ? '' : 'bg-gray-50 border border-gray-200'}`}
          style={isDark ? { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' } : {}}
        >
          <h2 className={`text-sm font-semibold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <BookOpen className="h-4 w-4 text-emerald-400" /> Asosiy ma&apos;lumotlar
          </h2>

          {/* Emoji tanlash */}
          <div>
            <label className={`text-xs mb-2 block ${isDark ? 'text-white/50' : 'text-gray-600'}`}>Kurs ikonkasi</label>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map(em => (
                <button key={em} type="button" onClick={() => set('emoji')(em)}
                  className={`h-9 w-9 rounded-xl text-xl transition-all ${form.emoji === em ? 'bg-emerald-500/20 ring-2 ring-emerald-500/50' : isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200'}`}>
                  {em}
                </button>
              ))}
            </div>
          </div>

          {/* Kurs nomi */}
          <div>
            <label className={`text-xs mb-1.5 block ${isDark ? 'text-white/50' : 'text-gray-600'}`}>Kurs nomi *</label>
            <input type="text" value={form.title} onChange={e => set('title')(e.target.value)}
              placeholder="Masalan: Web dizayn asoslari"
              className={`w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-1 focus:ring-emerald-500/50 ${isDark ? 'text-white placeholder-white/25' : 'text-gray-900 placeholder-gray-400'}`}
              style={isDark ? { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' } : { background: 'white', border: '1px solid #e5e7eb' }} />
          </div>

          {/* Qisqa tavsif */}
          <div>
            <label className={`text-xs mb-1.5 block ${isDark ? 'text-white/50' : 'text-gray-600'}`}>Qisqa tavsif * (200 belgi)</label>
            <textarea value={form.description} onChange={e => set('description')(e.target.value)}
              placeholder="Kurs haqida qisqa ma'lumot..." rows={2} maxLength={200}
              className={`w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-1 focus:ring-emerald-500/50 resize-none ${isDark ? 'text-white placeholder-white/25' : 'text-gray-900 placeholder-gray-400'}`}
              style={isDark ? { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' } : { background: 'white', border: '1px solid #e5e7eb' }} />
            <p className={`text-xs mt-1 text-right ${isDark ? 'text-white/20' : 'text-gray-400'}`}>{form.description.length}/200</p>
          </div>

          {/* To'liq tavsif */}
          <div>
            <label className={`text-xs mb-1.5 block ${isDark ? 'text-white/50' : 'text-gray-600'}`}>To&apos;liq tavsif</label>
            <textarea value={form.full_description} onChange={e => set('full_description')(e.target.value)}
              placeholder="Kurs haqida batafsil ma'lumot, nima o'rganiladi, kimlar uchun..." rows={5}
              className={`w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-1 focus:ring-emerald-500/50 resize-none ${isDark ? 'text-white placeholder-white/25' : 'text-gray-900 placeholder-gray-400'}`}
              style={isDark ? { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' } : { background: 'white', border: '1px solid #e5e7eb' }} />
          </div>

          {/* Kategoriya va daraja */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`text-xs mb-1.5 flex items-center gap-1 ${isDark ? 'text-white/50' : 'text-gray-600'}`}>
                <Tag className="h-3 w-3" /> Kategoriya *
              </label>
              <select value={form.category} onChange={e => set('category')(e.target.value)}
                className={`w-full px-3 py-2.5 rounded-xl text-sm outline-none appearance-none focus:ring-1 focus:ring-emerald-500/50 ${isDark ? 'text-white' : 'text-gray-900'}`}
                style={isDark ? { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' } : { background: 'white', border: '1px solid #e5e7eb' }}>
                {CATEGORIES.map(c => <option key={c} value={c} className={isDark ? 'bg-[#0d1220]' : 'bg-white'}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={`text-xs mb-1.5 flex items-center gap-1 ${isDark ? 'text-white/50' : 'text-gray-600'}`}>
                <BarChart2 className="h-3 w-3" /> Daraja
              </label>
              <select value={form.level} onChange={e => set('level')(e.target.value)}
                className={`w-full px-3 py-2.5 rounded-xl text-sm outline-none appearance-none focus:ring-1 focus:ring-emerald-500/50 ${isDark ? 'text-white' : 'text-gray-900'}`}
                style={isDark ? { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' } : { background: 'white', border: '1px solid #e5e7eb' }}>
                {LEVELS.map(l => <option key={l} value={l} className={isDark ? 'bg-[#0d1220]' : 'bg-white'}>{l}</option>)}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Metodikalar */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className={`rounded-2xl p-5 space-y-3 ${isDark ? '' : 'bg-gray-50 border border-gray-200'}`}
          style={isDark ? { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' } : {}}
        >
          <h2 className={`text-sm font-semibold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <BookOpen className="h-4 w-4 text-cyan-400" /> Metodikalar (ixtiyoriy)
          </h2>
          <div className="flex flex-wrap gap-2">
            {(Object.entries(METHODOLOGY_LABELS) as [Methodology, typeof METHODOLOGY_LABELS[Methodology]][]).map(([key, m]) => {
              const selected = form.methodologies.includes(key)
              return (
                <button key={key} type="button" onClick={() => {
                  setForm(prev => ({
                    ...prev,
                    methodologies: selected
                      ? prev.methodologies.filter(k => k !== key)
                      : [...prev.methodologies, key],
                  }))
                }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                    selected
                      ? ''
                      : isDark ? 'text-white/30 border-white/10 hover:text-white/60' : 'text-gray-500 border-gray-200 hover:text-gray-900'
                  }`}
                  style={selected ? {
                    background: `${m.color.replace('text-', '').replace('-400', '')}30`,
                    borderColor: `${m.color.replace('text-', '').replace('-400', '')}60`,
                    color: m.color.replace('text-', ''),
                  } : { background: isDark ? 'rgba(255,255,255,0.04)' : 'white' }}>
                  <span>{m.icon}</span>
                  <span className="ml-1">{m.label}</span>
                </button>
              )
            })}
          </div>
          {form.methodologies.length > 0 && (
            <p className={`text-xs ${isDark ? 'text-white/20' : 'text-gray-400'}`}>Tanlangan metodikalar kurs kartasida ko&apos;rinadi</p>
          )}
        </motion.div>

        {/* Media */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className={`rounded-2xl p-5 space-y-4 ${isDark ? '' : 'bg-gray-50 border border-gray-200'}`}
          style={isDark ? { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' } : {}}
        >
          <h2 className={`text-sm font-semibold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Image className="h-4 w-4 text-blue-400" /> Media
          </h2>
          <div>
            <label className={`text-xs mb-1.5 flex items-center gap-1 ${isDark ? 'text-white/50' : 'text-gray-600'}`}>
              <Image className="h-3 w-3" /> Kurs rasmi URL (ixtiyoriy)
            </label>
            <input type="url" value={form.image_url} onChange={e => set('image_url')(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className={`w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-1 focus:ring-blue-500/50 ${isDark ? 'text-white placeholder-white/25' : 'text-gray-900 placeholder-gray-400'}`}
              style={isDark ? { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' } : { background: 'white', border: '1px solid #e5e7eb' }} />
          </div>
          <div>
            <label className={`text-xs mb-1.5 flex items-center gap-1 ${isDark ? 'text-white/50' : 'text-gray-600'}`}>
              <LinkIcon className="h-3 w-3" /> Preview video URL (YouTube/Vimeo, ixtiyoriy)
            </label>
            <input type="url" value={form.preview_video_url} onChange={e => set('preview_video_url')(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className={`w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-1 focus:ring-blue-500/50 ${isDark ? 'text-white placeholder-white/25' : 'text-gray-900 placeholder-gray-400'}`}
              style={isDark ? { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' } : { background: 'white', border: '1px solid #e5e7eb' }} />
          </div>
        </motion.div>

        {/* Nashr sozlamalari */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
          className={`rounded-2xl p-5 ${isDark ? '' : 'bg-gray-50 border border-gray-200'}`}
          style={isDark ? { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' } : {}}
        >
          <h2 className={`text-sm font-semibold flex items-center gap-2 mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Globe className="h-4 w-4 text-purple-400" /> Nashr sozlamalari
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>Kursni nashr etish</p>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-white/35' : 'text-gray-500'}`}>
                {form.is_published ? "Admin tekshirgandan so'ng ko'rinadi" : 'Hozircha qoralama sifatida saqlanadi'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => set('is_published')(!form.is_published)}
              className={`relative h-6 w-11 rounded-full transition-colors ${form.is_published ? 'bg-emerald-500' : isDark ? 'bg-white/15' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${form.is_published ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </motion.div>

        {/* Tugmalar */}
        <div className="flex gap-3">
          <button type="button" onClick={() => router.back()}
            className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all border ${
              isDark ? 'text-white/50 hover:text-white hover:bg-white/5 border-white/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100 border-gray-200'
            }`}>
            Bekor qilish
          </button>
          <button type="submit" disabled={isPending}
            className={`flex-1 py-3 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg`}
            style={isDark ? { background: 'linear-gradient(135deg, rgba(5,150,105,0.9), rgba(4,120,87,0.9))' } : { background: 'linear-gradient(135deg, #059669, #047857)' }}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {mode === 'create' ? 'Kurs yaratish' : "O'zgarishlarni saqlash"}
          </button>
        </div>

        {/* O'chirish (faqat edit rejimida) */}
        {mode === 'edit' && (
          <button type="button" onClick={handleDelete} disabled={isDeleting}
            className={`w-full py-3 rounded-xl text-sm font-medium transition-all border flex items-center justify-center gap-2 ${isDark ? 'text-red-400/60 hover:text-red-400 hover:bg-red-500/10 border-red-500/10' : 'text-red-600/70 hover:text-red-700 hover:bg-red-50 border-red-200'}`}>
            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            Kursni o&apos;chirish
          </button>
        )}
      </form>
    </div>
  )
}
