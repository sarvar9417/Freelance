import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { addXP, updateStreak, XP_REWARDS } from '@/lib/xp'

export async function POST(req: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { taskId, fileUrls, studentComment } = await req.json()
    if (!taskId) return NextResponse.json({ error: 'taskId talab qilinadi' }, { status: 400 })
    if (!fileUrls?.length) return NextResponse.json({ error: 'Fayl yuklang' }, { status: 400 })

    // Allaqachon topshirilgan va graded emasligini tekshirish
    const { data: existing } = await supabase
      .from('submissions')
      .select('id, status')
      .eq('student_id', user.id)
      .eq('task_id', taskId)
      .order('submitted_at', { ascending: false })
      .limit(1)
      .single()

    if (existing && existing.status === 'pending') {
      return NextResponse.json({ error: 'Topshiriq allaqachon tekshirilmoqda' }, { status: 409 })
    }
    if (existing && existing.status === 'graded') {
      return NextResponse.json({ error: 'Topshiriq allaqachon baholangan' }, { status: 409 })
    }

    // Topshirish
    const { error: subError } = await supabase
      .from('submissions')
      .insert({
        student_id: user.id,
        task_id: taskId,
        file_urls: fileUrls,
        student_comment: studentComment?.trim() || null,
        status: 'pending',
      })

    if (subError) return NextResponse.json({ error: subError.message }, { status: 400 })

    // XP + streak
    let xpResult = await addXP(supabase, user.id, XP_REWARDS.TASK_SUBMIT)
    let xpGained = XP_REWARDS.TASK_SUBMIT

    const { isNew: streakUpdated } = await updateStreak(supabase, user.id)
    if (streakUpdated) {
      xpGained += XP_REWARDS.DAILY_STREAK
      xpResult = await addXP(supabase, user.id, XP_REWARDS.DAILY_STREAK)
    }

    // O'qituvchiga bildirishnoma
    const { data: task } = await supabase
      .from('tasks')
      .select('title, courses(teacher_id)')
      .eq('id', taskId)
      .single()

    const teacherId = (task?.courses as unknown as { teacher_id: string } | null)?.teacher_id
    if (teacherId) {
      const admin = createAdminClient()
      const { data: studentProfile } = await admin
        .from('users')
        .select('full_name')
        .eq('id', user.id)
        .single()

      await admin.from('notifications').insert({
        user_id: teacherId,
        type: 'new_submission',
        title: 'Yangi topshiriq keldi! 📥',
        message: `${studentProfile?.full_name ?? 'O\'quvchi'} "${task?.title ?? 'Topshiriq'}"ni topshirdi`,
        link: '/teacher/tasks/review',
        data: { taskId, studentId: user.id },
      }).then(() => {})
    }

    return NextResponse.json({
      success: true,
      xpGained,
      newXp: xpResult.newXp,
      newLevel: xpResult.newLevel,
      levelUp: xpResult.levelUp,
    })
  } catch {
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 })
  }
}
