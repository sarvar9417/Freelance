'use client'

import { useState, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, Loader2, Calendar, Star, BookOpen, FileCheck, Paperclip, X, Download } from 'lucide-react'
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
    task_file_urls: string[]
  }
}

function getFileName(url: string) {
  return decodeURIComponent(url.split('/').pop()?.split('?')[0] ?? url).replace(/^\d+_/, '')
}

export default function TaskEditClient({ courseId, taskId, courseTitle, lessons, initial }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [taskFiles, setTaskFiles] = useState<string[]>(initial.task_file_urls)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? [])
    if (!selected.length) return
    setUploadError('')
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('sessionId', taskId)
      selected.forEach(f => fd.append('files', f))
      const res = await fetch('/api/upload-task-files', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) { setUploadError(data.error ?? 'Fayl yuklashda xatolik'); return }
      setTaskFiles(prev => [...prev, ...data.urls])
    } catch {
      setUploadError('Fayl yuklashda xatolik')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const removeFile = (i: number) => setTaskFiles(prev => prev.filter((_, j) => j !== i))

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
        task_file_urls: taskFiles,
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

        {/* Fayl formatlari */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.07 }}
          className="rounded-2xl p-5"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <label className="text-white/50 text-xs mb-3 flex items-center gap-1">
            <FileCheck className="h-3 w-3" /> O&apos;quvchi yuklashi mumkin bo&apos;lgan fayl formatlari *
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
          {form.allowed_formats.length > 0 && (
            <p className="text-white/25 text-xs mt-2">
              O&apos;quvchilar faqat tanlangan formatlarda fayl yuboraoladi
            </p>
          )}
        </motion.div>

        {/* O'qituvchi fayllari */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl p-5"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <label className="text-white/50 text-xs flex items-center gap-1">
              <Paperclip className="h-3 w-3" /> Topshiriqqa fayl biriktirish (ixtiyoriy)
            </label>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border"
              style={{ background: 'rgba(59,130,246,0.08)', borderColor: 'rgba(59,130,246,0.2)', color: 'rgb(96,165,250)' }}
            >
              {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Paperclip className="h-3 w-3" />}
              {uploading ? 'Yuklanmoqda...' : "Fayl qo'shish"}
            </button>
            <input ref={fileRef} type="file" multiple className="hidden" onChange={handleFileUpload} />
          </div>

          {uploadError && <p className="text-red-400 text-xs mb-2">{uploadError}</p>}

          {taskFiles.length === 0 ? (
            <p className="text-white/20 text-xs">Fayl biriktirilmagan. O&apos;quvchilar topshiriq materiallarini bu yerda ko&apos;radi.</p>
          ) : (
            <div className="space-y-2">
              {taskFiles.map((url, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl"
                  style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.12)' }}>
                  <Download className="h-3.5 w-3.5 text-blue-400 flex-shrink-0" />
                  <span className="text-white/60 text-xs truncate flex-1">{getFileName(url)}</span>
                  <button type="button" onClick={() => removeFile(i)}
                    className="text-white/20 hover:text-red-400 transition-colors flex-shrink-0">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <div className="flex gap-3">
          <button
            type="button" onClick={() => router.back()}
            className="flex-1 py-3 rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 transition-all border border-white/5"
          >
            Bekor qilish
          </button>
          <button
            type="submit" disabled={isPending || uploading}
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
