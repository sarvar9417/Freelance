import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { addXP, updateStreak, XP_REWARDS } from '@/lib/xp'

export async function POST(req: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { title, content, category, author_name, author_avatar } = await req.json()

    if (!title?.trim() || title.trim().length < 5) {
      return NextResponse.json({ error: 'Sarlavha kamida 5 belgi bo\'lishi kerak' }, { status: 400 })
    }
    if (!content?.trim() || content.trim().length < 10) {
      return NextResponse.json({ error: 'Kontent kamida 10 belgi bo\'lishi kerak' }, { status: 400 })
    }
    if (!category) {
      return NextResponse.json({ error: 'Kategoriya kiritilishi shart' }, { status: 400 })
    }

    const { data: post, error } = await supabase
      .from('forum_posts')
      .insert({
        title: title.trim(),
        content: content.trim(),
        category,
        author_id: user.id,
        author_name: author_name ?? 'Foydalanuvchi',
        author_avatar: author_avatar ?? '',
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    let xpResult = await addXP(supabase, user.id, XP_REWARDS.FORUM_POST)
    let xpGained = XP_REWARDS.FORUM_POST

    const { isNew: streakUpdated } = await updateStreak(supabase, user.id)
    if (streakUpdated) {
      xpGained += XP_REWARDS.DAILY_STREAK
      xpResult = await addXP(supabase, user.id, XP_REWARDS.DAILY_STREAK)
    }

    return NextResponse.json({
      success: true,
      post,
      xpGained,
      newXp: xpResult.newXp,
      newLevel: xpResult.newLevel,
      levelUp: xpResult.levelUp,
    })
  } catch {
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 })
  }
}
