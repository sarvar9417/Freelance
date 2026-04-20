'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Users, BookOpen, MessageSquare,
  Sparkles, Settings, LogOut, Shield, Menu, X, ChevronRight,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

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
  href, label, icon: Icon, exact, onClick,
}: {
  href: string; label: string; icon: React.ElementType; exact?: boolean; onClick?: () => void
}) {
  const pathname = usePathname()
  const active = exact ? pathname === href : pathname.startsWith(href)

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
        active
          ? 'bg-purple-600/90 text-white shadow-lg shadow-purple-900/40'
          : 'text-white/50 hover:text-white hover:bg-white/5'
      }`}
    >
      {active && (
        <motion.div
          layoutId="adminNav"
          className="absolute inset-0 bg-purple-600/90 rounded-xl -z-10"
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
    <div className="flex flex-col h-full select-none">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="bg-gradient-to-br from-purple-500 to-purple-700 p-1.5 rounded-lg shadow-md shadow-purple-900/40">
            <Shield className="h-4 w-4 text-white" />
          </div>
          <div>
            <span className="font-bold text-white text-sm">FreelancerSchool</span>
            <span className="ml-2 text-xs bg-purple-900/60 text-purple-300 px-1.5 py-0.5 rounded-full">
              Admin
            </span>
          </div>
        </Link>
        {onClose && (
          <button onClick={onClose} className="text-white/30 hover:text-white lg:hidden">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Admin profil */}
      <div
        className="mx-3 mt-4 rounded-2xl p-4"
        style={{ background: 'rgba(139,92,246,0.07)', border: '1px solid rgba(139,92,246,0.15)' }}
      >
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-purple-500 to-purple-700 h-10 w-10 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0 shadow-lg shadow-purple-900/40">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white text-sm font-semibold truncate">{fullName}</p>
            <p className="text-white/40 text-xs truncate">{email}</p>
          </div>
        </div>
      </div>

      {/* Navigatsiya */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(item => (
          <NavItem key={item.href} {...item} onClick={onClose} />
        ))}
      </nav>

      {/* Chiqish */}
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

export default function AdminSidebar(props: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Mobil burger */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 h-10 w-10 rounded-xl flex items-center justify-center text-white shadow-lg"
        style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <Menu className="h-4 w-4" />
      </button>

      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex flex-col w-[240px] flex-shrink-0 h-screen border-r border-white/5"
        style={{ background: 'rgba(7,10,20,0.7)', backdropFilter: 'blur(24px)' }}
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
