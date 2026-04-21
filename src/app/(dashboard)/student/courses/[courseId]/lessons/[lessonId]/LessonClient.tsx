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
  lesson, task, submission, userId, courseId,
  prevLesson, nextLesson, totalLessons, currentIndex,
}: {
  lesson: Lesson
  task: Task | null
  submission: Submission | null
  userId: string
  courseId: string
  prevLesson: { id: string; title: string } | null
  nextLesson: { id: string; title: string } | null
  totalLessons: number
  currentIndex: number
}) {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>(lesson.video_url ? 'video' : lesson.content ? 'content' : 'task')
  const [isPending, startTransition] = useTransition()
  const [files, setFiles] = useState<File[]>([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  // Darsni tugatish
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
          // XP toast
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

  // Topshiriq topshirish
  const handleSubmit = () => {
    if (files.length === 0) { setError('Fayl yuklang'); return }
    setError('')
    startTransition(async () => {
      try {
        // 1. Fayllarni server API orqali yuklash
        const formData = new FormData()
        formData.append('taskId', task!.id)
        files.forEach(f => formData.append('files', f))

        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData })
        const uploadData = await uploadRes.json()
        if (!uploadRes.ok) { setError(uploadData.error ?? 'Fayl yuklashda xatolik'); return }
        const fileUrls: string[] = uploadData.urls

        // 2. Topshirish
        const res = await fetch('/api/submissions/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taskId: task!.id, fileUrls }),
        })
        const data = await res.json()

        if (!res.ok) {
          setError(data.error ?? 'Xatolik yuz berdi')
          return
        }

        setSuccess('Topshiriq muvaffaqiyatli yuborildi!')
        setFiles([])

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
          }, 1000)
        }

        router.refresh()
      } catch {
        setError('Server xatosi. Qayta urinib ko\'ring.')
      }
    })
  }

  const embedUrl = lesson.video_url ? getEmbedUrl(lesson.video_url) : null
  const STATUS_MAP = {
    pending:  { label: 'Tekshirilmoqda', color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20',   icon: Clock },
    graded:   { label: 'Baholandi',       color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle2 },
    revision: { label: 'Qayta topshiring', color: 'text-red-400',   bg: 'bg-red-500/10 border-red-500/20',       icon: RotateCcw },
  }

  const tabs: { key: Tab; label: string; icon: React.ElementType; show: boolean }[] = [
    { key: 'video',   label: 'Video',     icon: Play,          show: !!lesson.video_url },
    { key: 'content', label: 'Matn',      icon: FileText,      show: !!lesson.content },
    { key: 'task',    label: 'Topshiriq', icon: ClipboardList, show: !!task },
  ]

  return (
    <div className="space-y-4">
      {/* Dars sarlavhasi */}
      <div className="rounded-2xl p-5"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="h-7 w-7 rounded-lg bg-blue-500/15 border border-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-400">
            {lesson.order_num}
          </div>
          <h1 className="text-white text-lg font-bold">{lesson.title}</h1>
        </div>
        <p className="text-white/30 text-xs pl-10">Dars {currentIndex + 1} / {totalLessons}</p>
      </div>

      {/* Tablar */}
      {tabs.filter(t => t.show).length > 1 && (
        <div className="flex gap-2">
          {tabs.filter(t => t.show).map(t => {
            const Icon = t.icon
            return (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  tab === t.key ? 'bg-blue-600/80 text-white' : 'text-white/40 hover:text-white'
                }`}
                style={tab !== t.key ? { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' } : {}}>
                <Icon className="h-3.5 w-3.5" /> {t.label}
              </button>
            )
          })}
        </div>
      )}

      {/* Kontent */}
      <AnimatePresence mode="wait">
        {tab === 'video' && embedUrl && (
          <motion.div key="video" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="rounded-2xl overflow-hidden aspect-video"
            style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <iframe src={embedUrl} className="w-full h-full" allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
          </motion.div>
        )}

        {tab === 'content' && lesson.content && (
          <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="rounded-2xl p-6"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">{lesson.content}</p>
          </motion.div>
        )}

        {tab === 'task' && task && (
          <motion.div key="task" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="rounded-2xl p-5 space-y-4"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-amber-400" /> {task.title}
                </h3>
                {task.deadline && (
                  <p className="text-white/40 text-xs mt-1 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Deadline: {new Date(task.deadline).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                <span className="text-amber-400 text-sm font-bold">{task.max_score}</span>
                <Zap className="h-3.5 w-3.5 text-amber-300 ml-1" />
                <span className="text-amber-300 text-xs">+100 XP</span>
              </div>
            </div>

            {task.description && (
              <p className="text-white/60 text-sm leading-relaxed">{task.description}</p>
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
                        <span className="ml-auto text-white/60">{submission.score}/{task.max_score}</span>
                      )}
                    </div>
                  )
                })()}
                {submission.feedback && (
                  <div className="p-3 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <p className="text-white/40 text-xs mb-1">O&apos;qituvchi izohi:</p>
                    <p className="text-white/70 text-sm">{submission.feedback}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div
                  onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors hover:border-blue-500/50"
                  style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                  <Upload className="h-6 w-6 text-white/30 mx-auto mb-2" />
                  <p className="text-white/50 text-sm">Faylni shu yerga tashlang yoki bosing</p>
                  {task.allowed_formats && task.allowed_formats.length > 0 && (
                    <p className="text-white/25 text-xs mt-1">
                      Ruxsat etilgan: {task.allowed_formats.map(f => `.${f}`).join(', ')}
                    </p>
                  )}
                  <input ref={fileRef} type="file" multiple className="hidden"
                    onChange={e => setFiles(Array.from(e.target.files ?? []))} />
                </div>

                {files.length > 0 && (
                  <div className="space-y-1">
                    {files.map((f, i) => (
                      <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                        <span className="text-white/60 text-xs truncate">{f.name}</span>
                        <button onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))}
                          className="text-white/30 hover:text-red-400 ml-2 flex-shrink-0">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {error && <p className="text-red-400 text-xs">{error}</p>}
                {success && <p className="text-emerald-400 text-xs">{success}</p>}

                <button onClick={handleSubmit} disabled={isPending || files.length === 0}
                  className="w-full py-2.5 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.8), rgba(217,119,6,0.8))' }}>
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  Topshirish
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigatsiya */}
      <div className="flex items-center justify-between gap-3 pt-2">
        {prevLesson ? (
          <Link href={`/student/courses/${courseId}/lessons/${prevLesson.id}`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-white/50 hover:text-white transition-all"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:block truncate max-w-[120px]">{prevLesson.title}</span>
          </Link>
        ) : <div />}

        <button onClick={handleComplete} disabled={isPending}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.8), rgba(5,150,105,0.8))' }}>
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
          {nextLesson ? 'Bajarildi va keyingisi' : 'Darsni tugatish'}
        </button>

        {nextLesson ? (
          <Link href={`/student/courses/${courseId}/lessons/${nextLesson.id}`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-white/50 hover:text-white transition-all"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <span className="hidden sm:block truncate max-w-[120px]">{nextLesson.title}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : <div />}
      </div>
    </div>
  )
}
