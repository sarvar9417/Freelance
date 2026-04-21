import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { BookOpen, CheckCircle2, Play, ArrowRight, TrendingUp } from 'lucide-react'

export default async function MyCoursesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('course_id, progress, enrolled_at, last_accessed')
    .eq('student_id', user.id)
    .order('last_accessed', { ascending: false })

  const courseIds = (enrollments ?? []).map(e => e.course_id)
  const { data: courses } = courseIds.length > 0
    ? await supabase
        .from('courses')
        .select('id, title, description, emoji, category, level, image_url, teacher_id')
        .in('id', courseIds)
    : { data: [] }

  const teacherIds = Array.from(new Set((courses ?? []).map(c => c.teacher_id).filter(Boolean)))
  const { data: teachers } = teacherIds.length > 0
    ? await supabase.from('users').select('id, full_name').in('id', teacherIds)
    : { data: [] }
  const teacherMap = Object.fromEntries((teachers ?? []).map(t => [t.id, t.full_name]))

  const courseMap = Object.fromEntries((courses ?? []).map(c => [c.id, c]))

  const enriched = (enrollments ?? []).map(e => ({
    ...e,
    course: courseMap[e.course_id],
  })).filter(e => e.course)

  const active = enriched.filter(e => e.progress < 100)
  const completed = enriched.filter(e => e.progress >= 100)

  function CourseCard({ item, showCompleted }: { item: typeof enriched[0]; showCompleted?: boolean }) {
    const course = item.course
    if (!course) return null
    return (
      <div className="rounded-2xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="h-28 flex items-center justify-center text-4xl relative"
          style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.15))' }}>
          {course.image_url
            ? <img src={course.image_url} alt={course.title} className="w-full h-full object-cover" />
            : <span>{course.emoji ?? '📚'}</span>
          }
          {showCompleted && (
            <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/80 text-white text-xs">
              <CheckCircle2 className="h-3 w-3" /> Tugatilgan
            </div>
          )}
        </div>
        <div className="p-4 space-y-3">
          <div>
            <h3 className="text-white text-sm font-semibold line-clamp-1">{course.title}</h3>
            <p className="text-white/40 text-xs mt-0.5">{teacherMap[course.teacher_id] ?? "O'qituvchi"}</p>
          </div>
          {!showCompleted && (
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-white/40">Progress</span>
                <span className="text-blue-400 font-semibold">{item.progress ?? 0}%</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full"
                  style={{ width: `${item.progress ?? 0}%` }} />
              </div>
            </div>
          )}
          {showCompleted && item.enrolled_at && (
            <p className="text-white/30 text-xs">
              Yozilgan: {new Date(item.enrolled_at).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          )}
          <Link href={`/student/courses/${item.course_id}`}
            className="flex items-center justify-center gap-2 w-full py-2 rounded-xl text-xs font-medium text-white transition-all"
            style={showCompleted
              ? { background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.25)', color: '#34d399' }
              : { background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.25)', color: '#60a5fa' }
            }>
            {showCompleted ? <><CheckCircle2 className="h-3.5 w-3.5" /> Ko&apos;rish</> : <><Play className="h-3.5 w-3.5" /> Davom etish</>}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Mening kurslarim</h1>
          <p className="text-white/40 text-sm mt-1">Yozilgan barcha kurslaringiz</p>
        </div>
        <Link href="/student/courses"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-white/60 hover:text-white transition-colors"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <BookOpen className="h-4 w-4" /> Katalog
        </Link>
      </div>

      {/* Statistika */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Jami', value: enriched.length, color: 'text-white', bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)' },
          { label: "O'qiyotgan", value: active.length, color: 'text-blue-400', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)' },
          { label: 'Tugatgan', value: completed.length, color: 'text-emerald-400', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-4 text-center"
            style={{ background: s.bg, border: `1px solid ${s.border}` }}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-white/40 text-xs mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {enriched.length === 0 ? (
        <div className="rounded-2xl p-12 text-center"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="text-5xl mb-4">📚</p>
          <p className="text-white/40 text-sm mb-4">Hali hech qanday kursga yozilmagansiz</p>
          <Link href="/student/courses"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white"
            style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.8), rgba(99,102,241,0.8))' }}>
            <BookOpen className="h-4 w-4" /> Kurslarni ko&apos;rish
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {active.length > 0 && (
            <div>
              <h2 className="text-white font-semibold flex items-center gap-2 mb-4">
                <TrendingUp className="h-4 w-4 text-blue-400" /> Davom etayotgan ({active.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {active.map(item => <CourseCard key={item.course_id} item={item} />)}
              </div>
            </div>
          )}
          {completed.length > 0 && (
            <div>
              <h2 className="text-white font-semibold flex items-center gap-2 mb-4">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Tugatilgan ({completed.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {completed.map(item => <CourseCard key={item.course_id} item={item} showCompleted />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
