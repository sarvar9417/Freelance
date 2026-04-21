'use client'

import { useState, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ClipboardList, Clock, CheckCircle2, RotateCcw, AlertCircle,
  ChevronDown, Upload, X, Loader2, Star, Calendar, Search, Zap,
  Paperclip, Download, MessageSquare,
} from 'lucide-react'
import { toast } from 'sonner'

interface Task {
  id: string
  title: string
  description: string | null
  deadline: string | null
  max_score: number
  allowed_formats: string[] | null
  task_file_urls: string[] | null
  course_id: string
  lesson_id: string | null
  course: { id: string; title: string; emoji: string | null } | null
  submission: {
    id: string; task_id: string; status: string; score: number | null
    feedback: string | null; submitted_at: string; file_urls: string[] | null
  } | null
}

const STATUS_MAP = {
  pending:  { label: 'Tekshirilmoqda', color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20',     icon: Clock },
  graded:   { label: 'Baholandi',       color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle2 },
  revision: { label: 'Qayta topshiring', color: 'text-red-400',   bg: 'bg-red-500/10 border-red-500/20',         icon: RotateCcw },
}

const TOAST_STYLE = {
  background: 'rgba(10,14,28,0.96)',
  border: '1px solid rgba(255,255,255,0.1)',
  color: '#fff',
  backdropFilter: 'blur(20px)',
}

function getFileName(url: string) {
  return decodeURIComponent(url.split('/').pop()?.split('?')[0] ?? url).replace(/^\d+_/, '')
}

function getFileIcon(url: string) {
  const ext = url.split('.').pop()?.toLowerCase() ?? ''
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return '🖼️'
  if (ext === 'pdf') return '📄'
  if (['doc', 'docx'].includes(ext)) return '📝'
  if (['zip', 'rar'].includes(ext)) return '📦'
  if (['mp4', 'mov', 'avi'].includes(ext)) return '🎬'
  if (['xlsx', 'xls'].includes(ext)) return '📊'
  return '📎'
}

function TaskCard({ task, onRefresh }: { task: Task; onRefresh: () => void }) {
  const [expanded, setExpanded] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()
  const fileRef = useRef<HTMLInputElement>(null)

  const sub = task.submission
  const deadline = task.deadline ? new Date(task.deadline) : null
  const daysLeft = deadline ? Math.ceil((deadline.getTime() - Date.now()) / 86400000) : null
  const isOverdue = daysLeft !== null && daysLeft < 0
  const isUrgent  = daysLeft !== null && daysLeft >= 0 && daysLeft <= 2

  const statusEntry = sub ? (STATUS_MAP[sub.status as keyof typeof STATUS_MAP] ?? STATUS_MAP.pending) : null
  const taskFiles = task.task_file_urls?.filter(Boolean) ?? []
  const allowedFormats = task.allowed_formats ?? []

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? [])
    if (!selected.length) return

    if (allowedFormats.length > 0) {
      const invalid = selected.filter(f => {
        const ext = f.name.split('.').pop()?.toLowerCase() ?? ''
        return !allowedFormats.includes(ext)
      })
      if (invalid.length > 0) {
        setError(
          `Ruxsat etilmagan format: ${invalid.map(f => `.${f.name.split('.').pop()}`).join(', ')}. ` +
          `Ruxsat etilgan: ${allowedFormats.map(f => `.${f}`).join(', ')}`
        )
        e.target.value = ''
        return
      }
    }

    setFiles(selected)
    setError('')
  }

  const handleSubmit = () => {
    if (files.length === 0) { setError('Fayl yuklang'); return }
    setError('')
    startTransition(async () => {
      try {
        const formData = new FormData()
        formData.append('taskId', task.id)
        files.forEach(f => formData.append('files', f))

        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData })
        const uploadData = await uploadRes.json()
        if (!uploadRes.ok) { setError(uploadData.error ?? 'Fayl yuklashda xatolik'); return }
        const fileUrls: string[] = uploadData.urls

        const res = await fetch('/api/submissions/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taskId: task.id, fileUrls, studentComment: comment.trim() || null }),
        })
        const data = await res.json()

        if (!res.ok) {
          setError(data.error ?? 'Xatolik yuz berdi')
          return
        }

        setFiles([])
        setComment('')
        setExpanded(false)

        toast.success(`+${data.xpGained} XP — Topshiriq yuborildi! 📤`, {
          description: "O'qituvchi tekshirgandan so'ng natija ko'rinadi",
          duration: 5000,
          style: { ...TOAST_STYLE, border: '1px solid rgba(245,158,11,0.3)' },
        })

        if (data.levelUp) {
          setTimeout(() => {
            toast.success(`Level ${data.newLevel} ga ko'tarildingiz! 🚀`, {
              duration: 5000,
              style: { ...TOAST_STYLE, border: '1px solid rgba(139,92,246,0.4)' },
            })
          }, 1200)
        }

        onRefresh()
      } catch {
        setError("Server xatosi. Qayta urinib ko'ring.")
      }
    })
  }

  const acceptAttr = allowedFormats.length > 0 ? allowedFormats.map(f => `.${f}`).join(',') : undefined

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-start gap-3 p-4 text-left hover:bg-white/[0.02] transition-colors"
      >
        <div className="p-2 rounded-lg flex-shrink-0 mt-0.5"
          style={{ background: sub ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)' }}>
          <ClipboardList className={`h-4 w-4 ${sub ? 'text-emerald-400' : 'text-amber-400'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-medium truncate">{task.title}</p>
          <p className="text-white/40 text-xs mt-0.5 truncate">
            {task.course?.emoji} {task.course?.title ?? '—'}
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            {sub && statusEntry ? (
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${statusEntry.bg}`}>
                <statusEntry.icon className={`h-3 w-3 ${statusEntry.color}`} />
                <span className={statusEntry.color}>{statusEntry.label}</span>
                {sub.score !== null && (
                  <span className="text-white/40 ml-0.5">{sub.score}/{task.max_score}</span>
                )}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border bg-white/5 border-white/10 text-white/40">
                <AlertCircle className="h-3 w-3" /> Topshirilmagan
              </span>
            )}
            {deadline && (
              <span className={`flex items-center gap-1 text-xs ${
                isOverdue ? 'text-red-400' : isUrgent ? 'text-amber-400' : 'text-white/30'
              }`}>
                <Calendar className="h-3 w-3" />
                {isOverdue ? "Muddati o'tgan" : daysLeft === 0 ? 'Bugun!' : `${daysLeft} kun qoldi`}
              </span>
            )}
            <span className="flex items-center gap-1 text-xs text-white/30">
              <Star className="h-3 w-3 text-amber-400" /> {task.max_score} ball
            </span>
            {!sub && (
              <span className="flex items-center gap-1 text-xs text-amber-300/60">
                <Zap className="h-3 w-3" /> +100 XP
              </span>
            )}
          </div>
        </div>
        <ChevronDown className={`h-4 w-4 text-white/30 flex-shrink-0 mt-1 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {/* Expanded */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4 border-t border-white/5 pt-4">
              {task.description && (
                <p className="text-white/60 text-sm leading-relaxed">{task.description}</p>
              )}

              {/* O'qituvchi biriktirgan fayllar */}
              {taskFiles.length > 0 && (
                <div className="rounded-xl p-3 space-y-2"
                  style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.12)' }}>
                  <p className="text-blue-400/70 text-xs font-medium flex items-center gap-1.5">
                    <Paperclip className="h-3 w-3" /> O&apos;qituvchi materiallari
                  </p>
                  {taskFiles.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/5 transition-all group">
                      <span className="text-base">{getFileIcon(url)}</span>
                      <span className="text-white/60 text-xs truncate flex-1 group-hover:text-white transition-colors">
                        {getFileName(url)}
                      </span>
                      <Download className="h-3 w-3 text-blue-400/50 group-hover:text-blue-400 transition-colors flex-shrink-0" />
                    </a>
                  ))}
                </div>
              )}

              {/* Mavjud submission ma'lumoti */}
              {sub && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs text-white/30">
                    <Clock className="h-3 w-3" />
                    Topshirilgan: {new Date(sub.submitted_at).toLocaleDateString('uz-UZ', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </div>
                  {sub.feedback && (
                    <div className="p-3 rounded-xl"
                      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <p className="text-white/40 text-xs mb-1">O&apos;qituvchi izohi:</p>
                      <p className="text-white/70 text-sm">{sub.feedback}</p>
                    </div>
                  )}
                  {sub.status === 'revision' && (
                    <p className="text-red-400 text-xs">Qayta topshirish talab qilinmoqda</p>
                  )}
                </div>
              )}

              {/* Fayl yuklash va topshirish */}
              {(!sub || sub.status === 'revision') && (
                <div className="space-y-3">
                  {/* Format cheklovi */}
                  {allowedFormats.length > 0 && (
                    <p className="text-white/30 text-xs">
                      Ruxsat etilgan formatlar: {allowedFormats.map(f => `.${f}`).join(', ')}
                    </p>
                  )}

                  <div
                    onClick={() => fileRef.current?.click()}
                    className="border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors hover:border-blue-500/40"
                    style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                    <Upload className="h-5 w-5 text-white/30 mx-auto mb-1.5" />
                    <p className="text-white/40 text-xs">Fayl yuklash uchun bosing</p>
                    {allowedFormats.length > 0 && (
                      <p className="text-white/20 text-xs mt-0.5">
                        {allowedFormats.map(f => `.${f}`).join(', ')}
                      </p>
                    )}
                    <input
                      ref={fileRef} type="file" multiple className="hidden"
                      accept={acceptAttr}
                      onChange={handleFileChange}
                    />
                  </div>

                  {files.map((f, i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <span className="text-white/60 text-xs truncate">{f.name}</span>
                      <button onClick={() => setFiles(p => p.filter((_, j) => j !== i))}
                        className="text-white/30 hover:text-red-400 ml-2 flex-shrink-0">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}

                  {/* O'quvchi izohi */}
                  <div>
                    <label className="text-white/30 text-xs mb-1.5 flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" /> O&apos;qituvchiga xabar (ixtiyoriy)
                    </label>
                    <textarea
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                      placeholder="Topshiriq haqida izoh yoki savol..."
                      rows={2}
                      className="w-full px-3 py-2 rounded-xl text-xs text-white placeholder-white/20 outline-none focus:ring-1 focus:ring-amber-500/40 resize-none"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                    />
                  </div>

                  {error && <p className="text-red-400 text-xs">{error}</p>}

                  <button onClick={handleSubmit} disabled={isPending || files.length === 0}
                    className="w-full py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-50 flex items-center justify-center gap-2"
                    style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.8), rgba(217,119,6,0.8))' }}>
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    {sub?.status === 'revision' ? 'Qayta topshirish' : 'Topshirish'}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function TasksClient({ tasks }: { tasks: Task[]; userId: string }) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  const filtered = tasks.filter(t => {
    const matchSearch = !search.trim() ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.course?.title ?? '').toLowerCase().includes(search.toLowerCase())
    if (!matchSearch) return false
    if (filter === 'pending')   return !t.submission
    if (filter === 'submitted') return t.submission?.status === 'pending'
    if (filter === 'graded')    return t.submission?.status === 'graded'
    if (filter === 'revision')  return t.submission?.status === 'revision'
    return true
  })

  const counts = {
    all:       tasks.length,
    pending:   tasks.filter(t => !t.submission).length,
    submitted: tasks.filter(t => t.submission?.status === 'pending').length,
    graded:    tasks.filter(t => t.submission?.status === 'graded').length,
    revision:  tasks.filter(t => t.submission?.status === 'revision').length,
  }

  const filters = [
    { key: 'all',       label: 'Barchasi',         color: 'text-white/60' },
    { key: 'pending',   label: 'Topshirilmagan',   color: 'text-white/60' },
    { key: 'submitted', label: 'Tekshirilmoqda',   color: 'text-amber-400' },
    { key: 'graded',    label: 'Baholangan',       color: 'text-emerald-400' },
    { key: 'revision',  label: 'Qayta topshirish', color: 'text-red-400' },
  ]

  return (
    <div className="space-y-5">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
        <input type="text" placeholder="Topshiriq yoki kurs bo'yicha qidirish..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-white/25 outline-none focus:ring-1 focus:ring-blue-500/50"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === f.key ? 'bg-blue-600/80 text-white' : 'text-white/40 hover:text-white'
            }`}
            style={filter !== f.key ? { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' } : {}}>
            {f.label} <span className="ml-1 opacity-60">{counts[f.key as keyof typeof counts]}</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl p-10 text-center"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="text-white/30 text-sm">Topshiriq topilmadi</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(task => (
            <TaskCard key={task.id} task={task} onRefresh={() => router.refresh()} />
          ))}
        </div>
      )}
    </div>
  )
}
