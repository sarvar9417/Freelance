import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { addXP, updateStreak, XP_REWARDS } from '@/lib/xp'

export async function POST(req: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { courseId, lessonId } = await req.json()
    if (!courseId || !lessonId) {
      return NextResponse.json({ error: 'courseId va lessonId talab qilinadi' }, { status: 400 })
    }

    // Dars allaqachon bajarilganmi? (XP double-count oldini olish)
    const { data: existing } = await supabase
      .from('lesson_progress')
      .select('id')
      .eq('student_id', user.id)
      .eq('lesson_id', lessonId)
      .maybeSingle()

    const isNewLesson = !existing

    if (isNewLesson) {
      // Yangi dars — lesson_progress ga qo'shish (trigger progress ni yangilaydi)
      const { error: progressError } = await supabase
        .from('lesson_progress')
        .insert({ student_id: user.id, lesson_id: lessonId, course_id: courseId })

      if (progressError && progressError.code !== '23505') {
        return NextResponse.json({ error: progressError.message }, { status: 400 })
      }
    }

    // last_accessed va progress ni fallback sifatida yangilash
    const [{ count: totalLessons }, { count: doneLessons }] = await Promise.all([
      supabase.from('lessons').select('*', { count: 'exact', head: true }).eq('course_id', courseId),
      supabase.from('lesson_progress').select('*', { count: 'exact', head: true })
        .eq('student_id', user.id).eq('course_id', courseId),
    ])

    const progress = totalLessons
      ? Math.min(100, Math.round(((doneLessons ?? 0) / totalLessons) * 100))
      : 0

    await supabase
      .from('enrollments')
      .update({ last_accessed: new Date().toISOString(), progress })
      .eq('student_id', user.id)
      .eq('course_id', courseId)

    // XP va streak — faqat yangi dars bo'lsa
    let newXp = 0
    let newLevel = 1
    let levelUp = false
    let xpGained = 0
    let courseCompleted = false

    if (isNewLesson) {
      xpGained = XP_REWARDS.LESSON_COMPLETE
      const xpResult = await addXP(supabase, user.id, XP_REWARDS.LESSON_COMPLETE)
      newXp   = xpResult.newXp
      newLevel = xpResult.newLevel
      levelUp  = xpResult.levelUp

      const { isNew: streakUpdated } = await updateStreak(supabase, user.id)
      if (streakUpdated) {
        xpGained += XP_REWARDS.DAILY_STREAK
        const streakXp = await addXP(supabase, user.id, XP_REWARDS.DAILY_STREAK)
        newXp    = streakXp.newXp
        newLevel  = streakXp.newLevel
        levelUp   = levelUp || streakXp.levelUp
      }

      // Kurs tugatildi (+500 XP bonus) — faqat birinchi marta 100% bo'lsa
      if (progress >= 100) {
        courseCompleted = true
        xpGained += XP_REWARDS.COURSE_COMPLETE
        const bonusResult = await addXP(supabase, user.id, XP_REWARDS.COURSE_COMPLETE)
        newXp   = bonusResult.newXp
        newLevel = bonusResult.newLevel
        levelUp  = levelUp || bonusResult.levelUp
        // DB trigger on_course_completed bildirishnomani yuboradi
      }
    }

    return NextResponse.json({
      success: true,
      progress,
      xpGained,
      newXp,
      newLevel,
      levelUp,
      courseCompleted,
      alreadyDone: !isNewLesson,
    })
  } catch {
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 })
  }
}
