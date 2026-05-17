'use client'

import { useState, useTransition, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play, FileText, ClipboardList, ArrowLeft, ArrowRight,
  CheckCircle2, Upload, Loader2, Star, RotateCcw, Clock, X, Zap,
} from 'lucide-react'
import { toast } from 'sonner'
import { useMountedTheme } from '@/hooks/useTheme'

interface Lesson {
  id: string; title: string; order_num: number; video_url: string | null; content: string | null
}
interface Task {
  id: string; title: string; description: string | null
  deadline: string | null; max_score: number; allowed_formats: string[] | null
}
interface Submission {
  id: string; status: string; score: number | null; feedback: string | null
  submitted_at: string; file_urls: string[] | null
}

type Tab = 'video' | 'content' | 'task'

const TOAST_STYLE = {
  background: 'rgba(10,14,28,0.96)',
  border: '1px solid rgba(255,255,255,0.1)',
  color: '#fff',
  backdropFilter: 'blur(20px)',
}

function getEmbedUrl(url: string): string | null {
  if (!url) return null
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`
  return url
}

export default function LessonClient({
  lesson, task, submission, courseId,
  prevLesson, nextLesson, totalLessons, currentIndex,
}: {
  lesson: Lesson
  task: Task | null
  submission: Submission | null
  courseId: string
  prevLesson: { id: string; title: string } | null
  nextLesson: { id: string; title: string } | null
  totalLessons: number
  currentIndex: number
}) {
  const { isDark } = useMountedTheme()
  const router = useRouter()
  const [tab, setTab] = useState<Tab>(lesson.video_url ? 'video' : lesson.content ? 'content' : 'task')
  const [isPending, startTransition] = useTransition()
  const [files, setFiles] = useState<File[]>([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleComplete = () => {
    startTransition(async () => {
      try {
        const res = await fetch('/api/progress/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ courseId, lessonId: lesson.id }),
        })
        const data = await res.json()

        if (res.ok) {
          toast.success(`+${data.xpGained} XP qo'shildi! ⚡`, {
            description: data.courseCompleted
              ? 'Kurs 100% tugatildi! +500 bonus XP 🏆'
              : `Dars bajarildi. Jami: ${data.newXp?.toLocaleString()} XP`,
            duration: 4000,
            style: { ...TOAST_STYLE, border: '1px solid rgba(245,158,11,0.3)' },
          })

          if (data.levelUp) {
            setTimeout(() => {
              toast.success(`Level ${data.newLevel} ga ko'tarildingiz! 🚀`, {
                duration: 5000,
                style: { ...TOAST_STYLE, border: '1px solid rgba(139,92,246,0.4)' },
              })
            }, 1000)
          }

          if (data.courseCompleted) {
            setTimeout(() => {
              toast.success('Tabriklaymiz! Kurs tugatildi! 🎉', {
                description: 'Sertifikat uchun profil sahifasiga o\'ting',
                duration: 6000,
                style: { ...TOAST_STYLE, border: '1px solid rgba(16,185,129,0.4)' },
              })
            }, 2000)
          }
        }

        router.refresh()
        if (nextLesson) router.push(`/student/courses/${courseId}/lessons/${nextLesson.id}`)
      } catch {
        toast.error('Xatolik yuz berdi. Qayta urinib ko\'ring.', { style: TOAST_STYLE })
      }
    })
  }

  const handleSubmit = () => {
    if (files.length === 0) { setError('Fayl yuklang'); return }
    setError('')
    startTransition(async () => {
      try {
        const formData = new FormData()
        formData.append('taskId', task!.id)
        files.forEach(f => formData.append('files', f))

        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData })
        const uploadData = await uploadRes.json()
        if (!uploadRes.ok) { setError(uploadData.error ?? 'Fayl yuklashda xatolik'); return }
        const fileUrls: string[] = uploadData.urls

        const res = await fetch('/api/submissions/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taskId: task!.id, fileUrls }),
        })
        const data = await res.json()

        if (!res.ok) { setError(data.error ?? 'Xatolik yuz berdi'); return }

        setSuccess('Topshiriq muvaffaqiyatli yuborildi!')
        setFiles([])

        toast.success(`+${data.xpGained} XP — Topshiriq yuborildi! 📤`, {
          description: "O'qituvchi tekshirgandan so'ng natija ko'rinadi",
          duration: 5000,
          style: { ...TOAST_STYLE, border: '1px solid rgba(245,158,11,0.3)' },
        })

        router.refresh()
      } catch {
        setError('Server xatosi. Qayta urinib ko\'ring.')
      }
    })
  }

  const embedUrl = lesson.video_url ? getEmbedUrl(lesson.video_url) : null
  const STATUS_MAP = {
    pending:  { label: 'Tekshirilmoqda', color: isDark ? 'text-amber-400' : 'text-amber-600',   bg: isDark ? 'bg-amber-500/10 border-amber-500/20' : 'bg-amber-50 border-amber-200', icon: Clock },
    graded:   { label: 'Baholandi',       color: isDark ? 'text-emerald-400' : 'text-emerald-600', bg: isDark ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-200', icon: CheckCircle2 },
    revision: { label: 'Qayta topshiring', color: isDark ? 'text-red-400' : 'text-red-600',   bg: isDark ? 'bg-red-500/10 border-red-500/20' : 'bg-red-50 border-red-200',       icon: RotateCcw },
  }

  const tabs: { key: Tab; label: string; icon: React.ElementType; show: boolean }[] = [
    { key: 'video',   label: 'Video',     icon: Play,          show: !!lesson.video_url },
    { key: 'content', label: 'Matn',      icon: FileText,      show: !!lesson.content },
    { key: 'task',    label: 'Topshiriq', icon: ClipboardList, show: !!task },
  ]

  return (
    <div className="space-y-4">
      <div className={`rounded-2xl p-5 ${isDark ? '' : 'bg-white border border-gray-200'}`}
        style={isDark ? { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' } : {}}>
        <div className="flex items-center gap-3 mb-1">
          <div className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs font-bold ${isDark ? 'bg-blue-500/15 border border-blue-500/20 text-blue-400' : 'bg-blue-100 border border-blue-200 text-blue-600'}`}>
            {lesson.order_num}
          </div>
          <h1 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{lesson.title}</h1>
        </div>
        <p className={`text-xs pl-10 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>Dars {currentIndex + 1} / {totalLessons}</p>
      </div>

      {tabs.filter(t => t.show).length > 1 && (
        <div className="flex gap-2">
          {tabs.filter(t => t.show).map(t => {
            const Icon = t.icon
            return (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  tab === t.key 
                    ? isDark ? 'bg-blue-600/80 text-white' : 'bg-blue-600 text-white'
                    : isDark ? 'text-white/40 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
                style={tab !== t.key ? (isDark ? { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' } : { background: '#f9fafb', border: '1px solid #e5e7eb' }) : {}}>
                <Icon className="h-3.5 w-3.5" /> {t.label}
              </button>
            )
          })}
        </div>
      )}

      <AnimatePresence mode="wait">
        {tab === 'video' && embedUrl && (
          <motion.div key="video" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className={`rounded-2xl overflow-hidden aspect-video ${isDark ? '' : 'bg-gray-900'}`}
            style={isDark ? { background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.07)' } : {}}>
            <iframe src={embedUrl} className="w-full h-full" allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
          </motion.div>
        )}

        {tab === 'content' && lesson.content && (
          <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className={`rounded-2xl p-6 ${isDark ? '' : 'bg-white border border-gray-200'}`}
            style={isDark ? { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' } : {}}>
            <p className={`text-sm leading-relaxed whitespace-pre-wrap ${isDark ? 'text-white/70' : 'text-gray-700'}`}>{lesson.content}</p>
          </motion.div>
        )}

        {tab === 'task' && task && (
          <motion.div key="task" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className={`rounded-2xl p-5 space-y-4 ${isDark ? '' : 'bg-white border border-gray-200'}`}
            style={isDark ? { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' } : {}}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className={`font-semibold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <ClipboardList className={`h-4 w-4 ${isDark ? 'text-amber-400' : 'text-amber-500'}`} /> {task.title}
                </h3>
                {task.deadline && (
                  <p className={`text-xs mt-1 flex items-center gap-1 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                    <Clock className="h-3 w-3" />
                    Deadline: {new Date(task.deadline).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Star className={`h-4 w-4 ${isDark ? 'text-amber-400 fill-amber-400' : 'text-amber-500 fill-amber-500'}`} />
                <span className={`text-sm font-bold ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>{task.max_score}</span>
                <Zap className={`h-3.5 w-3.5 ml-1 ${isDark ? 'text-amber-300' : 'text-amber-400'}`} />
                <span className={`text-xs ${isDark ? 'text-amber-300' : 'text-amber-500'}`}>+100 XP</span>
              </div>
            </div>

            {task.description && (
              <p className={`text-sm leading-relaxed ${isDark ? 'text-white/60' : 'text-gray-600'}`}>{task.description}</p>
            )}

            {submission ? (
              <div className="space-y-3">
                {(() => {
                  const st = STATUS_MAP[submission.status as keyof typeof STATUS_MAP] ?? STATUS_MAP.pending
                  const StatusIcon = st.icon
                  return (
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm ${st.bg}`}>
                      <StatusIcon className={`h-4 w-4 ${st.color}`} />
                      <span className={st.color}>{st.label}</span>
                      {submission.score !== null && (
                        <span className={`ml-auto ${isDark ? 'text-white/60' : 'text-gray-500'}`}>{submission.score}/{task.max_score}</span>
                      )}
                    </div>
                  )
                })()}
                {submission.feedback && (
                  <div className={`p-3 rounded-xl ${isDark ? '' : 'bg-gray-50 border border-gray-200'}`}
                    style={isDark ? { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' } : {}}>
                    <p className={`text-xs mb-1 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>O&apos;qituvchi izohi:</p>
                    <p className={`text-sm ${isDark ? 'text-white/70' : 'text-gray-700'}`}>{submission.feedback}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div
                  onClick={() => fileRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                    isDark ? 'hover:border-blue-500/50' : 'hover:border-blue-400'
                  } ${isDark ? '' : 'border-gray-300'}`}
                  style={isDark ? { borderColor: 'rgba(255,255,255,0.1)' } : {}}>
                  <Upload className={`h-6 w-6 mx-auto mb-2 ${isDark ? 'text-white/30' : 'text-gray-400'}`} />
                  <p className={`text-sm ${isDark ? 'text-white/50' : 'text-gray-500'}`}>Faylni shu yerga tashlang yoki bosing</p>
                  {task.allowed_formats && task.allowed_formats.length > 0 && (
                    <p className={`text-xs mt-1 ${isDark ? 'text-white/25' : 'text-gray-400'}`}>
                      Ruxsat etilgan: {task.allowed_formats.map(f => `.${f}`).join(', ')}
                    </p>
                  )}
                  <input ref={fileRef} type="file" multiple className="hidden"
                    onChange={e => setFiles(Array.from(e.target.files ?? []))} />
                </div>

                {files.length > 0 && (
                  <div className="space-y-1">
                    {files.map((f, i) => (
                      <div key={i} className={`flex items-center justify-between px-3 py-2 rounded-lg ${isDark ? '' : 'bg-gray-50 border border-gray-200'}`}
                        style={isDark ? { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' } : {}}>
                        <span className={`text-xs truncate ${isDark ? 'text-white/60' : 'text-gray-700'}`}>{f.name}</span>
                        <button onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))}
                          className={`ml-2 flex-shrink-0 transition-colors ${isDark ? 'text-white/30 hover:text-red-400' : 'text-gray-400 hover:text-red-500'}`}>
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {error && <p className={`text-xs ${isDark ? 'text-red-400' : 'text-red-600'}`}>{error}</p>}
                {success && <p className={`text-xs ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>{success}</p>}

                <button onClick={handleSubmit} disabled={isPending || files.length === 0}
                  className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${isDark ? 'text-white' : 'text-white'}`}
                  style={isDark ? { background: 'linear-gradient(135deg, rgba(245,158,11,0.8), rgba(217,119,6,0.8))' } : { background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  Topshirish
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between gap-3 pt-2">
        {prevLesson ? (
          <Link href={`/student/courses/${courseId}/lessons/${prevLesson.id}`}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all ${
              isDark ? 'text-white/50 hover:text-white' : 'text-gray-500 hover:text-gray-900'
            }`}
            style={isDark ? { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' } : { background: '#f9fafb', border: '1px solid #e5e7eb' }}>
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:block truncate max-w-[120px]">{prevLesson.title}</span>
          </Link>
        ) : <div />}

        <button onClick={handleComplete} disabled={isPending}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-60 ${isDark ? 'text-white' : 'text-white'}`}
          style={isDark ? { background: 'linear-gradient(135deg, rgba(16,185,129,0.8), rgba(5,150,105,0.8))' } : { background: 'linear-gradient(135deg, #10b981, #059669)' }}>
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
          {nextLesson ? 'Bajarildi va keyingisi' : 'Darsni tugatish'}
        </button>

        {nextLesson ? (
          <Link href={`/student/courses/${courseId}/lessons/${nextLesson.id}`}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all ${
              isDark ? 'text-white/50 hover:text-white' : 'text-gray-500 hover:text-gray-900'
            }`}
            style={isDark ? { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' } : { background: '#f9fafb', border: '1px solid #e5e7eb' }}>
            <span className="hidden sm:block truncate max-w-[120px]">{nextLesson.title}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : <div />}
      </div>
    </div>
  )
}