'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Edit2, BookOpen, ClipboardList, Users, Trash2,
  AlertTriangle, X, Loader2, CheckCircle, Clock, GraduationCap, Plus,
} from 'lucide-react'
import { deleteCourse } from '../actions'

interface Course {
  id: string
  title: string
  description: string | null
  category: string | null
  emoji: string | null
  image_url: string | null
  is_published: boolean | null
  status: string | null
  students: number
  lessons: number
  tasks: number
}

function DeleteModal({
  course, onClose, onConfirm, loading,
}: { course: Course; onClose: () => void; onConfirm: () => void; loading: boolean }) {
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
          <h3 className="text-white font-semibold">Kursni o&apos;chirish</h3>
          <button onClick={onClose} className="ml-auto text-white/30 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-white/50 text-sm mb-1">
          <span className="text-white font-medium">{course.emoji} {course.title}</span> kursini o&apos;chirishni tasdiqlaysizmi?
        </p>
        <p className="text-red-400/70 text-xs mb-6">Barcha darslar, topshiriqlar va o&apos;quvchilar ma&apos;lumotlari o&apos;chiriladi!</p>
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

export default function CoursesGrid({ courses: init }: { courses: Course[] }) {
  const [courses, setCourses] = useState(init)
  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null)
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    if (!deleteTarget) return
    const id = deleteTarget.id
    setError('')
    startTransition(async () => {
      const result = await deleteCourse(id)
      if (result.error) { setError(result.error) }
      else { setCourses(prev => prev.filter(c => c.id !== id)); setDeleteTarget(null) }
    })
  }

  if (courses.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-12 text-center"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="mb-4 text-5xl">📚</div>
        <p className="text-white/50 text-sm mb-1">Hali hech qanday kurs yaratilmagan</p>
        <p className="text-white/25 text-xs mb-6">Birinchi kursingizni yarating va o&apos;quvchilarni jalb qiling</p>
        <Link
          href="/teacher/courses/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white shadow-lg"
          style={{ background: 'linear-gradient(135deg, rgba(5,150,105,0.9), rgba(4,120,87,0.9))' }}
        >
          <Plus className="h-4 w-4" />
          Birinchi kursni yaratish
        </Link>
      </motion.div>
    )
  }

  return (
    <>
      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">{error}</div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course, i) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="rounded-2xl overflow-hidden flex flex-col"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            {/* Cover */}
            <div
              className="h-32 flex items-center justify-center text-5xl relative"
              style={{ background: 'linear-gradient(135deg, rgba(5,150,105,0.15), rgba(59,130,246,0.10))' }}
            >
              {course.image_url ? (
                <img src={course.image_url} alt={course.title} className="w-full h-full object-cover" />
              ) : (
                <span>{course.emoji ?? '📚'}</span>
              )}
              <span className={`absolute top-3 right-3 text-xs px-2.5 py-1 rounded-full border font-medium ${
                course.is_published
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25'
                  : 'bg-white/5 text-white/40 border-white/10'
              }`}>
                {course.is_published ? 'Nashr etilgan' : 'Qoralama'}
              </span>
            </div>

            {/* Kontent */}
            <div className="p-4 flex-1 flex flex-col gap-3">
              <div>
                <h3 className="text-white font-semibold text-sm line-clamp-1">{course.title}</h3>
                <p className="text-white/40 text-xs mt-0.5">{course.category}</p>
              </div>

              {/* Statistika */}
              <div className="flex items-center gap-3 text-xs text-white/40">
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3 text-blue-400" />
                  {course.students}
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3 text-emerald-400" />
                  {course.lessons}
                </span>
                <span className="flex items-center gap-1">
                  <ClipboardList className="h-3 w-3 text-amber-400" />
                  {course.tasks}
                </span>
              </div>

              {/* Admin holati */}
              <div className={`flex items-center gap-1.5 text-xs ${
                course.status === 'approved' ? 'text-emerald-400' :
                course.status === 'rejected' ? 'text-red-400' : 'text-amber-400'
              }`}>
                {course.status === 'approved' ? <CheckCircle className="h-3 w-3" /> :
                 course.status === 'rejected' ? <X className="h-3 w-3" /> :
                 <Clock className="h-3 w-3" />}
                {course.status === 'approved' ? 'Admin tasdiqlagan' :
                 course.status === 'rejected' ? 'Admin rad etgan' : 'Admin tekshirmoqda'}
              </div>

              {/* Tugmalar */}
              <div className="grid grid-cols-2 gap-2 mt-auto">
                <Link href={`/teacher/courses/${course.id}/edit`}
                  className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all border border-white/5">
                  <Edit2 className="h-3 w-3" /> Tahrirlash
                </Link>
                <Link href={`/teacher/courses/${course.id}/lessons`}
                  className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all border border-white/5">
                  <BookOpen className="h-3 w-3" /> Darslar
                </Link>
                <Link href={`/teacher/courses/${course.id}/tasks`}
                  className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all border border-white/5">
                  <ClipboardList className="h-3 w-3" /> Topshiriqlar
                </Link>
                <Link href={`/teacher/courses/${course.id}/students`}
                  className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all border border-white/5">
                  <GraduationCap className="h-3 w-3" /> O&apos;quvchilar
                </Link>
              </div>

              <button
                onClick={() => setDeleteTarget(course)}
                className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium text-red-400/50 hover:text-red-400 hover:bg-red-500/10 transition-all border border-red-500/10">
                <Trash2 className="h-3 w-3" /> O&apos;chirish
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {deleteTarget && (
          <DeleteModal
            course={deleteTarget}
            onClose={() => setDeleteTarget(null)}
            onConfirm={handleDelete}
            loading={isPending}
          />
        )}
      </AnimatePresence>
    </>
  )
}
