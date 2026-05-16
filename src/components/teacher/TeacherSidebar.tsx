'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, BookOpen, ClipboardCheck, Users,
  Settings, HelpCircle, LogOut, GraduationCap, Menu, X, ChevronRight, Plus, Sun, Moon,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import NotificationBell from '@/components/shared/NotificationBell'
import { useTheme } from 'next-themes'

interface Props {
  userId: string
  fullName: string
  pendingCount?: number
  unreadNotifications?: number
}

const NAV = [
  { href: '/teacher',              label: 'Dashboard',               icon: LayoutDashboard, exact: true },
  { href: '/teacher/courses',      label: 'Kurslarim',               icon: BookOpen },
  { href: '/teacher/tasks/review', label: 'Topshiriqlar tekshirish', icon: ClipboardCheck, badgeKey: 'pending' },
  { href: '/teacher/students',     label: "O'quvchilarim",           icon: Users },
  { href: '/teacher/settings',     label: 'Sozlamalar',              icon: Settings },
  { href: '/teacher/help',         label: 'Yordam',                  icon: HelpCircle },
]

function NavItem({
  href, label, icon: Icon, badge, exact, onClick, isDark,
}: {
  href: string; label: string; icon: React.ElementType
  badge?: number; exact?: boolean; onClick?: () => void; isDark: boolean
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
            ? 'bg-emerald-600/80 text-white shadow-lg shadow-emerald-900/30'
            : 'bg-emerald-600 text-white shadow-lg shadow-emerald-200/50'
          : isDark
            ? 'text-white/50 hover:text-white hover:bg-white/5'
            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
      }`}
    >
      {active && (
        <motion.div
          layoutId="teacherNav"
          className={`absolute inset-0 rounded-xl -z-10 ${
            isDark ? 'bg-emerald-600/80' : 'bg-emerald-600'
          }`}
          transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
        />
      )}
      <Icon className="h-4 w-4 flex-shrink-0" />
      <span className="flex-1">{label}</span>
      {badge && badge > 0 ? (
        <span className="bg-amber-500 text-white text-xs font-bold h-5 min-w-5 px-1 rounded-full flex items-center justify-center">
          {badge > 99 ? '99+' : badge}
        </span>
      ) : active ? (
        <ChevronRight className="h-3.5 w-3.5 opacity-60" />
      ) : null}
    </Link>
  )
}

function SidebarInner({
  userId, fullName, pendingCount = 0, unreadNotifications = 0, onClose,
}: Props & { onClose?: () => void }) {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const isDark = theme === 'dark'

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const initials = fullName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className={`flex flex-col h-full select-none ${isDark ? '' : 'bg-white'}`}>
      {/* Logo + notification */}
      <div className={`flex items-center justify-between px-5 py-4 border-b ${
        isDark ? 'border-white/5' : 'border-slate-200'
      }`}>
        <Link href="/teacher" className="flex items-center gap-2.5" onClick={onClose}>
          <div className={`bg-gradient-to-br from-emerald-500 to-emerald-700 p-1.5 rounded-lg shadow-md ${
            isDark ? 'shadow-emerald-900/40' : ''
          }`}>
            <GraduationCap className="h-4 w-4 text-white" />
          </div>
          <div>
            <span className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>FreelancerSchool</span>
            <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
              isDark ? 'bg-emerald-900/60 text-emerald-300' : 'bg-emerald-100 text-emerald-700'
            }`}>
              O&apos;qituvchi
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className={`p-1.5 rounded-lg transition-all ${
              isDark
                ? 'text-white/40 hover:text-white hover:bg-white/10'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
            }`}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <NotificationBell userId={userId} initialUnread={unreadNotifications} variant="teacher" />
          {onClose && (
            <button onClick={onClose} className={`lg:hidden ml-1 ${
              isDark ? 'text-white/30 hover:text-white' : 'text-slate-400 hover:text-slate-600'
            }`}>
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Profil */}
      <div className={`mx-3 mt-4 rounded-2xl p-4 ${
        isDark
          ? 'bg-[rgba(16,185,129,0.07)] border border-[rgba(16,185,129,0.15)]'
          : 'bg-emerald-50 border border-emerald-100'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`bg-gradient-to-br from-emerald-500 to-emerald-700 h-10 w-10 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0 ${
            isDark ? 'shadow-lg' : 'shadow'
          }`}>
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className={`text-sm font-semibold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{fullName}</p>
            <p className={`text-xs ${isDark ? 'text-white/40' : 'text-slate-500'}`}>O&apos;qituvchi</p>
          </div>
        </div>
      </div>

      {/* Yangi kurs CTA */}
      <div className="px-3 mt-3">
        <Link
          href="/teacher/courses/new"
          onClick={onClose}
          className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90 ${
            isDark ? 'shadow-lg shadow-emerald-900/20' : 'shadow'
          }`}
          style={{ background: 'linear-gradient(135deg, rgba(5,150,105,0.9), rgba(4,120,87,0.9))' }}
        >
          <Plus className="h-4 w-4" />
          Yangi kurs yaratish
        </Link>
      </div>

      {/* Navigatsiya */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {NAV.map(item => (
          <NavItem
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            exact={item.exact}
            isDark={isDark}
            badge={item.badgeKey === 'pending' ? pendingCount : undefined}
            onClick={onClose}
          />
        ))}
      </nav>

      {/* Chiqish */}
      <div className={`p-3 border-t ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
        <button
          onClick={handleSignOut}
          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
            isDark
              ? 'text-white/40 hover:text-red-400 hover:bg-red-500/10'
              : 'text-slate-500 hover:text-red-600 hover:bg-red-50'
          }`}
        >
          <LogOut className="h-4 w-4" />
          Chiqish
        </button>
      </div>
    </div>
  )
}

export default function TeacherSidebar(props: Props) {
  const [open, setOpen] = useState(false)
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <>
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
        <Menu className={`h-4 w-4 ${isDark ? 'text-white' : 'text-slate-700'}`} />
      </button>

      <aside
        className="hidden lg:flex flex-col w-[240px] flex-shrink-0 h-screen border-r"
        style={{
          background: isDark ? 'rgba(7,10,20,0.7)' : '#ffffff',
          backdropFilter: 'blur(24px)',
          borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#e2e8f0',
          position: 'relative',
          zIndex: 20
        }}
      >
        <SidebarInner {...props} />
      </aside>

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
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'
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