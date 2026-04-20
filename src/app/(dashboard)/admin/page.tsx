import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import StatsOverview from '@/components/admin/StatsOverview'
import { Users, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default async function AdminDashboard() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/login')

  // Statistikalar
  const [
    { count: usersCount },
    { count: coursesCount },
    { count: postsCount },
    { data: recentUsers },
    { data: allUsers },
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('courses').select('*', { count: 'exact', head: true }),
    supabase.from('forum_posts').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('id, full_name, email, role, created_at').order('created_at', { ascending: false }).limit(5),
    supabase.from('users').select('created_at').order('created_at', { ascending: false }).limit(500),
  ])

  // Bugun faol (oxirgi 24 soat ichida ro'yxatdan o'tganlarni faol deb hisoblaymiz — real loyihada auth.sessions ishlatiladi)
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const activeToday = (allUsers ?? []).filter(u =>
    new Date(u.created_at) >= yesterday
  ).length

  // Oxirgi 7 kun ro'yxatdan o'tganlar grafigi
  const registrationChart = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const dateStr = d.toISOString().slice(0, 10)
    const count = (allUsers ?? []).filter(u => u.created_at?.slice(0, 10) === dateStr).length
    return { date: dateStr, count }
  })

  const ROLE_LABELS: Record<string, string> = {
    student: "O'quvchi",
    teacher: "O'qituvchi",
    admin: 'Admin',
  }

  const ROLE_COLORS: Record<string, string> = {
    student: 'text-blue-400',
    teacher: 'text-emerald-400',
    admin: 'text-purple-400',
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Sarlavha */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-white/40 text-sm mt-1">Saytning umumiy holati va statistikasi</p>
      </div>

      {/* Statistika kartalar + grafik */}
      <StatsOverview
        usersCount={usersCount ?? 0}
        coursesCount={coursesCount ?? 0}
        postsCount={postsCount ?? 0}
        activeToday={activeToday}
        registrationChart={registrationChart}
      />

      {/* Oxirgi ro'yxatdan o'tganlar */}
      <div
        className="rounded-2xl p-5"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-400" />
            <h2 className="text-white text-sm font-semibold">Yangi foydalanuvchilar</h2>
          </div>
          <Link
            href="/admin/users"
            className="flex items-center gap-1.5 text-xs text-white/40 hover:text-purple-400 transition-colors"
          >
            Barchasi
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="space-y-2">
          {(recentUsers ?? []).length === 0 ? (
            <p className="text-white/30 text-sm text-center py-6">Foydalanuvchilar yo&apos;q</p>
          ) : (
            (recentUsers ?? []).map((u) => {
              const initials = u.full_name?.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2) ?? '??'
              return (
                <div
                  key={u.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors hover:bg-white/[0.02]"
                >
                  <div className="bg-gradient-to-br from-purple-500/40 to-blue-600/40 h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{u.full_name}</p>
                    <p className="text-white/40 text-xs truncate">{u.email}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`text-xs font-medium ${ROLE_COLORS[u.role] ?? 'text-white/40'}`}>
                      {ROLE_LABELS[u.role] ?? u.role}
                    </span>
                    <span className="text-white/25 text-xs">
                      {new Date(u.created_at).toLocaleDateString('uz-UZ', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
