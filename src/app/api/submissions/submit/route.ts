import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { addXP, XP_REWARDS } from '@/lib/xp'

export async function POST(req: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { taskId, fileUrls } = await req.json()
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
        status: 'pending',
      })

    if (subError) return NextResponse.json({ error: subError.message }, { status: 400 })

    // XP qo'shish (+100)
    const { newXp, newLevel, levelUp } = await addXP(supabase, user.id, XP_REWARDS.TASK_SUBMIT)

    return NextResponse.json({
      success: true,
      xpGained: XP_REWARDS.TASK_SUBMIT,
      newXp,
      newLevel,
      levelUp,
    })
  } catch {
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 })
  }
}
