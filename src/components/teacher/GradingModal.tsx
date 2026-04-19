'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Star, Loader2, FileText, CheckCircle2, User } from 'lucide-react'

export interface SubmissionData {
  id: string
  studentName: string
  taskTitle: string
  course: string
  submittedAt: string
  fileUrl?: string
  fileName?: string
  currentGrade?: number | null
  currentFeedback?: string | null
  maxGrade: number
}

interface Props {
  open: boolean
  onClose: () => void
  submission: SubmissionData | null
  onGrade: (submissionId: string, grade: number, feedback: string) => Promise<void>
}

export default function GradingModal({ open, onClose, submission, onGrade }: Props) {
  const [grade, setGrade] = useState<number>(0)
  const [feedback, setFeedback] = useState('')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open && submission) {
      setGrade(submission.currentGrade ?? 0)
      setFeedback(submission.currentFeedback ?? '')
      setSaved(false)
      setError('')
    }
  }, [open, submission])

  if (!submission) return null

  const pct = Math.min((grade / submission.maxGrade) * 100, 100)
  const gradeColor =
    pct >= 90 ? 'text-emerald-400' :
    pct >= 70 ? 'text-blue-400' :
    pct >= 50 ? 'text-amber-400' : 'text-red-400'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (grade < 0 || grade > submission.maxGrade) {
      setError(`Baho 0 dan ${submission.maxGrade} gacha bo'lishi kerak`)
      return
    }
    if (!feedback.trim()) { setError("Izoh yozilishi shart"); return }
    setLoading(true)
    try {
      await onGrade(submission.id, grade, feedback)
      setSaved(true)
      setTimeout(onClose, 1200)
    } catch {
      setError("Xatolik yuz berdi. Qayta urinib ko'ring.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div key="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 backdrop-blur-sm" onClick={onClose} />

          <motion.div key="modal" initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">

            <div className="w-full max-w-lg rounded-2xl pointer-events-auto overflow-hidden"
              style={{ background: '#0e1322', border: '1px solid rgba(255,255,255,0.1)' }}
              onClick={e => e.stopPropagation()}>

              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/5">
                <div className="flex items-center gap-2.5">
                  <div className="bg-amber-500/15 p-2 rounded-lg">
                    <Star className="h-4 w-4 text-amber-400" />
                  </div>
                  <h2 className="text-white font-semibold">Baholash</h2>
                </div>
                <button onClick={onClose} className="text-white/30 hover:text-white transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Submission info */}
              <div className="p-6 border-b border-white/5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{submission.studentName}</p>
                    <p className="text-white/40 text-xs">{submission.course}</p>
                  </div>
                </div>
                <div className="rounded-xl p-3.5"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <p className="text-white/60 text-xs mb-0.5">Topshiriq</p>
                  <p className="text-white text-sm font-medium">{submission.taskTitle}</p>
                  <p className="text-white/30 text-xs mt-1">{submission.submittedAt} da yuborilgan</p>
                </div>

                {/* File */}
                {submission.fileName && (
                  <div className="flex items-center gap-3 rounded-xl p-3"
                    style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}>
                    <FileText className="h-4 w-4 text-blue-400 flex-shrink-0" />
                    <span className="text-blue-300 text-sm truncate">{submission.fileName}</span>
                    {submission.fileUrl && (
                      <a href={submission.fileUrl} target="_blank" rel="noopener noreferrer"
                        className="ml-auto text-blue-400 hover:text-blue-300 text-xs font-medium flex-shrink-0">
                        Ko&apos;rish
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Grading form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {saved ? (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 rounded-xl p-4"
                    style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)' }}>
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                    <p className="text-emerald-400 font-semibold">Baho muvaffaqiyatli saqlandi!</p>
                  </motion.div>
                ) : (
                  <>
                    {/* Grade slider */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-white/60 text-xs font-medium">Baho</label>
                        <span className={`text-2xl font-extrabold ${gradeColor}`}>
                          {grade}<span className="text-sm text-white/30">/{submission.maxGrade}</span>
                        </span>
                      </div>

                      <input type="range" min={0} max={submission.maxGrade} value={grade}
                        onChange={e => { setGrade(Number(e.target.value)); setError('') }}
                        className="w-full h-2 rounded-full appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, ${
                            pct >= 90 ? '#10b981' : pct >= 70 ? '#3b82f6' : pct >= 50 ? '#f59e0b' : '#ef4444'
                          } ${pct}%, rgba(255,255,255,0.1) ${pct}%)`,
                        }} />

                      <div className="flex justify-between text-xs text-white/20 mt-1">
                        <span>0</span>
                        <span className="text-amber-400/60">50</span>
                        <span className="text-emerald-400/60">{submission.maxGrade}</span>
                      </div>

                      {/* Quick select */}
                      <div className="flex gap-2 mt-3">
                        {[50, 60, 70, 80, 90, 100].map(v => (
                          <button key={v} type="button"
                            onClick={() => setGrade(Math.min(v, submission.maxGrade))}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                              grade === v
                                ? 'bg-white/20 text-white'
                                : 'bg-white/5 text-white/30 hover:text-white hover:bg-white/10'
                            }`}>
                            {v}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Feedback */}
                    <div>
                      <label className="text-white/60 text-xs font-medium mb-1.5 block">
                        O&apos;qituvchi izohi *
                      </label>
                      <textarea value={feedback} onChange={e => { setFeedback(e.target.value); setError('') }}
                        placeholder="O'quvchiga fikr-mulohaza yozing..."
                        rows={4}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/20 outline-none focus:border-amber-500/50 transition-colors resize-none" />
                    </div>

                    {error && (
                      <p className="text-red-400 text-xs">{error}</p>
                    )}

                    <div className="flex gap-3">
                      <button type="button" onClick={onClose}
                        className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white transition-all"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        Bekor qilish
                      </button>
                      <button type="submit" disabled={loading}
                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-amber-600 hover:bg-amber-500 disabled:opacity-60 transition-all flex items-center justify-center gap-2">
                        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Star className="h-3.5 w-3.5" />}
                        Baholash
                      </button>
                    </div>
                  </>
                )}
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
