import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CourseCatalogClient from './CourseCatalogClient'

export default async function CoursesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: courses }, { data: enrollments }] = await Promise.all([
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

  const courseIds = (courses ?? []).map(c => c.id)
  const enrolledSet = new Set((enrollments ?? []).map(e => e.course_id))

  const teacherIds = Array.from(new Set((courses ?? []).map(c => c.teacher_id).filter(Boolean)))
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

  const enriched = (courses ?? []).map(c => ({
    ...c,
    teacherName: teacherMap[c.teacher_id] ?? "O'qituvchi",
    enrollCount: enrollCountMap[c.id] ?? 0,
    rating: ratingMap[c.id]
      ? Math.round((ratingMap[c.id].sum / ratingMap[c.id].count) * 10) / 10
      : 0,
    reviewCount: ratingMap[c.id]?.count ?? 0,
    isEnrolled: enrolledSet.has(c.id),
  }))

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Kurslar katalogi</h1>
        <p className="text-white/40 text-sm mt-1">O&apos;zingizga mos kursni toping</p>
      </div>

      <CourseCatalogClient courses={enriched} />
    </div>
  )
}
