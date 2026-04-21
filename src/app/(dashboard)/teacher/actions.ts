'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// ─── Yordamchi: joriy o'qituvchini tekshirish ────────────────────────────────
async function requireTeacher() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = profile?.role ?? 'student'
  if (role !== 'teacher' && role !== 'admin') redirect('/login')

  return { supabase, userId: user.id }
}

// ════════════════════════════════════════════════════════════════════
// KURSLAR
// ════════════════════════════════════════════════════════════════════

export async function createCourse(formData: {
  title: string
  description: string
  full_description: string
  category: string
  level: string
  emoji: string
  image_url: string
  preview_video_url: string
  is_published: boolean
}) {
  const { supabase, userId } = await requireTeacher()

  if (!formData.title.trim()) return { error: 'Kurs nomi kiritilishi shart' }
  if (!formData.description.trim()) return { error: 'Qisqa tavsif kiritilishi shart' }
  if (!formData.category) return { error: 'Kategoriya tanlanishi shart' }

  const { data: course, error } = await supabase
    .from('courses')
    .insert({
      title: formData.title.trim(),
      description: formData.description.trim(),
      full_description: formData.full_description.trim() || null,
      category: formData.category,
      level: formData.level || "Boshlang'ich",
      emoji: formData.emoji || '📚',
      image_url: formData.image_url.trim() || null,
      preview_video_url: formData.preview_video_url.trim() || null,
      teacher_id: userId,
      is_published: formData.is_published,
      status: 'pending',
    })
    .select('id')
    .single()

  if (error) return { error: error.message }
  revalidatePath('/teacher/courses')
  return { success: true, id: course.id }
}

export async function updateCourse(courseId: string, formData: {
  title: string
  description: string
  full_description: string
  category: string
  level: string
  emoji: string
  image_url: string
  preview_video_url: string
  is_published: boolean
}) {
  const { supabase, userId } = await requireTeacher()

  if (!formData.title.trim()) return { error: 'Kurs nomi kiritilishi shart' }
  if (!formData.description.trim()) return { error: 'Qisqa tavsif kiritilishi shart' }

  const { error } = await supabase
    .from('courses')
    .update({
      title: formData.title.trim(),
      description: formData.description.trim(),
      full_description: formData.full_description.trim() || null,
      category: formData.category,
      level: formData.level,
      emoji: formData.emoji || '📚',
      image_url: formData.image_url.trim() || null,
      preview_video_url: formData.preview_video_url.trim() || null,
      is_published: formData.is_published,
      updated_at: new Date().toISOString(),
    })
    .eq('id', courseId)
    .eq('teacher_id', userId)

  if (error) return { error: error.message }
  revalidatePath('/teacher/courses')
  revalidatePath(`/teacher/courses/${courseId}`)
  return { success: true }
}

export async function deleteCourse(courseId: string) {
  const { supabase, userId } = await requireTeacher()

  const { error } = await supabase
    .from('courses')
    .delete()
    .eq('id', courseId)
    .eq('teacher_id', userId)

  if (error) return { error: error.message }
  revalidatePath('/teacher/courses')
  return { success: true }
}

// ════════════════════════════════════════════════════════════════════
// DARSLAR
// ════════════════════════════════════════════════════════════════════

export async function createLesson(courseId: string, formData: {
  title: string
  order_num: number
  video_url: string
  content: string
}) {
  const { supabase, userId } = await requireTeacher()

  if (!formData.title.trim()) return { error: 'Dars nomi kiritilishi shart' }

  const { data: course } = await supabase
    .from('courses')
    .select('id')
    .eq('id', courseId)
    .eq('teacher_id', userId)
    .single()

  if (!course) return { error: "Kurs topilmadi yoki ruxsat yo'q" }

  const { error } = await supabase
    .from('lessons')
    .insert({
      course_id: courseId,
      title: formData.title.trim(),
      order_num: formData.order_num,
      video_url: formData.video_url.trim() || null,
      content: formData.content.trim() || null,
    })

  if (error) return { error: error.message }
  revalidatePath(`/teacher/courses/${courseId}/lessons`)
  return { success: true }
}

export async function updateLesson(lessonId: string, courseId: string, formData: {
  title: string
  order_num: number
  video_url: string
  content: string
}) {
  const { supabase, userId } = await requireTeacher()

  if (!formData.title.trim()) return { error: 'Dars nomi kiritilishi shart' }

  const { data: course } = await supabase
    .from('courses')
    .select('id')
    .eq('id', courseId)
    .eq('teacher_id', userId)
    .single()

  if (!course) return { error: "Ruxsat yo'q" }

  const { error } = await supabase
    .from('lessons')
    .update({
      title: formData.title.trim(),
      order_num: formData.order_num,
      video_url: formData.video_url.trim() || null,
      content: formData.content.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', lessonId)
    .eq('course_id', courseId)

  if (error) return { error: error.message }
  revalidatePath(`/teacher/courses/${courseId}/lessons`)
  return { success: true }
}

export async function deleteLesson(lessonId: string, courseId: string) {
  const { supabase, userId } = await requireTeacher()

  const { data: course } = await supabase
    .from('courses')
    .select('id')
    .eq('id', courseId)
    .eq('teacher_id', userId)
    .single()

  if (!course) return { error: "Ruxsat yo'q" }

  const { error } = await supabase
    .from('lessons')
    .delete()
    .eq('id', lessonId)
    .eq('course_id', courseId)

  if (error) return { error: error.message }
  revalidatePath(`/teacher/courses/${courseId}/lessons`)
  return { success: true }
}

// ════════════════════════════════════════════════════════════════════
// TOPSHIRIQLAR
// ════════════════════════════════════════════════════════════════════

export async function createTask(courseId: string, formData: {
  title: string
  lesson_id: string
  description: string
  deadline: string
  max_score: number
  allowed_formats: string[]
  task_file_urls?: string[]
}) {
  const { supabase, userId } = await requireTeacher()

  if (!formData.title.trim()) return { error: 'Topshiriq nomi kiritilishi shart' }
  if (!formData.description.trim()) return { error: 'Tavsif kiritilishi shart' }
  if (!formData.deadline) return { error: 'Deadline kiritilishi shart' }

  const { data: course } = await supabase
    .from('courses')
    .select('id')
    .eq('id', courseId)
    .eq('teacher_id', userId)
    .single()

  if (!course) return { error: "Ruxsat yo'q" }

  const { error } = await supabase
    .from('tasks')
    .insert({
      course_id: courseId,
      lesson_id: formData.lesson_id || null,
      title: formData.title.trim(),
      description: formData.description.trim(),
      deadline: formData.deadline,
      max_score: formData.max_score,
      allowed_formats: formData.allowed_formats,
      task_file_urls: formData.task_file_urls ?? [],
    })

  if (error) return { error: error.message }
  revalidatePath(`/teacher/courses/${courseId}/tasks`)
  return { success: true }
}

export async function updateTask(taskId: string, courseId: string, formData: {
  title: string
  lesson_id: string
  description: string
  deadline: string
  max_score: number
  allowed_formats: string[]
  task_file_urls?: string[]
}) {
  const { supabase, userId } = await requireTeacher()

  if (!formData.title.trim()) return { error: 'Topshiriq nomi kiritilishi shart' }

  const { data: course } = await supabase
    .from('courses')
    .select('id')
    .eq('id', courseId)
    .eq('teacher_id', userId)
    .single()

  if (!course) return { error: "Ruxsat yo'q" }

  const { error } = await supabase
    .from('tasks')
    .update({
      lesson_id: formData.lesson_id || null,
      title: formData.title.trim(),
      description: formData.description.trim(),
      deadline: formData.deadline,
      max_score: formData.max_score,
      allowed_formats: formData.allowed_formats,
      task_file_urls: formData.task_file_urls ?? [],
    })
    .eq('id', taskId)
    .eq('course_id', courseId)

  if (error) return { error: error.message }
  revalidatePath(`/teacher/courses/${courseId}/tasks`)
  return { success: true }
}

export async function deleteTask(taskId: string, courseId: string) {
  const { supabase, userId } = await requireTeacher()

  const { data: course } = await supabase
    .from('courses')
    .select('id')
    .eq('id', courseId)
    .eq('teacher_id', userId)
    .single()

  if (!course) return { error: "Ruxsat yo'q" }

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)
    .eq('course_id', courseId)

  if (error) return { error: error.message }
  revalidatePath(`/teacher/courses/${courseId}/tasks`)
  return { success: true }
}

// ════════════════════════════════════════════════════════════════════
// TOPSHIRILGAN ISHLARNI BAHOLASH
// ════════════════════════════════════════════════════════════════════

export async function reviewSubmission(submissionId: string, score: number, feedback: string) {
  const { supabase, userId } = await requireTeacher()

  if (!feedback.trim()) return { error: 'Izoh kiritilishi shart' }

  const { data: sub } = await supabase
    .from('submissions')
    .select('task_id, student_id, tasks(course_id, title, max_score, courses(teacher_id))')
    .eq('id', submissionId)
    .single()

  if (!sub) return { error: 'Topshiriq topilmadi' }

  const teacherId = (sub.tasks as any)?.courses?.teacher_id
  if (teacherId !== userId) return { error: "Ruxsat yo'q" }

  const maxScore = (sub.tasks as any)?.max_score ?? 100
  if (score < 0 || score > maxScore) {
    return { error: `Baho 0-${maxScore} oralig'ida bo'lishi kerak` }
  }

  const { error } = await supabase
    .from('submissions')
    .update({
      score,
      feedback: feedback.trim(),
      status: 'graded',
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', submissionId)

  if (error) return { error: error.message }

  // Bildirishnoma DB trigger (notify_submission_graded) orqali avtomatik yuboriladi.
  // Trigger ishlamagan taqdirda zaxira sifatida qo'lda yuborish:
  if (sub.student_id) {
    const admin = createAdminClient()
    const taskTitle = (sub.tasks as any)?.title ?? 'Topshiriq'
    await admin.from('notifications').upsert({
      user_id: sub.student_id,
      type: 'submission_graded',
      title: 'Topshiriq baholandi! ✅',
      message: `"${taskTitle}" topshirig'i baholandi — ${score} ball`,
      link: '/student/tasks',
      data: { submissionId, score, taskId: sub.task_id },
    }, { onConflict: 'user_id,type,link', ignoreDuplicates: true }).then(() => {})
  }

  revalidatePath('/teacher/tasks/review')
  revalidatePath('/teacher')
  return { success: true }
}

export async function requestResubmission(submissionId: string, feedback: string) {
  const { supabase, userId } = await requireTeacher()

  if (!feedback.trim()) return { error: 'Izoh kiritilishi shart' }

  const { data: sub } = await supabase
    .from('submissions')
    .select('task_id, student_id, tasks(course_id, title, courses(teacher_id))')
    .eq('id', submissionId)
    .single()

  if (!sub) return { error: 'Topshiriq topilmadi' }

  const teacherId = (sub.tasks as any)?.courses?.teacher_id
  if (teacherId !== userId) return { error: "Ruxsat yo'q" }

  const { error } = await supabase
    .from('submissions')
    .update({
      feedback: feedback.trim(),
      status: 'revision',
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', submissionId)

  if (error) return { error: error.message }

  // Bildirishnoma DB trigger (notify_submission_graded) orqali avtomatik yuboriladi.
  if (sub.student_id) {
    const admin = createAdminClient()
    const taskTitle = (sub.tasks as any)?.title ?? 'Topshiriq'
    await admin.from('notifications').upsert({
      user_id: sub.student_id,
      type: 'submission_revision',
      title: 'Qayta topshirish talab qilinadi 🔄',
      message: `"${taskTitle}" topshirig'ini qayta ko'rib chiqing`,
      link: '/student/tasks',
      data: { submissionId, taskId: sub.task_id },
    }, { onConflict: 'user_id,type,link', ignoreDuplicates: true }).then(() => {})
  }

  revalidatePath('/teacher/tasks/review')
  return { success: true }
}

// ════════════════════════════════════════════════════════════════════
// PROFIL
// ════════════════════════════════════════════════════════════════════

export async function updateTeacherProfile(formData: {
  full_name: string
  bio: string
  age: number | null
}) {
  const { supabase, userId } = await requireTeacher()

  if (!formData.full_name.trim()) return { error: 'Ism kiritilishi shart' }

  const { error } = await supabase
    .from('users')
    .update({
      full_name: formData.full_name.trim(),
      bio: formData.bio.trim() || null,
      age: formData.age,
    })
    .eq('id', userId)

  if (error) return { error: error.message }
  revalidatePath('/teacher')
  return { success: true }
}
