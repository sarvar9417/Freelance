'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Plus, PlayCircle, Edit2, Trash2,
  GripVertical, ExternalLink, Hash,
} from 'lucide-react'
import LessonForm, { type LessonFormData } from '@/components/teacher/LessonForm'

interface Lesson {
  id: string
  order: number
  title: string
  video_url: string
  content: string
}

const INITIAL_LESSONS: Lesson[] = [
  { id: '1', order: 1, title: 'Kursga kirish',          video_url: 'https://youtube.com/watch?v=dQw4w9WgXcQ', content: "Bu darsda kurs haqida umumiy ma'lumot beriladi." },
  { id: '2', order: 2, title: 'Freelancing nima?',      video_url: 'https://youtube.com/watch?v=dQw4w9WgXcQ', content: "Freelancing tushunchasi va imkoniyatlari." },
  { id: '3', order: 3, title: 'Platformalarni tanlash', video_url: 'https://youtube.com/watch?v=dQw4w9WgXcQ', content: "Upwork, Fiverr, Toptal platformalari taqqoslanadi." },
  { id: '4', order: 4, title: 'Profil yaratish',        video_url: 'https://youtube.com/watch?v=dQw4w9WgXcQ', content: "Professional Upwork profili yaratish bosqichlari." },
  { id: '5', order: 5, title: 'Birinchi proposal',      video_url: '', content: "Samarali proposal yozish sirrlari va namunalar." },
]

const COURSE_NAMES: Record<string, string> = {
  '1': 'Freelancing asoslari',
  '2': 'Grafik Dizayn (Figma)',
  '3': 'Copywriting Pro',
}

export default function LessonsPage() {
  const { id } = useParams<{ id: string }>()
  const courseName = COURSE_NAMES[id] ?? 'Kurs'

  const [lessons, setLessons] = useState<Lesson[]>(INITIAL_LESSONS)
  const [formOpen, setFormOpen] = useState(false)
  const [editLesson, setEditLesson] = useState<Lesson | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const handleCreate = async (data: LessonFormData) => {
    await new Promise(r => setTimeout(r, 700))
    const newLesson: Lesson = { id: String(Date.now()), ...data }
    setLessons(l => [...l, newLesson].sort((a, b) => a.order - b.order))
    setFormOpen(false)
  }

  const handleEdit = async (data: LessonFormData) => {
    await new Promise(r => setTimeout(r, 500))
    setLessons(l =>
      l.map(lesson => lesson.id === editLesson?.id ? { ...lesson, ...data } : lesson)
       .sort((a, b) => a.order - b.order)
    )
    setEditLesson(null)
  }

  const handleDelete = (lessonId: string) => {
    setLessons(l => l.filter(lesson => lesson.id !== lessonId))
    setDeleteId(null)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back */}
      <Link href={`/teacher/courses/${id}`} className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm transition-colors">
        <ArrowLeft className="h-4 w-4" /> {courseName}
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Darslar</h1>
          <p className="text-white/40 text-sm mt-1">{lessons.length} ta dars</p>
        </div>
        <button onClick={() => setFormOpen(true)}
          className="flex items-center gap-2 text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-900/30">
          <Plus className="h-4 w-4" /> Dars qo&apos;shish
        </button>
      </div>

      {/* Lessons list */}
      {lessons.length === 0 ? (
        <div className="text-center py-20 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.02)', border: '2px dashed rgba(255,255,255,0.08)' }}>
          <PlayCircle className="h-10 w-10 text-white/20 mx-auto mb-3" />
          <p className="text-white/40 font-medium">Hali dars qo&apos;shilmagan</p>
          <button onClick={() => setFormOpen(true)}
            className="mt-4 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all">
            Birinchi darsni qo&apos;shing
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {lessons.map((lesson, i) => (
              <motion.div key={lesson.id}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3, delay: i * 0.05 }}
                className="flex items-center gap-4 p-4 rounded-2xl group"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>

                {/* Drag handle */}
                <div className="text-white/15 hover:text-white/40 transition-colors cursor-grab flex-shrink-0">
                  <GripVertical className="h-4 w-4" />
                </div>

                {/* Order number */}
                <div className="h-8 w-8 rounded-lg bg-blue-500/15 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-400 text-xs font-bold">{lesson.order}</span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm truncate group-hover:text-blue-300 transition-colors">
                    {lesson.title}
                  </p>
                  {lesson.content && (
                    <p className="text-white/30 text-xs mt-0.5 truncate">{lesson.content}</p>
                  )}
                </div>

                {/* Video badge */}
                {lesson.video_url ? (
                  <a href={lesson.video_url} target="_blank" rel="noopener noreferrer"
                    className="flex-shrink-0 flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full text-blue-300 hover:text-white transition-colors"
                    style={{ background: 'rgba(59,130,246,0.15)' }}>
                    <PlayCircle className="h-3 w-3" />Video
                    <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                ) : (
                  <span className="flex-shrink-0 flex items-center gap-1 text-xs px-2.5 py-1 rounded-full text-white/20"
                    style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <Hash className="h-3 w-3" />Matn
                  </span>
                )}

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button onClick={() => setEditLesson(lesson)}
                    className="h-7 w-7 rounded-lg flex items-center justify-center text-white/30 hover:text-blue-400 hover:bg-blue-400/10 transition-all">
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => setDeleteId(lesson.id)}
                    className="h-7 w-7 rounded-lg flex items-center justify-center text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-all">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create form */}
      <LessonForm open={formOpen} onClose={() => setFormOpen(false)}
        onSubmit={handleCreate} mode="create" defaultOrder={lessons.length + 1} />

      {/* Edit form */}
      <LessonForm open={!!editLesson} onClose={() => setEditLesson(null)}
        onSubmit={handleEdit} mode="edit"
        initial={editLesson ?? undefined} />

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl p-6 text-center"
            style={{ background: '#0e1322', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Trash2 className="h-8 w-8 text-red-400 mx-auto mb-3" />
            <h3 className="text-white font-semibold mb-2">Darsni o&apos;chirish</h3>
            <p className="text-white/40 text-sm mb-6">Bu dars o&apos;chiriladi. Davom etasizmi?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                Bekor qilish
              </button>
              <button onClick={() => handleDelete(deleteId)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-500 transition-all">
                O&apos;chirish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
