'use client'

import { redirect, notFound } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useMountedTheme } from '@/hooks/useTheme'
import { ArrowLeft, CheckCircle2, Play } from 'lucide-react'
import LessonClient from './LessonClient'

export default function LessonPage({ params }: { params: { courseId: string; lessonId: string } }) {
  const { isDark } = useMountedTheme()
  const [lesson, setLesson] = useState<any>(null)
  const [course, setCourse] = useState<any>(null)
  const [allLessons, setAllLessons] = useState<any[]>([])
  const [completedLessons, setCompletedLessons] = useState<any[]>([])
  const [task, setTask] = useState<any>(null)
  const [submission, setSubmission] = useState<any>(null)
  const [enrollment, setEnrollment] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { redirect('/login'); return }

      const { data: enrollmentData } = await supabase
        .from('enrollments').select('progress').eq('student_id', user.id).eq('course_id', params.courseId).single()

      if (!enrollmentData) { redirect(`/student/courses/${params.courseId}`); return }

      const [{ data: lessonData }, { data: courseData }, { data: lessonsData }, { data: completedData }, { data: taskData }] = await Promise.all([
        supabase.from('lessons').select('id, title, order_num, video_url, content').eq('id', params.lessonId).eq('course_id', params.courseId).single(),
        supabase.from('courses').select('id, title, emoji').eq('id', params.courseId).single(),
        supabase.from('lessons').select('id, title, order_num, video_url').eq('course_id', params.courseId).order('order_num'),
        supabase.from('lesson_progress').select('lesson_id').eq('student_id', user.id).eq('course_id', params.courseId),
        supabase.from('tasks').select('id, title, description, deadline, max_score, allowed_formats').eq('lesson_id', params.lessonId).single(),
      ])

      if (!lessonData) { setLoading(false); return }

      const submissionData = taskData
        ? await supabase.from('submissions').select('id, status, score, feedback, submitted_at, file_urls').eq('task_id', taskData.id).eq('student_id', user.id).single()
        : { data: null }

      setLesson(lessonData)
      setCourse(courseData)
      setAllLessons(lessonsData ?? [])
      setCompletedLessons(completedData ?? [])
      setTask(taskData)
      setSubmission(submissionData.data)
      setEnrollment(enrollmentData)
      setLoading(false)
    }
    loadData()
  }, [params.courseId, params.lessonId])

  if (loading) return <div className="max-w-7xl mx-auto animate-pulse"><div className="h-8 w-48 bg-white/10 rounded mb-4" /></div>
  if (!lesson) return notFound()

  const completedSet = new Set(completedLessons.map(l => l.lesson_id))
  const currentIndex = allLessons.findIndex(l => l.id === params.lessonId)
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-6 h-full">

        <div className="lg:w-72 flex-shrink-0">
          <div className={`rounded-2xl overflow-hidden sticky top-6 ${isDark ? '' : 'bg-white border border-gray-200'}`}
            style={isDark ? { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' } : {}}>
            <div className={`p-4 border-b ${isDark ? 'border-white/5' : 'border-gray-200'}`}>
              <Link href={`/student/courses/${params.courseId}`}
                className={`flex items-center gap-2 text-sm transition-colors mb-2 ${isDark ? 'text-white/50 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}>
                <ArrowLeft className="h-3.5 w-3.5" /> Kursga qaytish
              </Link>
              <p className={`font-semibold text-sm truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {course?.emoji} {course?.title}
              </p>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                {currentIndex + 1}/{allLessons.length} dars
              </p>
              <div className={`h-1.5 rounded-full overflow-hidden mt-2 ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}>
                <div className={`h-full rounded-full ${isDark ? 'bg-gradient-to-r from-blue-600 to-blue-400' : 'bg-gradient-to-r from-blue-500 to-blue-400'}`}
                  style={{ width: `${enrollment.progress ?? 0}%` }} />
              </div>
            </div>
            <div className="overflow-y-auto max-h-[60vh]">
              {allLessons.map((l, i) => {
                const isCurrent = l.id === params.lessonId
                return (
                  <Link
                    key={l.id}
                    href={`/student/courses/${params.courseId}/lessons/${l.id}`}
                    className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                      isCurrent
                        ? isDark ? 'bg-blue-600/20 text-white border-l-2 border-blue-500' : 'bg-blue-50 text-gray-900 border-l-2 border-blue-500'
                        : isDark ? 'text-white/50 hover:text-white hover:bg-white/[0.03] border-l-2 border-transparent' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-l-2 border-transparent'
                    }`}>
                    <span className={`flex-shrink-0 text-xs w-5 text-center ${isDark ? 'text-white/30' : 'text-gray-400'}`}>{i + 1}</span>
                    <span className="flex-1 truncate">{l.title}</span>
                    {completedSet.has(l.id)
                      ? <CheckCircle2 className={`h-3.5 w-3.5 flex-shrink-0 ${isDark ? 'text-green-400' : 'text-green-500'}`} />
                      : l.video_url && <Play className={`h-3 w-3 flex-shrink-0 ${isDark ? 'opacity-40' : 'text-gray-400'}`} />
                    }
                  </Link>
                )
              })}
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-0 space-y-4">
          <LessonClient
            lesson={lesson}
            task={task}
            submission={submission}
            courseId={params.courseId}
            prevLesson={prevLesson}
            nextLesson={nextLesson}
            totalLessons={allLessons.length}
            currentIndex={currentIndex}
          />
        </div>
      </div>
    </div>
  )
}