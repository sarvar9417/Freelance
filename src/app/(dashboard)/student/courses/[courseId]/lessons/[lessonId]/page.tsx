import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft, CheckCircle2, Play } from 'lucide-react'
import LessonClient from './LessonClient'

export default async function LessonPage({
  params,
}: {
  params: { courseId: string; lessonId: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Enrollment tekshirish
  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('progress')
    .eq('student_id', user.id)
    .eq('course_id', params.courseId)
    .single()

  if (!enrollment) redirect(`/student/courses/${params.courseId}`)

  const [{ data: lesson }, { data: course }, { data: allLessons }, { data: completedLessons }] = await Promise.all([
    supabase
      .from('lessons')
      .select('id, title, order_num, video_url, content')
      .eq('id', params.lessonId)
      .eq('course_id', params.courseId)
      .single(),
    supabase.from('courses').select('id, title, emoji').eq('id', params.courseId).single(),
    supabase
      .from('lessons')
      .select('id, title, order_num, video_url')
      .eq('course_id', params.courseId)
      .order('order_num'),
    supabase
      .from('lesson_progress')
      .select('lesson_id')
      .eq('student_id', user.id)
      .eq('course_id', params.courseId),
  ])

  const completedSet = new Set((completedLessons ?? []).map(l => l.lesson_id))

  if (!lesson) notFound()

  // Bu dars uchun topshiriq
  const { data: task } = await supabase
    .from('tasks')
    .select('id, title, description, deadline, max_score, allowed_formats')
    .eq('lesson_id', params.lessonId)
    .single()

  // O'quvchining submission
  const { data: submission } = task
    ? await supabase
        .from('submissions')
        .select('id, status, score, feedback, submitted_at, file_urls')
        .eq('task_id', task.id)
        .eq('student_id', user.id)
        .single()
    : { data: null }

  const currentIndex = (allLessons ?? []).findIndex(l => l.id === params.lessonId)
  const prevLesson = currentIndex > 0 ? allLessons![currentIndex - 1] : null
  const nextLesson = currentIndex < (allLessons ?? []).length - 1 ? allLessons![currentIndex + 1] : null

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-6 h-full">

        {/* Sol: darslar ro'yxati */}
        <div className="lg:w-72 flex-shrink-0">
          <div className="rounded-2xl overflow-hidden sticky top-6"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="p-4 border-b border-white/5">
              <Link href={`/student/courses/${params.courseId}`}
                className="flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors mb-2">
                <ArrowLeft className="h-3.5 w-3.5" /> Kursga qaytish
              </Link>
              <p className="text-white font-semibold text-sm truncate">
                {course?.emoji} {course?.title}
              </p>
              <p className="text-white/30 text-xs mt-0.5">
                {currentIndex + 1}/{(allLessons ?? []).length} dars
              </p>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mt-2">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full"
                  style={{ width: `${enrollment.progress ?? 0}%` }}
                />
              </div>
            </div>
            <div className="overflow-y-auto max-h-[60vh]">
              {(allLessons ?? []).map((l, i) => {
                const isCurrent = l.id === params.lessonId
                return (
                  <Link
                    key={l.id}
                    href={`/student/courses/${params.courseId}/lessons/${l.id}`}
                    className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                      isCurrent
                        ? 'bg-blue-600/20 text-white border-l-2 border-blue-500'
                        : 'text-white/50 hover:text-white hover:bg-white/[0.03] border-l-2 border-transparent'
                    }`}>
                    <span className="flex-shrink-0 text-xs w-5 text-center text-white/30">{i + 1}</span>
                    <span className="flex-1 truncate">{l.title}</span>
                    {completedSet.has(l.id)
                      ? <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0 text-green-400" />
                      : l.video_url && <Play className="h-3 w-3 flex-shrink-0 opacity-40" />
                    }
                  </Link>
                )
              })}
            </div>
          </div>
        </div>

        {/* O'ng: dars kontenti */}
        <div className="flex-1 min-w-0 space-y-4">
          <LessonClient
            lesson={lesson}
            task={task}
            submission={submission}
            userId={user.id}
            courseId={params.courseId}
            prevLesson={prevLesson}
            nextLesson={nextLesson}
            totalLessons={(allLessons ?? []).length}
            currentIndex={currentIndex}
          />
        </div>
      </div>
    </div>
  )
}
