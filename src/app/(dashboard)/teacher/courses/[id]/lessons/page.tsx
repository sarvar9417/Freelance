import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import LessonsClient from './LessonsClient'
import { ArrowLeft, Plus } from 'lucide-react'

export default async function LessonsPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: course } = await supabase
    .from('courses')
    .select('id, title, emoji, category')
    .eq('id', params.id)
    .eq('teacher_id', user.id)
    .single()

  if (!course) notFound()

  const { data: lessons } = await supabase
    .from('lessons')
    .select('id, title, order_num, video_url, content, created_at')
    .eq('course_id', params.id)
    .order('order_num', { ascending: true })

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/teacher/courses`} className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <p className="text-white/40 text-xs">{course.emoji} {course.title}</p>
            <h1 className="text-xl font-bold text-white">Darslar boshqaruvi</h1>
          </div>
        </div>
        <Link href={`/teacher/courses/${params.id}/lessons/new`}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white shadow-lg"
          style={{ background: 'linear-gradient(135deg, rgba(5,150,105,0.9), rgba(4,120,87,0.9))' }}>
          <Plus className="h-4 w-4" /> Yangi dars
        </Link>
      </div>

      <LessonsClient courseId={params.id} lessons={lessons ?? []} />
    </div>
  )
}
