'use client'

import { redirect } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useMountedTheme } from '@/hooks/useTheme'
import { Plus, BookOpen, Users, FileText, Search } from 'lucide-react'

export default function TeacherCoursesPage() {
  const { isDark } = useMountedTheme()
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { redirect('/login'); return }

      const { data: coursesData } = await supabase
        .from('courses')
        .select('id, title, description, category, emoji, image_url, is_published, created_at')
        .eq('teacher_id', user.id)
        .order('created_at', { ascending: false })

      const courseIds = (coursesData ?? []).map(c => c.id)

      const [{ data: enrollRows }, { data: lessonRows }, { data: taskRows }] = await Promise.all([
        courseIds.length > 0 ? supabase.from('enrollments').select('course_id').in('course_id', courseIds) : Promise.resolve({ data: [] }),
        courseIds.length > 0 ? supabase.from('lessons').select('course_id').in('course_id', courseIds) : Promise.resolve({ data: [] }),
        courseIds.length > 0 ? supabase.from('tasks').select('course_id').in('course_id', courseIds) : Promise.resolve({ data: [] }),
      ])

      const statsMap = Object.fromEntries(courseIds.map(id => [
        id,
        {
          students: (enrollRows ?? []).filter(r => r.course_id === id).length,
          lessons: (lessonRows ?? []).filter(r => r.course_id === id).length,
          tasks: (taskRows ?? []).filter(r => r.course_id === id).length,
        }
      ]))

      setCourses((coursesData ?? []).map(c => ({ ...c, stats: statsMap[c.id] })))
      setLoading(false)
    }
    loadData()
  }, [])

  const filteredCourses = courses.filter(c => 
    !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.category?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="max-w-5xl mx-auto animate-pulse"><div className="h-8 w-48 bg-white/10 rounded mb-4" /></div>

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Kurslarim</h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>{courses.length} ta kurs</p>
        </div>
        <a href="/teacher/courses/new" className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium ${
          isDark ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
        }`}>
          <Plus className="h-4 w-4" /> Yangi kurs
        </a>
      </div>

      <div className="relative">
        <Search className={`absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 ${isDark ? 'text-white/30' : 'text-gray-400'}`} />
        <input
          type="text"
          placeholder="Kurs qidirish..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className={`w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none ${
            isDark ? 'text-white placeholder-white/25 bg-white/5 border border-white/10' : 'text-gray-900 placeholder-gray-400 bg-white border border-gray-200'
          }`}
        />
      </div>

      {filteredCourses.length === 0 ? (
        <div className={`text-center py-16 rounded-2xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
          <BookOpen className={`h-12 w-12 mx-auto mb-4 ${isDark ? 'text-white/20' : 'text-gray-300'}`} />
          <p className={isDark ? 'text-white/40' : 'text-gray-500'}>Kurs topilmadi</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCourses.map(course => (
            <a key={course.id} href={`/teacher/courses/${course.id}`} className={`rounded-2xl overflow-hidden transition-all hover:scale-[1.02] ${
              isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'
            }`}>
              <div className={`h-32 flex items-center justify-center text-5xl ${
                isDark ? 'bg-gradient-to-br from-emerald-600 to-emerald-800' : 'bg-gradient-to-br from-emerald-500 to-emerald-600'
              }`}>
                {course.emoji || '📚'}
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <h3 className={`font-semibold line-clamp-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{course.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                    course.is_published 
                      ? isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600'
                      : isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-600'
                  }`}>
                    {course.is_published ? 'Faol' : 'Nofaol'}
                  </span>
                </div>
                <div className={`flex items-center gap-3 text-xs ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" />{course.stats?.students || 0}</span>
                  <span className="flex items-center gap-1"><FileText className="h-3 w-3" />{course.stats?.lessons || 0}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}