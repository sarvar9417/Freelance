'use client'

import { redirect } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useMountedTheme } from '@/hooks/useTheme'
import { Users, Search, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export default function TeacherCourseStudentsPage({ params }: { params: { id: string } }) {
  const { isDark } = useMountedTheme()
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { redirect('/login'); return }

      const { data: enrollments } = await supabase
        .from('enrollments')
        .select('student_id, enrolled_at, progress')
        .eq('course_id', params.id)

      if (enrollments?.length) {
        const studentIds = enrollments.map(e => e.student_id)
        const { data: users } = await supabase
          .from('users')
          .select('id, full_name, email, avatar_url')
          .in('id', studentIds)

        const enriched = enrollments.map(e => {
          const u = users?.find(x => x.id === e.student_id)
          return { ...u, progress: e.progress, enrolled_at: e.enrolled_at }
        })
        setStudents(enriched ?? [])
      }
      setLoading(false)
    }
    loadData()
  }, [params.id])

  const filtered = students.filter(s => 
    s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto animate-pulse">
        <div className="h-8 w-48 bg-white/10 rounded mb-4" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>O&apos;quvchilar</h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>{students.length} ta o&apos;quvchi</p>
        </div>
      </div>

      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'}`}>
        <Search className={`h-5 w-5 ${isDark ? 'text-white/40' : 'text-gray-400'}`} />
        <input
          type="text"
          placeholder="Qidirish..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className={`flex-1 bg-transparent outline-none ${isDark ? 'text-white placeholder:text-white/40' : 'text-gray-900 placeholder:text-gray-400'}`}
        />
      </div>

      {filtered.length === 0 ? (
        <div className={`text-center py-16 rounded-2xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
          <Users className={`h-12 w-12 mx-auto mb-4 ${isDark ? 'text-white/20' : 'text-gray-300'}`} />
          <p className={isDark ? 'text-white/40' : 'text-gray-500'}>O&apos;quvchilar topilmadi</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(student => (
            <Link key={student.id} href={`/teacher/students/${student.id}`} className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
              isDark ? 'bg-white/5 border border-white/10 hover:bg-white/10' : 'bg-white border border-gray-200 hover:bg-gray-50'
            }`}>
              <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium ${
                isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'
              }`}>
                {student.full_name?.charAt(0) || '?'}
              </div>
              <div className="flex-1">
                <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{student.full_name || 'Nomalum'}</h3>
                <p className={`text-sm ${isDark ? 'text-white/40' : 'text-gray-500'}`}>{student.email}</p>
              </div>
              <ChevronRight className={`h-5 w-5 ${isDark ? 'text-white/40' : 'text-gray-400'}`} />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}