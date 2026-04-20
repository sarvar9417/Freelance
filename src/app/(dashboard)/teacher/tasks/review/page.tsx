import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ReviewQueueClient from './ReviewQueueClient'
import { ClipboardCheck } from 'lucide-react'

export default async function ReviewQueuePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (!['teacher', 'admin'].includes(profile?.role ?? '')) redirect('/student')

  // O'qituvchining barcha kurslari
  const { data: courses } = await supabase
    .from('courses')
    .select('id, title, emoji')
    .eq('teacher_id', user.id)

  const courseIds = (courses ?? []).map(c => c.id)

  if (courseIds.length === 0) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Topshiriqlarni tekshirish</h1>
          <p className="text-white/40 text-sm mt-1">Tekshirilmagan topshiriqlar</p>
        </div>
        <div className="rounded-2xl p-12 text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="text-5xl mb-4">📭</div>
          <p className="text-white/40 text-sm">Hali kurs yaratilmagan</p>
          <Link href="/teacher/courses/new" className="mt-4 inline-block text-emerald-400 text-sm hover:text-emerald-300">Kurs yaratish →</Link>
        </div>
      </div>
    )
  }

  // Topshiriqlar
  const { data: taskRows } = await supabase
    .from('tasks')
    .select('id, title, course_id, max_score')
    .in('course_id', courseIds)

  const taskIds = (taskRows ?? []).map(t => t.id)
  const taskMap = Object.fromEntries((taskRows ?? []).map(t => [t.id, t]))
  const courseMap = Object.fromEntries((courses ?? []).map(c => [c.id, c]))

  // Topshirilgan ishlar
  const { data: submissions } = taskIds.length > 0
    ? await supabase
        .from('submissions')
        .select('id, student_id, task_id, submitted_at, status, score, file_urls, users!student_id(full_name, email, avatar_url)')
        .in('task_id', taskIds)
        .order('submitted_at', { ascending: false })
    : { data: [] }

  const enriched = (submissions ?? []).map((s: any) => ({
    id: s.id,
    student_id: s.student_id,
    task_id: s.task_id,
    submitted_at: s.submitted_at,
    status: s.status,
    score: s.score,
    file_urls: s.file_urls ?? [],
    student_name: s.users?.full_name ?? "O'quvchi",
    student_email: s.users?.email ?? '',
    task_title: taskMap[s.task_id]?.title ?? '—',
    max_score: taskMap[s.task_id]?.max_score ?? 100,
    course_title: courseMap[taskMap[s.task_id]?.course_id]?.title ?? '—',
    course_emoji: courseMap[taskMap[s.task_id]?.course_id]?.emoji ?? '📚',
  }))

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Topshiriqlarni tekshirish</h1>
          <p className="text-white/40 text-sm mt-1">Barcha topshirilgan ishlarni ko&apos;rib chiqing</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm"
          style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}>
          <ClipboardCheck className="h-4 w-4 text-amber-400" />
          <span className="text-amber-400 font-semibold">
            {enriched.filter(s => s.status === 'pending').length}
          </span>
          <span className="text-white/40">ta kutilmoqda</span>
        </div>
      </div>

      <ReviewQueueClient
        submissions={enriched}
        courses={courses ?? []}
      />
    </div>
  )
}
