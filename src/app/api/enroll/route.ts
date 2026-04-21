import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { courseId } = body
    if (!courseId) return NextResponse.json({ error: 'courseId talab qilinadi' }, { status: 400 })

    // Allaqachon yozilganligini tekshirish
    const { data: existing } = await supabase
      .from('enrollments')
      .select('id')
      .eq('student_id', user.id)
      .eq('course_id', courseId)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Allaqachon yozilgansiz' }, { status: 409 })
    }

    // Kursga yozilish
    const { error: enrollError } = await supabase
      .from('enrollments')
      .insert({ student_id: user.id, course_id: courseId, progress: 0 })

    if (enrollError) {
      return NextResponse.json({ error: enrollError.message }, { status: 400 })
    }

    // Admin client bilan kurs va student ma'lumotlarini olish
    const admin = createAdminClient()
    const [{ data: course }, { data: studentProfile }] = await Promise.all([
      admin.from('courses').select('title, teacher_id').eq('id', courseId).single(),
      admin.from('users').select('full_name').eq('id', user.id).single(),
    ])

    // O'qituvchiga bildirishnoma (trigger orqali ham ishlaishi mumkin, bu backup)
    if (course?.teacher_id) {
      await admin.from('notifications').insert({
        user_id: course.teacher_id,
        type: 'new_enrollment',
        title: "Yangi o'quvchi yozildi 🎓",
        message: `${studentProfile?.full_name ?? "Yangi o'quvchi"} "${course.title}" kursiga yozildi`,
        link: `/teacher/students`,
        data: { courseId, studentId: user.id },
      }).then(() => {})
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 })
  }
}
