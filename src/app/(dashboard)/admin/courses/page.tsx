'use client'

import { redirect } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useMountedTheme } from '@/hooks/useTheme'
import { deleteCourse, deleteTask } from '../actions'
import {
  BookOpen, Search, Trash2, X, Loader2, AlertTriangle,
  ChevronDown, ChevronUp, ClipboardList, CheckCircle2, Clock, RotateCcw,
} from 'lucide-react'

const STATUS_MAP: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  pending:  { label: 'Kutilmoqda',    color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', icon: Clock },
  graded:   { label: 'Baholandi',      color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle2 },
  revision: { label: 'Qayta topshirish', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', icon: RotateCcw },
}

function ConfirmModal({ title, message, onClose, onConfirm, loading }: {
  title: string; message: string; onClose: () => void; onConfirm: () => void; loading: boolean
}) {
  const { isDark } = useMountedTheme()
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={e => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl p-6 space-y-4"
        style={isDark ? { background: '#10141f', border: '1px solid rgba(255,255,255,0.1)' } : { background: '#ffffff', border: '1px solid rgba(0,0,0,0.1)' }}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-red-500/10"><AlertTriangle className="h-5 w-5 text-red-400" /></div>
          <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
          <button onClick={onClose} className={`ml-auto ${isDark ? 'text-white/30 hover:text-white' : 'text-gray-400 hover:text-gray-600'}`}><X className="h-4 w-4" /></button>
        </div>
        <p className={`text-sm ${isDark ? 'text-white/50' : 'text-gray-600'}`}>{message}</p>
        <div className="flex gap-3">
          <button onClick={onClose} className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border ${
            isDark ? 'text-white/50 hover:text-white hover:bg-white/5 border-white/5' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 border-gray-200'
          }`}>Bekor qilish</button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-500 text-white disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            O'chirish
          </button>
        </div>
      </div>
    </div>
  )
}

function TaskListModal({ tasks, courseTitle, onClose, onDeleteTask, isDeleting }: {
  tasks: any[]; courseTitle: string; onClose: () => void; onDeleteTask: (taskId: string) => void; isDeleting: string | null
}) {
  const { isDark } = useMountedTheme()
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={e => e.stopPropagation()}
        className="w-full max-w-2xl rounded-2xl overflow-hidden max-h-[80vh] flex flex-col"
        style={isDark ? { background: '#10141f', border: '1px solid rgba(255,255,255,0.1)' } : { background: '#ffffff', border: '1px solid rgba(0,0,0,0.1)' }}>
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Topshiriqlar</h3>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>{courseTitle} • {tasks.length} ta</p>
          </div>
          <button onClick={onClose} className={`p-1.5 rounded-lg ${isDark ? 'text-white/30 hover:text-white hover:bg-white/5' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100'}`}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto p-6 space-y-3">
          {tasks.length === 0 ? (
            <p className={`text-center py-8 text-sm ${isDark ? 'text-white/30' : 'text-gray-400'}`}>Topshiriq mavjud emas</p>
          ) : tasks.map(task => {
            const st = STATUS_MAP[task.status as keyof typeof STATUS_MAP]
            const StatusIcon = st?.icon
            return (
              <div key={task.id} className={`flex items-center gap-4 p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                <div className={`p-2 rounded-lg ${isDark ? 'bg-amber-500/10' : 'bg-amber-100'}`}>
                  <ClipboardList className={`h-4 w-4 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{task.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                      Maks: {task.max_score} ball
                    </span>
                    {task.total !== undefined && (
                      <span className={`text-xs ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                        • {task.total} ta topshirilgan
                      </span>
                    )}
                  </div>
                </div>
                <button onClick={() => onDeleteTask(task.id)} disabled={isDeleting === task.id}
                  className={`p-1.5 rounded-lg transition-all ${isDark ? 'text-white/30 hover:text-red-400 hover:bg-red-500/10' : 'text-gray-400 hover:text-red-600 hover:bg-red-100'}`}>
                  {isDeleting === task.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function AdminCoursesPage() {
  const { isDark } = useMountedTheme()
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null)
  const [taskTarget, setTaskTarget] = useState<any | null>(null)
  const [tasks, setTasks] = useState<any[]>([])
  const [loadingTasks, setLoadingTasks] = useState(false)
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { redirect('/login'); return }

      const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
      if (profile?.role !== 'admin') { redirect('/login'); return }

      const { data: coursesData } = await supabase.from('courses')
        .select('id, title, category, emoji, is_published, status, created_at, teacher_id')
        .order('created_at', { ascending: false })

      const teacherIds = Array.from(new Set((coursesData ?? []).map(c => c.teacher_id).filter(Boolean)))
      const { data: teachers } = teacherIds.length > 0
        ? await supabase.from('users').select('id, full_name').in('id', teacherIds)
        : { data: [] }
      const teacherMap = Object.fromEntries((teachers ?? []).map(t => [t.id, t.full_name]))

      setCourses((coursesData ?? []).map(c => ({ ...c, teacherName: teacherMap[c.teacher_id] || 'Noma\'lum' })))
      setLoading(false)
    }
    loadData()
  }, [])

  const handleDelete = () => {
    if (!deleteTarget) return
    startTransition(async () => {
      const result = await deleteCourse(deleteTarget.id)
      if (result.error) return
      setCourses(prev => prev.filter(c => c.id !== deleteTarget.id))
      setDeleteTarget(null)
    })
  }

  const handleShowTasks = async (course: any) => {
    setTaskTarget(course)
    setLoadingTasks(true)
    const supabase = createClient()
    const { data } = await supabase.from('tasks').select('id, title, max_score').eq('course_id', course.id).order('created_at')
    setTasks(data ?? [])
    setLoadingTasks(false)
  }

  const handleDeleteTask = async (taskId: string) => {
    setDeletingTaskId(taskId)
    const result = await deleteTask(taskId)
    setDeletingTaskId(null)
    if (result.error) return
    setTasks(prev => prev.filter(t => t.id !== taskId))
  }

  const filteredCourses = courses.filter(c => !search || c.title.toLowerCase().includes(search.toLowerCase()))

  if (loading) return <div className="max-w-5xl mx-auto animate-pulse"><div className="h-8 w-48 bg-white/10 rounded mb-4" /></div>

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Kurslar</h1>
        <p className={`text-sm mt-1 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>{courses.length} ta kurs</p>
      </div>

      <div className="relative">
        <Search className={`absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 ${isDark ? 'text-white/30' : 'text-gray-400'}`} />
        <input type="text" placeholder="Kurs qidirish..." value={search} onChange={e => setSearch(e.target.value)}
          className={`w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none ${
            isDark ? 'text-white placeholder-white/25 bg-white/5 border border-white/10' : 'text-gray-900 placeholder-gray-400 bg-white border border-gray-200'
          }`} />
      </div>

      <div className="space-y-3">
        {filteredCourses.map(course => (
          <div key={course.id} className={`rounded-xl overflow-hidden ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'}`}>
            <div className="flex items-center gap-4 p-4">
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-xl ${
                isDark ? 'bg-gradient-to-br from-blue-600 to-blue-800' : 'bg-gradient-to-br from-blue-500 to-blue-600'
              }`}>
                {course.emoji || '📚'}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{course.title}</h3>
                <p className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                  {course.teacherName} • {course.category || '—'}
                </p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${
                course.status === 'approved'
                  ? isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600'
                  : course.status === 'rejected'
                    ? isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600'
                    : isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-600'
              }`}>
                {course.status === 'approved' ? 'Tasdiqlangan' : course.status === 'rejected' ? 'Rad etilgan' : 'Kutilmoqda'}
              </span>
              <button onClick={() => handleShowTasks(course)}
                className={`p-2 rounded-lg text-xs font-medium transition-all ${
                  isDark ? 'text-white/40 hover:text-white hover:bg-white/5 border border-white/10' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100 border border-gray-200'
                }`}>
                <ClipboardList className="h-4 w-4" />
              </button>
              <button onClick={() => setDeleteTarget(course)}
                className={`p-2 rounded-lg transition-all ${
                  isDark ? 'text-white/30 hover:text-red-400 hover:bg-red-500/10' : 'text-gray-400 hover:text-red-600 hover:bg-red-100'
                }`}>
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {deleteTarget && (
        <ConfirmModal
          title="Kursni o'chirish"
          message={`"${deleteTarget.title}" kursini o'chirishni tasdiqlaysizmi? Barcha darslar, topshiriqlar va o'quvchilar ma'lumotlari o'chiriladi!`}
          onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={isPending} />
      )}

      {taskTarget && (
        <TaskListModal
          tasks={tasks} courseTitle={taskTarget.title}
          onClose={() => { setTaskTarget(null); setTasks([]) }}
          onDeleteTask={handleDeleteTask} isDeleting={deletingTaskId} />
      )}
    </div>
  )
}
