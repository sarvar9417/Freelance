'use client'

import { redirect } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useMountedTheme } from '@/hooks/useTheme'
import { ClipboardList } from 'lucide-react'

interface Task {
  id: string
  title: string
  description: string | null
  deadline: string | null
  course_id: string
  difficulty_level: number
  order_index: number
  task_type: string
  template_data: Record<string, unknown> | null
  course: { id: string; title: string; emoji: string | null } | null
  submission: { status: string; score: number | null } | null
}

export default function TasksPage() {
  const { isDark } = useMountedTheme()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { redirect('/login'); return }

      const { data: enrollments } = await supabase.from('enrollments').select('course_id').eq('student_id', user.id)
      const courseIds = (enrollments ?? []).map(e => e.course_id)

      if (courseIds.length === 0) {
        setLoading(false)
        return
      }

      const { data: tasksData } = await supabase.from('tasks').select('id, title, description, deadline, course_id, difficulty_level, order_index, task_type, template_data').in('course_id', courseIds)
      const taskIds = (tasksData ?? []).map(t => t.id)

      const { data: submissions } = taskIds.length > 0
        ? await supabase.from('submissions').select('task_id, status, score').eq('student_id', user.id).in('task_id', taskIds)
        : { data: [] }

      const { data: courses } = courseIds.length > 0
        ? await supabase.from('courses').select('id, title, emoji').in('id', courseIds)
        : { data: [] }
      const courseMap = Object.fromEntries((courses ?? []).map(c => [c.id, c]))
      const subMap = Object.fromEntries((submissions ?? []).map(s => [s.task_id, s]))

      const sorted = (tasksData ?? []).map(t => ({
        ...t,
        difficulty_level: t.difficulty_level ?? 1,
        order_index: t.order_index ?? 0,
        task_type: t.task_type ?? 'standard',
        template_data: t.template_data ?? null,
        course: courseMap[t.course_id] ? { id: courseMap[t.course_id].id, title: courseMap[t.course_id].title, emoji: courseMap[t.course_id].emoji } : null,
        submission: subMap[t.id] || null,
      })).sort((a, b) => {
        if (a.difficulty_level !== b.difficulty_level) return a.difficulty_level - b.difficulty_level
        return a.order_index - b.order_index
      })
      setTasks(sorted)
      setLoading(false)
    }
    loadData()
  }, [])

  if (loading) return <div className="max-w-3xl mx-auto animate-pulse"><div className="h-8 w-48 bg-white/10 rounded mb-2" /></div>

  if (tasks.length === 0) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Topshiriqlarim</h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>Barcha topshiriqlaringiz</p>
        </div>
        <div className={`rounded-2xl p-12 text-center ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
          <ClipboardList className={`h-12 w-12 mx-auto mb-4 ${isDark ? 'text-white/20' : 'text-gray-300'}`} />
          <p className={isDark ? 'text-white/40' : 'text-gray-500'}>Hali kursga yozilmagansiz</p>
        </div>
      </div>
    )
  }

  const pendingTasks = tasks.filter(t => !t.submission)
  const submittedTasks = tasks.filter(t => t.submission?.status === 'pending')
  const gradedTasks = tasks.filter(t => t.submission?.status === 'graded')

  const DIFFICULTY_LABELS: Record<number, { label: string; color: string; bg: string }> = {
    1: { label: 'Reproduktiv', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    2: { label: 'Produktiv', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
    3: { label: 'Qisman-izlanishli', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
    4: { label: 'Kreativ', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
  }

  const difficultyCounts = [1, 2, 3, 4].map(level => ({
    level,
    count: tasks.filter(t => t.difficulty_level === level).length,
    ...DIFFICULTY_LABELS[level],
  }))

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Topshiriqlarim</h1>
        <p className={`text-sm mt-1 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>{tasks.length} ta topshiriq</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className={`rounded-xl p-4 ${isDark ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-amber-50 border border-amber-200'}`}>
          <p className={`text-2xl font-bold ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>{pendingTasks.length}</p>
          <p className={`text-xs ${isDark ? 'text-white/60' : 'text-gray-600'}`}>Kutilmoqda</p>
        </div>
        <div className={`rounded-xl p-4 ${isDark ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-200'}`}>
          <p className={`text-2xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{submittedTasks.length}</p>
          <p className={`text-xs ${isDark ? 'text-white/60' : 'text-gray-600'}`}>Tekshirilmoqda</p>
        </div>
        <div className={`rounded-xl p-4 ${isDark ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-emerald-50 border border-emerald-200'}`}>
          <p className={`text-2xl font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>{gradedTasks.length}</p>
          <p className={`text-xs ${isDark ? 'text-white/60' : 'text-gray-600'}`}>Baholangan</p>
        </div>
      </div>

      {/* Difficulty summary */}
      {difficultyCounts.some(d => d.count > 0) && (
        <div className="grid grid-cols-4 gap-3">
          {difficultyCounts.filter(d => d.count > 0).map(d => (
            <div key={d.level} className={`rounded-xl p-3 ${d.bg}`}>
              <p className={`text-lg font-bold ${d.color}`}>{d.count}</p>
              <p className={`text-[10px] ${d.color} opacity-70`}>{d.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-3">
        {tasks.map(task => {
          const dl = DIFFICULTY_LABELS[task.difficulty_level]
          return (
            <div key={task.id} className={`rounded-xl p-4 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'}`}>
              <div className="flex items-start gap-3">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-lg ${isDark ? 'bg-blue-500/10' : 'bg-blue-100'}`}>
                  {task.course?.emoji || '📝'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{task.title}</h3>
                    {dl && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${dl.bg} ${dl.color}`}>
                        {dl.label}
                      </span>
                    )}
                    {task.task_type !== 'standard' && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${isDark ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-cyan-50 text-cyan-600 border border-cyan-200'}`}>
                        {task.task_type === 'web_kvest' && '🌐'}
                        {task.task_type === 'flipped_homework' && '🏠'}
                        {task.task_type === 'flipped_inclass' && '🏫'}
                        {task.task_type === 'pbl_project' && '📐'}
                        {task.task_type === 'muammoli_problem' && '🧩'}
                      </span>
                    )}
                  </div>
                  <p className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-500'}`}>{task.course?.title}</p>
                </div>
                {task.submission ? (
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    task.submission.status === 'graded' 
                      ? isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600'
                      : isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-600'
                  }`}>
                    {task.submission.status === 'graded' ? `Baholangan: ${task.submission.score}` : 'Tekshirilmoqda'}
                  </span>
                ) : (
                  <span className={`text-xs px-2 py-1 rounded-full ${isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600'}`}>
                    Topshirilmagan
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}