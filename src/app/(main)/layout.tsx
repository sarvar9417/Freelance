'use client'

import Link from 'next/link'
import { GraduationCap, UserCircle, Sun, Moon } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { useMountedTheme } from '@/hooks/useTheme'

const ROLE_DASHBOARD: Record<string, string> = {
  admin: '/admin',
  teacher: '/teacher',
  student: '/student',
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { isDark, setTheme, mounted } = useMountedTheme()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
  }, [])

  const dashboardHref = user ? '/student' : '/student'

  return (
    <div suppressHydrationWarning
      className={`min-h-screen ${isDark ? 'text-white' : 'text-gray-900'}`}
      style={{
        background: isDark
          ? 'linear-gradient(160deg, #080c17 0%, #0d1220 60%, #0c0d1a 100%)'
          : 'linear-gradient(160deg, #f9fafb 0%, #f5f5f4 50%, #f0f0ef 100%)'
      }}
    >
      {mounted && isDark && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-800/6 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-purple-800/5 rounded-full blur-3xl" />
        </div>
      )}

      {/* Navbar */}
      <header
        className={`sticky top-0 z-40 ${isDark ? 'border-white/5' : 'border-gray-200'}`}
        style={{
          background: isDark ? 'rgba(8,12,23,0.85)' : 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(20px)'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-lg ${
              isDark
                ? 'bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-900/40'
                : 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-md'
            }`}>
              <GraduationCap className="h-4 w-4 text-white" />
            </div>
            <span className={`font-bold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Freelancer<span className={isDark ? 'text-blue-400' : 'text-blue-600'}>School</span>
            </span>
          </Link>

          <nav className="hidden sm:flex items-center gap-6">
            <Link href="/courses" className={`text-sm font-medium transition-colors ${
              isDark ? 'text-white/60 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            }`}>
              Kurslar
            </Link>
            <Link href="/tasks" className={`text-sm font-medium transition-colors ${
              isDark ? 'text-white/60 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            }`}>
              Topshiriqlar
            </Link>
            <Link href="/forum" className={`text-sm font-medium transition-colors ${
              isDark ? 'text-white/60 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            }`}>
              Onlayn forum
            </Link>
            <Link href="/motivation" className={`text-sm font-medium transition-colors ${
              isDark ? 'text-white/60 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            }`}>
              Motivatsiyaini oshirish
            </Link>
            <Link href="/platforms" className={`text-sm font-medium transition-colors ${
              isDark ? 'text-white/60 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            }`}>
              Frilanserlik platformalari
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className={`p-2 rounded-xl transition-all ${
                isDark
                  ? 'text-white/40 hover:text-white hover:bg-white/5'
                  : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
              }`}
              aria-label="Mavzuni o'zgartirish"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            {user ? (
              <>
                <Link href="/profile" className={`flex items-center gap-1.5 text-sm font-medium transition-colors px-3 py-2 rounded-xl ${
                  isDark
                    ? 'text-white/50 hover:text-white hover:bg-white/5'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                }`}>
                  <UserCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">Profil</span>
                </Link>
                <Link href={dashboardHref}>
                  <button className={`text-sm font-semibold px-4 py-2 rounded-xl transition-all ${
                    isDark
                      ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/30'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}>
                    Panel
                  </button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className={`text-sm font-medium px-3 py-2 transition-colors ${
                  isDark ? 'text-white/60 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}>
                  Kirish
                </Link>
                <Link href="/register">
                  <button className={`text-sm font-semibold px-4 py-2 rounded-xl transition-all ${
                    isDark
                      ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/30'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}>
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
