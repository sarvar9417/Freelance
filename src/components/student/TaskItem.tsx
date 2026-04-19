'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock, Upload, CheckCircle2, Loader2, AlertCircle,
  Star, ChevronDown, ChevronUp, Paperclip, X, FileText,
} from 'lucide-react'

export type TaskStatus = 'pending' | 'submitted' | 'graded'

export interface TaskData {
  id: string
  title: string
  description: string
  course: string
  deadline: string
  status: TaskStatus
  grade?: number | null
  maxGrade?: number
  feedback?: string | null
  submittedFile?: string | null
}

const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  pending:   { label: 'Bajarilmagan',      color: 'text-amber-400',  bg: 'bg-amber-400/10 border-amber-400/20',   icon: AlertCircle  },
  submitted: { label: "Ko'rib chiqilmoqda", color: 'text-blue-400',   bg: 'bg-blue-400/10 border-blue-400/20',     icon: Loader2      },
  graded:    { label: 'Baholandi',          color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20', icon: CheckCircle2 },
}

function isOverdue(deadline: string) {
  return new Date(deadline) < new Date()
}

function formatDeadline(deadline: string) {
  const d = new Date(deadline)
  return d.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' })
}

interface Props {
  task: TaskData
  index?: number
}

export default function TaskItem({ task, index = 0 }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploaded, setUploaded] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const cfg = STATUS_CONFIG[task.status]
  const Icon = cfg.icon
  const overdue = task.status === 'pending' && isOverdue(task.deadline)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) setFile(f)
  }

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    await new Promise(r => setTimeout(r, 1800))
    setUploading(false)
    setUploaded(true)
    setFile(null)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.07 }}
      className="rounded-2xl overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      {/* Header row */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 p-5 text-left hover:bg-white/3 transition-colors"
      >
        {/* Status icon */}
        <div className={`flex-shrink-0 h-10 w-10 rounded-xl flex items-center justify-center border ${cfg.bg}`}>
          <Icon className={`h-4 w-4 ${cfg.color} ${task.status === 'submitted' ? 'animate-spin' : ''}`} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-white font-semibold text-sm truncate">{task.title}</p>
            {task.status === 'graded' && task.grade != null && (
              <span className="flex items-center gap-1 text-amber-400 text-xs font-bold flex-shrink-0">
                <Star className="h-3 w-3 fill-amber-400" />
                {task.grade}/{task.maxGrade ?? 100}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
            <span className="text-white/40 text-xs">{task.course}</span>
            <span className={`text-xs flex items-center gap-1 ${overdue ? 'text-red-400' : 'text-white/30'}`}>
              <Clock className="h-3 w-3" />
              {formatDeadline(task.deadline)}
              {overdue && ' — Muhlat o\'tdi!'}
            </span>
          </div>
        </div>

        {/* Status badge */}
        <div className={`hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border flex-shrink-0 ${cfg.bg} ${cfg.color}`}>
          {cfg.label}
        </div>

        {/* Expand arrow */}
        <div className="text-white/30 flex-shrink-0">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {/* Expanded body */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-white/5 pt-4 space-y-4">
              {/* Description */}
              <p className="text-white/60 text-sm leading-relaxed">{task.description}</p>

              {/* Graded feedback */}
              {task.status === 'graded' && task.feedback && (
                <div className="rounded-xl p-4" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                  <p className="text-emerald-400 text-xs font-semibold mb-1">O&apos;qituvchi izohi:</p>
                  <p className="text-white/70 text-sm leading-relaxed">{task.feedback}</p>
                </div>
              )}

              {/* Submitted info */}
              {task.status === 'submitted' && (
                <div className="rounded-xl p-4 flex items-center gap-3" style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}>
                  <Loader2 className="h-4 w-4 text-blue-400 animate-spin flex-shrink-0" />
                  <p className="text-blue-300 text-sm">
                    Topshirig&apos;ingiz yuborilgan. O&apos;qituvchi ko&apos;rib chiqmoqda...
                  </p>
                </div>
              )}

              {/* Upload area — only for pending */}
              {task.status === 'pending' && !uploaded && (
                <div>
                  <input
                    ref={fileRef}
                    type="file"
                    className="hidden"
                    onChange={handleFile}
                    accept=".pdf,.doc,.docx,.zip,.png,.jpg,.jpeg"
                  />

                  {!file ? (
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="w-full rounded-xl py-6 flex flex-col items-center gap-2 transition-all duration-200 hover:bg-white/5"
                      style={{ border: '2px dashed rgba(255,255,255,0.1)' }}
                    >
                      <Upload className="h-5 w-5 text-white/30" />
                      <p className="text-white/40 text-sm">Fayl yuklash uchun bosing</p>
                      <p className="text-white/20 text-xs">PDF, DOC, ZIP, PNG — max 50MB</p>
                    </button>
                  ) : (
                    <div className="rounded-xl p-4 flex items-center gap-3" style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <div className="bg-blue-500/20 h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0">
                        <FileText className="h-4 w-4 text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{file.name}</p>
                        <p className="text-white/40 text-xs">{(file.size / 1024).toFixed(0)} KB</p>
                      </div>
                      <button
                        onClick={() => { setFile(null); if (fileRef.current) fileRef.current.value = '' }}
                        className="text-white/30 hover:text-red-400 transition-colors flex-shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  <div className="flex gap-3 mt-3">
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white transition-all"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      <Paperclip className="h-3.5 w-3.5" />
                      {file ? 'Boshqa fayl' : 'Fayl tanlash'}
                    </button>

                    {file && (
                      <button
                        onClick={handleUpload}
                        disabled={uploading}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-all disabled:opacity-60 shadow-lg shadow-blue-900/30"
                      >
                        {uploading ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Yuklanmoqda...
                          </>
                        ) : (
                          <>
                            <Upload className="h-3.5 w-3.5" />
                            Topshiriqni yuborish
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Uploaded success */}
              {uploaded && (
                <div className="rounded-xl p-4 flex items-center gap-3" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                  <div>
                    <p className="text-emerald-400 font-semibold text-sm">Yuborildi!</p>
                    <p className="text-white/50 text-xs">O&apos;qituvchi tekshirib, baho qo&apos;yadi</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
