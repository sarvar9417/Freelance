'use client'

import { redirect } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useMountedTheme } from '@/hooks/useTheme'
import { BookOpen, Users, FileText, ClipboardCheck, Edit, Trash2, Eye } from 'lucide-react'
import Link from 'next/link'

export default function TeacherCourseDetailPage({ params }: { params: { id: string } }) {
  const { isDark } = useMountedTheme()
  const [course, setCourse] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { redirect('/login'); return }

      const { data: courseData } = await supabase.from('courses').select('*').eq('id', params.id).single()
      
      const [{ data: enrollments }, { data: lessons }, { data: tasks }] = await Promise.all([
        supabase.from('enrollments').select('student_id').eq('course_id', params.id),
        supabase.from('lessons').select('id, title, order_index').eq('course_id', params.id).order('order_index'),
        supabase.from('tasks').select('id, title').eq('course_id', params.id),
      ])

      setCourse({
        ...courseData,
        studentCount: enrollments?.length || 0,
        lessons: lessons ?? [],
        taskCount: tasks?.length || 0,
      })
      setLoading(false)
    }
    loadData()
  }, [params.id])

  if (loading) return <div className="max-w-5xl mx-auto animate-pulse"><div className="h-8 w-48 bg-white/10 rounded mb-4" /></div>

  if (!course) return <div className="max-w-5xl mx-auto p-8 text-center">Kurs topilmadi</div>

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className={`h-16 w-16 rounded-2xl flex items-center justify-center text-3xl ${
            isDark ? 'bg-gradient-to-br from-emerald-600 to-emerald-800' : 'bg-gradient-to-br from-emerald-500 to-emerald-600'
          }`}>
            {course.emoji || '📚'}
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{course.title}</h1>
            <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-500'}`}>{course.category}</p>
          </div>
        </div>
        <span className={`text-xs px-3 py-1.5 rounded-full ${
          course.is_published 
            ? isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600'
            : isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-600'
        }`}>
          {course.is_published ? 'Faol' : 'Nofaol'}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className={`rounded-2xl p-5 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'}`}>
          <Users className={`h-6 w-6 mb-3 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
          <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{course.studentCount}</p>
          <p className={`text-xs ${isDark ? 'text-white/60' : 'text-gray-600'}`}>O'quvchilar</p>
        </div>
        <div className={`rounded-2xl p-5 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'}`}>
          <FileText className={`h-6 w-6 mb-3 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
          <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{course.lessons?.length || 0}</p>
          <p className={`text-xs ${isDark ? 'text-white/60' : 'text-gray-600'}`}>Darslar</p>
        </div>
        <div className={`rounded-2xl p-5 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'}`}>
          <ClipboardCheck className={`h-6 w-6 mb-3 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
          <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{course.taskCount}</p>
          <p className={`text-xs ${isDark ? 'text-white/60' : 'text-gray-600'}`}>Topshiriqlar</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Link href={`/teacher/courses/${params.id}/lessons`} className={`flex items-center justify-between p-5 rounded-2xl transition-all ${
          isDark ? 'bg-white/5 border border-white/10 hover:bg-white/10' : 'bg-white border border-gray-200 hover:bg-gray-50'
        }`}>
          <div className="flex items-center gap-3">
            <BookOpen className={`h-6 w-6 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Darslar</span>
          </div>
          <span className={`text-sm ${isDark ? 'text-white/40' : 'text-gray-400'}`}>{course.lessons?.length || 0} ta</span>
        </Link>
        <Link href={`/teacher/courses/${params.id}/tasks`} className={`flex items-center justify-between p-5 rounded-2xl transition-all ${
          isDark ? 'bg-white/5 border border-white/10 hover:bg-white/10' : 'bg-white border border-gray-200 hover:bg-gray-50'
        }`}>
          <div className="flex items-center gap-3">
            <ClipboardCheck className={`h-6 w-6 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Topshiriqlar</span>
          </div>
          <span className={`text-sm ${isDark ? 'text-white/40' : 'text-gray-400'}`}>{course.taskCount} ta</span>
        </Link>
        <Link href={`/teacher/courses/${params.id}/students`} className={`flex items-center justify-between p-5 rounded-2xl transition-all ${
          isDark ? 'bg-white/5 border border-white/10 hover:bg-white/10' : 'bg-white border border-gray-200 hover:bg-gray-50'
        }`}>
          <div className="flex items-center gap-3">
            <Users className={`h-6 w-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>O'quvchilar</span>
          </div>
          <span className={`text-sm ${isDark ? 'text-white/40' : 'text-gray-400'}`}>{course.studentCount} ta</span>
        </Link>
        <Link href={`/teacher/courses/${params.id}/edit`} className={`flex items-center justify-between p-5 rounded-2xl transition-all ${
          isDark ? 'bg-white/5 border border-white/10 hover:bg-white/10' : 'bg-white border border-gray-200 hover:bg-gray-50'
        }`}>
          <div className="flex items-center gap-3">
            <Edit className={`h-6 w-6 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Tahrirlash</span>
          </div>
        </Link>
      </div>
    </div>
  )
}