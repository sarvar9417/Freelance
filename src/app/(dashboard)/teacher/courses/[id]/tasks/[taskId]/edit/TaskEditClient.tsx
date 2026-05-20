'use client'

import { useState, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, Loader2, Calendar, Star, BookOpen, FileCheck, Paperclip, X, Download } from 'lucide-react'
import { updateTask } from '../../../../../actions'
import { useMountedTheme } from '@/hooks/useTheme'

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
    difficulty_level: number
    order_index: number
  }
}

function getFileName(url: string) {
  return decodeURIComponent(url.split('/').pop()?.split('?')[0] ?? url).replace(/^\d+_/, '')
}

export default function TaskEditClient({ courseId, taskId, courseTitle, lessons, initial }: Props) {
  const { isDark } = useMountedTheme()
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
    difficulty_level: initial.difficulty_level ?? 1,
    order_index: initial.order_index ?? 0,
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
        difficulty_level: form.difficulty_level,
        order_index: form.order_index,
      })
      if (result.error) { setError(result.error); return }
      router.push(`/teacher/courses/${courseId}/tasks`)
    })
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className={`p-2 rounded-xl transition-all ${isDark ? 'text-white/40 hover:text-white hover:bg-white/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}>
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <p className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-500'}`}>{courseTitle}</p>
          <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Topshiriqni tahrirlash</h1>
        </div>
      </div>

      {error && (
        <div className={`px-4 py-3 rounded-xl text-sm ${isDark ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-red-50 border border-red-200 text-red-600'}`}>{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl p-5 space-y-4 ${isDark ? '' : 'bg-gray-50 border border-gray-200'}`}
          style={isDark ? { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' } : {}}
        >
          <div>
            <label className={`text-xs mb-1.5 block ${isDark ? 'text-white/50' : 'text-gray-600'}`}>Topshiriq nomi *</label>
            <input
              type="text" value={form.title}
              onChange={e => set('title')(e.target.value)}
              placeholder="Masalan: HTML sahifa yaratish"
              className={`w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-1 focus:ring-amber-500/50 ${isDark ? 'text-white placeholder-white/25' : 'text-gray-900 placeholder-gray-400'}`}
              style={isDark ? { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' } : { background: 'white', border: '1px solid #e5e7eb' }}
            />
          </div>

          {lessons.length > 0 && (
            <div>
              <label className={`text-xs mb-1.5 flex items-center gap-1 ${isDark ? 'text-white/50' : 'text-gray-600'}`}>
                <BookOpen className="h-3 w-3" /> Qaysi darsga tegishli (ixtiyoriy)
              </label>
              <select
                value={form.lesson_id}
                onChange={e => set('lesson_id')(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl text-sm outline-none appearance-none focus:ring-1 focus:ring-amber-500/50 ${isDark ? 'text-white' : 'text-gray-900'}`}
                style={isDark ? { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' } : { background: 'white', border: '1px solid #e5e7eb' }}
              >
                <option value="" className={isDark ? 'bg-[#0d1220]' : 'bg-white'}>— Dars tanlanmagan —</option>
                {lessons.map(l => (
                  <option key={l.id} value={l.id} className={isDark ? 'bg-[#0d1220]' : 'bg-white'}>
                    {l.order_num}. {l.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className={`text-xs mb-1.5 block ${isDark ? 'text-white/50' : 'text-gray-600'}`}>Topshiriq tavsifi *</label>
            <textarea
              value={form.description}
              onChange={e => set('description')(e.target.value)}
              placeholder="O'quvchi nima qilishi kerakligi, talablar, misollar..."
              rows={5}
              className={`w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-1 focus:ring-amber-500/50 resize-none ${isDark ? 'text-white placeholder-white/25' : 'text-gray-900 placeholder-gray-400'}`}
              style={isDark ? { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' } : { background: 'white', border: '1px solid #e5e7eb' }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`text-xs mb-1.5 flex items-center gap-1 ${isDark ? 'text-white/50' : 'text-gray-600'}`}>
                <Calendar className="h-3 w-3" /> Deadline *
              </label>
              <input
                type="datetime-local" value={form.deadline}
                onChange={e => set('deadline')(e.target.value)}
                className={`w-full px-3 py-2.5 rounded-xl text-sm outline-none focus:ring-1 focus:ring-amber-500/50 ${isDark ? 'text-white' : 'text-gray-900'}`}
                style={isDark ? { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', colorScheme: 'dark' } : { background: 'white', border: '1px solid #e5e7eb' }}
              />
            </div>
            <div>
              <label className={`text-xs mb-1.5 flex items-center gap-1 ${isDark ? 'text-white/50' : 'text-gray-600'}`}>
                <Star className="h-3 w-3" /> Maksimal ball
              </label>
              <input
                type="number" min={1} max={100} value={form.max_score}
                onChange={e => set('max_score')(Number(e.target.value))}
                className={`w-full px-3 py-2.5 rounded-xl text-sm outline-none focus:ring-1 focus:ring-amber-500/50 ${isDark ? 'text-white' : 'text-gray-900'}`}
                style={isDark ? { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' } : { background: 'white', border: '1px solid #e5e7eb' }}
              />
            </div>
            <div>
              <label className={`text-xs mb-1.5 flex items-center gap-1 ${isDark ? 'text-white/50' : 'text-gray-600'}`}>
                <BookOpen className="h-3 w-3" /> Tartib raqami
              </label>
              <input
                type="number" min={0} value={form.order_index}
                onChange={e => set('order_index')(Number(e.target.value))}
                className={`w-full px-3 py-2.5 rounded-xl text-sm outline-none focus:ring-1 focus:ring-amber-500/50 ${isDark ? 'text-white' : 'text-gray-900'}`}
                style={isDark ? { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' } : { background: 'white', border: '1px solid #e5e7eb' }}
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="rounded-2xl p-5"
          style={isDark ? { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' } : { background: 'white', border: '1px solid #e5e7eb' }}
        >
          <label className={`text-xs mb-3 flex items-center gap-1 ${isDark ? 'text-white/50' : 'text-gray-600'}`}>
            <Star className="h-3 w-3" /> Qiyinchilik darajasi *
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { level: 1, label: 'Reproduktiv', icon: '🔄', activeBg: 'rgba(16,185,129,0.15)', activeText: '#34d399', activeBorder: 'rgba(16,185,129,0.3)', inactiveBg: isDark ? 'rgba(255,255,255,0.05)' : '#f3f4f6', inactiveText: isDark ? 'rgba(255,255,255,0.3)' : '#6b7280', inactiveBorder: isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb' },
              { level: 2, label: 'Produktiv', icon: '⚙️', activeBg: 'rgba(59,130,246,0.15)', activeText: '#60a5fa', activeBorder: 'rgba(59,130,246,0.3)', inactiveBg: isDark ? 'rgba(255,255,255,0.05)' : '#f3f4f6', inactiveText: isDark ? 'rgba(255,255,255,0.3)' : '#6b7280', inactiveBorder: isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb' },
              { level: 3, label: 'Qisman-izlanishli', icon: '🔍', activeBg: 'rgba(245,158,11,0.15)', activeText: '#fbbf24', activeBorder: 'rgba(245,158,11,0.3)', inactiveBg: isDark ? 'rgba(255,255,255,0.05)' : '#f3f4f6', inactiveText: isDark ? 'rgba(255,255,255,0.3)' : '#6b7280', inactiveBorder: isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb' },
              { level: 4, label: 'Kreativ', icon: '🎯', activeBg: 'rgba(168,85,247,0.15)', activeText: '#c084fc', activeBorder: 'rgba(168,85,247,0.3)', inactiveBg: isDark ? 'rgba(255,255,255,0.05)' : '#f3f4f6', inactiveText: isDark ? 'rgba(255,255,255,0.3)' : '#6b7280', inactiveBorder: isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb' },
            ].map(opt => (
              <button key={opt.level} type="button" onClick={() => set('difficulty_level')(opt.level)}
                className="p-3 rounded-xl text-xs font-medium transition-all border"
                style={{
                  background: form.difficulty_level === opt.level ? opt.activeBg : opt.inactiveBg,
                  color: form.difficulty_level === opt.level ? opt.activeText : opt.inactiveText,
                  borderColor: form.difficulty_level === opt.level ? opt.activeBorder : opt.inactiveBorder,
                }}
              >
                <span className="block text-lg mb-1">{opt.icon}</span>
                {opt.label}
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.07 }}
          className="rounded-2xl p-5"
          style={isDark ? { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' } : { background: 'white', border: '1px solid #e5e7eb' }}
        >
          <label className={`text-xs mb-3 flex items-center gap-1 ${isDark ? 'text-white/50' : 'text-gray-600'}`}>
            <FileCheck className="h-3 w-3" /> O&apos;quvchi yuklashi mumkin bo&apos;lgan fayl formatlari *
          </label>
          <div className="flex flex-wrap gap-2">
            {FORMAT_OPTIONS.map(fmt => (
              <button
                key={fmt} type="button" onClick={() => toggleFormat(fmt)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                  form.allowed_formats.includes(fmt)
                    ? isDark ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' : 'bg-amber-100 text-amber-600 border-amber-200'
                    : isDark ? 'bg-white/5 text-white/30 border-white/10 hover:text-white/60' : 'bg-gray-100 text-gray-600 border-gray-200 hover:text-gray-900'
                }`}
              >
                .{fmt}
              </button>
            ))}
          </div>
          {form.allowed_formats.length > 0 && (
            <p className={`text-xs mt-2 ${isDark ? 'text-white/25' : 'text-gray-400'}`}>
              O&apos;quvchilar faqat tanlangan formatlarda fayl yuboraoladi
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl p-5"
          style={isDark ? { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' } : { background: 'white', border: '1px solid #e5e7eb' }}
        >
          <div className="flex items-center justify-between mb-3">
            <label className={`text-xs flex items-center gap-1 ${isDark ? 'text-white/50' : 'text-gray-600'}`}>
              <Paperclip className="h-3 w-3" /> Topshiriqqa fayl biriktirish (ixtiyoriy)
            </label>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${isDark ? '' : 'bg-blue-50 border-blue-200 text-blue-600'}`}
              style={isDark ? { background: 'rgba(59,130,246,0.08)', borderColor: 'rgba(59,130,246,0.2)', color: 'rgb(96,165,250)' } : {}}
            >
              {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Paperclip className="h-3 w-3" />}
              {uploading ? 'Yuklanmoqda...' : "Fayl qo'shish"}
            </button>
            <input ref={fileRef} type="file" multiple className="hidden" onChange={handleFileUpload} />
          </div>

          {uploadError && <p className={isDark ? 'text-red-400 text-xs mb-2' : 'text-red-600 text-xs mb-2'}>{uploadError}</p>}

          {taskFiles.length === 0 ? (
            <p className={`text-xs ${isDark ? 'text-white/20' : 'text-gray-400'}`}>Fayl biriktirilmagan. O&apos;quvchilar topshiriq materiallarini bu yerda ko&apos;radi.</p>
          ) : (
            <div className="space-y-2">
              {taskFiles.map((url, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl"
                  style={isDark ? { background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.12)' } : { background: '#f0f9ff', border: '1px solid #bfdbfe' }}>
                  <Download className={`h-3.5 w-3.5 flex-shrink-0 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                  <span className={`text-xs truncate flex-1 ${isDark ? 'text-white/60' : 'text-gray-700'}`}>{getFileName(url)}</span>
                  <button type="button" onClick={() => removeFile(i)}
                    className={`flex-shrink-0 transition-colors ${isDark ? 'text-white/20 hover:text-red-400' : 'text-gray-400 hover:text-red-500'}`}>
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
            className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all border ${
              isDark ? 'text-white/50 hover:text-white hover:bg-white/5 border-white/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100 border-gray-200'
            }`}
          >
            Bekor qilish
          </button>
          <button
            type="submit" disabled={isPending || uploading}
            className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${isDark ? 'text-white' : 'text-white'}`}
            style={isDark ? { background: 'linear-gradient(135deg, rgba(245,158,11,0.8), rgba(217,119,6,0.8))' } : { background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            O&apos;zgarishlarni saqlash
          </button>
        </div>
      </form>
    </div>
  )
}