import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BookOpen, Star, Zap, Flame, CheckCircle2, ClipboardCheck } from 'lucide-react'
import ProfileClient from './ProfileClient'

export default async function StudentProfilePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [
    { data: profile },
    { data: xpRow },
    { data: streakRow },
    { data: enrollments },
  ] = await Promise.all([
    supabase.from('users').select('id, full_name, email, bio, age, created_at').eq('id', user.id).single(),
    supabase.from('user_xp').select('total_xp, current_level').eq('user_id', user.id).single(),
    supabase.from('user_streaks').select('current_streak').eq('user_id', user.id).single(),
    supabase.from('enrollments').select('course_id, progress').eq('student_id', user.id),
  ])

  const courseIds = (enrollments ?? []).map(e => e.course_id)
  const taskIds: string[] = []
  if (courseIds.length > 0) {
    const { data: tasks } = await supabase.from('tasks').select('id').in('course_id', courseIds)
    taskIds.push(...(tasks ?? []).map(t => t.id))
  }
  const { data: submissions } = taskIds.length > 0
    ? await supabase.from('submissions').select('status, score').eq('student_id', user.id).in('task_id', taskIds)
    : { data: [] }

  const completedCourses = (enrollments ?? []).filter(e => e.progress >= 100).length
  const gradedSubs = (submissions ?? []).filter(s => s.status === 'graded' && s.score !== null)
  const avgScore = gradedSubs.length
    ? Math.round(gradedSubs.reduce((a, s) => a + (s.score ?? 0), 0) / gradedSubs.length)
    : 0

  const stats = [
    { label: "O'qigan kurslar", value: (enrollments ?? []).length, icon: BookOpen, color: 'text-blue-400' },
    { label: 'Tugatgan', value: completedCourses, icon: CheckCircle2, color: 'text-emerald-400' },
    { label: 'Topshiriqlar', value: (submissions ?? []).length, icon: ClipboardCheck, color: 'text-purple-400' },
    { label: "O'rt. baho", value: avgScore ? `${avgScore}` : '—', icon: Star, color: 'text-amber-400' },
  ]

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-white">Mening profilim</h1>

      {/* Avatar + info */}
      <div className="rounded-2xl p-6"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-start gap-5">
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-500/60 to-purple-600/60 flex items-center justify-center text-2xl font-bold text-white flex-shrink-0">
            {(profile?.full_name ?? 'U').split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-white text-lg font-bold">{profile?.full_name ?? "O'quvchi"}</h2>
            <p className="text-white/40 text-sm">{profile?.email}</p>
            {profile?.bio && <p className="text-white/50 text-sm mt-2 leading-relaxed">{profile.bio}</p>}
            <div className="flex flex-wrap items-center gap-3 mt-3">
              <div className="flex items-center gap-1.5 text-amber-400 text-sm">
                <Zap className="h-4 w-4" />
                <span className="font-semibold">{(xpRow?.total_xp ?? 0).toLocaleString()} XP</span>
                <span className="text-white/30 text-xs">· Level {xpRow?.current_level ?? 1}</span>
              </div>
              <div className="flex items-center gap-1.5 text-orange-400 text-sm">
                <Flame className="h-4 w-4" />
                <span className="font-semibold">{streakRow?.current_streak ?? 0}</span>
                <span className="text-white/30 text-xs">kun streak</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistika */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map(s => {
          const Icon = s.icon
          return (
            <div key={s.label} className="rounded-2xl p-4 text-center"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <Icon className={`h-5 w-5 ${s.color} mx-auto mb-1`} />
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-white/30 text-xs mt-0.5">{s.label}</p>
            </div>
          )
        })}
      </div>

      {/* Tahrirlash */}
      <ProfileClient
        initialData={{
          full_name: profile?.full_name ?? '',
          bio: profile?.bio ?? '',
          age: profile?.age ?? null,
        }}
        userId={user.id}
      />
    </div>
  )
}
