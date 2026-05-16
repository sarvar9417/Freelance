'use client'

import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'
import { Play, ClipboardList, MessageSquare, Sparkles, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const FEATURES = [
  {
    icon: Play,
    title: 'HD Video Darslar',
    desc: "Professional o'qituvchilar tomonidan tayyorlangan 200+ video dars. Istalgan vaqt, istalgan joydan ko'ring.",
    color: 'text-blue-600',
    glowLight: 'bg-blue-50 border-blue-200',
    glowDark: 'bg-blue-500/10 border-blue-500/20',
    badge: '200+ dars',
    badgeColorLight: 'bg-blue-100 text-blue-700',
    badgeColorDark: 'bg-blue-500/20 text-blue-300',
  },
  {
    icon: ClipboardList,
    title: 'Amaliy Topshiriqlar',
    desc: "Har darsdan so'ng real loyihalar bajarish orqali bilimingizni mustahkamlang va portfolio to'plang.",
    color: 'text-emerald-600',
    glowLight: 'bg-emerald-50 border-emerald-200',
    glowDark: 'bg-emerald-500/10 border-emerald-500/20',
    badge: 'XP topasiz',
    badgeColorLight: 'bg-emerald-100 text-emerald-700',
    badgeColorDark: 'bg-emerald-500/20 text-emerald-300',
  },
  {
    icon: MessageSquare,
    title: 'Jonli Forum',
    desc: "O'qituvchilar va 12,000+ hamkasb bilan savol-javob, tajriba almashish va hamkorlik imkoniyati.",
    color: 'text-purple-600',
    glowLight: 'bg-purple-50 border-purple-200',
    glowDark: 'bg-purple-500/10 border-purple-500/20',
    badge: 'Hamjamiyat',
    badgeColorLight: 'bg-purple-100 text-purple-700',
    badgeColorDark: 'bg-purple-500/20 text-purple-300',
  },
  {
    icon: Sparkles,
    title: 'Sertifikat',
    desc: "Har bir kursni tugatgach rasmiy sertifikat oling. Upwork va Fiverr profilingizga qo'shing.",
    color: 'text-amber-600',
    glowLight: 'bg-amber-50 border-amber-200',
    glowDark: 'bg-amber-500/10 border-amber-500/20',
    badge: 'Tan olingan',
    badgeColorLight: 'bg-amber-100 text-amber-700',
    badgeColorDark: 'bg-amber-500/20 text-amber-300',
  },
]

const POPULAR_COURSES = [
  { emoji: '🚀', name: "Freelancing asoslari", students: 3200, level: "Boshlang'ich", colorLight: 'from-blue-50 to-blue-100 border-blue-200', colorDark: 'from-blue-600/20 to-blue-800/20 border-blue-700/30' },
  { emoji: '🎨', name: 'Grafik Dizayn (Figma)', students: 2800, level: "O'rta", colorLight: 'from-purple-50 to-purple-100 border-purple-200', colorDark: 'from-purple-600/20 to-purple-800/20 border-purple-700/30' },
  { emoji: '📱', name: 'SMM va Kontent', students: 2100, level: "O'rta", colorLight: 'from-pink-50 to-pink-100 border-pink-200', colorDark: 'from-pink-600/20 to-pink-800/20 border-pink-700/30' },
  { emoji: '✍️', name: 'Copywriting Pro', students: 1900, level: "Ilg'or", colorLight: 'from-emerald-50 to-emerald-100 border-emerald-200', colorDark: 'from-emerald-600/20 to-emerald-800/20 border-emerald-700/30' },
  { emoji: '💻', name: 'Web Development', students: 1600, level: "O'rta", colorLight: 'from-amber-50 to-amber-100 border-amber-200', colorDark: 'from-amber-600/20 to-amber-800/20 border-amber-700/30' },
  { emoji: '🎬', name: 'Video Montaj', students: 1300, level: "Boshlang'ich", colorLight: 'from-red-50 to-red-100 border-red-200', colorDark: 'from-red-600/20 to-red-800/20 border-red-700/30' },
]

export default function Features() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <section id="features" className={`relative py-20 ${isDark ? '' : 'bg-gray-50/50'}`}>
      <div className={`absolute inset-0 pointer-events-none ${
        isDark ? 'bg-gradient-to-b from-transparent via-blue-950/5 to-transparent' : ''
      }`} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── WHY US ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className={`text-sm font-medium uppercase tracking-widest mb-2 ${
            isDark ? 'text-white/40' : 'text-gray-500'
          }`}>
            Nima beramiz?
          </p>
          <h2 className={`text-3xl sm:text-4xl font-bold mb-3 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Nega aynan{' '}
            <span className="gradient-text">FreelancerSchool?</span>
          </h2>
          <p className={`max-w-xl mx-auto ${
            isDark ? 'text-white/50' : 'text-gray-600'
          }`}>
            Faqat video emas — amaliy ko&apos;nikmalar, hamjamiyat, sertifikat va haqiqiy natija.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-20">
          {FEATURES.map(({ icon: Icon, title, desc, color, glowLight, glowDark, badge, badgeColorLight, badgeColorDark }, i) => (
            <Link
              key={title}
              href={title === 'Jonli Forum' ? '/forum' : title === 'HD Video Darslar' ? '/courses' : '#features'}
            >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className={`rounded-3xl p-6 group cursor-pointer transition-all ${
                isDark
                  ? 'glass hover:bg-white/5'
                  : 'bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300'
              }`}
            >
              <div className={`inline-flex p-3 rounded-2xl border mb-4 ${
                isDark ? glowDark : glowLight
              }`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <div className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full mb-3 ${
                isDark ? badgeColorDark : badgeColorLight
              }`}>
                {badge}
              </div>
              <h3 className={`font-semibold mb-2 group-hover:text-blue-600 transition-colors ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>{title}</h3>
              <p className={`text-sm leading-relaxed ${
                isDark ? 'text-white/50' : 'text-gray-600'
              }`}>{desc}</p>
            </motion.div>
            </Link>
          ))}
        </div>

        {/* ── POPULAR COURSES ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <p className={`text-sm font-medium uppercase tracking-widest mb-2 ${
            isDark ? 'text-white/40' : 'text-gray-500'
          }`}>Katalog</p>
          <h2 className={`text-3xl sm:text-4xl font-bold ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Ommabop{' '}
            <span className="gradient-text">kurslar</span>
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {POPULAR_COURSES.map(({ emoji, name, students, level, colorLight, colorDark }, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className={`group bg-gradient-to-br border rounded-2xl p-5 flex items-center gap-4 cursor-pointer ${
                isDark ? colorDark : colorLight
              }`}
            >
              <div className="text-3xl">{emoji}</div>
              <div className="flex-1 min-w-0">
                <p className={`font-semibold text-sm truncate group-hover:text-blue-600 transition-colors ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>{name}</p>
                <p className={`text-xs mt-0.5 ${
                  isDark ? 'text-white/40' : 'text-gray-500'
                }`}>{students.toLocaleString()} o&apos;quvchi · {level}</p>
              </div>
              <Link href="/courses">
                <button className={`h-8 w-8 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${
                  isDark
                    ? 'glass text-white/40 hover:text-white group-hover:bg-blue-500/30'
                    : 'bg-gray-100 text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                }`}>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}