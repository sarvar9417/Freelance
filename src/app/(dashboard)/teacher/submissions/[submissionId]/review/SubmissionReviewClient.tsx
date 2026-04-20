'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Star, RotateCcw, CheckCircle2, Clock,
  FileText, Download, Calendar, User, BookOpen,
  Loader2, AlertCircle, MessageSquare,
} from 'lucide-react'
import { reviewSubmission, requestResubmission } from '../../../actions'

interface Submission {
  id: string
  student_id: string
  task_id: string
  submitted_at: string
  status: string
  score: number | null
  feedback: string
  file_urls: string[]
  student_name: string
  student_email: string
  student_avatar: string | null
  task_title: string
  task_description: string
  max_score: number
  allowed_formats: string[]
  deadline: string | null
  course_title: string
  course_emoji: string
  course_id: string
}

const STATUS_MAP = {
  pending:  { label: 'Kutilmoqda',       color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20',   icon: Clock },
  graded:   { label: 'Baholandi',         color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle2 },
  revision: { label: 'Qayta topshirish', color: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/20',       icon: RotateCcw },
}

function getFileIcon(url: string) {
  const ext = url.split('.').pop()?.toLowerCase() ?? ''
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return '🖼️'
  if (['pdf'].includes(ext)) return '📄'
  if (['doc', 'docx'].includes(ext)) return '📝'
  if (['zip', 'rar'].includes(ext)) return '📦'
  if (['mp4', 'mov', 'avi'].includes(ext)) return '🎬'
  if (['xlsx', 'xls'].includes(ext)) return '📊'
  return '📎'
}

function getFileName(url: string) {
  return url.split('/').pop()?.split('?')[0] ?? url
}

export default function SubmissionReviewClient({ submission: s }: { submission: Submission }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [action, setAction] = useState<'grade' | 'revision' | null>(null)
  const [score, setScore] = useState<number>(s.score ?? s.max_score)
  const [feedback, setFeedback] = useState(s.feedback ?? '')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const st = STATUS_MAP[s.status as keyof typeof STATUS_MAP] ?? STATUS_MAP.pending
  const StatusIcon = st.icon
  const initials = s.student_name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)

  const handleGrade = () => {
    if (!feedback.trim()) { setError('Izoh kiritilishi shart'); return }
    if (score < 0 || score > s.max_score) { setError(`Baho 0-${s.max_score} oralig'ida bo'lishi kerak`); return }
    setError('')
    setAction('grade')
    startTransition(async () => {
      const result = await reviewSubmission(s.id, score, feedback)
      if (result.error) { setError(result.error); setAction(null); return }
      setSuccess('Baho muvaffaqiyatli saqlandi!')
      setTimeout(() => router.push('/teacher/tasks/review'), 1500)
    })
  }

  const handleRevision = () => {
    if (!feedback.trim()) { setError('Qayta topshirish sababi kiritilishi shart'); return }
    setError('')
    setAction('revision')
    startTransition(async () => {
      const result = await requestResubmission(s.id, feedback)
      if (result.error) { setError(result.error); setAction(null); return }
      setSuccess("O'quvchiga qayta topshirish so'rovi yuborildi!")
      setTimeout(() => router.push('/teacher/tasks/review'), 1500)
    })
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/teacher/tasks/review"
          className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <p className="text-white/40 text-xs">{s.course_emoji} {s.course_title}</p>
          <h1 className="text-xl font-bold text-white">{s.task_title}</h1>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${st.bg}`}>
          <StatusIcon className={`h-3.5 w-3.5 ${st.color}`} />
          <span className={st.color}>{st.label}</span>
          {s.status === 'graded' && s.score !== null && (
            <span className="text-white/40 ml-0.5">{s.score}/{s.max_score}</span>
          )}
        </span>
      </div>

      {success && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
          {success}
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Left: submission info */}
        <div className="lg:col-span-3 space-y-4">
          {/* Student info */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-5"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-white/40 text-xs font-medium mb-3 flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" /> O&apos;quvchi
            </p>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500/30 to-blue-500/30 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                {initials}
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{s.student_name}</p>
                <p className="text-white/40 text-xs">{s.student_email}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-white/30 text-xs">Topshirilgan</p>
                <p className="text-white/60 text-xs">
                  {new Date(s.submitted_at).toLocaleDateString('uz-UZ', {
                    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Task description */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="rounded-2xl p-5"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-white/40 text-xs font-medium mb-3 flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5" /> Topshiriq talablari
            </p>
            <div className="flex flex-wrap gap-3 mb-3 text-xs text-white/40">
              {s.deadline && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Deadline: {new Date(s.deadline).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3 text-yellow-400" />
                Maks: {s.max_score} ball
              </span>
            </div>
            {s.task_description ? (
              <p className="text-white/60 text-sm leading-relaxed whitespace-pre-wrap">{s.task_description}</p>
            ) : (
              <p className="text-white/25 text-sm italic">Tavsif yo&apos;q</p>
            )}
          </motion.div>

          {/* Submitted files */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="rounded-2xl p-5"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-white/40 text-xs font-medium mb-3 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" /> Topshirilgan fayllar
              <span className="ml-auto bg-white/10 text-white/50 px-2 py-0.5 rounded-full">{s.file_urls.length} ta</span>
            </p>
            {s.file_urls.length === 0 ? (
              <p className="text-white/25 text-sm italic">Fayl yuklanmagan</p>
            ) : (
              <div className="space-y-2">
                {s.file_urls.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all group"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <span className="text-xl">{getFileIcon(url)}</span>
                    <span className="text-white/60 text-sm truncate flex-1 group-hover:text-white transition-colors">
                      {getFileName(url)}
                    </span>
                    <Download className="h-3.5 w-3.5 text-white/20 group-hover:text-emerald-400 transition-colors flex-shrink-0" />
                  </a>
                ))}
              </div>
            )}
          </motion.div>

          {/* Previous feedback if any */}
          {s.feedback && s.status !== 'pending' && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="rounded-2xl p-5"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-white/40 text-xs font-medium mb-2 flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5" /> Avvalgi izoh
              </p>
              <p className="text-white/60 text-sm leading-relaxed">{s.feedback}</p>
            </motion.div>
          )}
        </div>

        {/* Right: grading panel */}
        <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08 }}
          className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl p-5 space-y-5 sticky top-6"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-white font-semibold text-sm">Baholash paneli</p>

            {/* Score */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-white/50 text-xs">Ball (0–{s.max_score})</label>
                <span className="text-white font-bold text-lg">{score}</span>
              </div>
              <input
                type="range" min={0} max={s.max_score} value={score}
                onChange={e => setScore(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-white/20 text-xs mt-1">
                <span>0</span>
                <span>{Math.round(s.max_score / 2)}</span>
                <span>{s.max_score}</span>
              </div>
              <div className="mt-2">
                <input
                  type="number" min={0} max={s.max_score} value={score}
                  onChange={e => setScore(Math.min(s.max_score, Math.max(0, Number(e.target.value))))}
                  className="w-full px-3 py-2 rounded-xl text-sm text-white text-center outline-none focus:ring-1 focus:ring-emerald-500/50"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                />
              </div>
            </div>

            {/* Score percentage bar */}
            <div className="space-y-1">
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${(score / s.max_score) * 100}%`,
                    background: score >= s.max_score * 0.7
                      ? 'linear-gradient(90deg, #10b981, #34d399)'
                      : score >= s.max_score * 0.4
                        ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                        : 'linear-gradient(90deg, #ef4444, #f87171)',
                  }}
                />
              </div>
              <p className="text-white/30 text-xs text-right">{Math.round((score / s.max_score) * 100)}%</p>
            </div>

            {/* Feedback */}
            <div>
              <label className="text-white/50 text-xs mb-1.5 block">Izoh *</label>
              <textarea
                value={feedback} onChange={e => setFeedback(e.target.value)}
                placeholder="O'quvchiga izoh, tavsiya yoki tuzatishlar..."
                rows={5}
                className="w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder-white/25 outline-none focus:ring-1 focus:ring-emerald-500/50 resize-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2.5">
              <button
                onClick={handleGrade}
                disabled={isPending}
                className="w-full py-3 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
                style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.8), rgba(5,150,105,0.8))' }}>
                {isPending && action === 'grade'
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <CheckCircle2 className="h-4 w-4" />}
                Bahoni saqlash
              </button>
              <button
                onClick={handleRevision}
                disabled={isPending}
                className="w-full py-3 rounded-xl text-sm font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2 border"
                style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.2)', color: 'rgb(248,113,113)' }}>
                {isPending && action === 'revision'
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <RotateCcw className="h-4 w-4" />}
                Qayta topshirishni so&apos;rash
              </button>
            </div>

            <Link href="/teacher/tasks/review"
              className="block w-full py-2.5 rounded-xl text-sm font-medium text-white/40 hover:text-white text-center transition-all hover:bg-white/5 border border-white/5">
              Bekor qilish
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
