'use client'

import { redirect, notFound } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useMountedTheme } from '@/hooks/useTheme'
import {
  ArrowLeft, Users, BookOpen, Star, CheckCircle2,
  Clock, BarChart2, Play, ClipboardList, ChevronRight,
} from 'lucide-react'
import EnrollButton from './EnrollButton'

export default function CourseDetailPage({ params }: { params: { courseId: string } }) {
  const { isDark } = useMountedTheme()
  const [course, setCourse] = useState<any>(null)
  const [enrollment, setEnrollment] = useState<any>(null)
  const [lessons, setLessons] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [teacher, setTeacher] = useState<any>(null)
  const [enrollCount, setEnrollCount] = useState(0)
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { redirect('/login'); return }

      const [{ data: courseData }, { data: enrollmentData }] = await Promise.all([
        supabase.from('courses').select('id, title, description, full_description, category, level, emoji, image_url, teacher_id, created_at, updated_at').eq('id', params.courseId).eq('is_published', true).single(),
        supabase.from('enrollments').select('progress, enrolled_at, last_accessed').eq('student_id', user.id).eq('course_id', params.courseId).single(),
      ])

      if (!courseData) { setLoading(false); return }

      const [
        { data: teacherData },
        { data: lessonsData },
        { data: tasksData },
        { count: enrollCountData },
        { data: reviewsData },
      ] = await Promise.all([
        supabase.from('users').select('full_name, bio').eq('id', courseData.teacher_id).single(),
        supabase.from('lessons').select('id, title, order_num, video_url').eq('course_id', params.courseId).order('order_num'),
        supabase.from('tasks').select('id, title, deadline').eq('course_id', params.courseId),
        supabase.from('enrollments').select('student_id', { count: 'exact', head: true }).eq('course_id', params.courseId),
        supabase.from('course_reviews').select('rating, comment, user_id, created_at').eq('course_id', params.courseId).order('created_at', { ascending: false }).limit(5),
      ])

      setCourse(courseData)
      setEnrollment(enrollmentData)
      setTeacher(teacherData)
      setLessons(lessonsData ?? [])
      setTasks(tasksData ?? [])
      setEnrollCount(enrollCountData ?? 0)
      setReviews(reviewsData ?? [])
      setLoading(false)
    }
    loadData()
  }, [params.courseId])

  if (loading) return <div className="max-w-5xl mx-auto animate-pulse"><div className="h-8 w-48 bg-white/10 rounded mb-4" /></div>
  if (!course) return notFound()

  const isEnrolled = !!enrollment
  const allRatings = reviews.map(r => r.rating)
  const avgRating = allRatings.length ? Math.round((allRatings.reduce((a, b) => a + b, 0) / allRatings.length) * 10) / 10 : 0

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Link href="/student/courses" className={`inline-flex items-center gap-2 text-sm transition-colors ${isDark ? 'text-white/40 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}>
        <ArrowLeft className="h-4 w-4" /> Kurslar katalogi
      </Link>

      <div className={`rounded-2xl overflow-hidden ${isDark ? '' : 'bg-gray-50 border border-gray-200'}`}
        style={isDark ? { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' } : {}}>
        <div className={`h-48 flex items-center justify-center text-7xl relative ${isDark ? '' : 'bg-gradient-to-br from-blue-100 to-purple-100'}`}
          style={isDark ? { background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(139,92,246,0.2))' } : {}}>
          {course.image_url
            ? <img src={course.image_url} alt={course.title} className="w-full h-full object-cover" />
            : <span>{course.emoji ?? '📚'}</span>
          }
        </div>
        <div className="p-6 space-y-4">
          <div className="flex flex-wrap gap-2">
            {course.category && (
              <span className={`text-xs px-2 py-1 rounded-full ${isDark ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20' : 'bg-blue-100 text-blue-600 border border-blue-200'}`}>
                {course.category}
              </span>
            )}
            {course.level && (
              <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${isDark ? 'bg-white/5 text-white/50' : 'bg-gray-100 text-gray-600'}`}>
                <BarChart2 className="h-3 w-3" /> {course.level}
              </span>
            )}
          </div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{course.title}</h1>
          {course.description && (
            <p className={`text-sm leading-relaxed ${isDark ? 'text-white/60' : 'text-gray-600'}`}>{course.description}</p>
          )}

          <div className={`flex flex-wrap items-center gap-5 text-sm ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
            <div className={`flex items-center gap-1.5 ${isDark ? '' : 'text-blue-600'}`}>
              <Users className={`h-4 w-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              {enrollCount} o&apos;quvchi
            </div>
            <div className={`flex items-center gap-1.5 ${isDark ? '' : 'text-emerald-600'}`}>
              <BookOpen className={`h-4 w-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
              {lessons.length} dars
            </div>
            <div className={`flex items-center gap-1.5 ${isDark ? '' : 'text-amber-600'}`}>
              <ClipboardList className={`h-4 w-4 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
              {tasks.length} topshiriq
            </div>
            {avgRating > 0 && (
              <div className={`flex items-center gap-1.5 ${isDark ? '' : 'text-amber-600'}`}>
                <Star className={`h-4 w-4 ${isDark ? 'text-amber-400 fill-amber-400' : 'text-amber-500 fill-amber-500'}`} />
                {avgRating} ({allRatings.length} sharh)
              </div>
            )}
          </div>

          <div className={`flex items-center gap-3 p-3 rounded-xl ${isDark ? '' : 'bg-gray-50 border border-gray-200'}`}
            style={isDark ? { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' } : {}}>
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${isDark ? 'bg-gradient-to-br from-blue-500/40 to-purple-500/40 text-white' : 'bg-gradient-to-br from-blue-500 to-purple-500 text-white'}`}>
              {(teacher?.full_name ?? 'O')[0]}
            </div>
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{teacher?.full_name ?? "O'qituvchi"}</p>
              {teacher?.bio && <p className={`text-xs line-clamp-1 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>{teacher.bio}</p>}
            </div>
          </div>

          {isEnrolled ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className={isDark ? 'text-white/50' : 'text-gray-500'}>Progress</span>
                <span className={isDark ? 'text-emerald-400 font-semibold' : 'text-emerald-600 font-semibold'}>{enrollment.progress ?? 0}%</span>
              </div>
              <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}>
                <div className={`h-full rounded-full ${isDark ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' : 'bg-gradient-to-r from-emerald-500 to-emerald-400'}`}
                  style={{ width: `${enrollment.progress ?? 0}%` }} />
              </div>
              {lessons.length > 0 && (
                <Link href={`/student/courses/${params.courseId}/lessons/${lessons[0].id}`}
                  className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold transition-all ${isDark ? 'text-white' : 'text-white'}`}
                  style={isDark ? { background: 'linear-gradient(135deg, rgba(16,185,129,0.8), rgba(5,150,105,0.8))' } : { background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                  <Play className="h-4 w-4" /> Davom etish
                </Link>
              )}
            </div>
          ) : (
            <EnrollButton courseId={params.courseId} />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`lg:col-span-2 rounded-2xl p-5 space-y-4 ${isDark ? '' : 'bg-gray-50 border border-gray-200'}`}
          style={isDark ? { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' } : {}}>
          <h2 className={`font-semibold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <BookOpen className={`h-4 w-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} /> O&apos;quv dasturi
          </h2>
          {lessons.length === 0 ? (
            <p className={`text-sm text-center py-6 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>Hali dars qo&apos;shilmagan</p>
          ) : (
            <div className="space-y-2">
              {lessons.map((lesson, i) => (
                <div key={lesson.id} className={`flex items-center gap-3 p-3 rounded-xl ${isDark ? '' : 'bg-white border border-gray-100'}`}
                  style={isDark ? { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' } : {}}>
                  <div className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${isDark ? '' : 'bg-blue-50 border border-blue-100'}`}
                    style={isDark ? { background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' } : {}}>
                    <span className={isDark ? 'text-blue-400' : 'text-blue-600'}>{i + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm truncate ${isDark ? 'text-white/80' : 'text-gray-700'}`}>{lesson.title}</p>
                  </div>
                  {lesson.video_url && <Play className={`h-3.5 w-3.5 flex-shrink-0 ${isDark ? 'text-white/30' : 'text-gray-400'}`} />}
                  {isEnrolled && (
                    <Link href={`/student/courses/${params.courseId}/lessons/${lesson.id}`}
                      className={`flex-shrink-0 ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          {course.full_description && (
            <div className={`rounded-2xl p-5 ${isDark ? '' : 'bg-gray-50 border border-gray-200'}`}
              style={isDark ? { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' } : {}}>
              <h2 className={`font-semibold text-sm mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Kurs haqida</h2>
              <p className={`text-sm leading-relaxed ${isDark ? 'text-white/50' : 'text-gray-600'}`}>{course.full_description}</p>
            </div>
          )}

          {reviews.length > 0 && (
            <div className={`rounded-2xl p-5 space-y-3 ${isDark ? '' : 'bg-gray-50 border border-gray-200'}`}
              style={isDark ? { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' } : {}}>
              <div className="flex items-center justify-between">
                <h2 className={`font-semibold text-sm flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <Star className={`h-4 w-4 ${isDark ? 'text-amber-400' : 'text-amber-500'}`} /> Sharhlar
                </h2>
                {avgRating > 0 && (
                  <span className={`font-bold ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>{avgRating}/5</span>
                )}
              </div>
              {reviews.map((r, i) => (
                <div key={i} className={`p-3 rounded-xl ${isDark ? '' : 'bg-white border border-gray-100'}`}
                  style={isDark ? { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' } : {}}>
                  <div className="flex items-center justify-between mb-1">
                    <p className={`text-xs font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>O'quvchi</p>
                    <div className="flex items-center gap-0.5">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} className={`h-2.5 w-2.5 ${s <= r.rating ? isDark ? 'text-amber-400 fill-amber-400' : 'text-amber-500 fill-amber-500' : isDark ? 'text-white/20' : 'text-gray-300'}`} />
                      ))}
                    </div>
                  </div>
                  {r.comment && <p className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-500'}`}>{r.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}