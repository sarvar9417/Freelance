'use client'

import { useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen, CheckCircle, XCircle, Clock, Search,
  AlertTriangle, X, Loader2, ChevronDown,
} from 'lucide-react'
import { approveCourse, rejectCourse } from '../actions'
import { useMountedTheme } from '@/hooks/useTheme'

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
  isDark: boolean
}

function ConfirmModal({ course, action, onClose, onConfirm, loading, isDark }: ConfirmModalProps) {
  const isApprove = action === 'approve'
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className={`rounded-2xl p-6 w-full max-w-sm ${isDark ? 'border border-white/10' : 'border border-gray-200 shadow-xl'}`}
        style={{ background: isDark ? '#10141f' : '#ffffff' }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${isApprove ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
              <AlertTriangle className={`h-5 w-5 ${isApprove ? 'text-emerald-400' : 'text-red-400'}`} />
            </div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {isApprove ? 'Kursni tasdiqlash' : 'Kursni rad etish'}
            </h3>
          </div>
          <button onClick={onClose} className={isDark ? 'text-white/30 hover:text-white' : 'text-gray-400 hover:text-gray-600'}>
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className={`text-sm mb-6 ${isDark ? 'text-white/50' : 'text-gray-600'}`}>
          <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{course.emoji} {course.title}</span>{' '}
          kursini {isApprove ? 'tasdiqlashni' : 'rad etishni'} tasdiqlaysizmi?
        </p>
        <div className="flex gap-3">
          <button onClick={onClose}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
              isDark ? 'text-white/50 hover:text-white hover:bg-white/5 border-white/5' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-gray-200'
            }`}>
            Bekor qilish
          </button>
          <button onClick={onConfirm} disabled={loading}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${
              isApprove ? 'bg-emerald-500/80 hover:bg-emerald-500' : 'bg-red-500/80 hover:bg-red-500'
            }`}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : isApprove ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
            {isApprove ? 'Tasdiqlash' : 'Rad etish'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

interface Props { courses: Course[]; error?: string }

export default function CoursesClient({ courses: initialCourses, error }: Props) {
  const { isDark } = useMountedTheme()
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
        setCourses(prev => prev.map(c => c.id === courseId ? { ...c, status: action === 'approve' ? 'approved' : 'rejected' } : c))
        setModal(null)
      }
    })
  }

  const inputCls = `w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none focus:ring-1 focus:ring-purple-500/50 transition-colors ${
    isDark ? 'bg-white/4 border border-white/8 text-white placeholder-white/30' : 'bg-white border border-gray-200 text-gray-900 placeholder-gray-400'
  }`
  const selectCls = `pl-4 pr-8 py-2.5 rounded-xl text-sm outline-none appearance-none cursor-pointer focus:ring-1 focus:ring-purple-500/50 transition-colors ${
    isDark ? 'bg-white/4 border border-white/8 text-white' : 'bg-white border border-gray-200 text-gray-900'
  }`

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Kurslar</h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>Barcha kurslarni ko&apos;rish va tasdiqlash</p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm ${isDark ? 'bg-emerald-500/8 border border-emerald-500/15' : 'bg-emerald-50 border border-emerald-200'}`}>
          <BookOpen className="h-4 w-4 text-emerald-400" />
          <span className="text-emerald-500 font-semibold">{courses.length}</span>
          <span className={isDark ? 'text-white/40' : 'text-gray-500'}>ta kurs</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isDark ? 'text-white/30' : 'text-gray-400'}`} />
          <input type="text" placeholder="Kurs nomi bo'yicha qidirish..." value={search}
            onChange={e => setSearch(e.target.value)} className={inputCls}
            style={isDark ? { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' } : {}} />
        </div>
        <div className="relative">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={selectCls}
            style={isDark ? { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' } : {}}>
            <option value="all" className={isDark ? 'bg-[#10141f]' : 'bg-white'}>Barcha holatlar</option>
            <option value="pending" className={isDark ? 'bg-[#10141f]' : 'bg-white'}>Kutilmoqda</option>
            <option value="approved" className={isDark ? 'bg-[#10141f]' : 'bg-white'}>Tasdiqlangan</option>
            <option value="rejected" className={isDark ? 'bg-[#10141f]' : 'bg-white'}>Rad etilgan</option>
          </select>
          <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none ${isDark ? 'text-white/30' : 'text-gray-400'}`} />
        </div>
      </div>

      {(error || actionError) && (
        <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error || actionError}</div>
      )}

      <div className={`rounded-2xl overflow-hidden ${isDark ? 'border border-white/7' : 'border border-gray-200'}`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={isDark
                ? { background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }
                : { background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                {['Kurs', 'Kategoriya', 'Holat', 'Sana', 'Amallar'].map((h, i) => (
                  <th key={h} className={`text-xs font-medium px-4 py-3 ${i < 4 ? 'text-left' : 'text-right'} ${i === 1 ? 'hidden sm:table-cell' : ''} ${i === 3 ? 'hidden md:table-cell' : ''} ${isDark ? 'text-white/40' : 'text-gray-500'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className={`text-center py-12 text-sm ${isDark ? 'text-white/30' : 'text-gray-400'}`}>Kurslar topilmadi</td></tr>
              ) : filtered.map((course, i) => {
                const status = course.status ?? 'pending'
                const StatusIcon = STATUS_ICONS[status] ?? Clock
                return (
                  <motion.tr key={course.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                    className={`transition-colors ${isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-gray-50'}`}
                    style={isDark ? { borderBottom: '1px solid rgba(255,255,255,0.04)' } : { borderBottom: '1px solid #f3f4f6' }}>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl flex-shrink-0">{course.emoji ?? '📚'}</span>
                        <div className="min-w-0">
                          <p className={`text-sm font-medium truncate max-w-[160px] ${isDark ? 'text-white' : 'text-gray-900'}`}>{course.title}</p>
                          <p className={`text-xs truncate max-w-[160px] ${isDark ? 'text-white/30' : 'text-gray-400'}`}>{course.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden sm:table-cell">
                      <span className={`text-sm ${isDark ? 'text-white/50' : 'text-gray-600'}`}>{course.category ?? '—'}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[status] ?? ''}`}>
                        <StatusIcon className="h-3 w-3" />{STATUS_LABELS[status] ?? status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <span className={`text-sm ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                        {new Date(course.created_at).toLocaleDateString('uz-UZ', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        {status !== 'approved' && (
                          <button onClick={() => setModal({ course, action: 'approve' })} title="Tasdiqlash"
                            className={`p-1.5 rounded-lg transition-all hover:text-emerald-400 hover:bg-emerald-500/10 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                            <CheckCircle className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {status !== 'rejected' && (
                          <button onClick={() => setModal({ course, action: 'reject' })} title="Rad etish"
                            className={`p-1.5 rounded-lg transition-all hover:text-red-400 hover:bg-red-500/10 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                            <XCircle className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3" style={isDark ? { background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)' } : { background: '#f9fafb', borderTop: '1px solid #e5e7eb' }}>
          <span className={`text-xs ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
            Jami: <span className={`font-medium ${isDark ? 'text-white/50' : 'text-gray-600'}`}>{filtered.length}</span> ta kurs
          </span>
        </div>
      </div>

      <AnimatePresence>
        {modal && (
          <ConfirmModal course={modal.course} action={modal.action} isDark={isDark}
            onClose={() => setModal(null)} onConfirm={() => handleAction(modal.action)} loading={isPending} />
        )}
      </AnimatePresence>
    </div>
  )
}
