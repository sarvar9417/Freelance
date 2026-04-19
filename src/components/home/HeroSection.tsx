'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, BadgeCheck, Users, Star, Zap, TrendingUp, Bell } from 'lucide-react'

const BADGES = [
  { icon: BadgeCheck, label: 'Sertifikat beriladi', color: 'text-emerald-400' },
  { icon: Users,      label: "12,000+ o'quvchi",   color: 'text-blue-400' },
  { icon: Star,       label: '4.9 reyting',         color: 'text-amber-400' },
]

const COURSES_MOCK = [
  { name: 'Copywriting',  pct: 78,  color: 'from-blue-500 to-blue-400' },
  { name: 'SMM Marketing',pct: 62,  color: 'from-purple-500 to-purple-400' },
  { name: 'Web Dizayn',   pct: 91,  color: 'from-emerald-500 to-emerald-400' },
]

function DashboardMockup() {
  return (
    <div className="relative w-full max-w-lg mx-auto">
      {/* Glow */}
      <div className="absolute inset-0 bg-blue-600/20 blur-3xl rounded-full scale-110" />

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 30, rotateY: -8 }}
        animate={{ opacity: 1, y: 0, rotateY: 0 }}
        transition={{ duration: 0.9, ease: 'easeOut', delay: 0.3 }}
        className="relative glass rounded-3xl p-6 shadow-2xl shadow-black/40 animate-float"
        style={{ perspective: '1000px' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-white/50 text-xs mb-0.5">Xush kelibsiz 👋</p>
            <p className="text-white font-semibold text-sm">Dilshod Nazarov</p>
          </div>
          <div className="bg-blue-500/20 border border-blue-400/30 rounded-xl px-3 py-1.5">
            <p className="text-blue-300 text-xs font-semibold">Top Rated ⭐</p>
          </div>
        </div>

        {/* Progress bars */}
        <p className="text-white/40 text-xs mb-3 font-medium uppercase tracking-wider">Kurslar jarayoni</p>
        <div className="space-y-3 mb-5">
          {COURSES_MOCK.map(({ name, pct, color }, i) => (
            <div key={name}>
              <div className="flex justify-between mb-1">
                <span className="text-white/70 text-xs">{name}</span>
                <span className="text-white/50 text-xs">{pct}%</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full bg-gradient-to-r ${color} rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 1.2, delay: 0.6 + i * 0.15, ease: 'easeOut' }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-dark rounded-2xl p-3 text-center">
            <p className="text-amber-400 font-bold text-lg">$2,400</p>
            <p className="text-white/40 text-xs mt-0.5">Bu oyda</p>
          </div>
          <div className="glass-dark rounded-2xl p-3 text-center">
            <p className="text-emerald-400 font-bold text-lg">47 ta</p>
            <p className="text-white/40 text-xs mt-0.5">Buyurtmalar</p>
          </div>
        </div>
      </motion.div>

      {/* Floating — notification */}
      <motion.div
        initial={{ opacity: 0, x: 30, scale: 0.8 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.9 }}
        className="absolute -top-5 -right-4 glass rounded-2xl px-4 py-3 shadow-xl shadow-black/30 animate-float2"
      >
        <div className="flex items-center gap-2.5">
          <div className="bg-emerald-500/20 rounded-full p-1.5">
            <Bell className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <div>
            <p className="text-white text-xs font-semibold">Yangi buyurtma!</p>
            <p className="text-white/50 text-xs">$150 · Logo dizayn</p>
          </div>
        </div>
      </motion.div>

      {/* Floating — earnings badge */}
      <motion.div
        initial={{ opacity: 0, x: -30, scale: 0.8 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ duration: 0.7, delay: 1.1 }}
        className="absolute -bottom-5 -left-4 glass rounded-2xl px-4 py-3 shadow-xl shadow-black/30 animate-float-delay"
      >
        <div className="flex items-center gap-2.5">
          <div className="bg-blue-500/20 rounded-full p-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-blue-400" />
          </div>
          <div>
            <p className="text-white text-xs font-semibold">+38% daromad</p>
            <p className="text-white/50 text-xs">O&apos;tgan oydan</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default function HeroSection() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center pt-20 pb-16 overflow-hidden"
    >
      {/* BG orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/5 w-[500px] h-[500px] bg-blue-700/15 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/5 w-96 h-96 bg-purple-700/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-2/3 left-1/2 w-64 h-64 bg-emerald-700/8 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '4s' }} />
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          {/* LEFT */}
          <div>
            {/* Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-wrap gap-2.5 mb-7"
            >
              {BADGES.map(({ icon: Icon, label, color }) => (
                <div
                  key={label}
                  className="flex items-center gap-1.5 glass rounded-full px-3 py-1.5"
                >
                  <Icon className={`h-3.5 w-3.5 ${color}`} />
                  <span className="text-white/80 text-xs font-medium">{label}</span>
                </div>
              ))}
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight mb-5"
            >
              <span className="text-white">O&apos;zbekistonda</span>{' '}
              <span className="gradient-text">Freelancer</span>{' '}
              <span className="text-white">bo&apos;ling va</span>{' '}
              <br className="hidden sm:block" />
              <span className="text-white">dunyoda pul </span>
              <span className="gradient-text">toping</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-white/60 leading-relaxed mb-8 max-w-lg"
            >
              Upwork, Fiverr platformalarida muvaffaqiyatga erishish uchun{' '}
              <span className="text-white font-semibold">BEPUL ko&apos;nikmalar</span>.
              Noldan professional darajagacha — hamma narsa shu yerda.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link href="/register">
                <button className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-200 shadow-xl shadow-blue-900/40 hover:shadow-blue-800/60 hover:scale-105 text-base w-full sm:w-auto">
                  <Zap className="h-4 w-4" />
                  Bepul boshlash
                </button>
              </Link>
              <Link href="/courses">
                <button className="flex items-center justify-center gap-2 glass hover:bg-white/10 text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-200 text-base w-full sm:w-auto">
                  Kurslarni ko&apos;rish
                  <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
            </motion.div>

            {/* Trust */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-wrap gap-x-6 gap-y-2 mt-8"
            >
              {["Ro'yxatdan o'tish bepul", "Kredit karta kerak emas", "Sertifikat beriladi"].map(t => (
                <span key={t} className="flex items-center gap-1.5 text-sm text-white/40">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
                  {t}
                </span>
              ))}
            </motion.div>
          </div>

          {/* RIGHT — mockup */}
          <div className="hidden lg:block">
            <DashboardMockup />
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0B0F19] to-transparent" />
    </section>
  )
}
