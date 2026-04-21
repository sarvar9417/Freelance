'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

// Oddiy admin operatsiyalari uchun server client qaytaradi
async function requireAdmin() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/student')

  return supabase
}

// Faqat auth.admin.* operatsiyalari uchun kerak (deleteUser, changeRole)
function getAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY o'rnatilmagan. " +
      "Supabase Dashboard → Settings → API → Service Role Key dan oling va .env.local ga qo'shing."
    )
  }
  return createAdminClient()
}

// ─── Foydalanuvchi rolini o'zgartirish ───────────────────────────────────────
export async function changeUserRole(userId: string, role: 'student' | 'teacher' | 'admin') {
  const supabase = await requireAdmin()

  const { error } = await supabase
    .from('users')
    .update({ role })
    .eq('id', userId)

  if (error) return { error: error.message }
  revalidatePath('/admin/users')
  return { success: true }
}

// ─── Foydalanuvchini o'chirish ────────────────────────────────────────────────
export async function deleteUser(userId: string) {
  await requireAdmin()

  try {
    const adminClient = getAdminClient()
    await adminClient.from('users').delete().eq('id', userId)
    const { error } = await adminClient.auth.admin.deleteUser(userId)
    if (error) return { error: error.message }
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : "Admin key yo'q. .env.local ga SUPABASE_SERVICE_ROLE_KEY qo'shing." }
  }

  revalidatePath('/admin/users')
  return { success: true }
}

// ─── Kursni tasdiqlash ────────────────────────────────────────────────────────
export async function approveCourse(courseId: string) {
  const supabase = await requireAdmin()

  const { error } = await supabase
    .from('courses')
    .update({ status: 'approved', is_published: true })
    .eq('id', courseId)

  if (error) return { error: error.message }
  revalidatePath('/admin/courses')
  return { success: true }
}

// ─── Kursni rad etish ─────────────────────────────────────────────────────────
export async function rejectCourse(courseId: string) {
  const supabase = await requireAdmin()

  const { error } = await supabase
    .from('courses')
    .update({ status: 'rejected', is_published: false })
    .eq('id', courseId)

  if (error) return { error: error.message }
  revalidatePath('/admin/courses')
  return { success: true }
}

// ─── Forum postini o'chirish ──────────────────────────────────────────────────
export async function deleteForumPost(postId: string) {
  const supabase = await requireAdmin()

  const { error } = await supabase.from('forum_posts').delete().eq('id', postId)

  if (error) return { error: error.message }
  revalidatePath('/admin/forum')
  return { success: true }
}

// ─── Forum postini spam belgilash ─────────────────────────────────────────────
export async function markPostAsSpam(postId: string) {
  const supabase = await requireAdmin()

  const { error } = await supabase
    .from('forum_posts')
    .update({ category: 'Spam' })
    .eq('id', postId)

  if (error) return { error: error.message }
  revalidatePath('/admin/forum')
  return { success: true }
}

// ─── Kunlik iqtibos qo'shish ─────────────────────────────────────────────────
export async function addDailyQuote(text: string, author: string) {
  const supabase = await requireAdmin()

  const { error } = await supabase
    .from('daily_quotes')
    .insert({ text, author, is_active: true })

  if (error) return { error: error.message }
  revalidatePath('/admin/motivation')
  return { success: true }
}

// ─── Iqtibosni o'chirish ──────────────────────────────────────────────────────
export async function deleteQuote(quoteId: string) {
  const supabase = await requireAdmin()

  const { error } = await supabase
    .from('daily_quotes')
    .delete()
    .eq('id', quoteId)

  if (error) return { error: error.message }
  revalidatePath('/admin/motivation')
  return { success: true }
}

// ─── Muvaffaqiyat hikoyasini o'chirish ────────────────────────────────────────
export async function deleteStory(storyId: string) {
  const supabase = await requireAdmin()

  const { error } = await supabase
    .from('success_stories')
    .delete()
    .eq('id', storyId)

  if (error) return { error: error.message }
  revalidatePath('/admin/motivation')
  return { success: true }
}

// ─── Muvaffaqiyat hikoyasini tasdiqlash ───────────────────────────────────────
export async function approveStory(storyId: string) {
  const supabase = await requireAdmin()

  const { error } = await supabase
    .from('success_stories')
    .update({ approved: true })
    .eq('id', storyId)

  if (error) return { error: error.message }
  revalidatePath('/admin/motivation')
  return { success: true }
}

// ─── Sayt sozlamalarini saqlash ───────────────────────────────────────────────
export async function saveSiteSettings(settings: Record<string, string>) {
  const supabase = await requireAdmin()

  const upserts = Object.entries(settings).map(([key, value]) => ({ key, value }))
  const { error } = await supabase
    .from('site_settings')
    .upsert(upserts, { onConflict: 'key' })

  if (error) return { error: error.message }
  revalidatePath('/admin/settings')
  return { success: true }
}
