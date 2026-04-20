'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ClipboardList, Calendar, Star, Users, Clock,
  Edit2, Trash2, AlertTriangle, X, Loader2, Plus,
} from 'lucide-react'
import { deleteTask } from '../../../actions'

interface Task {
  id: string
  title: string
  description: string | null
  deadline: string | null
  max_score: number
  allowed_formats: string[] | null
  lesson_id: string | null
  total: number
  pending: number
}

function DeleteModal({ task, onClose, onConfirm, loading }: {
  task: Task; onClose: () => void; onConfirm: () => void; loading: boolean
}) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="rounded-2xl p-6 w-full max-w-sm"
        style={{ background: '#10141f', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-red-500/10">
            <AlertTriangle className="h-5 w-5 text-red-400" />
          </div>
          <h3 className="text-white font-semibold">Topshiriqni o&apos;chirish</h3>
          <button onClick={onClose} className="ml-auto text-white/30 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-white/50 text-sm mb-2">
          <span className="text-white font-medium">{task.title}</span> topshirig&apos;ini o&apos;chirishni tasdiqlaysizmi?
        </p>
        <p className="text-red-400/70 text-xs mb-6">Barcha topshirilgan ishlar ham o&apos;chiriladi!</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 transition-all border border-white/5">
            Bekor qilish
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-red-500/80 hover:bg-red-500 text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            O&apos;chirish
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function TasksClient({ courseId, tasks: init }: { courseId: string; tasks: Task[] }) {
  const [tasks, setTasks] = useState(init)
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null)
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    if (!deleteTarget) return
    const id = deleteTarget.id
    setError('')
    startTransition(async () => {
      const result = await deleteTask(id, courseId)
      if (result.error) setError(result.error)
      else { setTasks(prev => prev.filter(t => t.id !== id)); setDeleteTarget(null) }
    })
  }

  if (tasks.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-12 text-center"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="text-5xl mb-4">📝</div>
        <p className="text-white/50 text-sm mb-1">Hali topshiriq yaratilmagan</p>
        <p className="text-white/25 text-xs mb-6">O&apos;quvchilar uchun birinchi topshiriqni yarating</p>
        <Link href={`/teacher/courses/${courseId}/tasks/new`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white shadow-lg"
          style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.8), rgba(217,119,6,0.8))' }}>
          <Plus className="h-4 w-4" /> Topshiriq yaratish
        </Link>
      </motion.div>
    )
  }

  return (
    <>
      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
      )}
      <div className="space-y-3">
        {tasks.map((task, i) => {
          const isOverdue = task.deadline && new Date(task.deadline) < new Date()
          return (
            <motion.div key={task.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="rounded-2xl p-5 group"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <ClipboardList className="h-4 w-4 text-amber-400 flex-shrink-0" />
                    <h3 className="text-white font-semibold text-sm truncate">{task.title}</h3>
                  </div>
                  {task.description && (
                    <p className="text-white/40 text-xs line-clamp-2 mb-3">{task.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    {task.deadline && (
                      <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-400' : 'text-white/40'}`}>
                        <Calendar className="h-3 w-3" />
                        {new Date(task.deadline).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {isOverdue && ' (muddati o\'tgan)'}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-white/40">
                      <Star className="h-3 w-3 text-yellow-400" />
                      Maks: {task.max_score} ball
                    </span>
                    <span className="flex items-center gap-1 text-white/40">
                      <Users className="h-3 w-3 text-blue-400" />
                      {task.total} ta topshirilgan
                    </span>
                    {task.pending > 0 && (
                      <span className="flex items-center gap-1 text-amber-400">
                        <Clock className="h-3 w-3" />
                        {task.pending} ta kutilmoqda
                      </span>
                    )}
                  </div>
                  {task.allowed_formats && task.allowed_formats.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {task.allowed_formats.map(f => (
                        <span key={f} className="text-xs px-1.5 py-0.5 rounded bg-white/5 text-white/30">.{f}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Link href={`/teacher/courses/${courseId}/tasks/${task.id}/edit`}
                    className="p-1.5 rounded-lg text-white/30 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all">
                    <Edit2 className="h-3.5 w-3.5" />
                  </Link>
                  <button onClick={() => setDeleteTarget(task)}
                    className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      <AnimatePresence>
        {deleteTarget && (
          <DeleteModal task={deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={isPending} />
        )}
      </AnimatePresence>
    </>
  )
}
