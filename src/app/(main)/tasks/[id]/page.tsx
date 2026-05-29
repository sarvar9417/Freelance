'use client'

import { useEffect, useState, useRef, useTransition } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Clock, Star, Calendar, Upload, X, Loader2,
  Paperclip, Download, MessageSquare, CheckCircle2, RotateCcw,
  AlertCircle, BookOpen, Zap, Lock,
} from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useMountedTheme } from '@/hooks/useTheme'
import MethodologyTemplate from '@/components/tasks/MethodologyTemplate'

interface Task {
  id: string
  title: string
  description: string | null
  deadline: string | null
  max_score: number
  allowed_formats: string[] | null
  task_file_urls: string[] | null
  course_id: string
  difficulty_level: number
  order_index: number
  task_type: string
  template_data: Record<string, unknown> | null
  course: { id: string; title: string; emoji: string | null } | null
}

interface Submission {
  id: string
  status: string
  score: number | null
  feedback: string | null
  submitted_at: string
  file_urls: string[] | null
}

const DIFFICULTY: Record<number, { label: string; icon: string; color: string; bg: string }> = {
  1: { label: 'Reproduktiv',       icon: '🔄', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  2: { label: 'Produktiv',         icon: '⚙️', color: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/20' },
  3: { label: 'Qisman-izlanishli', icon: '🔍', color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20' },
  4: { label: 'Kreativ',           icon: '🎯', color: 'text-purple-400',  bg: 'bg-purple-500/10 border-purple-500/20' },
}

const STATUS_MAP = {
  pending:  { label: 'Tekshirilmoqda',   color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20',     icon: Clock },
  graded:   { label: 'Baholandi',         color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle2 },
  revision: { label: 'Qayta topshiring',  color: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/20',         icon: RotateCcw },
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
  if (['mp4', 'mov'].includes(ext)) return '🎬'
  if (['xlsx', 'xls'].includes(ext)) return '📊'
  return '📎'
}

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { isDark } = useMountedTheme()

  const [task, setTask] = useState<Task | null>(null)
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [isLocked, setIsLocked] = useState(false)
  const [loading, setLoading] = useState(true)

  const [files, setFiles] = useState<File[]>([])
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()
  const fileRef = useRef<HTMLInputElement>(null)

  const load = async () => {
    const supabase = createClient()

    const [{ data: { user } }, { data: taskData }] = await Promise.all([
      supabase.auth.getUser(),
      supabase.from('tasks')
        .select('id, title, description, deadline, max_score, allowed_formats, task_file_urls, course_id, difficulty_level, order_index, task_type, template_data, courses(id, title, emoji)')
        .eq('id', id)
        .single(),
    ])

    if (!taskData) { setLoading(false); return }

    const courses = taskData.courses as unknown as { id: string; title: string; emoji: string | null } | null
    setTask({
      ...taskData,
      max_score: taskData.max_score ?? 100,
      allowed_formats: taskData.allowed_formats ?? null,
      task_file_urls: taskData.task_file_urls ?? null,
      difficulty_level: taskData.difficulty_level ?? 1,
      order_index: taskData.order_index ?? 0,
      task_type: taskData.task_type ?? 'standard',
      template_data: taskData.template_data ?? null,
      course: courses,
    })

    if (user) {
      setUserId(user.id)

      // topshiriqning submission ini olish
      const { data: sub } = await supabase.from('submissions')
        .select('id, status, score, feedback, submitted_at, file_urls')
        .eq('student_id', user.id)
        .eq('task_id', id)
        .order('submitted_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      setSubmission(sub ?? null)

      // progression lock tekshirish
      if (taskData.difficulty_level > 1) {
        const { data: courseTaskIds } = await supabase.from('tasks')
          .select('id, difficulty_level')
          .eq('course_id', taskData.course_id)
          .lt('difficulty_level', taskData.difficulty_level)

        if (courseTaskIds?.length) {
          const prevIds = courseTaskIds.map(t => t.id)
          const { data: prevSubs } = await supabase.from('submissions')
            .select('task_id')
            .eq('student_id', user.id)
            .in('task_id', prevIds)

          const submittedPrevIds = new Set((prevSubs ?? []).map(s => s.task_id))
          const allPrevDone = prevIds.every(pid => submittedPrevIds.has(pid))
          setIsLocked(!allPrevDone)
        }
      }
    }

    setLoading(false)
  }

  useEffect(() => { load() }, [id])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? [])
    if (!selected.length) return
    const allowedFormats = task?.allowed_formats ?? []
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
    if (!task) return
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

        const res = await fetch('/api/submissions/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taskId: task.id, fileUrls: uploadData.urls, studentComment: comment.trim() || null }),
        })
        const data = await res.json()
        if (!res.ok) { setError(data.error ?? 'Xatolik yuz berdi'); return }

        setFiles([])
        setComment('')

        toast.success(`+${data.xpGained} XP — Topshiriq yuborildi! 📤`, {
          description: "O'qituvchi tekshirgandan so'ng natija ko'rinadi",
          duration: 5000,
        })
        if (data.levelUp) {
          setTimeout(() => toast.success(`Level ${data.newLevel} ga ko'tarildingiz! 🚀`, { duration: 5000 }), 1200)
        }

        await load()
      } catch {
        setError("Server xatosi. Qayta urinib ko'ring.")
      }
    })
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 animate-pulse space-y-4">
        <div className={`h-6 w-32 rounded ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
        <div className={`h-40 rounded-2xl ${isDark ? 'bg-white/5' : 'bg-gray-100'}`} />
        <div className={`h-60 rounded-2xl ${isDark ? 'bg-white/5' : 'bg-gray-100'}`} />
      </div>
    )
  }

  if (!task) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 text-center">
        <p className={isDark ? 'text-white/40' : 'text-gray-500'}>Topshiriq topilmadi</p>
        <Link href="/tasks" className="text-blue-500 text-sm mt-4 inline-block">← Topshiriqlar ro'yxatiga qaytish</Link>
      </div>
    )
  }

  const diff = DIFFICULTY[task.difficulty_level]
  const allowedFormats = task.allowed_formats ?? []
  const taskFiles = task.task_file_urls?.filter(Boolean) ?? []
  const deadline = task.deadline ? new Date(task.deadline) : null
  const daysLeft = deadline ? Math.ceil((deadline.getTime() - Date.now()) / 86400000) : null
  const isOverdue = daysLeft !== null && daysLeft < 0
  const isUrgent = daysLeft !== null && daysLeft >= 0 && daysLeft <= 2
  const statusEntry = submission ? (STATUS_MAP[submission.status as keyof typeof STATUS_MAP] ?? STATUS_MAP.pending) : null
  const canSubmit = userId && !isLocked && (!submission || submission.status === 'revision')

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      {/* Back */}
      <Link href="/tasks" className={`inline-flex items-center gap-1.5 text-sm transition-colors ${
        isDark ? 'text-white/40 hover:text-white' : 'text-gray-500 hover:text-gray-900'
      }`}>
        <ArrowLeft className="h-4 w-4" /> Barcha topshiriqlar
      </Link>

      {/* Task header card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl p-6 space-y-4 ${
          isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200 shadow-sm'
        }`}>
        <div className="flex items-start gap-4">
          <div className={`h-14 w-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${
            isDark ? 'bg-blue-500/10' : 'bg-blue-50'
          }`}>
            {task.course?.emoji ?? '📝'}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className={`text-xl font-bold leading-snug ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {task.title}
            </h1>
            <div className="flex items-center gap-1.5 mt-1">
              <BookOpen className={`h-3.5 w-3.5 ${isDark ? 'text-white/30' : 'text-gray-400'}`} />
              <span className={`text-sm ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                {task.course?.title ?? 'Kurs'}
              </span>
            </div>
          </div>
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap gap-2">
          {diff && (
            <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium border ${diff.bg} ${diff.color}`}>
              {diff.icon} {diff.label}
            </span>
          )}
          <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium border ${
            isDark ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-600'
          }`}>
            <Star className="h-3 w-3" /> {task.max_score} ball
          </span>
          {!submission && (
            <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium border ${
              isDark ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' : 'bg-purple-50 border-purple-200 text-purple-600'
            }`}>
              <Zap className="h-3 w-3" /> +100 XP
            </span>
          )}
          {deadline && (
            <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium border ${
              isOverdue
                ? isDark ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-red-50 border-red-200 text-red-600'
                : isUrgent
                  ? isDark ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-600'
                  : isDark ? 'bg-white/5 border-white/10 text-white/40' : 'bg-gray-50 border-gray-200 text-gray-500'
            }`}>
              <Calendar className="h-3 w-3" />
              {isOverdue ? "Muddati o'tgan" : daysLeft === 0 ? 'Bugun!' : `${daysLeft} kun qoldi`}
              {' '}({deadline.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' })})
            </span>
          )}
          {statusEntry && (
            <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium border ${statusEntry.bg}`}>
              <statusEntry.icon className={`h-3 w-3 ${statusEntry.color}`} />
              <span className={statusEntry.color}>{statusEntry.label}</span>
              {submission?.score !== null && submission?.score !== undefined && (
                <span className={`${isDark ? 'text-white/40' : 'text-gray-400'} ml-0.5`}>
                  {submission.score}/{task.max_score}
                </span>
              )}
            </span>
          )}
        </div>

        {/* Description */}
        {task.description && (
          <p className={`text-sm leading-relaxed ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
            {task.description}
          </p>
        )}

        {/* Methodology template */}
        {task.task_type && task.task_type !== 'standard' && (
          <MethodologyTemplate taskType={task.task_type} templateData={task.template_data} />
        )}

        {/* Teacher files */}
        {taskFiles.length > 0 && (
          <div className={`rounded-xl p-4 space-y-2 ${
            isDark ? 'bg-blue-500/5 border border-blue-500/12' : 'bg-blue-50 border border-blue-100'
          }`}>
            <p className={`text-xs font-medium flex items-center gap-1.5 ${isDark ? 'text-blue-400/70' : 'text-blue-600'}`}>
              <Paperclip className="h-3 w-3" /> O&apos;qituvchi materiallari
            </p>
            {taskFiles.map((url, i) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                className={`flex items-center gap-2.5 p-2 rounded-lg transition-colors group ${
                  isDark ? 'hover:bg-white/5' : 'hover:bg-blue-100'
                }`}>
                <span className="text-base">{getFileIcon(url)}</span>
                <span className={`text-xs truncate flex-1 transition-colors ${
                  isDark ? 'text-white/50 group-hover:text-white' : 'text-gray-600 group-hover:text-gray-900'
                }`}>{getFileName(url)}</span>
                <Download className={`h-3 w-3 flex-shrink-0 ${isDark ? 'text-blue-400/50' : 'text-blue-400'}`} />
              </a>
            ))}
          </div>
        )}
      </motion.div>

      {/* Previous submission info */}
      {submission && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl p-5 space-y-3 ${
            isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200 shadow-sm'
          }`}>
          <h3 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Topshiriq holati
          </h3>
          <div className={`flex items-center gap-1.5 text-xs ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
            <Clock className="h-3 w-3" />
            Topshirilgan: {new Date(submission.submitted_at).toLocaleDateString('uz-UZ', {
              day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
            })}
          </div>
          {submission.feedback && (
            <div className={`rounded-xl p-4 ${
              isDark ? 'bg-white/3 border border-white/8' : 'bg-gray-50 border border-gray-200'
            }`}>
              <p className={`text-xs font-medium mb-1.5 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                O&apos;qituvchi izohi:
              </p>
              <p className={`text-sm leading-relaxed ${isDark ? 'text-white/70' : 'text-gray-700'}`}>
                {submission.feedback}
              </p>
            </div>
          )}
          {submission.status === 'revision' && (
            <div className={`flex items-center gap-2 p-3 rounded-xl ${
              isDark ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-200'
            }`}>
              <RotateCcw className={`h-4 w-4 flex-shrink-0 ${isDark ? 'text-red-400' : 'text-red-500'}`} />
              <p className={`text-xs ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                Qayta topshirish talab qilinmoqda
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* Progression lock */}
      {isLocked && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl p-5 flex items-center gap-3 ${
            isDark ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-amber-50 border border-amber-200'
          }`}>
          <Lock className={`h-5 w-5 flex-shrink-0 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
          <p className={`text-sm ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
            Bu topshiriqni bajarish uchun avval oldingi darajadagi topshiriqlarni bajaring.
          </p>
        </motion.div>
      )}

      {/* Not logged in */}
      {!userId && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl p-6 text-center space-y-4 ${
            isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200 shadow-sm'
          }`}>
          <AlertCircle className={`h-10 w-10 mx-auto ${isDark ? 'text-white/20' : 'text-gray-300'}`} />
          <div>
            <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Topshiriq bajarish uchun kiring
            </p>
            <p className={`text-sm mt-1 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
              Topshiriq yuborish va baholash olish uchun hisobingizga kiring
            </p>
          </div>
          <div className="flex gap-3 justify-center">
            <Link href={`/login?redirectTo=/tasks/${id}`}>
              <button className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isDark
                  ? 'bg-blue-600 hover:bg-blue-500 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}>
                Kirish
              </button>
            </Link>
            <Link href="/register">
              <button className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isDark
                  ? 'border border-white/15 text-white/70 hover:bg-white/5'
                  : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}>
                Ro&apos;yxatdan o&apos;tish
              </button>
            </Link>
          </div>
        </motion.div>
      )}

      {/* Submission form */}
      {canSubmit && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl p-6 space-y-4 ${
            isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200 shadow-sm'
          }`}>
          <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {submission?.status === 'revision' ? 'Qayta topshirish' : 'Topshiriq yuborish'}
          </h3>

          {allowedFormats.length > 0 && (
            <p className={`text-xs ${isDark ? 'text-white/30' : 'text-gray-500'}`}>
              Ruxsat etilgan formatlar: {allowedFormats.map(f => `.${f}`).join(', ')}
            </p>
          )}

          {/* Drag-drop zone */}
          <div
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
              isDark
                ? 'border-white/10 hover:border-blue-500/40 hover:bg-white/[0.02]'
                : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50/50'
            }`}>
            <Upload className={`h-6 w-6 mx-auto mb-2 ${isDark ? 'text-white/30' : 'text-gray-400'}`} />
            <p className={`text-sm font-medium ${isDark ? 'text-white/50' : 'text-gray-600'}`}>
              Fayl yuklash uchun bosing
            </p>
            {allowedFormats.length > 0 && (
              <p className={`text-xs mt-1 ${isDark ? 'text-white/20' : 'text-gray-400'}`}>
                {allowedFormats.map(f => `.${f}`).join(', ')}
              </p>
            )}
            <input
              ref={fileRef} type="file" multiple className="hidden"
              accept={allowedFormats.length > 0 ? allowedFormats.map(f => `.${f}`).join(',') : undefined}
              onChange={handleFileChange}
            />
          </div>

          {/* Selected files */}
          {files.map((f, i) => (
            <div key={i} className={`flex items-center justify-between px-3 py-2 rounded-lg ${
              isDark ? 'bg-white/5 border border-white/8' : 'bg-gray-50 border border-gray-200'
            }`}>
              <span className={`text-xs truncate ${isDark ? 'text-white/60' : 'text-gray-700'}`}>{f.name}</span>
              <button onClick={() => setFiles(p => p.filter((_, j) => j !== i))}
                className={`ml-2 flex-shrink-0 ${isDark ? 'text-white/30 hover:text-red-400' : 'text-gray-400 hover:text-red-500'}`}>
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}

          {/* Comment */}
          <div>
            <label className={`text-xs mb-1.5 flex items-center gap-1.5 ${isDark ? 'text-white/30' : 'text-gray-500'}`}>
              <MessageSquare className="h-3 w-3" /> O&apos;qituvchiga xabar (ixtiyoriy)
            </label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Topshiriq haqida izoh yoki savol..."
              rows={3}
              className={`w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none transition-colors ${
                isDark
                  ? 'bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:border-blue-500/50'
                  : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-blue-400'
              }`}
            />
          </div>

          {error && (
            <p className={`text-xs ${isDark ? 'text-red-400' : 'text-red-500'}`}>{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={isPending || files.length === 0}
            className={`w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 ${
              isDark
                ? 'bg-gradient-to-r from-amber-600/80 to-amber-700/80 hover:from-amber-500/80 hover:to-amber-600/80 text-white'
                : 'bg-amber-500 hover:bg-amber-600 text-white'
            }`}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {submission?.status === 'revision' ? 'Qayta topshirish' : 'Topshirish'}
          </button>
        </motion.div>
      )}

      {/* Already graded */}
      {submission?.status === 'graded' && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl p-5 flex items-center gap-3 ${
            isDark ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-emerald-50 border border-emerald-200'
          }`}>
          <CheckCircle2 className={`h-5 w-5 flex-shrink-0 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
          <p className={`text-sm ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
            Topshiriq baholandi — {submission.score}/{task.max_score} ball olindi
          </p>
        </motion.div>
      )}

      {/* Pending review */}
      {submission?.status === 'pending' && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl p-5 flex items-center gap-3 ${
            isDark ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-amber-50 border border-amber-200'
          }`}>
          <Clock className={`h-5 w-5 flex-shrink-0 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
          <p className={`text-sm ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
            Topshiriq o&apos;qituvchi tekshirishini kutmoqda
          </p>
        </motion.div>
      )}
    </div>
  )
}
