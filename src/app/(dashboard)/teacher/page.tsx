'use client'

import { redirect } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useMountedTheme } from '@/hooks/useTheme'
import {
  BookOpen, Users, ClipboardCheck, Star, Plus, ArrowRight, Clock, CheckCircle2,
} from 'lucide-react'

export default function TeacherDashboard() {
  const { isDark } = useMountedTheme()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { redirect('/login'); return }

      const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
      if (!['teacher', 'admin'].includes(profile?.role ?? '')) { redirect('/student'); return }

      const { data: coursesData } = await supabase
        .from('courses')
        .select('id, title, emoji, category, is_published, created_at')
        .eq('teacher_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

      const courseIds = (coursesData ?? []).map((c: any) => c.id)

      const [{ data: enrollData }, { count: totalCourses }, { count: pendingCount }] = await Promise.all([
        courseIds.length > 0
          ? supabase.from('enrollments').select('student_id').in('course_id', courseIds)
          : Promise.resolve({ data: [] }),
        supabase.from('courses').select('*', { count: 'exact', head: true }).eq('teacher_id', user.id),
        supabase.from('submissions').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      ])

      const uniqueStudents = new Set((enrollData ?? []).map((e: any) => e.student_id)).size

      setData({
        courses: coursesData ?? [],
        totalCourses: totalCourses ?? 0,
        totalStudents: uniqueStudents,
        pendingCount: pendingCount ?? 0,
      })
      setLoading(false)
    }
    loadData()
  }, [])

  if (loading) return <div className="max-w-5xl mx-auto animate-pulse"><div className="h-8 w-48 bg-white/10 rounded mb-4" /></div>

  const stats = [
    { label: 'Jami kurslar', value: data?.totalCourses || 0, icon: BookOpen, color: isDark ? 'text-blue-400' : 'text-blue-600', bg: isDark ? 'bg-blue-500/10' : 'bg-blue-50' },
    { label: "O'quvchilar", value: data?.totalStudents || 0, icon: Users, color: isDark ? 'text-purple-400' : 'text-purple-600', bg: isDark ? 'bg-purple-500/10' : 'bg-purple-50' },
    { label: 'Kutilayotgan', value: data?.pendingCount || 0, icon: ClipboardCheck, color: isDark ? 'text-amber-400' : 'text-amber-600', bg: isDark ? 'bg-amber-500/10' : 'bg-amber-50' },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>O'qituvchi paneli</h1>
        <p className={`text-sm mt-1 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>Kurslaringizni boshqaring</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className={`rounded-2xl p-5 ${stat.bg}`}>
            <stat.icon className={`h-6 w-6 ${stat.color} mb-3`} />
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stat.value}</p>
            <p className={`text-xs ${isDark ? 'text-white/60' : 'text-gray-600'}`}>{stat.label}</p>
          </div>
        ))}
      </div>

      <div className={`rounded-2xl p-6 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Kurslarim</h2>
          <a href="/teacher/courses/new" className={`flex items-center gap-1 text-sm ${isDark ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-600 hover:text-emerald-700'}`}>
            <Plus className="h-4 w-4" /> Yangi kurs
          </a>
        </div>

        {data?.courses?.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className={`h-10 w-10 mx-auto mb-3 ${isDark ? 'text-white/20' : 'text-gray-300'}`} />
            <p className={isDark ? 'text-white/40' : 'text-gray-500'}>Hali kurs yaratilmagan</p>
          </div>
        ) : (
          <div className="space-y-3">
            {data?.courses?.map((course: any) => (
              <div key={course.id} className={`flex items-center gap-4 p-4 rounded-xl ${
                isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-100'
              }`}>
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-lg ${
                  isDark ? 'bg-gradient-to-br from-emerald-600 to-emerald-800' : 'bg-gradient-to-br from-emerald-500 to-emerald-600'
                }`}>
                  {course.emoji || '📚'}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{course.title}</h3>
                  <p className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-500'}`}>{course.category}</p>
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
        )}

        {data?.courses?.length > 0 && (
          <div className="mt-4 text-center">
            <a href="/teacher/courses" className={`inline-flex items-center gap-1 text-sm ${isDark ? 'text-white/60 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}>
              Barcha kurslar <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <a href="/teacher/tasks/review" className={`flex items-center gap-4 p-5 rounded-2xl transition-all ${
          isDark ? 'bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20' : 'bg-amber-50 border border-amber-200 hover:bg-amber-100'
        }`}>
          <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
            isDark ? 'bg-amber-500/20' : 'bg-amber-200'
          }`}>
            <ClipboardCheck className={`h-6 w-6 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
          </div>
          <div>
            <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Topshiriqlarni tekshirish</p>
            <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-500'}`}>{data?.pendingCount || 0} ta kutilmoqda</p>
          </div>
        </a>

        <a href="/teacher/students" className={`flex items-center gap-4 p-5 rounded-2xl transition-all ${
          isDark ? 'bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20' : 'bg-purple-50 border border-purple-200 hover:bg-purple-100'
        }`}>
          <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
            isDark ? 'bg-purple-500/20' : 'bg-purple-200'
          }`}>
            <Users className={`h-6 w-6 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
          </div>
          <div>
            <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>O'quvchilar</p>
            <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-500'}`}>{data?.totalStudents || 0} ta o'quvchi</p>
          </div>
        </a>
      </div>
    </div>
  )
}