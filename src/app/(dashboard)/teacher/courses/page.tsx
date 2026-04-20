import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import CoursesGrid from './CoursesGrid'
import { Plus } from 'lucide-react'

export default async function TeacherCoursesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: courses } = await supabase
    .from('courses')
    .select('id, title, description, category, emoji, image_url, is_published, status, created_at')
    .eq('teacher_id', user.id)
    .order('created_at', { ascending: false })

  const courseIds = (courses ?? []).map(c => c.id)

  // Har bir kurs uchun statistika
  const [{ data: enrollRows }, { data: lessonRows }, { data: taskRows }] = await Promise.all([
    courseIds.length > 0
      ? supabase.from('enrollments').select('course_id').in('course_id', courseIds)
      : Promise.resolve({ data: [] }),
    courseIds.length > 0
      ? supabase.from('lessons').select('course_id').in('course_id', courseIds)
      : Promise.resolve({ data: [] }),
    courseIds.length > 0
      ? supabase.from('tasks').select('course_id').in('course_id', courseIds)
      : Promise.resolve({ data: [] }),
  ])

  const statsMap = Object.fromEntries(
    courseIds.map(id => [
      id,
      {
        students: (enrollRows ?? []).filter(r => r.course_id === id).length,
        lessons:  (lessonRows  ?? []).filter(r => r.course_id === id).length,
        tasks:    (taskRows    ?? []).filter(r => r.course_id === id).length,
      },
    ])
  )

  const enriched = (courses ?? []).map(c => ({ ...c, ...statsMap[c.id] }))

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Kurslarim</h1>
          <p className="text-white/40 text-sm mt-1">Barcha kurslaringizni boshqaring</p>
        </div>
        <Link
          href="/teacher/courses/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90 shadow-lg shadow-emerald-900/20"
          style={{ background: 'linear-gradient(135deg, rgba(5,150,105,0.9), rgba(4,120,87,0.9))' }}
        >
          <Plus className="h-4 w-4" />
          Yangi kurs
        </Link>
      </div>

      {/* Umumiy statistika */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Jami kurslar', value: enriched.length, color: 'text-emerald-400' },
          { label: 'Nashr etilgan', value: enriched.filter(c => c.is_published).length, color: 'text-blue-400' },
          { label: 'Qoralamalar', value: enriched.filter(c => !c.is_published).length, color: 'text-white/40' },
        ].map(s => (
          <div
            key={s.label}
            className="rounded-xl p-4 text-center"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-white/40 text-xs mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <CoursesGrid courses={enriched} />
    </div>
  )
}
