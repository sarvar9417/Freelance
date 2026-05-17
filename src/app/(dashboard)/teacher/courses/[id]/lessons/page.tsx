'use client'

import { redirect } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useMountedTheme } from '@/hooks/useTheme'
import { BookOpen, Plus, ArrowRight, FileText, Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'

export default function TeacherCourseLessonsPage({ params }: { params: { id: string } }) {
  const { isDark } = useMountedTheme()
  const [lessons, setLessons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { redirect('/login'); return }

      const { data: lessonsData } = await supabase
        .from('lessons')
        .select('id, title, description, order_index, is_published')
        .eq('course_id', params.id)
        .order('order_index')

      setLessons(lessonsData ?? [])
      setLoading(false)
    }
    loadData()
  }, [params.id])

  if (loading) return <div className="max-w-5xl mx-auto animate-pulse"><div className="h-8 w-48 bg-white/10 rounded mb-4" /></div>

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Darslar</h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>{lessons.length} ta dars</p>
        </div>
        <Link href={`/teacher/courses/${params.id}/lessons/new`} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium ${
          isDark ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
        }`}>
          <Plus className="h-4 w-4" /> Yangi dars
        </Link>
      </div>

      {lessons.length === 0 ? (
        <div className={`text-center py-16 rounded-2xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
          <BookOpen className={`h-12 w-12 mx-auto mb-4 ${isDark ? 'text-white/20' : 'text-gray-300'}`} />
          <p className={isDark ? 'text-white/40' : 'text-gray-500'}>Hali dars yaratilmagan</p>
        </div>
      ) : (
        <div className="space-y-3">
          {lessons.map((lesson, i) => (
            <div key={lesson.id} className={`flex items-center gap-4 p-4 rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'}`}>
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-sm font-medium ${
                isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600'
              }`}>
                {i + 1}
              </div>
              <div className="flex-1">
                <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{lesson.title}</h3>
                <p className={`text-sm line-clamp-1 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>{lesson.description || 'Tavsif yo\'q'}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                lesson.is_published 
                  ? isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600'
                  : isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-600'
              }`}>
                {lesson.is_published ? 'Faol' : 'Nofaol'}
              </span>
              <Link href={`/teacher/courses/${params.id}/lessons/${lesson.id}/edit`} className={`p-2 rounded-lg ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}>
                <Edit className={`h-4 w-4 ${isDark ? 'text-white/40' : 'text-gray-400'}`} />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}