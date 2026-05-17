'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { GraduationCap, Menu, X, ArrowRight, Sun, Moon } from 'lucide-react'
import { useMountedTheme } from '@/hooks/useTheme'

const NAV_LINKS = [
  { href: '/courses',     label: 'Kurslar',      external: false },
  { href: '/forum',       label: 'Onlayn forum',         external: false },
  { href: '/motivation',  label: 'Motivatsiyani oshirish',   external: false },
  { href: '/platforms',   label: 'Frilanserlik platformalari',  external: false },
  { href: '#leaderboard', label: 'Topshiriqlar',   external: false },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { isDark, setTheme } = useMountedTheme()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isDark
          ? scrolled
            ? 'glass-dark shadow-2xl shadow-black/30'
            : 'bg-transparent'
          : scrolled
            ? 'bg-white/80 backdrop-blur-xl border-b border-gray-200 shadow-sm'
            : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className={`p-1.5 rounded-lg transition-transform group-hover:scale-105 ${
            isDark
              ? 'bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-900/40'
              : 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-md shadow-blue-500/20'
          }`}>
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <span className={`font-bold text-lg tracking-tight ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Freelancer<span className="text-blue-600">School</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm font-medium transition-colors duration-200 ${
                isDark
                  ? 'text-white/60 hover:text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className={`p-2 rounded-lg transition-all duration-200 ${
              isDark
                ? 'text-white/60 hover:text-white hover:bg-white/10'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
            }`}
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>
          <Link href="/login">
            <button className={`text-sm font-medium px-4 py-2 transition-colors ${
              isDark
                ? 'text-white/70 hover:text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}>
              Kirish
            </button>
          </Link>
          <Link href="/register">
            <button className="flex items-center gap-1.5 text-sm font-semibold bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-5 py-2 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5">
              Ro'yxatdan o'tish
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(!open)}
          className={`md:hidden p-2 rounded-lg transition-colors ${
            isDark
              ? 'text-white/70 hover:text-white'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`md:hidden border-t ${
              isDark
                ? 'glass-dark border-white/5'
                : 'bg-white border-gray-200'
            }`}
          >
            <div className="px-4 py-4 flex flex-col gap-3">
              {NAV_LINKS.map(l => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={`py-2 text-sm font-medium transition-colors ${
                    isDark
                      ? 'text-white/70 hover:text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {l.label}
                </Link>
              ))}
              <div className={`flex gap-3 pt-2 border-t ${
                isDark ? 'border-white/10' : 'border-gray-200'
              }`}>
                <button
                  onClick={() => setTheme(isDark ? "light" : "dark")}
                  className={`flex-1 p-2 rounded-xl transition-colors flex items-center justify-center gap-2 ${
                    isDark
                      ? 'text-white/70 border border-white/10 hover:bg-white/5'
                      : 'text-gray-600 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  <span className="text-sm">Theme</span>
                </button>
                <Link href="/login" className="flex-1">
                  <button className={`w-full text-sm border rounded-xl py-2.5 transition-colors ${
                    isDark
                      ? 'text-white/70 border border-white/10 hover:bg-white/5'
                      : 'text-gray-600 border border-gray-200 hover:bg-gray-100'
                  }`}>
                    Kirish
                  </button>
                </Link>
                <Link href="/register" className="flex-1">
                  <button className="w-full text-sm font-semibold bg-blue-600 text-white rounded-xl py-2.5 hover:bg-blue-500 transition-colors">
                    Ro'yxatdan o'tish
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}