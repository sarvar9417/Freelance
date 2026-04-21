'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, BookOpen, ClipboardList, BarChart2,
  MessageSquare, User, LogOut, GraduationCap, Menu, X,
  Zap, Flame, ChevronRight, Trophy, Library,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import NotificationBell from '@/components/shared/NotificationBell'

const NAV = [
  { href: '/student',             label: 'Dashboard',        icon: LayoutDashboard, exact: true },
  { href: '/student/courses',     label: 'Kurslar katalogi', icon: Library,         badge: null },
  { href: '/student/my-courses',  label: 'Mening kurslarim', icon: BookOpen,        badge: null },
  { href: '/student/tasks',       label: 'Topshiriqlarim',   icon: ClipboardList,   badge: null },
  { href: '/student/progress',    label: 'Progressim',       icon: BarChart2,       badge: null },
  { href: '/student/leaderboard', label: 'Reyting',          icon: Trophy,          badge: null },
  { href: '/student/forum',       label: 'Forum',            icon: MessageSquare,   badge: null },
  { href: '/student/profile',     label: 'Profil',           icon: User,            badge: null },
]

interface Props {
  userId: string
  fullName: string
  xp: number
  level?: number
  streak: number
  pendingTasks?: number
  unreadNotifications?: number
}

function NavItem({
  href, label, icon: Icon, badge, exact, onClick,
}: {
  href: string; label: string; icon: React.ElementType;
  badge?: number | null; exact?: boolean; onClick?: () => void
}) {
  const pathname = usePathname()
  const active = exact ? pathname === href : pathname.startsWith(href)

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
        active
          ? 'bg-blue-600/90 text-white shadow-lg shadow-blue-900/40'
          : 'text-white/50 hover:text-white hover:bg-white/5'
      }`}
    >
      {active && (
        <motion.div
          layoutId="activeNav"
          className="absolute inset-0 bg-blue-600/90 rounded-xl -z-10"
          transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
        />
      )}
      <Icon className="h-4 w-4 flex-shrink-0" />
      <span className="flex-1">{label}</span>
      {badge ? (
        <span className="bg-amber-500 text-white text-xs font-bold h-5 min-w-5 px-1 rounded-full flex items-center justify-center">
          {badge}
        </span>
      ) : active ? (
        <ChevronRight className="h-3.5 w-3.5 opacity-60" />
      ) : null}
    </Link>
  )
}

function SidebarInner({
  userId, fullName, xp, level = 1, streak, pendingTasks = 0, unreadNotifications = 0, onClose,
}: Props & { onClose?: () => void }) {
  const router = useRouter()

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

  const xpToNext = 2000
  const xpPct = Math.min((xp / xpToNext) * 100, 100)

  return (
    <div className="flex flex-col h-full select-none">
      {/* Logo + notification */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-1.5 rounded-lg shadow-md shadow-blue-900/40">
            <GraduationCap className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-white text-sm">FreelancerSchool</span>
        </Link>
        <div className="flex items-center gap-1">
          <NotificationBell userId={userId} initialUnread={unreadNotifications} variant="student" />
          {onClose && (
            <button onClick={onClose} className="text-white/30 hover:text-white lg:hidden ml-1">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* User card */}
      <div className="mx-3 mt-4 rounded-2xl p-4" style={{ background: 'rgba(59,130,246,0.07)', border: '1px solid rgba(59,130,246,0.15)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-gradient-to-br from-blue-500 to-blue-700 h-10 w-10 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0 shadow-lg shadow-blue-900/40">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white text-sm font-semibold truncate">{fullName}</p>
            <p className="text-white/40 text-xs">Level {level} · O&apos;quvchi</p>
          </div>
        </div>

        {/* XP bar */}
        <div className="mb-2">
          <div className="flex justify-between mb-1">
            <span className="text-white/40 text-xs flex items-center gap-1">
              <Zap className="h-3 w-3 text-amber-400" />
              {xp.toLocaleString()} XP
            </span>
            <span className="text-white/30 text-xs">{xpToNext.toLocaleString()}</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${xpPct}%` }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Flame className="h-3.5 w-3.5 text-orange-400" />
          <span className="text-orange-400 text-xs font-semibold">{streak} kunlik streak</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(item => (
          <NavItem
            key={item.href}
            {...item}
            badge={item.href === '/student/tasks' ? pendingTasks : item.badge}
            onClick={onClose}
          />
        ))}
      </nav>

      {/* Sign out */}
      <div className="p-3 border-t border-white/5">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-white/40 hover:text-red-400 hover:bg-red-500/10 text-sm font-medium transition-all duration-200"
        >
          <LogOut className="h-4 w-4" />
          Chiqish
        </button>
      </div>
    </div>
  )
}

export default function Sidebar(props: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Mobile burger */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 h-10 w-10 rounded-xl flex items-center justify-center text-white shadow-lg"
        style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <Menu className="h-4 w-4" />
      </button>

      {/* Desktop */}
      <aside
        className="hidden lg:flex flex-col w-[240px] flex-shrink-0 h-screen border-r border-white/5"
        style={{ background: 'rgba(7,10,20,0.7)', backdropFilter: 'blur(24px)' }}
      >
        <SidebarInner {...props} />
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/70 z-40 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.aside
              key="drawer"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 26, stiffness: 300 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-72 z-50 flex flex-col border-r border-white/10"
              style={{ background: '#090d18', backdropFilter: 'blur(24px)' }}
            >
              <SidebarInner {...props} onClose={() => setOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
