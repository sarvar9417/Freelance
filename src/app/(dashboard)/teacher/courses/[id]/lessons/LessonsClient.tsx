'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  GripVertical, Video, FileText, Edit2, Trash2,
  AlertTriangle, X, Loader2, Hash, Plus,
} from 'lucide-react'
import { deleteLesson } from '../../../actions'

interface Lesson {
  id: string
  title: string
  order_num: number
  video_url: string | null
  content: string | null
  created_at: string
}

function DeleteModal({
  lesson, onClose, onConfirm, loading,
}: { lesson: Lesson; onClose: () => void; onConfirm: () => void; loading: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="rounded-2xl p-6 w-full max-w-sm"
        style={{ background: '#10141f', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-red-500/10">
            <AlertTriangle className="h-5 w-5 text-red-400" />
          </div>
          <h3 className="text-white font-semibold">Darsni o&apos;chirish</h3>
          <button onClick={onClose} className="ml-auto text-white/30 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-white/50 text-sm mb-6">
          <span className="text-white font-medium">{lesson.title}</span> darsini o&apos;chirishni tasdiqlaysizmi?
        </p>
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 transition-all border border-white/5">
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

export default function LessonsClient({ courseId, lessons: init }: { courseId: string; lessons: Lesson[] }) {
  const [lessons, setLessons] = useState(init)
  const [deleteTarget, setDeleteTarget] = useState<Lesson | null>(null)
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    if (!deleteTarget) return
    const id = deleteTarget.id
    setError('')
    startTransition(async () => {
      const result = await deleteLesson(id, courseId)
      if (result.error) setError(result.error)
      else { setLessons(prev => prev.filter(l => l.id !== id)); setDeleteTarget(null) }
    })
  }

  if (lessons.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-12 text-center"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="text-5xl mb-4">🎓</div>
        <p className="text-white/50 text-sm mb-1">Hali dars qo&apos;shilmagan</p>
        <p className="text-white/25 text-xs mb-6">Birinchi darsni yarating</p>
        <Link href={`/teacher/courses/${courseId}/lessons/new`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white shadow-lg"
          style={{ background: 'linear-gradient(135deg, rgba(5,150,105,0.9), rgba(4,120,87,0.9))' }}>
          <Plus className="h-4 w-4" /> Dars qo&apos;shish
        </Link>
      </motion.div>
    )
  }

  return (
    <>
      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
      )}

      <div className="space-y-2">
        {lessons.map((lesson, i) => (
          <motion.div
            key={lesson.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3 px-4 py-3.5 rounded-xl group"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            {/* Drag handle */}
            <GripVertical className="h-4 w-4 text-white/15 group-hover:text-white/30 cursor-grab flex-shrink-0" />

            {/* Tartib raqam */}
            <div
              className="h-7 w-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}
            >
              <span className="text-emerald-400">{lesson.order_num}</span>
            </div>

            {/* Ma'lumot */}
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{lesson.title}</p>
              <div className="flex items-center gap-3 mt-0.5">
                {lesson.video_url && (
                  <span className="flex items-center gap-1 text-xs text-blue-400">
                    <Video className="h-3 w-3" /> Video mavjud
                  </span>
                )}
                {lesson.content && (
                  <span className="flex items-center gap-1 text-xs text-white/30">
                    <FileText className="h-3 w-3" /> Matn mavjud
                  </span>
                )}
                {!lesson.video_url && !lesson.content && (
                  <span className="text-xs text-white/20">Kontent yo&apos;q</span>
                )}
              </div>
            </div>

            {/* Amallar */}
            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <Link href={`/teacher/courses/${courseId}/lessons/${lesson.id}/edit`}
                className="p-1.5 rounded-lg text-white/30 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all">
                <Edit2 className="h-3.5 w-3.5" />
              </Link>
              <button onClick={() => setDeleteTarget(lesson)}
                className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Jami */}
      <div className="text-white/25 text-xs text-center pt-2">
        Jami <span className="text-white/50 font-medium">{lessons.length}</span> ta dars
      </div>

      <AnimatePresence>
        {deleteTarget && (
          <DeleteModal
            lesson={deleteTarget}
            onClose={() => setDeleteTarget(null)}
            onConfirm={handleDelete}
            loading={isPending}
          />
        )}
      </AnimatePresence>
    </>
  )
}
