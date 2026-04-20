'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

// ─── Foydalanuvchi rolini o'zgartirish ───────────────────────────────────────
export async function changeUserRole(userId: string, role: 'student' | 'teacher' | 'admin') {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Ruxsat yo\'q' }

  const { data: admin } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (admin?.role !== 'admin') return { error: 'Faqat adminlar bu amalni bajarishi mumkin' }

  const adminClient = createAdminClient()
  const { error } = await adminClient
    .from('users')
    .update({ role })
    .eq('id', userId)

  if (error) return { error: error.message }
  revalidatePath('/admin/users')
  return { success: true }
}

// ─── Foydalanuvchini o'chirish ────────────────────────────────────────────────
export async function deleteUser(userId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Ruxsat yo\'q' }

  const { data: admin } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (admin?.role !== 'admin') return { error: 'Faqat adminlar bu amalni bajarishi mumkin' }

  const adminClient = createAdminClient()

  // Avval public.users dan, keyin auth.users dan o'chirish
  await adminClient.from('users').delete().eq('id', userId)
  const { error } = await adminClient.auth.admin.deleteUser(userId)

  if (error) return { error: error.message }
  revalidatePath('/admin/users')
  return { success: true }
}

// ─── Kursni tasdiqlash ────────────────────────────────────────────────────────
export async function approveCourse(courseId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Ruxsat yo\'q' }

  const adminClient = createAdminClient()
  const { error } = await adminClient
    .from('courses')
    .update({ status: 'approved' })
    .eq('id', courseId)

  if (error) return { error: error.message }
  revalidatePath('/admin/courses')
  return { success: true }
}

// ─── Kursni bekor qilish ──────────────────────────────────────────────────────
export async function rejectCourse(courseId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Ruxsat yo\'q' }

  const adminClient = createAdminClient()
  const { error } = await adminClient
    .from('courses')
    .update({ status: 'rejected' })
    .eq('id', courseId)

  if (error) return { error: error.message }
  revalidatePath('/admin/courses')
  return { success: true }
}

// ─── Forum postini o'chirish ──────────────────────────────────────────────────
export async function deleteForumPost(postId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Ruxsat yo\'q' }

  const { data: admin } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (admin?.role !== 'admin') return { error: 'Faqat adminlar bu amalni bajarishi mumkin' }

  const adminClient = createAdminClient()
  const { error } = await adminClient.from('forum_posts').delete().eq('id', postId)

  if (error) return { error: error.message }
  revalidatePath('/admin/forum')
  return { success: true }
}

// ─── Forum postini spam belgilash ─────────────────────────────────────────────
export async function markPostAsSpam(postId: string) {
  const adminClient = createAdminClient()
  const { error } = await adminClient
    .from('forum_posts')
    .update({ category: 'Spam' })
    .eq('id', postId)

  if (error) return { error: error.message }
  revalidatePath('/admin/forum')
  return { success: true }
}

// ─── Kunlik iqtibos qo'shish ─────────────────────────────────────────────────
export async function addDailyQuote(text: string, author: string) {
  const adminClient = createAdminClient()
  const { error } = await adminClient
    .from('daily_quotes')
    .insert({ text, author, is_active: true })

  if (error) return { error: error.message }
  revalidatePath('/admin/motivation')
  return { success: true }
}

// ─── Iqtibosni o'chirish ──────────────────────────────────────────────────────
export async function deleteQuote(quoteId: string) {
  const adminClient = createAdminClient()
  const { error } = await adminClient
    .from('daily_quotes')
    .delete()
    .eq('id', quoteId)

  if (error) return { error: error.message }
  revalidatePath('/admin/motivation')
  return { success: true }
}

// ─── Muvaffaqiyat hikoyasini tasdiqlash ───────────────────────────────────────
export async function approveStory(storyId: string) {
  const adminClient = createAdminClient()
  const { error } = await adminClient
    .from('success_stories')
    .update({ approved: true })
    .eq('id', storyId)

  if (error) return { error: error.message }
  revalidatePath('/admin/motivation')
  return { success: true }
}

// ─── Sayt sozlamalarini saqlash ───────────────────────────────────────────────
export async function saveSiteSettings(settings: Record<string, string>) {
  const adminClient = createAdminClient()

  const upserts = Object.entries(settings).map(([key, value]) => ({ key, value }))
  const { error } = await adminClient
    .from('site_settings')
    .upsert(upserts, { onConflict: 'key' })

  if (error) return { error: error.message }
  revalidatePath('/admin/settings')
  return { success: true }
}
