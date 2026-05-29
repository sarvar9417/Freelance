'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useMountedTheme } from '@/hooks/useTheme'
import { ClipboardList } from 'lucide-react'
import TasksClient from './TasksClient'

interface Task {
  id: string
  title: string
  description: string | null
  deadline: string | null
  max_score: number
  allowed_formats: string[] | null
  task_file_urls: string[] | null
  course_id: string
  lesson_id: string | null
  difficulty_level: number
  order_index: number
  task_type: string
  template_data: Record<string, unknown> | null
  course: { id: string; title: string; emoji: string | null } | null
  submission: {
    id: string; task_id: string; status: string; score: number | null
    feedback: string | null; submitted_at: string; file_urls: string[] | null
  } | null
}

export default function StudentTasksPage() {
  const router = useRouter()
  const { isDark } = useMountedTheme()
  const [tasks, setTasks] = useState<Task[]>([])
  const [userId, setUserId] = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    setUserId(user.id)

    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('course_id')
      .eq('student_id', user.id)

    const courseIds = (enrollments ?? []).map(e => e.course_id)
    if (courseIds.length === 0) { setLoading(false); return }

    const { data: tasksData } = await supabase
      .from('tasks')
      .select('id, title, description, deadline, max_score, allowed_formats, task_file_urls, course_id, lesson_id, difficulty_level, order_index, task_type, template_data')
      .in('course_id', courseIds)

    if (!tasksData?.length) { setLoading(false); return }

    const taskIds = tasksData.map(t => t.id)

    const [{ data: submissions }, { data: courses }] = await Promise.all([
      supabase.from('submissions')
        .select('id, task_id, status, score, feedback, submitted_at, file_urls')
        .eq('student_id', user.id)
        .in('task_id', taskIds)
        .order('submitted_at', { ascending: false }),
      supabase.from('courses').select('id, title, emoji').in('id', courseIds),
    ])

    const courseMap = Object.fromEntries((courses ?? []).map(c => [c.id, c]))
    // latest submission per task
    type SubmissionRow = { id: string; task_id: string; status: string; score: number | null; feedback: string | null; submitted_at: string; file_urls: string[] | null }
    const subMap: Record<string, SubmissionRow> = {}
    for (const s of (submissions ?? [])) {
      if (!subMap[s.task_id]) subMap[s.task_id] = s
    }

    const sorted = tasksData.map(t => ({
      ...t,
      max_score: t.max_score ?? 100,
      allowed_formats: t.allowed_formats ?? null,
      task_file_urls: t.task_file_urls ?? null,
      lesson_id: t.lesson_id ?? null,
      difficulty_level: t.difficulty_level ?? 1,
      order_index: t.order_index ?? 0,
      task_type: t.task_type ?? 'standard',
      template_data: t.template_data ?? null,
      course: courseMap[t.course_id] ?? null,
      submission: subMap[t.id] ?? null,
    })).sort((a, b) =>
      a.difficulty_level !== b.difficulty_level
        ? a.difficulty_level - b.difficulty_level
        : a.order_index - b.order_index
    )

    setTasks(sorted)
    setLoading(false)
  }, [router])

  useEffect(() => { load() }, [load])

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-3 animate-pulse">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={`h-20 rounded-2xl ${isDark ? 'bg-white/5' : 'bg-gray-100'}`} />
        ))}
      </div>
    )
  }

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

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Topshiriqlarim</h1>
        <p className={`text-sm mt-1 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>{tasks.length} ta topshiriq</p>
      </div>
      <TasksClient tasks={tasks} userId={userId} />
    </div>
  )
}
