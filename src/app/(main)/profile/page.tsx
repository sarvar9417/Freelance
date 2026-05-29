import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProfilePageClient from './ProfilePageClient'
import type { ProfileStats } from '@/components/profile/StatsCards'

export const metadata = { title: 'Profilim | Freelancer School' }

const TEACHER_MOCK = { courses: 3, students: 73, pending: 5, avgRating: 4.8 }

export default async function ProfilePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirectTo=/profile')

  const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single()

  const { count: forumCount } = await supabase
    .from('forum_posts').select('*', { count: 'exact', head: true }).eq('author_id', user.id)
  const { count: goalsCount } = await supabase
    .from('user_goals').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('completed', true)

  const isTeacher = profile?.role === 'teacher'

  const stats: ProfileStats = {
    courses: isTeacher ? TEACHER_MOCK.courses : 3,
    tasks: 12, avgGrade: 87,
    forumPosts: forumCount ?? 0,
    completedGoals: goalsCount ?? 0,
    xp: 1240, streak: 7,
  }

  return (
    <ProfilePageClient
      userId={user.id}
      profile={profile}
      userEmail={user.email ?? ''}
      userMetaFullName={user.user_metadata?.full_name ?? 'Foydalanuvchi'}
      createdAt={user.created_at}
      stats={stats}
      isTeacher={isTeacher}
      teacherMock={TEACHER_MOCK}
    />
  )
}
