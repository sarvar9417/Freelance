'use client'

import { redirect } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useMountedTheme } from '@/hooks/useTheme'
import { Users, BookOpen, TrendingUp, Search } from 'lucide-react'

export default function StudentsPage() {
  const { isDark } = useMountedTheme()
  const [students, setStudents] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { redirect('/login'); return }

      const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
      if (!['teacher', 'admin'].includes(profile?.role ?? '')) { redirect('/student'); return }

      const { data: coursesData } = await supabase.from('courses').select('id, title, emoji').eq('teacher_id', user.id)
      const courseIds = (coursesData ?? []).map(c => c.id)
      setCourses(coursesData ?? [])

      if (courseIds.length === 0) {
        setLoading(false)
        return
      }

      const { data: enrollments } = await supabase
        .from('enrollments')
        .select('student_id, course_id, progress')
        .in('course_id', courseIds)

      const studentIds = Array.from(new Set((enrollments ?? []).map(e => e.student_id)))
      const { data: studentProfiles } = studentIds.length > 0
        ? await supabase.from('users').select('id, full_name').in('id', studentIds)
        : { data: [] }

      const studentMap: Record<string, any> = {}
      for (const e of enrollments ?? []) {
        if (!studentMap[e.student_id]) {
          studentMap[e.student_id] = {
            id: e.student_id,
            name: studentProfiles?.find(p => p.id === e.student_id)?.full_name || 'Noma\'lum',
            courses: 0,
            totalProgress: 0,
          }
        }
        studentMap[e.student_id].courses++
        studentMap[e.student_id].totalProgress += e.progress || 0
      }

      setStudents(Object.values(studentMap).map(s => ({
        ...s,
        avgProgress: s.courses > 0 ? Math.round(s.totalProgress / s.courses) : 0,
      })))
      setLoading(false)
    }
    loadData()
  }, [])

  const filteredStudents = students.filter(s => 
    !search || s.name.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="max-w-4xl mx-auto animate-pulse"><div className="h-8 w-48 bg-white/10 rounded mb-4" /></div>

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>O'quvchilarim</h1>
        <p className={`text-sm mt-1 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>{students.length} ta o'quvchi</p>
      </div>

      <div className="relative">
        <Search className={`absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 ${isDark ? 'text-white/30' : 'text-gray-400'}`} />
        <input
          type="text"
          placeholder="O'quvchi qidirish..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className={`w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none ${
            isDark ? 'text-white placeholder-white/25 bg-white/5 border border-white/10' : 'text-gray-900 placeholder-gray-400 bg-white border border-gray-200'
          }`}
        />
      </div>

      {courses.length === 0 ? (
        <div className={`text-center py-16 rounded-2xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
          <BookOpen className={`h-12 w-12 mx-auto mb-4 ${isDark ? 'text-white/20' : 'text-gray-300'}`} />
          <p className={isDark ? 'text-white/40' : 'text-gray-500'}>Hali kurs yaratilmagan</p>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className={`text-center py-16 rounded-2xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
          <Users className={`h-12 w-12 mx-auto mb-4 ${isDark ? 'text-white/20' : 'text-gray-300'}`} />
          <p className={isDark ? 'text-white/40' : 'text-gray-500'}>O'quvchi topilmadi</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredStudents.map(student => (
            <Link key={student.id} href={`/teacher/students/${student.id}`} className={`flex items-center gap-4 p-4 rounded-xl transition-all hover:scale-[1.01] ${
              isDark ? 'bg-white/5 border border-white/10 hover:bg-white/10' : 'bg-white border border-gray-200 hover:bg-gray-50'
            }`}>
              <div className={`h-12 w-12 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                isDark ? 'bg-gradient-to-br from-emerald-500 to-emerald-600' : 'bg-gradient-to-br from-emerald-400 to-emerald-500'
              }`}>
                {student.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1">
                <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{student.name}</h3>
                <p className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-500'}`}>{student.courses} ta kurs</p>
              </div>
              <div className="text-right">
                <p className={`text-lg font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>{student.avgProgress}%</p>
                <p className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-500'}`}>o'rtacha</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}