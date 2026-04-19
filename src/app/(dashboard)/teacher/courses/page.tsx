'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useSearchParams } from 'next/navigation'
import {
  Plus, BookOpen, Users, ClipboardList, Edit2,
  Trash2, MoreVertical, PlayCircle, ChevronRight,
} from 'lucide-react'
import CourseForm, { type CourseFormData } from '@/components/teacher/CourseForm'

interface Course {
  id: string
  title: string
  description: string
  category: string
  emoji: string
  students: number
  lessons: number
  tasks: number
  avgProgress: number
  color: string
}

const INITIAL_COURSES: Course[] = [
  {
    id: '1', title: 'Freelancing asoslari', description: "Freelancing dunyosiga kirish, platforma tanlash va birinchi buyurtma olish.",
    category: "Boshlang'ich", emoji: '🚀', students: 24, lessons: 12, tasks: 4, avgProgress: 62, color: 'from-blue-600 to-blue-800',
  },
  {
    id: '2', title: 'Grafik Dizayn (Figma)', description: "Figma orqali professional UI dizayn yaratish va portfolio tayyorlash.",
    category: "O'rta", emoji: '🎨', students: 18, lessons: 18, tasks: 3, avgProgress: 45, color: 'from-purple-600 to-purple-800',
  },
  {
    id: '3', title: 'Copywriting Pro', description: "Sotuvchi matnlar yozish, AIDA, PAS formulalar va mijozlar bilan ishlash.",
    category: "Boshlang'ich", emoji: '✍️', students: 31, lessons: 10, tasks: 5, avgProgress: 78, color: 'from-emerald-600 to-emerald-800',
  },
]

export default function TeacherCoursesPage() {
  const searchParams = useSearchParams()
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES)
  const [formOpen, setFormOpen] = useState(searchParams.get('new') === '1')
  const [editCourse, setEditCourse] = useState<Course | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  const handleCreate = async (data: CourseFormData) => {
    await new Promise(r => setTimeout(r, 800))
    const newCourse: Course = {
      id: String(Date.now()), ...data, students: 0, lessons: 0, tasks: 0, avgProgress: 0,
      color: 'from-slate-600 to-slate-800',
    }
    setCourses(c => [newCourse, ...c])
    setFormOpen(false)
  }

  const handleEdit = async (data: CourseFormData) => {
    await new Promise(r => setTimeout(r, 600))
    setCourses(c => c.map(course =>
      course.id === editCourse?.id ? { ...course, ...data } : course
    ))
    setEditCourse(null)
  }

  const handleDelete = (id: string) => {
    setCourses(c => c.filter(course => course.id !== id))
    setDeleteId(null)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Mening kurslarim</h1>
          <p className="text-white/40 text-sm mt-1">{courses.length} ta kurs yaratilgan</p>
        </div>
        <button onClick={() => setFormOpen(true)}
          className="flex items-center gap-2 text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-900/30">
          <Plus className="h-4 w-4" />
          Yangi kurs
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Jami kurslar',    count: courses.length,                                       color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: "Jami o'quvchilar", count: courses.reduce((s, c) => s + c.students, 0),         color: 'text-blue-400',    bg: 'bg-blue-500/10'    },
          { label: 'Jami darslar',    count: courses.reduce((s, c) => s + c.lessons, 0),           color: 'text-purple-400',  bg: 'bg-purple-500/10'  },
        ].map(({ label, count, color }) => (
          <div key={label} className="rounded-2xl p-4 text-center"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p className={`text-2xl font-extrabold ${color}`}>{count}</p>
            <p className="text-white/50 text-xs mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Courses grid */}
      {courses.length === 0 ? (
        <div className="text-center py-20 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.02)', border: '2px dashed rgba(255,255,255,0.08)' }}>
          <BookOpen className="h-10 w-10 text-white/20 mx-auto mb-3" />
          <p className="text-white/40 font-medium">Hali kurs yaratmadingiz</p>
          <button onClick={() => setFormOpen(true)}
            className="mt-4 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all">
            Birinchi kursni yarating
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((course, i) => (
            <motion.div key={course.id}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
              className="flex flex-col rounded-2xl overflow-hidden group"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>

              {/* Cover */}
              <div className={`relative h-28 bg-gradient-to-br ${course.color} flex items-center justify-center`}>
                <div className="absolute inset-0 bg-black/20" />
                <span className="relative z-10 text-4xl">{course.emoji}</span>
                <div className="absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full text-white"
                  style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}>
                  {course.category}
                </div>

                {/* Menu */}
                <div className="absolute top-3 right-3">
                  <button onClick={() => setOpenMenu(openMenu === course.id ? null : course.id)}
                    className="h-7 w-7 rounded-lg flex items-center justify-center text-white transition-all"
                    style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}>
                    <MoreVertical className="h-3.5 w-3.5" />
                  </button>

                  {openMenu === course.id && (
                    <div className="absolute right-0 top-9 rounded-xl py-1 z-10 min-w-[140px]"
                      style={{ background: '#0e1322', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <button onClick={() => { setEditCourse(course); setOpenMenu(null) }}
                        className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors">
                        <Edit2 className="h-3.5 w-3.5" /> Tahrirlash
                      </button>
                      <button onClick={() => { setDeleteId(course.id); setOpenMenu(null) }}
                        className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors">
                        <Trash2 className="h-3.5 w-3.5" /> O&apos;chirish
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Body */}
              <div className="flex flex-col flex-1 p-5">
                <h3 className="text-white font-semibold text-sm leading-snug mb-1 group-hover:text-emerald-300 transition-colors">
                  {course.title}
                </h3>
                <p className="text-white/40 text-xs leading-relaxed mb-4 line-clamp-2">{course.description}</p>

                <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                  {[
                    { icon: Users,        val: course.students, label: "O'quvchi" },
                    { icon: PlayCircle,   val: course.lessons,  label: 'Dars'     },
                    { icon: ClipboardList,val: course.tasks,    label: 'Topshiriq'},
                  ].map(({ icon: Icon, val, label }) => (
                    <div key={label} className="rounded-lg p-2" style={{ background: 'rgba(255,255,255,0.03)' }}>
                      <Icon className="h-3.5 w-3.5 text-white/30 mx-auto mb-1" />
                      <p className="text-white font-bold text-sm">{val}</p>
                      <p className="text-white/30 text-[10px]">{label}</p>
                    </div>
                  ))}
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between mb-1.5">
                    <span className="text-white/40 text-xs">O&apos;rtacha progress</span>
                    <span className="text-emerald-400 text-xs font-semibold">{course.avgProgress}%</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full"
                      style={{ width: `${course.avgProgress}%` }} />
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-auto grid grid-cols-2 gap-2">
                  <Link href={`/teacher/courses/${course.id}/lessons`}>
                    <button className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all"
                      style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                      <PlayCircle className="h-3.5 w-3.5" /> Darslar
                    </button>
                  </Link>
                  <Link href={`/teacher/courses/${course.id}`}>
                    <button className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-all">
                      Ko&apos;rish <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create form */}
      <CourseForm open={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleCreate} mode="create" />

      {/* Edit form */}
      <CourseForm open={!!editCourse} onClose={() => setEditCourse(null)}
        onSubmit={handleEdit} mode="edit"
        initial={editCourse ? { title: editCourse.title, description: editCourse.description, category: editCourse.category, emoji: editCourse.emoji } : undefined} />

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl p-6 text-center"
            style={{ background: '#0e1322', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Trash2 className="h-8 w-8 text-red-400 mx-auto mb-3" />
            <h3 className="text-white font-semibold mb-2">Kursni o&apos;chirish</h3>
            <p className="text-white/40 text-sm mb-6">Bu kurs va uning barcha ma&apos;lumotlari o&apos;chiriladi. Davom etasizmi?</p>
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
