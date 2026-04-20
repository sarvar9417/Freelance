'use client'

import { useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen, CheckCircle, XCircle, Clock, Search,
  AlertTriangle, X, Loader2, ChevronDown,
} from 'lucide-react'
import { approveCourse, rejectCourse } from '../actions'

interface Course {
  id: string
  title: string
  description: string | null
  category: string | null
  emoji: string | null
  status: string | null
  created_at: string
  teacher_id: string | null
}

const STATUS_LABELS: Record<string, string> = {
  approved: 'Tasdiqlangan',
  rejected: 'Rad etilgan',
  pending: 'Kutilmoqda',
}

const STATUS_COLORS: Record<string, string> = {
  approved: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  rejected: 'bg-red-500/15 text-red-400 border-red-500/20',
  pending: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
}

const STATUS_ICONS: Record<string, React.ElementType> = {
  approved: CheckCircle,
  rejected: XCircle,
  pending: Clock,
}

interface ConfirmModalProps {
  course: Course
  action: 'approve' | 'reject'
  onClose: () => void
  onConfirm: () => void
  loading: boolean
}

function ConfirmModal({ course, action, onClose, onConfirm, loading }: ConfirmModalProps) {
  const isApprove = action === 'approve'
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="rounded-2xl p-6 w-full max-w-sm"
        style={{ background: '#10141f', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${isApprove ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
              <AlertTriangle className={`h-5 w-5 ${isApprove ? 'text-emerald-400' : 'text-red-400'}`} />
            </div>
            <h3 className="text-white font-semibold">
              {isApprove ? 'Kursni tasdiqlash' : 'Kursni rad etish'}
            </h3>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-white/50 text-sm mb-6">
          <span className="text-white font-medium">{course.emoji} {course.title}</span>{' '}
          kursini {isApprove ? 'tasdiqlashni' : 'rad etishni'} tasdiqlaysizmi?
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 transition-all border border-white/5"
          >
            Bekor qilish
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${
              isApprove ? 'bg-emerald-500/80 hover:bg-emerald-500' : 'bg-red-500/80 hover:bg-red-500'
            }`}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : isApprove ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
            {isApprove ? 'Tasdiqlash' : 'Rad etish'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

interface Props {
  courses: Course[]
  error?: string
}

export default function CoursesClient({ courses: initialCourses, error }: Props) {
  const [courses, setCourses] = useState(initialCourses)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [modal, setModal] = useState<{ course: Course; action: 'approve' | 'reject' } | null>(null)
  const [actionError, setActionError] = useState('')
  const [isPending, startTransition] = useTransition()

  const filtered = courses.filter(c => {
    const matchSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      (c.category ?? '').toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || (c.status ?? 'pending') === statusFilter
    return matchSearch && matchStatus
  })

  const handleAction = (action: 'approve' | 'reject') => {
    if (!modal) return
    const courseId = modal.course.id
    setActionError('')
    startTransition(async () => {
      const result = action === 'approve' ? await approveCourse(courseId) : await rejectCourse(courseId)
      if (result.error) {
        setActionError(result.error)
      } else {
        setCourses(prev =>
          prev.map(c =>
            c.id === courseId ? { ...c, status: action === 'approve' ? 'approved' : 'rejected' } : c
          )
        )
        setModal(null)
      }
    })
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Kurslar</h1>
          <p className="text-white/40 text-sm mt-1">Barcha kurslarni ko&apos;rish va tasdiqlash</p>
        </div>
        <div
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm"
          style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}
        >
          <BookOpen className="h-4 w-4 text-emerald-400" />
          <span className="text-emerald-400 font-semibold">{courses.length}</span>
          <span className="text-white/40">ta kurs</span>
        </div>
      </div>

      {/* Filterlar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
          <input
            type="text"
            placeholder="Kurs nomi bo'yicha qidirish..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-white/30 outline-none focus:ring-1 focus:ring-purple-500/50"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="pl-4 pr-8 py-2.5 rounded-xl text-sm text-white outline-none appearance-none cursor-pointer focus:ring-1 focus:ring-purple-500/50"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <option value="all" className="bg-[#10141f]">Barcha holatlar</option>
            <option value="pending" className="bg-[#10141f]">Kutilmoqda</option>
            <option value="approved" className="bg-[#10141f]">Tasdiqlangan</option>
            <option value="rejected" className="bg-[#10141f]">Rad etilgan</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 pointer-events-none" />
        </div>
      </div>

      {(error || actionError) && (
        <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error || actionError}
        </div>
      )}

      {/* Jadval */}
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <th className="text-left text-xs font-medium text-white/40 px-4 py-3">Kurs</th>
                <th className="text-left text-xs font-medium text-white/40 px-4 py-3 hidden sm:table-cell">Kategoriya</th>
                <th className="text-left text-xs font-medium text-white/40 px-4 py-3">Holat</th>
                <th className="text-left text-xs font-medium text-white/40 px-4 py-3 hidden md:table-cell">Sana</th>
                <th className="text-right text-xs font-medium text-white/40 px-4 py-3">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-white/30 text-sm">
                    Kurslar topilmadi
                  </td>
                </tr>
              ) : (
                filtered.map((course, i) => {
                  const status = course.status ?? 'pending'
                  const StatusIcon = STATUS_ICONS[status] ?? Clock
                  return (
                    <motion.tr
                      key={course.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.04 }}
                      className="transition-colors hover:bg-white/[0.02]"
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl flex-shrink-0">{course.emoji ?? '📚'}</span>
                          <div className="min-w-0">
                            <p className="text-white text-sm font-medium truncate max-w-[160px]">{course.title}</p>
                            <p className="text-white/30 text-xs truncate max-w-[160px]">{course.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 hidden sm:table-cell">
                        <span className="text-white/50 text-sm">{course.category ?? '—'}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[status] ?? ''}`}>
                          <StatusIcon className="h-3 w-3" />
                          {STATUS_LABELS[status] ?? status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell">
                        <span className="text-white/30 text-sm">
                          {new Date(course.created_at).toLocaleDateString('uz-UZ', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-2">
                          {status !== 'approved' && (
                            <button
                              onClick={() => setModal({ course, action: 'approve' })}
                              title="Tasdiqlash"
                              className="p-1.5 rounded-lg text-white/30 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
                            >
                              <CheckCircle className="h-3.5 w-3.5" />
                            </button>
                          )}
                          {status !== 'rejected' && (
                            <button
                              onClick={() => setModal({ course, action: 'reject' })}
                              title="Rad etish"
                              className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all"
                            >
                              <XCircle className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        <div
          className="px-4 py-3"
          style={{ background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)' }}
        >
          <span className="text-white/30 text-xs">
            Jami: <span className="text-white/50 font-medium">{filtered.length}</span> ta kurs
          </span>
        </div>
      </div>

      <AnimatePresence>
        {modal && (
          <ConfirmModal
            course={modal.course}
            action={modal.action}
            onClose={() => setModal(null)}
            onConfirm={() => handleAction(modal.action)}
            loading={isPending}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
