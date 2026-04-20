'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, Loader2, Calendar, Star, BookOpen, FileCheck } from 'lucide-react'
import { updateTask } from '../../../../../actions'

const FORMAT_OPTIONS = ['pdf', 'doc', 'docx', 'zip', 'jpg', 'png', 'mp4', 'xlsx']

interface Lesson { id: string; title: string; order_num: number }

interface Props {
  courseId: string
  taskId: string
  courseTitle: string
  lessons: Lesson[]
  initial: {
    title: string
    lesson_id: string
    description: string
    deadline: string
    max_score: number
    allowed_formats: string[]
  }
}

export default function TaskEditClient({ courseId, taskId, courseTitle, lessons, initial }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: initial.title,
    lesson_id: initial.lesson_id,
    description: initial.description,
    deadline: initial.deadline ? new Date(initial.deadline).toISOString().slice(0, 16) : '',
    max_score: initial.max_score,
    allowed_formats: initial.allowed_formats,
  })

  const set = <K extends keyof typeof form>(key: K) => (val: typeof form[K]) =>
    setForm(prev => ({ ...prev, [key]: val }))

  const toggleFormat = (fmt: string) =>
    setForm(prev => ({
      ...prev,
      allowed_formats: prev.allowed_formats.includes(fmt)
        ? prev.allowed_formats.filter(f => f !== fmt)
        : [...prev.allowed_formats, fmt],
    }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) { setError('Topshiriq nomi kiritilishi shart'); return }
    if (!form.description.trim()) { setError('Tavsif kiritilishi shart'); return }
    if (!form.deadline) { setError('Deadline kiritilishi shart'); return }
    if (form.allowed_formats.length === 0) { setError('Kamida bitta fayl formati tanlang'); return }
    setError('')

    startTransition(async () => {
      const result = await updateTask(taskId, courseId, {
        title: form.title,
        lesson_id: form.lesson_id,
        description: form.description,
        deadline: new Date(form.deadline).toISOString(),
        max_score: form.max_score,
        allowed_formats: form.allowed_formats,
      })
      if (result.error) { setError(result.error); return }
      router.push(`/teacher/courses/${courseId}/tasks`)
    })
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <p className="text-white/40 text-xs">{courseTitle}</p>
          <h1 className="text-xl font-bold text-white">Topshiriqni tahrirlash</h1>
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-5 space-y-4"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div>
            <label className="text-white/50 text-xs mb-1.5 block">Topshiriq nomi *</label>
            <input
              type="text" value={form.title}
              onChange={e => set('title')(e.target.value)}
              placeholder="Masalan: HTML sahifa yaratish"
              className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/25 outline-none focus:ring-1 focus:ring-amber-500/50"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            />
          </div>

          {lessons.length > 0 && (
            <div>
              <label className="text-white/50 text-xs mb-1.5 flex items-center gap-1">
                <BookOpen className="h-3 w-3" /> Qaysi darsga tegishli (ixtiyoriy)
              </label>
              <select
                value={form.lesson_id}
                onChange={e => set('lesson_id')(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none appearance-none focus:ring-1 focus:ring-amber-500/50"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <option value="" className="bg-[#0d1220]">— Dars tanlanmagan —</option>
                {lessons.map(l => (
                  <option key={l.id} value={l.id} className="bg-[#0d1220]">
                    {l.order_num}. {l.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="text-white/50 text-xs mb-1.5 block">Topshiriq tavsifi *</label>
            <textarea
              value={form.description}
              onChange={e => set('description')(e.target.value)}
              placeholder="O'quvchi nima qilishi kerakligi, talablar, misollar..."
              rows={5}
              className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/25 outline-none focus:ring-1 focus:ring-amber-500/50 resize-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-white/50 text-xs mb-1.5 flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Deadline *
              </label>
              <input
                type="datetime-local" value={form.deadline}
                onChange={e => set('deadline')(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none focus:ring-1 focus:ring-amber-500/50"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', colorScheme: 'dark' }}
              />
            </div>
            <div>
              <label className="text-white/50 text-xs mb-1.5 flex items-center gap-1">
                <Star className="h-3 w-3" /> Maksimal ball
              </label>
              <input
                type="number" min={1} max={100} value={form.max_score}
                onChange={e => set('max_score')(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none focus:ring-1 focus:ring-amber-500/50"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.07 }}
          className="rounded-2xl p-5"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <label className="text-white/50 text-xs mb-3 flex items-center gap-1">
            <FileCheck className="h-3 w-3" /> Ruxsat etilgan fayl formatlari *
          </label>
          <div className="flex flex-wrap gap-2">
            {FORMAT_OPTIONS.map(fmt => (
              <button
                key={fmt} type="button" onClick={() => toggleFormat(fmt)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                  form.allowed_formats.includes(fmt)
                    ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                    : 'bg-white/5 text-white/30 border-white/10 hover:text-white/60'
                }`}
              >
                .{fmt}
              </button>
            ))}
          </div>
        </motion.div>

        <div className="flex gap-3">
          <button
            type="button" onClick={() => router.back()}
            className="flex-1 py-3 rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 transition-all border border-white/5"
          >
            Bekor qilish
          </button>
          <button
            type="submit" disabled={isPending}
            className="flex-1 py-3 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
            style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.8), rgba(217,119,6,0.8))' }}
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            O&apos;zgarishlarni saqlash
          </button>
        </div>
      </form>
    </div>
  )
}
