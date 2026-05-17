'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, Loader2, Video, FileText, Hash } from 'lucide-react'
import { updateLesson } from '../../../../../actions'
import { useMountedTheme } from '@/hooks/useTheme'

interface Props {
  courseId: string
  lessonId: string
  courseTitle: string
  initial: { title: string; order_num: number; video_url: string; content: string }
}

export default function LessonEditClient({ courseId, lessonId, courseTitle, initial }: Props) {
  const { isDark } = useMountedTheme()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: initial.title,
    order_num: initial.order_num,
    video_url: initial.video_url,
    content: initial.content,
  })

  const set = (key: keyof typeof form) => (val: string | number) =>
    setForm(prev => ({ ...prev, [key]: val }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) { setError('Dars nomi kiritilishi shart'); return }
    setError('')

    startTransition(async () => {
      const result = await updateLesson(lessonId, courseId, {
        title: form.title,
        order_num: Number(form.order_num),
        video_url: form.video_url,
        content: form.content,
      })
      if (result.error) { setError(result.error); return }
      router.push(`/teacher/courses/${courseId}/lessons`)
    })
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className={`p-2 rounded-xl transition-all ${isDark ? 'text-white/40 hover:text-white hover:bg-white/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <p className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-500'}`}>{courseTitle}</p>
          <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Darsni tahrirlash</h1>
        </div>
      </div>

      {error && (
        <div className={`px-4 py-3 rounded-xl text-sm ${isDark ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-red-50 border border-red-200 text-red-600'}`}>{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl p-5 space-y-4 ${isDark ? '' : 'bg-gray-50 border border-gray-200'}`}
          style={isDark ? { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' } : {}}
        >
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={`text-xs mb-1.5 flex items-center gap-1 ${isDark ? 'text-white/50' : 'text-gray-600'}`}>
                <Hash className="h-3 w-3" /> Tartib raqami
              </label>
              <input
                type="number" min={1} value={form.order_num}
                onChange={e => set('order_num')(e.target.value)}
                className={`w-full px-3 py-2.5 rounded-xl text-sm outline-none focus:ring-1 focus:ring-emerald-500/50 ${isDark ? 'text-white' : 'text-gray-900'}`}
                style={isDark ? { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' } : { background: 'white', border: '1px solid #e5e7eb' }}
              />
            </div>
            <div className="col-span-2">
              <label className={`text-xs mb-1.5 block ${isDark ? 'text-white/50' : 'text-gray-600'}`}>Dars nomi *</label>
              <input
                type="text" value={form.title}
                onChange={e => set('title')(e.target.value)}
                placeholder="Masalan: HTML asoslari"
                className={`w-full px-4 py-2.5 rounded-xl text-sm outline-none focus:ring-1 focus:ring-emerald-500/50 ${isDark ? 'text-white placeholder-white/25' : 'text-gray-900 placeholder-gray-400'}`}
                style={isDark ? { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' } : { background: 'white', border: '1px solid #e5e7eb' }}
              />
            </div>
          </div>

          <div>
            <label className={`text-xs mb-1.5 flex items-center gap-1 ${isDark ? 'text-white/50' : 'text-gray-600'}`}>
              <Video className="h-3 w-3" /> Video URL (YouTube/Vimeo, ixtiyoriy)
            </label>
            <input
              type="url" value={form.video_url}
              onChange={e => set('video_url')(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className={`w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-1 focus:ring-blue-500/50 ${isDark ? 'text-white placeholder-white/25' : 'text-gray-900 placeholder-gray-400'}`}
              style={isDark ? { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' } : { background: 'white', border: '1px solid #e5e7eb' }}
            />
          </div>

          <div>
            <label className={`text-xs mb-1.5 flex items-center gap-1 ${isDark ? 'text-white/50' : 'text-gray-600'}`}>
              <FileText className="h-3 w-3" /> Dars matni (ixtiyoriy)
            </label>
            <textarea
              value={form.content}
              onChange={e => set('content')(e.target.value)}
              placeholder="Dars bo'yicha qo'shimcha matn, tushuntirish yoki ko'rsatmalar..."
              rows={8}
              className={`w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-1 focus:ring-emerald-500/50 resize-none ${isDark ? 'text-white placeholder-white/25' : 'text-gray-900 placeholder-gray-400'}`}
              style={isDark ? { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' } : { background: 'white', border: '1px solid #e5e7eb' }}
            />
          </div>
        </motion.div>

        <div className="flex gap-3">
          <button
            type="button" onClick={() => router.back()}
            className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all border ${
              isDark ? 'text-white/50 hover:text-white hover:bg-white/5 border-white/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100 border-gray-200'
            }`}
          >
            Bekor qilish
          </button>
          <button
            type="submit" disabled={isPending}
            className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${isDark ? 'text-white' : 'text-white'}`}
            style={isDark ? { background: 'linear-gradient(135deg, rgba(5,150,105,0.9), rgba(4,120,87,0.9))' } : { background: 'linear-gradient(135deg, #059669, #047857)' }}
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            O&apos;zgarishlarni saqlash
          </button>
        </div>
      </form>
    </div>
  )
}