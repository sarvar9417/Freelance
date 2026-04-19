import { redirect }    from 'next/navigation'
import Link            from 'next/link'
import { ArrowLeft, Settings, Users, BookOpen, TrendingUp, ClipboardList } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import ProfileHeader  from '@/components/profile/ProfileHeader'
import StatsCards, { type ProfileStats } from '@/components/profile/StatsCards'
import ProgressChart  from '@/components/profile/ProgressChart'

export const metadata = { title: 'Profilim | Freelancer School' }

/* O'qituvchi uchun qo'shimcha bo'lim */
const TEACHER_MOCK = {
  courses:  3,
  students: 73,
  pending:  5,
  avgRating: 4.8,
}

export default async function ProfilePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirectTo=/profile')

  /* Profil ma'lumotlari */
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  /* Forum postlar soni */
  const { count: forumCount } = await supabase
    .from('forum_posts')
    .select('*', { count: 'exact', head: true })
    .eq('author_id', user.id)

  /* Bajarilgan maqsadlar */
  const { count: goalsCount } = await supabase
    .from('user_goals')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('completed', true)

  const isTeacher = profile?.role === 'teacher'

  const stats: ProfileStats = {
    courses:        isTeacher ? TEACHER_MOCK.courses  : 3,
    tasks:          12,
    avgGrade:       87,
    forumPosts:     forumCount ?? 0,
    completedGoals: goalsCount ?? 0,
    xp:             1240,
    streak:         7,
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">

      {/* ── Navigatsiya ── */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 text-sm transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Bosh sahifa
        </Link>
        <Link
          href="/profile/settings"
          className="inline-flex items-center gap-2 text-sm font-medium text-white/50 hover:text-white border border-white/10 hover:border-white/20 px-4 py-2 rounded-xl transition-all"
          style={{ background: 'rgba(255,255,255,0.03)' }}
        >
          <Settings className="h-4 w-4" />
          Sozlamalar
        </Link>
      </div>

      {/* ── Profil header ── */}
      <ProfileHeader
        userId={user.id}
        fullName={profile?.full_name ?? user.user_metadata?.full_name ?? 'Foydalanuvchi'}
        email={profile?.email ?? user.email ?? ''}
        role={profile?.role ?? 'student'}
        bio={profile?.bio ?? null}
        avatarUrl={profile?.avatar_url ?? null}
        createdAt={user.created_at}
      />

      {/* ── Statistika ── */}
      <StatsCards
        stats={stats}
        isTeacher={isTeacher}
        teacherStudents={TEACHER_MOCK.students}
        teacherCourses={TEACHER_MOCK.courses}
      />

      {/* ── O'qituvchi uchun qo'shimcha panel ── */}
      {isTeacher && (
        <div
          className="rounded-2xl p-6"
          style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)' }}
        >
          <h2 className="text-white font-semibold text-sm flex items-center gap-2 mb-5">
            <BookOpen className="h-4 w-4 text-emerald-400" />
            O&apos;qituvchi paneli
          </h2>
          <div className="grid sm:grid-cols-4 gap-4 mb-5">
            {[
              { icon: BookOpen,      label: 'Kurslar',     value: TEACHER_MOCK.courses,   color: 'text-emerald-400' },
              { icon: Users,         label: "O'quvchilar", value: TEACHER_MOCK.students,  color: 'text-blue-400'    },
              { icon: ClipboardList, label: 'Kutmoqda',    value: TEACHER_MOCK.pending,   color: 'text-amber-400'   },
              { icon: TrendingUp,    label: 'Reyting',     value: TEACHER_MOCK.avgRating, color: 'text-purple-400'  },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="rounded-xl p-4 text-center"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <Icon className={`h-4 w-4 ${color} mx-auto mb-1.5`} />
                <p className={`text-xl font-extrabold ${color}`}>{value}</p>
                <p className="text-white/35 text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>
          <Link href="/teacher">
            <button className="w-full py-2.5 rounded-xl text-sm font-semibold text-emerald-300 border border-emerald-500/25 hover:bg-emerald-500/10 transition-all">
              O&apos;qituvchi paneliga o&apos;tish →
            </button>
          </Link>
        </div>
      )}

      {/* ── Progress va sertifikatlar ── */}
      <ProgressChart isTeacher={isTeacher} />

      {/* ── Pastki havolalar ── */}
      <div className="grid sm:grid-cols-3 gap-3 pt-2">
        {[
          { href: '/forum',      label: 'Forumga o\'tish',       emoji: '💬' },
          { href: '/motivation', label: 'Motivatsiya markazi',    emoji: '🔥' },
          { href: '/platforms',  label: 'Platformalar qo\'llanma', emoji: '🚀' },
        ].map(({ href, label, emoji }) => (
          <Link key={href} href={href}>
            <div
              className="flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <span className="text-lg">{emoji}</span>
              <span className="text-white/60 text-sm hover:text-white/80 transition-colors">{label}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
