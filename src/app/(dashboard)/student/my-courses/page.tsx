'use client'

import { redirect } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { BookOpen, CheckCircle2, Play, ArrowRight } from 'lucide-react'
import { useMountedTheme } from '@/hooks/useTheme'

interface Enrollment {
  course_id: string
  progress: number
  enrolled_at: string
  last_accessed: string
  course?: {
    id: string
    title: string
    description: string
    emoji: string
    category: string
    level: string
    image_url: string
    teacher_id: string
  }
}

export default function MyCoursesPage() {
  const { isDark } = useMountedTheme()
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        redirect('/login')
        return
      }

      const { data: enrollData } = await supabase
        .from('enrollments')
        .select('course_id, progress, enrolled_at, last_accessed')
        .eq('student_id', user.id)
        .order('last_accessed', { ascending: false })

      const courseIds = (enrollData ?? []).map(e => e.course_id)
      const { data: courses } = courseIds.length > 0
        ? await supabase.from('courses').select('id, title, description, emoji, category, level, image_url, teacher_id').in('id', courseIds)
        : { data: [] }

      const teacherIds = Array.from(new Set((courses ?? []).map(c => c.teacher_id).filter(Boolean)))
      const { data: teachers } = teacherIds.length > 0
        ? await supabase.from('users').select('id, full_name').in('id', teacherIds)
        : { data: [] }
      const teacherMap = Object.fromEntries((teachers ?? []).map(t => [t.id, t.full_name]))

      const courseMap = Object.fromEntries((courses ?? []).map(c => [c.id, c]))

      const enriched = (enrollData ?? []).map(e => ({
        ...e,
        course: courseMap[e.course_id],
      })).filter(e => e.course)

      setEnrollments(enriched)
      setLoading(false)
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-white/10 rounded mb-2" />
          <div className="h-4 w-64 bg-white/5 rounded" />
        </div>
      </div>
    )
  }

  const active = enrollments.filter(e => e.progress < 100)
  const completed = enrollments.filter(e => e.progress >= 100)

  function CourseCard({ item }: { item: Enrollment }) {
    const course = item.course
    if (!course) return null
    return (
      <Link href={`/student/courses/${course.id}`}>
        <div className={`rounded-2xl overflow-hidden transition-all hover:scale-[1.02] ${
          isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'
        }`}>
          <div className={`h-28 flex items-center justify-center text-4xl relative ${
            isDark ? 'bg-gradient-to-br from-blue-600/20 to-purple-600/20' : 'bg-gradient-to-br from-blue-100 to-purple-100'
          }`}>
            {course.image_url
              ? <img src={course.image_url} alt={course.title} className="w-full h-full object-cover" />
              : course.emoji || '📚'
            }
            {item.progress >= 100 && (
              <div className="absolute top-2 right-2 bg-emerald-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Tugatgan
              </div>
            )}
          </div>
          <div className="p-4 space-y-3">
            <h3 className={`font-semibold text-sm line-clamp-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {course.title}
            </h3>
            <div className="flex items-center gap-2">
              <div className={`h-1.5 flex-1 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}>
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full"
                  style={{ width: `${item.progress}%` }}
                />
              </div>
              <span className={`text-xs font-medium ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                {item.progress}%
              </span>
            </div>
            {item.progress < 100 ? (
              <button className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium ${
                isDark ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}>
                <Play className="h-4 w-4" /> Davom etish
              </button>
            ) : (
              <div className={`flex items-center justify-center gap-2 py-2 rounded-xl text-sm ${
                isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
              }`}>
                <CheckCircle2 className="h-4 w-4" /> Tugatilgan
              </div>
            )}
          </div>
        </div>
      </Link>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Mening kurslarim</h1>
        <p className={`text-sm mt-1 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
          {enrollments.length} ta kurs — {active.length} faol, {completed.length} tugatilgan
        </p>
      </div>

      {active.length > 0 && (
        <div className="space-y-4">
          <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Faol kurslar</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {active.map(item => <CourseCard key={item.course_id} item={item} />)}
          </div>
        </div>
      )}

      {completed.length > 0 && (
        <div className="space-y-4">
          <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Tugatilgan kurslar</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {completed.map(item => <CourseCard key={item.course_id} item={item} />)}
          </div>
        </div>
      )}

      {enrollments.length === 0 && (
        <div className={`text-center py-16 rounded-2xl ${
          isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'
        }`}>
          <BookOpen className={`h-12 w-12 mx-auto mb-4 ${isDark ? 'text-white/20' : 'text-gray-300'}`} />
          <p className={isDark ? 'text-white/40' : 'text-gray-500'}>Hali kursga yozilmagansiz</p>
          <Link href="/student/courses" className={`inline-block mt-4 px-4 py-2 rounded-xl text-sm ${
            isDark ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white'
          }`}>
            Kurslarni ko'rish
          </Link>
        </div>
      )}
    </div>
  )
}