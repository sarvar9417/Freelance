import type { SupabaseClient } from '@supabase/supabase-js'

export const XP_REWARDS = {
  LESSON_COMPLETE:  50,
  TASK_SUBMIT:      100,
  COURSE_COMPLETE:  500,
  FORUM_POST:       20,
  DAILY_STREAK:     10,
} as const

export function calcLevel(totalXp: number): number {
  return Math.floor(totalXp / 1000) + 1
}

export async function addXP(
  supabase: SupabaseClient,
  userId: string,
  amount: number,
): Promise<{ newXp: number; newLevel: number; levelUp: boolean }> {
  const { data: existing } = await supabase
    .from('user_xp')
    .select('total_xp, current_level')
    .eq('user_id', userId)
    .single()

  const oldXp    = existing?.total_xp ?? 0
  const oldLevel = existing?.current_level ?? 1
  const newXp    = oldXp + amount
  const newLevel = calcLevel(newXp)

  if (existing) {
    await supabase
      .from('user_xp')
      .update({ total_xp: newXp, current_level: newLevel })
      .eq('user_id', userId)
  } else {
    await supabase
      .from('user_xp')
      .insert({ user_id: userId, total_xp: newXp, current_level: newLevel })
  }

  return { newXp, newLevel, levelUp: newLevel > oldLevel }
}

export async function updateStreak(
  supabase: SupabaseClient,
  userId: string,
): Promise<{ streak: number; isNew: boolean }> {
  const today     = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  const { data: existing } = await supabase
    .from('user_streaks')
    .select('current_streak, longest_streak, last_activity_date')
    .eq('user_id', userId)
    .single()

  if (!existing) {
    await supabase
      .from('user_streaks')
      .insert({ user_id: userId, current_streak: 1, longest_streak: 1, last_activity_date: today })
    return { streak: 1, isNew: true }
  }

  if (existing.last_activity_date === today) {
    return { streak: existing.current_streak, isNew: false }
  }

  const newStreak    = existing.last_activity_date === yesterday ? (existing.current_streak ?? 0) + 1 : 1
  const longestStreak = Math.max(existing.longest_streak ?? 0, newStreak)

  await supabase
    .from('user_streaks')
    .update({ current_streak: newStreak, longest_streak: longestStreak, last_activity_date: today })
    .eq('user_id', userId)

  return { streak: newStreak, isNew: true }
}
