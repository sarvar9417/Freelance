'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { GraduationCap, Menu, X, ArrowRight } from 'lucide-react'

const NAV_LINKS = [
  { href: '/courses',     label: 'Kurslar',      external: false },
  { href: '/forum',       label: 'Forum',         external: false },
  { href: '/motivation',  label: 'Motivatsiya',   external: false },
  { href: '/platforms',   label: 'Platformalar',  external: false },
  { href: '#leaderboard', label: 'Leaderboard',   external: false },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

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
        scrolled ? 'glass-dark shadow-2xl shadow-black/30' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-1.5 rounded-lg shadow-lg shadow-blue-900/40 group-hover:scale-105 transition-transform">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-lg text-white tracking-tight">
            Freelancer<span className="text-blue-400">School</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-white/60 hover:text-white transition-colors duration-200 font-medium"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/login">
            <button className="text-sm text-white/70 hover:text-white transition-colors font-medium px-4 py-2">
              Kirish
            </button>
          </Link>
          <Link href="/register">
            <button className="flex items-center gap-1.5 text-sm font-semibold bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-5 py-2 rounded-xl transition-all duration-200 shadow-lg shadow-blue-900/40 hover:shadow-blue-800/50 hover:scale-105">
              Boshlash
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-white/70 hover:text-white p-2"
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
            className="md:hidden glass-dark border-t border-white/5"
          >
            <div className="px-4 py-4 flex flex-col gap-3">
              {NAV_LINKS.map(l => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="text-white/70 hover:text-white py-2 text-sm font-medium transition-colors"
                >
                  {l.label}
                </Link>
              ))}
              <div className="flex gap-3 pt-2 border-t border-white/10">
                <Link href="/login" className="flex-1">
                  <button className="w-full text-sm text-white/70 border border-white/10 rounded-xl py-2.5 hover:bg-white/5 transition-colors">
                    Kirish
                  </button>
                </Link>
                <Link href="/register" className="flex-1">
                  <button className="w-full text-sm font-semibold bg-blue-600 text-white rounded-xl py-2.5 hover:bg-blue-500 transition-colors">
                    Boshlash
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
