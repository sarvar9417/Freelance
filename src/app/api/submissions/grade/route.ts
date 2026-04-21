import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { submissionId, score, feedback, status = 'graded' } = await req.json()

    if (!submissionId) return NextResponse.json({ error: 'submissionId talab qilinadi' }, { status: 400 })
    if (!feedback?.trim()) return NextResponse.json({ error: 'Izoh kiritilishi shart' }, { status: 400 })
    if (!['graded', 'revision'].includes(status)) {
      return NextResponse.json({ error: 'Status noto\'g\'ri' }, { status: 400 })
    }

    // O'qituvchi ruxsatini tekshirish
    const { data: sub } = await supabase
      .from('submissions')
      .select('task_id, student_id, tasks(course_id, max_score, courses(teacher_id))')
      .eq('id', submissionId)
      .single()

    if (!sub) return NextResponse.json({ error: 'Topshiriq topilmadi' }, { status: 404 })

    const teacherId = (sub.tasks as any)?.courses?.teacher_id
    if (teacherId !== user.id) {
      return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 403 })
    }

    const maxScore: number = (sub.tasks as any)?.max_score ?? 100
    if (status === 'graded' && (score < 0 || score > maxScore)) {
      return NextResponse.json({ error: `Baho 0-${maxScore} oralig\'ida bo\'lishi kerak` }, { status: 400 })
    }

    // Baho qo'yish
    const updateData: Record<string, unknown> = {
      feedback: feedback.trim(),
      status,
      reviewed_at: new Date().toISOString(),
    }
    if (status === 'graded') {
      updateData.score = score
    }

    const { error: updateError } = await supabase
      .from('submissions')
      .update(updateData)
      .eq('id', submissionId)

    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 400 })

    // O'quvchiga bildirishnoma (trigger ham ishlaishi mumkin, bu backup)
    if (sub.student_id) {
      const admin = createAdminClient()
      const { data: task } = await admin
        .from('tasks')
        .select('title')
        .eq('id', sub.task_id)
        .single()

      if (status === 'graded') {
        await admin.from('notifications').insert({
          user_id: sub.student_id,
          type: 'submission_graded',
          title: 'Topshiriq baholandi! ✅',
          message: `"${task?.title ?? 'Topshiriq'}" baholandi — ${score} ball`,
          link: '/student/tasks',
          data: { submissionId, taskId: sub.task_id, score },
        }).then(() => {})
      } else {
        await admin.from('notifications').insert({
          user_id: sub.student_id,
          type: 'submission_revision',
          title: 'Qayta topshirish talab qilinadi 🔄',
          message: `"${task?.title ?? 'Topshiriq'}"ni qayta ko'rib chiqing`,
          link: '/student/tasks',
          data: { submissionId, taskId: sub.task_id },
        }).then(() => {})
      }
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 })
  }
}
