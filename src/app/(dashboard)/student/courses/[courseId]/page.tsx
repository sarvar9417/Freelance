import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import {
  ArrowLeft, Users, BookOpen, Star, CheckCircle2,
  Clock, BarChart2, Play, ClipboardList, ChevronRight,
} from 'lucide-react'
import EnrollButton from './EnrollButton'

export default async function CourseDetailPage({ params }: { params: { courseId: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: course }, { data: enrollment }] = await Promise.all([
    supabase
      .from('courses')
      .select('id, title, description, full_description, category, level, emoji, image_url, teacher_id, created_at, updated_at')
      .eq('id', params.courseId)
      .eq('is_published', true)
      .single(),
    supabase
      .from('enrollments')
      .select('progress, enrolled_at, last_accessed')
      .eq('student_id', user.id)
      .eq('course_id', params.courseId)
      .single(),
  ])

  if (!course) notFound()

  const [
    { data: teacher },
    { data: lessons },
    { data: tasks },
    { data: enrollCount },
    { data: reviews },
  ] = await Promise.all([
    supabase.from('users').select('full_name, bio').eq('id', course.teacher_id).single(),
    supabase.from('lessons').select('id, title, order_num, video_url').eq('course_id', params.courseId).order('order_num'),
    supabase.from('tasks').select('id, title, deadline').eq('course_id', params.courseId),
    supabase.from('enrollments').select('student_id', { count: 'exact', head: true }).eq('course_id', params.courseId),
    supabase.from('course_reviews').select('rating, comment, user_id, created_at').eq('course_id', params.courseId).order('created_at', { ascending: false }).limit(5),
  ])

  const reviewerIds = (reviews ?? []).map(r => r.user_id)
  const { data: reviewers } = reviewerIds.length > 0
    ? await supabase.from('users').select('id, full_name').in('id', reviewerIds)
    : { data: [] }
  const reviewerMap = Object.fromEntries((reviewers ?? []).map(r => [r.id, r.full_name]))

  const allRatings = (reviews ?? []).map(r => r.rating)
  const avgRating = allRatings.length
    ? Math.round((allRatings.reduce((a, b) => a + b, 0) / allRatings.length) * 10) / 10
    : 0

  const isEnrolled = !!enrollment

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back */}
      <Link href="/student/courses"
        className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm transition-colors">
        <ArrowLeft className="h-4 w-4" /> Kurslar katalogi
      </Link>

      {/* Hero */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="h-48 flex items-center justify-center text-7xl relative"
          style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(139,92,246,0.2))' }}>
          {course.image_url
            ? <img src={course.image_url} alt={course.title} className="w-full h-full object-cover" />
            : <span>{course.emoji ?? '📚'}</span>
          }
        </div>
        <div className="p-6 space-y-4">
          <div className="flex flex-wrap gap-2">
            {course.category && (
              <span className="text-xs px-2 py-1 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/20">
                {course.category}
              </span>
            )}
            {course.level && (
              <span className="text-xs px-2 py-1 rounded-full bg-white/5 text-white/50 flex items-center gap-1">
                <BarChart2 className="h-3 w-3" /> {course.level}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-white">{course.title}</h1>
          {course.description && (
            <p className="text-white/60 text-sm leading-relaxed">{course.description}</p>
          )}

          {/* Stats row */}
          <div className="flex flex-wrap items-center gap-5 text-sm text-white/50">
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-blue-400" />
              {(enrollCount as any) ?? 0} o&apos;quvchi
            </div>
            <div className="flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-emerald-400" />
              {(lessons ?? []).length} dars
            </div>
            <div className="flex items-center gap-1.5">
              <ClipboardList className="h-4 w-4 text-amber-400" />
              {(tasks ?? []).length} topshiriq
            </div>
            {avgRating > 0 && (
              <div className="flex items-center gap-1.5">
                <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                {avgRating} ({allRatings.length} sharh)
              </div>
            )}
          </div>

          {/* Teacher */}
          <div className="flex items-center gap-3 p-3 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500/40 to-purple-500/40 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
              {(teacher?.full_name ?? 'O')[0]}
            </div>
            <div>
              <p className="text-white text-sm font-medium">{teacher?.full_name ?? "O'qituvchi"}</p>
              {teacher?.bio && <p className="text-white/40 text-xs line-clamp-1">{teacher.bio}</p>}
            </div>
          </div>

          {/* Enroll / Continue */}
          {isEnrolled ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/50">Progress</span>
                <span className="text-emerald-400 font-semibold">{enrollment.progress ?? 0}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full"
                  style={{ width: `${enrollment.progress ?? 0}%` }} />
              </div>
              {(lessons ?? []).length > 0 && (
                <Link
                  href={`/student/courses/${params.courseId}/lessons/${lessons![0].id}`}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold text-white transition-all"
                  style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.8), rgba(5,150,105,0.8))' }}>
                  <Play className="h-4 w-4" /> Davom etish
                </Link>
              )}
            </div>
          ) : (
            <EnrollButton courseId={params.courseId} userId={user.id} />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Darslar ro'yxati */}
        <div className="lg:col-span-2 rounded-2xl p-5 space-y-4"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <h2 className="text-white font-semibold flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-blue-400" /> O&apos;quv dasturi
          </h2>
          {(lessons ?? []).length === 0 ? (
            <p className="text-white/30 text-sm text-center py-6">Hali dars qo&apos;shilmagan</p>
          ) : (
            <div className="space-y-2">
              {(lessons ?? []).map((lesson, i) => (
                <div key={lesson.id}
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="h-7 w-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
                    <span className="text-blue-400">{i + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/80 text-sm truncate">{lesson.title}</p>
                  </div>
                  {lesson.video_url && <Play className="h-3.5 w-3.5 text-white/30 flex-shrink-0" />}
                  {isEnrolled && (
                    <Link href={`/student/courses/${params.courseId}/lessons/${lesson.id}`}
                      className="text-blue-400 hover:text-blue-300 transition-colors flex-shrink-0">
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sharh + to'liq tavsif */}
        <div className="space-y-4">
          {course.full_description && (
            <div className="rounded-2xl p-5"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <h2 className="text-white font-semibold text-sm mb-3">Kurs haqida</h2>
              <p className="text-white/50 text-sm leading-relaxed">{course.full_description}</p>
            </div>
          )}

          {(reviews ?? []).length > 0 && (
            <div className="rounded-2xl p-5 space-y-3"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-center justify-between">
                <h2 className="text-white font-semibold text-sm flex items-center gap-2">
                  <Star className="h-4 w-4 text-amber-400" /> Sharhlar
                </h2>
                {avgRating > 0 && (
                  <span className="text-amber-400 font-bold">{avgRating}/5</span>
                )}
              </div>
              {(reviews ?? []).map(r => (
                <div key={r.user_id} className="p-3 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-white text-xs font-medium">{reviewerMap[r.user_id] ?? "O'quvchi"}</p>
                    <div className="flex items-center gap-0.5">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} className={`h-2.5 w-2.5 ${s <= r.rating ? 'text-amber-400 fill-amber-400' : 'text-white/20'}`} />
                      ))}
                    </div>
                  </div>
                  {r.comment && <p className="text-white/40 text-xs">{r.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
