'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload, FileText, X, Loader2, CheckCircle2,
  Clock, Star, AlertCircle, Download,
} from 'lucide-react'

interface SubmissionHistory {
  id: string
  fileName: string
  fileSize: string
  submittedAt: string
  status: 'pending' | 'reviewed' | 'graded'
  grade?: number
  feedback?: string
}

interface Props {
  taskId: string
  taskTitle: string
  taskDescription: string
  deadline: string
  fileRequirements: string
  maxGrade: number
  history: SubmissionHistory[]
}

const STATUS_CONFIG = {
  pending:  { label: "Ko'rib chiqilmoqda", color: 'text-blue-400',    bg: 'bg-blue-400/10 border-blue-400/20',     icon: Loader2      },
  reviewed: { label: 'Tekshirildi',        color: 'text-purple-400',  bg: 'bg-purple-400/10 border-purple-400/20', icon: CheckCircle2 },
  graded:   { label: 'Baholandi',          color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20', icon: Star       },
}

function formatDeadline(d: string) {
  const date = new Date(d)
  const now = new Date()
  const diff = date.getTime() - now.getTime()
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))

  if (days < 0) return { text: `${Math.abs(days)} kun muhlat o'tdi`, overdue: true }
  if (days === 0) return { text: 'Bugun — oxirgi kun!', overdue: true }
  if (days === 1) return { text: 'Ertaga', overdue: false }
  return { text: `${days} kun qoldi`, overdue: false }
}

export default function TaskSubmission({
  taskTitle, taskDescription, deadline, fileRequirements, maxGrade, history,
}: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const deadlineInfo = formatDeadline(deadline)
  const latestSubmission = history[0] ?? null

  const handleFile = (f: File) => {
    const maxSize = 50 * 1024 * 1024
    if (f.size > maxSize) return
    setFile(f)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  const handleSubmit = async () => {
    if (!file) return
    setUploading(true)
    await new Promise(r => setTimeout(r, 2000))
    setUploading(false)
    setSubmitted(true)
    setFile(null)
  }

  return (
    <div className="space-y-5">
      {/* Task info */}
      <div className="rounded-2xl p-6 space-y-4"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="bg-amber-500/15 p-2 rounded-lg flex-shrink-0">
              <span className="text-lg">📋</span>
            </div>
            <h2 className="text-white font-semibold">{taskTitle}</h2>
          </div>
          <div className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full flex-shrink-0 ${
            deadlineInfo.overdue ? 'text-red-400 bg-red-400/10 border border-red-400/20' : 'text-amber-400 bg-amber-400/10 border border-amber-400/20'
          }`}>
            <Clock className="h-3 w-3" />
            {deadlineInfo.text}
          </div>
        </div>
        <p className="text-white/60 text-sm leading-relaxed">{taskDescription}</p>
        <div className="flex items-center gap-2 text-white/30 text-xs">
          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
          <span>Fayl talablari: <span className="text-white/50">{fileRequirements}</span></span>
          <span className="ml-auto flex items-center gap-1">
            <Star className="h-3 w-3 text-amber-400" />
            Max: <span className="text-amber-400 font-semibold">{maxGrade} ball</span>
          </span>
        </div>
      </div>

      {/* Upload area */}
      <div className="rounded-2xl p-6"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
          <Upload className="h-4 w-4 text-blue-400" />
          Topshiriqni yuborish
        </h3>

        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div key="success"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-3 py-8">
              <div className="h-16 w-16 rounded-2xl bg-emerald-500/15 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-400" />
              </div>
              <div className="text-center">
                <p className="text-white font-semibold">Muvaffaqiyatli yuborildi!</p>
                <p className="text-white/40 text-sm mt-1">O&apos;qituvchi tekshirib, baho qo&apos;yadi</p>
              </div>
              <button onClick={() => setSubmitted(false)}
                className="text-blue-400 hover:text-blue-300 text-sm transition-colors">
                Qayta yuborish
              </button>
            </motion.div>
          ) : (
            <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {/* Drop zone */}
              <input ref={fileRef} type="file" className="hidden"
                accept=".pdf,.doc,.docx,.zip,.rar,.png,.jpg,.jpeg"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />

              {!file ? (
                <div
                  onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileRef.current?.click()}
                  className={`rounded-xl py-10 flex flex-col items-center gap-3 cursor-pointer transition-all ${
                    dragOver ? 'bg-blue-500/10' : 'hover:bg-white/3'
                  }`}
                  style={{ border: `2px dashed ${dragOver ? 'rgba(59,130,246,0.5)' : 'rgba(255,255,255,0.1)'}` }}
                >
                  <div className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-all ${dragOver ? 'bg-blue-500/20' : 'bg-white/5'}`}>
                    <Upload className={`h-6 w-6 ${dragOver ? 'text-blue-400' : 'text-white/30'}`} />
                  </div>
                  <div className="text-center">
                    <p className="text-white/60 text-sm font-medium">
                      {dragOver ? "Faylni qo'yib yuboring" : "Fayl yuklash uchun bosing yoki sudrab olib keling"}
                    </p>
                    <p className="text-white/25 text-xs mt-1">{fileRequirements}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-4 rounded-xl"
                    style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}>
                    <div className="bg-blue-500/20 h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FileText className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{file.name}</p>
                      <p className="text-white/40 text-xs">{(file.size / 1024).toFixed(0)} KB</p>
                    </div>
                    <button onClick={() => { setFile(null); if (fileRef.current) fileRef.current.value = '' }}
                      className="text-white/30 hover:text-red-400 transition-colors flex-shrink-0">
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => fileRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white transition-all"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      Boshqa fayl
                    </button>
                    <button onClick={handleSubmit} disabled={uploading}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-60 transition-all shadow-lg shadow-blue-900/30">
                      {uploading ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> Yuklanmoqda...</>
                      ) : (
                        <><Upload className="h-4 w-4" /> Topshiriqni yuborish</>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Submission history */}
      {history.length > 0 && (
        <div className="rounded-2xl p-6"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h3 className="text-white font-semibold text-sm mb-4">Yuborilgan ishlar tarixi</h3>
          <div className="space-y-3">
            {history.map((sub, i) => {
              const cfg = STATUS_CONFIG[sub.status]
              const Icon = cfg.icon
              return (
                <div key={sub.id}
                  className={`rounded-xl p-4 ${i === 0 ? 'border' : ''}`}
                  style={i === 0 ? { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' } : { background: 'rgba(255,255,255,0.02)' }}>

                  <div className="flex items-center gap-3">
                    <div className="bg-white/5 h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FileText className="h-4 w-4 text-white/40" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{sub.fileName}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-white/30 text-xs">{sub.fileSize}</span>
                        <span className="text-white/20 text-xs flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5" />{sub.submittedAt}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.color}`}>
                        <Icon className={`h-3 w-3 ${sub.status === 'pending' ? 'animate-spin' : ''}`} />
                        {cfg.label}
                      </span>
                      {sub.grade !== undefined && (
                        <span className="text-amber-400 text-sm font-bold">
                          {sub.grade}<span className="text-white/30 text-xs">/{maxGrade}</span>
                        </span>
                      )}
                      <button className="text-white/20 hover:text-white/60 transition-colors">
                        <Download className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {sub.feedback && (
                    <div className="mt-3 pt-3 border-t border-white/5">
                      <p className="text-white/40 text-xs font-medium mb-1">O&apos;qituvchi izohi:</p>
                      <p className="text-white/60 text-xs leading-relaxed">{sub.feedback}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Latest grade highlight */}
      {latestSubmission?.status === 'graded' && latestSubmission.grade !== undefined && (
        <div className="rounded-2xl p-5 flex items-center gap-4"
          style={{ background: 'linear-gradient(135deg,rgba(16,185,129,0.1),rgba(59,130,246,0.07))', border: '1px solid rgba(16,185,129,0.25)' }}>
          <div className="h-14 w-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl font-extrabold text-emerald-400">{latestSubmission.grade}</span>
          </div>
          <div>
            <p className="text-white font-semibold">Bahoyingiz: {latestSubmission.grade}/{maxGrade}</p>
            <p className="text-white/40 text-sm mt-0.5">
              {latestSubmission.grade >= 90 ? "A'lo natija! 🏆" :
               latestSubmission.grade >= 70 ? "Yaxshi natija! 👏" :
               latestSubmission.grade >= 50 ? "Qabul qilindi ✓" : "Qayta ishlab yuboring"}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
