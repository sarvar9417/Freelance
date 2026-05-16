'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Users, BookOpen, MessageSquare,
  Sparkles, Settings, LogOut, Shield, Menu, X, ChevronRight, Sun, Moon,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useTheme } from 'next-themes'

const NAV = [
  { href: '/admin',            label: 'Dashboard',       icon: LayoutDashboard, exact: true },
  { href: '/admin/users',      label: 'Foydalanuvchilar', icon: Users },
  { href: '/admin/courses',    label: 'Kurslar',          icon: BookOpen },
  { href: '/admin/forum',      label: 'Forum',            icon: MessageSquare },
  { href: '/admin/motivation', label: 'Motivatsiya',      icon: Sparkles },
  { href: '/admin/settings',   label: 'Sozlamalar',       icon: Settings },
]

interface Props {
  fullName: string
  email: string
}

function NavItem({
  href, label, icon: Icon, exact, onClick, isDark,
}: {
  href: string; label: string; icon: React.ElementType; exact?: boolean; onClick?: () => void; isDark: boolean
}) {
  const pathname = usePathname()
  const active = exact ? pathname === href : pathname.startsWith(href)

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
        active
          ? isDark
            ? 'bg-purple-600/90 text-white shadow-lg shadow-purple-900/40'
            : 'bg-purple-600 text-white shadow-md shadow-purple-200/50'
          : isDark
            ? 'text-white/50 hover:text-white hover:bg-white/5'
            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      {active && (
        <motion.div
          layoutId="adminNav"
          className={`absolute inset-0 rounded-xl -z-10 ${
            isDark ? 'bg-purple-600/90' : 'bg-purple-600'
          }`}
          transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
        />
      )}
      <Icon className="h-4 w-4 flex-shrink-0" />
      <span className="flex-1">{label}</span>
      {active && <ChevronRight className="h-3.5 w-3.5 opacity-60" />}
    </Link>
  )
}

function SidebarInner({ fullName, email, onClose }: Props & { onClose?: () => void }) {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const isDark = theme === 'dark'

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const initials = fullName
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className={`flex flex-col h-full select-none ${isDark ? '' : 'bg-white'}`}>
      {/* Logo */}
      <div className={`flex items-center justify-between px-5 py-4 border-b ${
        isDark ? 'border-white/5' : 'border-gray-200'
      }`}>
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className={`p-1.5 rounded-lg ${
            isDark
              ? 'bg-gradient-to-br from-purple-500 to-purple-700 shadow-md shadow-purple-900/40'
              : 'bg-gradient-to-br from-purple-500 to-purple-600 shadow-md shadow-purple-500/20'
          }`}>
            <Shield className="h-4 w-4 text-white" />
          </div>
          <div>
            <span className={`font-bold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>FreelancerSchool</span>
            <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
              isDark ? 'bg-purple-900/60 text-purple-300' : 'bg-purple-100 text-purple-700'
            }`}>
              Admin
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className={`p-1.5 rounded-lg transition-all ${
              isDark
                ? 'text-white/40 hover:text-white hover:bg-white/10'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
            }`}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          {onClose && (
            <button onClick={onClose} className={`lg:hidden ${
              isDark ? 'text-white/30 hover:text-white' : 'text-gray-400 hover:text-gray-600'
            }`}>
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Admin profil */}
      <div className={`mx-3 mt-4 rounded-2xl p-4 ${
        isDark
          ? 'bg-purple-500/5 border border-purple-500/10'
          : 'bg-purple-50 border border-purple-100'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-sm font-bold text-white ${
            isDark
              ? 'bg-gradient-to-br from-purple-500 to-purple-700 shadow-lg'
              : 'bg-gradient-to-br from-purple-500 to-purple-600 shadow'
          }`}>
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className={`text-sm font-semibold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{fullName}</p>
            <p className={`text-xs truncate ${isDark ? 'text-white/40' : 'text-gray-500'}`}>{email}</p>
          </div>
        </div>
      </div>

      {/* Navigatsiya */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(item => (
          <NavItem key={item.href} {...item} isDark={isDark} onClick={onClose} />
        ))}
      </nav>

      {/* Chiqish */}
      <div className={`p-3 border-t ${isDark ? 'border-white/5' : 'border-gray-200'}`}>
        <button
          onClick={handleSignOut}
          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
            isDark
              ? 'text-white/40 hover:text-red-400 hover:bg-red-500/10'
              : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
          }`}
        >
          <LogOut className="h-4 w-4" />
          Chiqish
        </button>
      </div>
    </div>
  )
}

export default function AdminSidebar(props: Props) {
  const [open, setOpen] = useState(false)
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <>
      {/* Mobil burger */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 h-10 w-10 rounded-xl flex items-center justify-center"
        style={{
          background: isDark ? 'rgba(255,255,255,0.05)' : 'white',
          backdropFilter: 'blur(16px)',
          border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}
      >
        <Menu className={`h-4 w-4 ${isDark ? 'text-white' : 'text-gray-700'}`} />
      </button>

      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex flex-col w-[240px] flex-shrink-0 h-screen border-r"
        style={{
          background: isDark ? 'rgba(7,10,20,0.7)' : '#ffffff',
          backdropFilter: 'blur(24px)',
          borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#e5e7eb'
        }}
      >
        <SidebarInner {...props} />
      </aside>

      {/* Mobil overlay */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.aside
              key="drawer"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 26, stiffness: 300 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-72 z-50 flex flex-col border-r"
              style={{
                background: isDark ? '#090d18' : '#ffffff',
                backdropFilter: 'blur(24px)',
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb'
              }}
            >
              <SidebarInner {...props} onClose={() => setOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}