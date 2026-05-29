'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useMountedTheme } from '@/hooks/useTheme'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import TasksClient from './TasksClient'

interface Task {
  id: string
  title: string
  description: string | null
  deadline: string | null
  max_score: number
  allowed_formats: string[] | null
  lesson_id: string | null
  difficulty_level: number
  total: number
  pending: number
}

export default function TeacherCourseTasksPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { isDark } = useMountedTheme()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data: tasksData } = await supabase
      .from('tasks')
      .select('id, title, description, deadline, max_score, allowed_formats, lesson_id, difficulty_level')
      .eq('course_id', params.id)
      .order('difficulty_level', { ascending: true })
      .order('created_at', { ascending: false })

    if (!tasksData?.length) {
      setTasks([])
      setLoading(false)
      return
    }

    const taskIds = tasksData.map(t => t.id)

    const { data: submissions } = await supabase
      .from('submissions')
      .select('task_id, status')
      .in('task_id', taskIds)

    const countMap: Record<string, { total: number; pending: number }> = {}
    for (const s of submissions ?? []) {
      if (!countMap[s.task_id]) countMap[s.task_id] = { total: 0, pending: 0 }
      countMap[s.task_id].total++
      if (s.status === 'pending') countMap[s.task_id].pending++
    }

    setTasks(
      tasksData.map(t => ({
        ...t,
        max_score: t.max_score ?? 100,
        allowed_formats: t.allowed_formats ?? null,
        lesson_id: t.lesson_id ?? null,
        difficulty_level: t.difficulty_level ?? 1,
        total: countMap[t.id]?.total ?? 0,
        pending: countMap[t.id]?.pending ?? 0,
      }))
    )
    setLoading(false)
  }, [params.id, router])

  useEffect(() => { load() }, [load])

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-3 animate-pulse">
        <div className="flex items-center justify-between mb-6">
          <div className={`h-8 w-40 rounded-xl ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
          <div className={`h-10 w-36 rounded-xl ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
        </div>
        {[1, 2, 3].map(i => (
          <div key={i} className={`h-24 rounded-2xl ${isDark ? 'bg-white/5' : 'bg-gray-100'}`} />
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Topshiriqlar</h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>{tasks.length} ta topshiriq</p>
        </div>
        <Link href={`/teacher/courses/${params.id}/tasks/new`}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-amber-600 hover:bg-amber-500 transition-all">
          <Plus className="h-4 w-4" /> Yangi topshiriq
        </Link>
      </div>

      <TasksClient courseId={params.id} tasks={tasks} />
    </div>
  )
}
