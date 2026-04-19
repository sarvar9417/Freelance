'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Plus, ClipboardList, Edit2, Trash2,
  Calendar, Star, AlertCircle, CheckCircle2, Loader2,
  FileText, Clock,
} from 'lucide-react'
import TaskForm, { type TaskFormData } from '@/components/teacher/TaskForm'
import GradingModal, { type SubmissionData } from '@/components/teacher/GradingModal'

interface Task {
  id: string
  title: string
  description: string
  deadline: string
  file_requirements: string
  max_grade: number
  submissions: Submission[]
}

interface Submission {
  id: string
  studentName: string
  submittedAt: string
  fileName: string
  grade: number | null
  feedback: string | null
}

const INITIAL_TASKS: Task[] = [
  {
    id: '1',
    title: "Upwork profilini to'ldiring",
    description: "Professional foto, sarlavha, tavsif va ko'nikmalar bilan to'liq profil yarating.",
    deadline: '2025-02-15',
    file_requirements: 'PDF, PNG — max 20MB',
    max_grade: 100,
    submissions: [
      { id: 's1', studentName: 'Jasur Toshmatov', submittedAt: '2025-01-10 14:30', fileName: 'upwork-profile.pdf', grade: 88, feedback: "Juda yaxshi! Sarlavha kuchli, tavsif batafsil." },
      { id: 's2', studentName: 'Bobur Aliyev',    submittedAt: '2025-01-11 09:15', fileName: 'profile-screenshot.png', grade: null, feedback: null },
      { id: 's3', studentName: 'Malika Yusupova', submittedAt: '2025-01-12 16:45', fileName: 'my-profile.pdf', grade: null, feedback: null },
    ],
  },
  {
    id: '2',
    title: "Birinchi proposal yozing",
    description: "Upwork'da real loyiha toping va professional proposal tayyorlang.",
    deadline: '2025-02-20',
    file_requirements: 'PDF, DOC — max 10MB',
    max_grade: 100,
    submissions: [
      { id: 's4', studentName: 'Jasur Toshmatov', submittedAt: '2025-01-13 11:00', fileName: 'proposal.pdf', grade: 92, feedback: "A'lo! Mijozning muammosi aniq ko'rsatilgan." },
    ],
  },
  {
    id: '3',
    title: 'Narx strategiyasini tuzing',
    description: "O'z sohangizdagi narx belgilash strategiyangizni hujjatlashtiring.",
    deadline: '2025-03-01',
    file_requirements: 'PDF, DOCX — max 15MB',
    max_grade: 100,
    submissions: [],
  },
]

const COURSE_NAMES: Record<string, string> = {
  '1': 'Freelancing asoslari',
  '2': 'Grafik Dizayn (Figma)',
  '3': 'Copywriting Pro',
}

function formatDeadline(d: string) {
  return new Date(d).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' })
}

function isOverdue(d: string) { return new Date(d) < new Date() }

export default function TasksPage() {
  const { id } = useParams<{ id: string }>()
  const courseName = COURSE_NAMES[id] ?? 'Kurs'

  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS)
  const [formOpen, setFormOpen] = useState(false)
  const [editTask, setEditTask] = useState<Task | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [expandedTask, setExpandedTask] = useState<string | null>(null)
  const [gradingSubmission, setGradingSubmission] = useState<SubmissionData | null>(null)

  const handleCreate = async (data: TaskFormData) => {
    await new Promise(r => setTimeout(r, 700))
    setTasks(t => [...t, { id: String(Date.now()), ...data, submissions: [] }])
    setFormOpen(false)
  }

  const handleEdit = async (data: TaskFormData) => {
    await new Promise(r => setTimeout(r, 500))
    setTasks(t => t.map(task => task.id === editTask?.id ? { ...task, ...data } : task))
    setEditTask(null)
  }

  const handleDelete = (taskId: string) => {
    setTasks(t => t.filter(task => task.id !== taskId))
    setDeleteId(null)
  }

  const handleGrade = async (submissionId: string, grade: number, feedback: string) => {
    await new Promise(r => setTimeout(r, 1000))
    setTasks(t => t.map(task => ({
      ...task,
      submissions: task.submissions.map(sub =>
        sub.id === submissionId ? { ...sub, grade, feedback } : sub
      ),
    })))
    setGradingSubmission(null)
  }

  const openGrading = (task: Task, sub: Submission) => {
    setGradingSubmission({
      id: sub.id,
      studentName: sub.studentName,
      taskTitle: task.title,
      course: courseName,
      submittedAt: sub.submittedAt,
      fileName: sub.fileName,
      currentGrade: sub.grade,
      currentFeedback: sub.feedback,
      maxGrade: task.max_grade,
    })
  }

  const totalSubmissions = tasks.reduce((s, t) => s + t.submissions.length, 0)
  const pendingGrades = tasks.reduce((s, t) => s + t.submissions.filter(sub => sub.grade === null).length, 0)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back */}
      <Link href={`/teacher/courses/${id}`} className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm transition-colors">
        <ArrowLeft className="h-4 w-4" /> {courseName}
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Topshiriqlar</h1>
          <p className="text-white/40 text-sm mt-1">{tasks.length} ta topshiriq</p>
        </div>
        <button onClick={() => setFormOpen(true)}
          className="flex items-center gap-2 text-sm font-semibold bg-amber-600 hover:bg-amber-500 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-amber-900/30">
          <Plus className="h-4 w-4" /> Topshiriq qo&apos;shish
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Topshiriqlar', val: tasks.length,        color: 'text-amber-400',   icon: ClipboardList },
          { label: 'Yuborilgan',   val: totalSubmissions,    color: 'text-blue-400',    icon: FileText      },
          { label: 'Kutmoqda',     val: pendingGrades,       color: 'text-red-400',     icon: AlertCircle   },
        ].map(({ label, val, color, icon: Icon }) => (
          <div key={label} className="rounded-2xl p-4 text-center"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <Icon className={`h-4 w-4 ${color} mx-auto mb-1.5`} />
            <p className={`text-2xl font-extrabold ${color}`}>{val}</p>
            <p className="text-white/40 text-xs mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Tasks list */}
      {tasks.length === 0 ? (
        <div className="text-center py-20 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.02)', border: '2px dashed rgba(255,255,255,0.08)' }}>
          <ClipboardList className="h-10 w-10 text-white/20 mx-auto mb-3" />
          <p className="text-white/40 font-medium">Hali topshiriq yo&apos;q</p>
          <button onClick={() => setFormOpen(true)}
            className="mt-4 bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all">
            Birinchi topshiriqni yarating
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {tasks.map((task, i) => {
              const overdue = isOverdue(task.deadline)
              const graded = task.submissions.filter(s => s.grade !== null).length
              const pending = task.submissions.filter(s => s.grade === null).length
              const isExpanded = expandedTask === task.id

              return (
                <motion.div key={task.id}
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="rounded-2xl overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>

                  {/* Task header */}
                  <div className="flex items-center gap-4 p-5">
                    <div className="h-10 w-10 rounded-xl bg-amber-500/15 flex items-center justify-center flex-shrink-0">
                      <ClipboardList className="h-4 w-4 text-amber-400" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm">{task.title}</p>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className={`text-xs flex items-center gap-1 ${overdue ? 'text-red-400' : 'text-white/40'}`}>
                          <Calendar className="h-3 w-3" />
                          {formatDeadline(task.deadline)}
                          {overdue && ' — Muhlat o\'tdi'}
                        </span>
                        <span className="text-white/30 text-xs flex items-center gap-1">
                          <Star className="h-3 w-3" />Max: {task.max_grade}
                        </span>
                      </div>
                    </div>

                    {/* Submission counts */}
                    <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
                      {pending > 0 && (
                        <span className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full text-amber-400"
                          style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
                          <AlertCircle className="h-3 w-3" />{pending} kutmoqda
                        </span>
                      )}
                      {graded > 0 && (
                        <span className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full text-emerald-400"
                          style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                          <CheckCircle2 className="h-3 w-3" />{graded} baholangan
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => setExpandedTask(isExpanded ? null : task.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-white/50 hover:text-white hover:bg-white/5 transition-all">
                        {isExpanded ? 'Yopish' : `${task.submissions.length} ta`}
                      </button>
                      <button onClick={() => setEditTask(task)}
                        className="h-7 w-7 rounded-lg flex items-center justify-center text-white/30 hover:text-blue-400 hover:bg-blue-400/10 transition-all">
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => setDeleteId(task.id)}
                        className="h-7 w-7 rounded-lg flex items-center justify-center text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-all">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Submissions expanded */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
                        className="overflow-hidden border-t border-white/5">

                        <div className="p-4 space-y-2">
                          <p className="text-white/40 text-xs font-medium px-1 mb-3">
                            Yuborilgan ishlar ({task.submissions.length})
                          </p>

                          {task.submissions.length === 0 ? (
                            <p className="text-white/20 text-sm text-center py-4">
                              Hali hech kim topshirmagan
                            </p>
                          ) : (
                            task.submissions.map(sub => (
                              <div key={sub.id} className="flex items-center gap-3 p-3 rounded-xl"
                                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div className="h-8 w-8 rounded-lg bg-blue-600/20 flex items-center justify-center flex-shrink-0">
                                  <FileText className="h-3.5 w-3.5 text-blue-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-white text-sm font-medium">{sub.studentName}</p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-white/30 text-xs truncate">{sub.fileName}</span>
                                    <span className="text-white/20 text-xs flex items-center gap-1 flex-shrink-0">
                                      <Clock className="h-2.5 w-2.5" />{sub.submittedAt}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex-shrink-0">
                                  {sub.grade !== null ? (
                                    <div className="text-right">
                                      <span className="text-amber-400 text-sm font-bold">{sub.grade}</span>
                                      <span className="text-white/30 text-xs">/{task.max_grade}</span>
                                      <button onClick={() => openGrading(task, sub)}
                                        className="block text-xs text-blue-400 hover:text-blue-300 mt-0.5 transition-colors">
                                        Qayta baho
                                      </button>
                                    </div>
                                  ) : (
                                    <button onClick={() => openGrading(task, sub)}
                                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold text-white bg-amber-600 hover:bg-amber-500 transition-all">
                                      <Star className="h-3 w-3" /> Baholash
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Forms & Modals */}
      <TaskForm open={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleCreate} mode="create" />

      <TaskForm open={!!editTask} onClose={() => setEditTask(null)} onSubmit={handleEdit} mode="edit"
        initial={editTask ? {
          title: editTask.title, description: editTask.description,
          deadline: editTask.deadline, file_requirements: editTask.file_requirements,
          max_grade: editTask.max_grade,
        } : undefined} />

      <GradingModal open={!!gradingSubmission} submission={gradingSubmission}
        onClose={() => setGradingSubmission(null)} onGrade={handleGrade} />

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl p-6 text-center"
            style={{ background: '#0e1322', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Trash2 className="h-8 w-8 text-red-400 mx-auto mb-3" />
            <h3 className="text-white font-semibold mb-2">Topshiriqni o&apos;chirish</h3>
            <p className="text-white/40 text-sm mb-6">Bu topshiriq va barcha javoblar o&apos;chiriladi.</p>
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

      {/* Loading spinner placeholder */}
      <div className="hidden"><Loader2 /></div>
    </div>
  )
}
