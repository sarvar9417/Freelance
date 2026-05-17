'use client'

import { redirect } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useMountedTheme } from '@/hooks/useTheme'
import { ClipboardCheck, Plus, FileText } from 'lucide-react'
import Link from 'next/link'

export default function TeacherCourseTasksPage({ params }: { params: { id: string } }) {
  const { isDark } = useMountedTheme()
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { redirect('/login'); return }

      const { data: tasksData } = await supabase
        .from('tasks')
        .select('id, title, description, max_score, deadline, is_published')
        .eq('course_id', params.id)
        .order('created_at', { ascending: false })

      setTasks(tasksData ?? [])
      setLoading(false)
    }
    loadData()
  }, [params.id])

  if (loading) return <div className="max-w-5xl mx-auto animate-pulse"><div className="h-8 w-48 bg-white/10 rounded mb-4" /></div>

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Topshiriqlar</h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>{tasks.length} ta topshiriq</p>
        </div>
        <Link href={`/teacher/courses/${params.id}/tasks/new`} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium ${
          isDark ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-amber-600 hover:bg-amber-700 text-white'
        }`}>
          <Plus className="h-4 w-4" /> Yangi topshiriq
        </Link>
      </div>

      {tasks.length === 0 ? (
        <div className={`text-center py-16 rounded-2xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
          <ClipboardCheck className={`h-12 w-12 mx-auto mb-4 ${isDark ? 'text-white/20' : 'text-gray-300'}`} />
          <p className={isDark ? 'text-white/40' : 'text-gray-500'}>Hali topshiriq yaratilmagan</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map(task => (
            <div key={task.id} className={`flex items-center gap-4 p-4 rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'}`}>
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${isDark ? 'bg-amber-500/20' : 'bg-amber-100'}`}>
                <FileText className={`h-5 w-5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
              </div>
              <div className="flex-1">
                <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{task.title}</h3>
                <p className={`text-sm ${isDark ? 'text-white/40' : 'text-gray-500'}`}>{task.max_score} ball • {task.deadline ? new Date(task.deadline).toLocaleDateString('uz-UZ') : 'Deadline yo\'q'}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                task.is_published 
                  ? isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600'
                  : isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-600'
              }`}>
                {task.is_published ? 'Faol' : 'Nofaol'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}