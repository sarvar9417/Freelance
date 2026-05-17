'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useMountedTheme } from '@/hooks/useTheme'
import { ArrowRight, BadgeCheck, Users, Star, Zap, TrendingUp, Bell } from 'lucide-react'

const BADGES = [
  { icon: BadgeCheck, label: 'Sertifikat beriladi', color: 'text-emerald-600', bgLight: 'bg-emerald-50 border-emerald-200', bgDark: 'bg-emerald-500/10 border-emerald-500/20' },
  { icon: Users,      label: "12,000+ o'quvchi",   color: 'text-blue-600', bgLight: 'bg-blue-50 border-blue-200', bgDark: 'bg-blue-500/10 border-blue-500/20' },
  { icon: Star,       label: '4.9 reyting',         color: 'text-amber-600', bgLight: 'bg-amber-50 border-amber-200', bgDark: 'bg-amber-500/10 border-amber-500/20' },
]

const COURSES_MOCK = [
  { name: 'Copywriting',  pct: 78,  color: 'from-blue-500 to-blue-400' },
  { name: 'SMM Marketing',pct: 62,  color: 'from-purple-500 to-purple-400' },
  { name: 'Web Dizayn',   pct: 91,  color: 'from-emerald-500 to-emerald-400' },
]

function DashboardMockup() {
  const { isDark } = useMountedTheme()

  return (
    <div className="relative w-full max-w-lg mx-auto">
      {/* Glow */}
      <div className={`absolute inset-0 ${
        isDark ? 'bg-blue-600/20 blur-3xl' : 'bg-blue-500/5 blur-3xl'
      } rounded-full scale-110`} />

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 30, rotateY: -8 }}
        animate={{ opacity: 1, y: 0, rotateY: 0 }}
        transition={{ duration: 0.9, ease: 'easeOut', delay: 0.3 }}
        className={`relative rounded-3xl p-6 animate-float ${
          isDark
            ? 'glass shadow-2xl shadow-black/40'
            : 'bg-white border border-gray-200 shadow-xl shadow-gray-200/40'
        }`}
        style={{ perspective: '1000px' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className={`text-xs mb-0.5 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>Xush kelibsiz 👋</p>
            <p className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>Dilshod Nazarov</p>
          </div>
          <div className={`rounded-xl px-3 py-1.5 ${
            isDark
              ? 'bg-blue-500/20 border border-blue-400/30'
              : 'bg-blue-50 border border-blue-100'
          }`}>
            <p className={`text-xs font-semibold ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>Top Rated ⭐</p>
          </div>
        </div>

        {/* Progress bars */}
        <p className={`text-xs mb-3 font-medium uppercase tracking-wider ${
          isDark ? 'text-white/40' : 'text-gray-500'
        }`}>Kurslar jarayoni</p>
        <div className="space-y-3 mb-5">
          {COURSES_MOCK.map(({ name, pct, color }, i) => (
            <div key={name}>
              <div className="flex justify-between mb-1">
                <span className={`text-xs ${isDark ? 'text-white/70' : 'text-gray-700'}`}>{name}</span>
                <span className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-500'}`}>{pct}%</span>
              </div>
              <div className={`h-1.5 rounded-full overflow-hidden ${
                isDark ? 'bg-white/10' : 'bg-gray-100'
              }`}>
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
          <div className={`rounded-2xl p-3 text-center ${
            isDark
              ? 'glass-dark'
              : 'bg-gray-50 border border-gray-100'
          }`}>
            <p className="text-amber-600 font-bold text-lg">$2,400</p>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>Bu oyda</p>
          </div>
          <div className={`rounded-2xl p-3 text-center ${
            isDark
              ? 'glass-dark'
              : 'bg-gray-50 border border-gray-100'
          }`}>
            <p className="text-emerald-600 font-bold text-lg">47 ta</p>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>Buyurtmalar</p>
          </div>
        </div>
      </motion.div>

      {/* Floating — notification */}
      <motion.div
        initial={{ opacity: 0, x: 30, scale: 0.8 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.9 }}
        className={`absolute -top-5 -right-4 rounded-2xl px-4 py-3 animate-float2 ${
          isDark
            ? 'glass shadow-xl shadow-black/30'
            : 'bg-white border border-gray-200 shadow-lg shadow-gray-200/50'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className={`rounded-full p-1.5 ${
            isDark ? 'bg-emerald-500/20' : 'bg-emerald-50'
          }`}>
            <Bell className="h-3.5 w-3.5 text-emerald-600" />
          </div>
          <div>
            <p className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Yangi buyurtma!</p>
            <p className={`text-xs ${isDark ? 'text-white/50' : 'text-gray-500'}`}>$150 · Logo dizayn</p>
          </div>
        </div>
      </motion.div>

      {/* Floating — earnings badge */}
      <motion.div
        initial={{ opacity: 0, x: -30, scale: 0.8 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ duration: 0.7, delay: 1.1 }}
        className={`absolute -bottom-5 -left-4 rounded-2xl px-4 py-3 animate-float-delay ${
          isDark
            ? 'glass shadow-xl shadow-black/30'
            : 'bg-white border border-gray-200 shadow-lg shadow-gray-200/50'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className={`rounded-full p-1.5 ${
            isDark ? 'bg-blue-500/20' : 'bg-blue-50'
          }`}>
            <TrendingUp className="h-3.5 w-3.5 text-blue-600" />
          </div>
          <div>
            <p className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>+38% daromad</p>
            <p className={`text-xs ${isDark ? 'text-white/50' : 'text-gray-500'}`}>O&apos;tgan oydan</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default function HeroSection() {
  const { isDark } = useMountedTheme()

  return (
    <section
      id="hero"
      className={`relative min-h-screen flex items-center pt-20 pb-16 overflow-hidden ${
        isDark ? '' : 'bg-gradient-to-b from-gray-50 to-white'
      }`}
    >
      {/* BG orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {isDark ? (
          <>
            <div className="absolute top-1/4 left-1/5 w-[500px] h-[500px] bg-blue-700/15 rounded-full blur-3xl animate-pulse-slow" />
            <div className="absolute bottom-1/4 right-1/5 w-96 h-96 bg-purple-700/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
            <div className="absolute top-2/3 left-1/2 w-64 h-64 bg-emerald-700/8 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '4s' }} />
            <div
              className="absolute inset-0 opacity-[0.025]"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)',
                backgroundSize: '60px 60px',
              }}
            />
          </>
        ) : (
          <>
            <div className="absolute top-20 left-1/4 w-[350px] h-[350px] bg-blue-500/[0.03] rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-1/4 w-[250px] h-[250px] bg-purple-500/[0.03] rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 w-[200px] h-[200px] bg-emerald-500/[0.02] rounded-full blur-3xl" />
          </>
        )}
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
              {BADGES.map(({ icon: Icon, label, color, bgLight, bgDark }) => (
                <div
                  key={label}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 border ${
                    isDark ? bgDark : bgLight
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${color}`} />
                  <span className={`text-xs font-medium ${
                    isDark ? 'text-white/80' : 'text-gray-700'
                  }`}>{label}</span>
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
              <span className={isDark ? 'text-white' : 'text-gray-900'}>O&apos;zbekistonda</span>{' '}
              <span className="gradient-text">Freelancer</span>{' '}
              <span className={isDark ? 'text-white' : 'text-gray-900'}>bo&apos;ling va</span>{' '}
              <br className="hidden sm:block" />
              <span className={isDark ? 'text-white' : 'text-gray-900'}>dunyoda pul </span>
              <span className="gradient-text">toping</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className={`text-lg leading-relaxed mb-8 max-w-lg ${
                isDark ? 'text-white/60' : 'text-gray-600'
              }`}
            >
              Upwork, Fiverr platformalarida muvaffaqiyatga erishish uchun{' '}
              <span className={isDark ? 'text-white font-semibold' : 'text-gray-900 font-semibold'}>BEPUL ko&apos;nikmalar</span>.
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
                <button className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-1 text-base w-full sm:w-auto">
                  <Zap className="h-4 w-4" />
                  Bepul boshlash
                </button>
              </Link>
              <Link href="/courses">
                <button className={`flex items-center justify-center gap-2 font-semibold px-8 py-4 rounded-2xl transition-all duration-200 text-base w-full sm:w-auto ${
                  isDark
                    ? 'glass hover:bg-white/10 text-white'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 shadow-sm'
                }`}>
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
                <span key={t} className={`flex items-center gap-1.5 text-sm ${
                  isDark ? 'text-white/40' : 'text-gray-500'
                }`}>
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
      <div className={`absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t ${
        isDark ? 'from-[#0B0F19] to-transparent' : 'from-gray-50 to-transparent'
      }`} />
    </section>
  )
}