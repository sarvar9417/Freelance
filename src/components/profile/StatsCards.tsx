'use client'

import { motion } from 'framer-motion'
import { BookOpen, ClipboardList, MessageSquare, Zap, Target, Flame, Star, Award } from 'lucide-react'

export interface ProfileStats {
  courses: number
  tasks: number
  avgGrade: number
  forumPosts: number
  completedGoals: number
  xp: number
  streak: number
}

interface Props {
  stats: ProfileStats
  isTeacher: boolean
  teacherStudents?: number
  teacherCourses?: number
}

function AnimatedNumber({ value }: { value: number }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {value.toLocaleString()}
    </motion.span>
  )
}

export default function StatsCards({ stats, isTeacher, teacherStudents = 0, teacherCourses = 0 }: Props) {
  const studentCards = [
    {
      icon: BookOpen,
      label: 'Tugatgan kurslar',
      value: stats.courses,
      suffix: 'ta',
      color: 'text-blue-400',
      bg: 'from-blue-600/15 to-blue-800/10',
      border: 'rgba(59,130,246,0.2)',
      glow: 'rgba(59,130,246,0.06)',
    },
    {
      icon: ClipboardList,
      label: 'Topshiriqlar',
      value: stats.tasks,
      suffix: 'ta',
      color: 'text-emerald-400',
      bg: 'from-emerald-600/15 to-emerald-800/10',
      border: 'rgba(16,185,129,0.2)',
      glow: 'rgba(16,185,129,0.06)',
    },
    {
      icon: Star,
      label: "O'rtacha baho",
      value: stats.avgGrade,
      suffix: '%',
      color: 'text-amber-400',
      bg: 'from-amber-600/15 to-amber-800/10',
      border: 'rgba(245,158,11,0.2)',
      glow: 'rgba(245,158,11,0.06)',
    },
    {
      icon: MessageSquare,
      label: 'Forum postlar',
      value: stats.forumPosts,
      suffix: 'ta',
      color: 'text-purple-400',
      bg: 'from-purple-600/15 to-purple-800/10',
      border: 'rgba(168,85,247,0.2)',
      glow: 'rgba(168,85,247,0.06)',
    },
    {
      icon: Target,
      label: "Bajarilgan maqsad",
      value: stats.completedGoals,
      suffix: 'ta',
      color: 'text-rose-400',
      bg: 'from-rose-600/15 to-rose-800/10',
      border: 'rgba(244,63,94,0.2)',
      glow: 'rgba(244,63,94,0.06)',
    },
    {
      icon: Zap,
      label: 'Jami XP',
      value: stats.xp,
      suffix: '',
      color: 'text-indigo-400',
      bg: 'from-indigo-600/15 to-indigo-800/10',
      border: 'rgba(99,102,241,0.2)',
      glow: 'rgba(99,102,241,0.06)',
    },
  ]

  const teacherCards = [
    {
      icon: BookOpen,
      label: 'Yaratgan kurslar',
      value: teacherCourses,
      suffix: 'ta',
      color: 'text-emerald-400',
      bg: 'from-emerald-600/15 to-emerald-800/10',
      border: 'rgba(16,185,129,0.2)',
      glow: 'rgba(16,185,129,0.06)',
    },
    {
      icon: Award,
      label: "O'quvchilar",
      value: teacherStudents,
      suffix: 'ta',
      color: 'text-blue-400',
      bg: 'from-blue-600/15 to-blue-800/10',
      border: 'rgba(59,130,246,0.2)',
      glow: 'rgba(59,130,246,0.06)',
    },
    {
      icon: Flame,
      label: 'Streak',
      value: stats.streak,
      suffix: ' kun',
      color: 'text-orange-400',
      bg: 'from-orange-600/15 to-orange-800/10',
      border: 'rgba(249,115,22,0.2)',
      glow: 'rgba(249,115,22,0.06)',
    },
    {
      icon: MessageSquare,
      label: 'Forum postlar',
      value: stats.forumPosts,
      suffix: 'ta',
      color: 'text-purple-400',
      bg: 'from-purple-600/15 to-purple-800/10',
      border: 'rgba(168,85,247,0.2)',
      glow: 'rgba(168,85,247,0.06)',
    },
  ]

  const cards = isTeacher ? teacherCards : studentCards

  return (
    <div className="space-y-3">
      <h2 className="text-white/50 text-xs font-semibold uppercase tracking-widest">Statistika</h2>
      <div className={`grid grid-cols-2 ${isTeacher ? 'sm:grid-cols-4' : 'sm:grid-cols-3 lg:grid-cols-6'} gap-3`}>
        {cards.map(({ icon: Icon, label, value, suffix, color, bg, border, glow }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.07, duration: 0.35 }}
            className={`rounded-2xl p-4 bg-gradient-to-br ${bg} flex flex-col gap-2`}
            style={{ border: `1px solid ${border}`, boxShadow: `0 0 20px ${glow}` }}
          >
            <div className="flex items-center justify-between">
              <Icon className={`h-4 w-4 ${color}`} />
            </div>
            <div>
              <p className={`text-xl sm:text-2xl font-extrabold ${color} tabular-nums leading-none`}>
                <AnimatedNumber value={value} />{suffix}
              </p>
              <p className="text-white/35 text-[10px] mt-1 leading-snug">{label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* XP + Streak — kichik banner */}
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="flex items-center gap-3 p-4 rounded-2xl"
        style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.08))', border: '1px solid rgba(99,102,241,0.2)' }}
      >
        <div className="flex items-center gap-3 flex-1">
          <div className="h-9 w-9 rounded-xl bg-indigo-500/20 flex items-center justify-center">
            <Zap className="h-5 w-5 text-indigo-400" />
          </div>
          <div>
            <p className="text-indigo-300 font-bold text-sm">{stats.xp.toLocaleString()} XP</p>
            <p className="text-white/30 text-xs">Jami tajriba ballari</p>
          </div>
        </div>
        <div className="h-8 w-px bg-white/8" />
        <div className="flex items-center gap-3 flex-1">
          <div className="h-9 w-9 rounded-xl bg-orange-500/20 flex items-center justify-center">
            <Flame className="h-5 w-5 text-orange-400" />
          </div>
          <div>
            <p className="text-orange-300 font-bold text-sm">{stats.streak} kun 🔥</p>
            <p className="text-white/30 text-xs">Ketma-ket faollik</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
