'use client'

import Link from 'next/link'
import { ArrowLeft, Settings, Users, BookOpen, TrendingUp, ClipboardList } from 'lucide-react'
import { useMountedTheme } from '@/hooks/useTheme'
import ProfileHeader from '@/components/profile/ProfileHeader'
import StatsCards, { type ProfileStats } from '@/components/profile/StatsCards'
import ProgressChart from '@/components/profile/ProgressChart'

interface Props {
  userId: string
  profile: { full_name: string; email: string; role: string; bio: string | null; avatar_url: string | null } | null
  userEmail: string
  userMetaFullName: string
  createdAt: string
  stats: ProfileStats
  isTeacher: boolean
  teacherMock: { courses: number; students: number; pending: number; avgRating: number }
}

export default function ProfilePageClient({ userId, profile, userEmail, userMetaFullName, createdAt, stats, isTeacher, teacherMock }: Props) {
  const { isDark } = useMountedTheme()

  const navLink = `inline-flex items-center gap-2 text-sm transition-colors ${isDark ? 'text-white/40 hover:text-white/70' : 'text-gray-500 hover:text-gray-900'}`

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">

      <div className="flex items-center justify-between">
        <Link href="/" className={navLink}>
          <ArrowLeft className="h-4 w-4" />Bosh sahifa
        </Link>
        <Link href="/profile/settings"
          className={`inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl transition-all ${
            isDark
              ? 'text-white/50 hover:text-white border border-white/10 hover:border-white/20'
              : 'text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-gray-300 bg-white'
          }`}
          style={isDark ? { background: 'rgba(255,255,255,0.03)' } : {}}>
          <Settings className="h-4 w-4" />Sozlamalar
        </Link>
      </div>

      <ProfileHeader
        userId={userId}
        fullName={profile?.full_name ?? userMetaFullName}
        email={profile?.email ?? userEmail}
        role={profile?.role ?? 'student'}
        bio={profile?.bio ?? null}
        avatarUrl={profile?.avatar_url ?? null}
        createdAt={createdAt}
      />

      <StatsCards stats={stats} isTeacher={isTeacher} teacherStudents={teacherMock.students} teacherCourses={teacherMock.courses} />

      {isTeacher && (
        <div className="rounded-2xl p-6"
          style={isDark
            ? { background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)' }
            : { background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
          <h2 className={`font-semibold text-sm flex items-center gap-2 mb-5 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <BookOpen className="h-4 w-4 text-emerald-400" />O&apos;qituvchi paneli
          </h2>
          <div className="grid sm:grid-cols-4 gap-4 mb-5">
            {[
              { icon: BookOpen,      label: 'Kurslar',     value: teacherMock.courses,   color: 'text-emerald-400' },
              { icon: Users,         label: "O'quvchilar", value: teacherMock.students,  color: 'text-blue-400'    },
              { icon: ClipboardList, label: 'Kutmoqda',    value: teacherMock.pending,   color: 'text-amber-400'   },
              { icon: TrendingUp,    label: 'Reyting',     value: teacherMock.avgRating, color: 'text-purple-400'  },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className={`rounded-xl p-4 text-center ${isDark ? 'border border-white/7' : 'bg-white border border-gray-200'}`}
                style={isDark ? { background: 'rgba(255,255,255,0.04)' } : {}}>
                <Icon className={`h-4 w-4 ${color} mx-auto mb-1.5`} />
                <p className={`text-xl font-extrabold ${color}`}>{value}</p>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-white/35' : 'text-gray-500'}`}>{label}</p>
              </div>
            ))}
          </div>
          <Link href="/teacher">
            <button className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${
              isDark
                ? 'text-emerald-300 border border-emerald-500/25 hover:bg-emerald-500/10'
                : 'text-emerald-700 border border-emerald-300 hover:bg-emerald-50'
            }`}>
              O&apos;qituvchi paneliga o&apos;tish →
            </button>
          </Link>
        </div>
      )}

      <ProgressChart isTeacher={isTeacher} />

      <div className="grid sm:grid-cols-3 gap-3 pt-2">
        {[
          { href: '/forum',      label: "Forumga o'tish",        emoji: '💬' },
          { href: '/motivation', label: 'Motivatsiya markazi',   emoji: '🔥' },
          { href: '/platforms',  label: "Platformalar qo'llanma", emoji: '🚀' },
        ].map(({ href, label, emoji }) => (
          <Link key={href} href={href}>
            <div className={`flex items-center gap-3 px-4 py-3.5 rounded-xl cursor-pointer transition-colors ${
              isDark ? 'hover:bg-white/5' : 'bg-white border border-gray-200 hover:bg-gray-50'
            }`}
              style={isDark ? { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' } : {}}>
              <span className="text-lg">{emoji}</span>
              <span className={`text-sm transition-colors ${isDark ? 'text-white/60 hover:text-white/80' : 'text-gray-600 hover:text-gray-900'}`}>{label}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
