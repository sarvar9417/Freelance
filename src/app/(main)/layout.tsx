import Link from 'next/link'
import { GraduationCap, UserCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

const ROLE_DASHBOARD: Record<string, string> = {
  admin: '/admin',
  teacher: '/teacher',
  student: '/student',
}

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let dashboardHref = '/student'
  if (user) {
    const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
    dashboardHref = ROLE_DASHBOARD[profile?.role ?? 'student'] ?? '/student'
  }

  return (
    <div
      className="min-h-screen text-white"
      style={{ background: 'linear-gradient(160deg, #080c17 0%, #0d1220 60%, #0c0d1a 100%)' }}
    >
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-800/6 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-purple-800/5 rounded-full blur-3xl" />
      </div>

      {/* Navbar */}
      <header
        className="sticky top-0 z-40 border-b border-white/5"
        style={{ background: 'rgba(8,12,23,0.85)', backdropFilter: 'blur(20px)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-1.5 rounded-lg shadow-lg shadow-blue-900/40">
              <GraduationCap className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-white text-sm">
              Freelancer<span className="text-blue-400">School</span>
            </span>
          </Link>

          <nav className="hidden sm:flex items-center gap-6">
            <Link href="/courses" className="text-white/60 hover:text-white text-sm font-medium transition-colors">
              Kurslar
            </Link>
            <Link href="/forum" className="text-white/60 hover:text-white text-sm font-medium transition-colors">
              Forum
            </Link>
            <Link href="/motivation" className="text-white/60 hover:text-white text-sm font-medium transition-colors">
              Motivatsiya
            </Link>
            <Link href="/platforms" className="text-white/60 hover:text-white text-sm font-medium transition-colors">
              Platformalar
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Link href="/profile" className="flex items-center gap-1.5 text-white/50 hover:text-white text-sm font-medium transition-colors px-3 py-2 rounded-xl hover:bg-white/5">
                  <UserCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">Profil</span>
                </Link>
                <Link href={dashboardHref}>
                  <button className="text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl transition-all shadow-lg shadow-blue-900/30">
                    Panel
                  </button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm text-white/60 hover:text-white font-medium px-3 py-2 transition-colors">
                  Kirish
                </Link>
                <Link href="/register">
                  <button className="text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl transition-all shadow-lg shadow-blue-900/30">
                    Boshlash
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="relative z-10">{children}</main>
    </div>
  )
}
