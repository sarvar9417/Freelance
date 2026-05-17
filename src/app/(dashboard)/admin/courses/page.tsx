'use client'

import { redirect } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useMountedTheme } from '@/hooks/useTheme'
import { BookOpen, Users, Search, Eye, Edit, Trash2 } from 'lucide-react'

export default function AdminCoursesPage() {
  const { isDark } = useMountedTheme()
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { redirect('/login'); return }

      const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
      if (profile?.role !== 'admin') { redirect('/login'); return }

      const { data: coursesData } = await supabase.from('courses').select('id, title, category, is_published, created_at, teacher_id').order('created_at', { ascending: false })

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

      <div className="grid gap-4">
        {filteredCourses.map(course => (
          <div key={course.id} className={`flex items-center gap-4 p-4 rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'}`}>
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-xl ${isDark ? 'bg-gradient-to-br from-blue-600 to-blue-800' : 'bg-gradient-to-br from-blue-500 to-blue-600'}`}>
              📚
            </div>
            <div className="flex-1">
              <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{course.title}</h3>
              <p className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-500'}`}>{course.teacherName} • {course.category}</p>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${
              course.is_published 
                ? isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600'
                : isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-600'
            }`}>
              {course.is_published ? 'Faol' : 'Nofaol'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}