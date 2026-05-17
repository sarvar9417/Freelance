'use client'

import { redirect } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import CourseCatalogClient from './CourseCatalogClient'
import { useMountedTheme } from '@/hooks/useTheme'

interface CourseData {
  id: string
  title: string
  description: string | null
  category: string | null
  level: string | null
  emoji: string | null
  image_url: string | null
  teacher_id: string
  teacherName: string
  enrollCount: number
  rating: number
  reviewCount: number
  isEnrolled: boolean
  created_at: string
}

export default function CoursesPage() {
  const { isDark } = useMountedTheme()
  const [courses, setCourses] = useState<CourseData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        redirect('/login')
        return
      }

      const [{ data: coursesData }, { data: enrollments }] = await Promise.all([
        supabase
          .from('courses')
          .select('id, title, description, category, level, emoji, image_url, teacher_id, created_at, is_published')
          .eq('is_published', true)
          .order('created_at', { ascending: false }),
        supabase
          .from('enrollments')
          .select('course_id')
          .eq('student_id', user.id),
      ])

      const courseIds = (coursesData ?? []).map(c => c.id)
      const enrolledSet = new Set((enrollments ?? []).map(e => e.course_id))

      const teacherIds = Array.from(new Set((coursesData ?? []).map(c => c.teacher_id).filter(Boolean)))
      const { data: teachers } = teacherIds.length > 0
        ? await supabase.from('users').select('id, full_name').in('id', teacherIds)
        : { data: [] }
      const teacherMap = Object.fromEntries((teachers ?? []).map(t => [t.id, t.full_name]))

      const [{ data: enrollCounts }, { data: reviews }] = await Promise.all([
        courseIds.length > 0
          ? supabase.from('enrollments').select('course_id').in('course_id', courseIds)
          : Promise.resolve({ data: [] }),
        courseIds.length > 0
          ? supabase.from('course_reviews').select('course_id, rating').in('course_id', courseIds)
          : Promise.resolve({ data: [] }),
      ])

      const enrollCountMap: Record<string, number> = {}
      const ratingMap: Record<string, { sum: number; count: number }> = {}

      for (const e of enrollCounts ?? []) {
        enrollCountMap[e.course_id] = (enrollCountMap[e.course_id] ?? 0) + 1
      }
      for (const r of reviews ?? []) {
        if (!ratingMap[r.course_id]) ratingMap[r.course_id] = { sum: 0, count: 0 }
        ratingMap[r.course_id].sum += r.rating
        ratingMap[r.course_id].count += 1
      }

      const enriched = (coursesData ?? []).map(c => ({
        ...c,
        teacherName: teacherMap[c.teacher_id] ?? "O'qituvchi",
        enrollCount: enrollCountMap[c.id] ?? 0,
        rating: ratingMap[c.id]
          ? Math.round((ratingMap[c.id].sum / ratingMap[c.id].count) * 10) / 10
          : 0,
        reviewCount: ratingMap[c.id]?.count ?? 0,
        isEnrolled: enrolledSet.has(c.id),
      }))

      setCourses(enriched)
      setLoading(false)
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-white/10 rounded mb-2" />
          <div className="h-4 w-64 bg-white/5 rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Kurslar katalogi</h1>
        <p className={`text-sm mt-1 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>O&apos;zingizga mos kursni toping</p>
      </div>

      <CourseCatalogClient courses={courses} />
    </div>
  )
}