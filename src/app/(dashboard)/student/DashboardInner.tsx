'use client'

import { useMountedTheme } from '@/hooks/useTheme'
import {
  BookOpen, ClipboardCheck, Star, Flame, Zap,
  ArrowRight, Clock, CheckCircle2, TrendingUp,
} from 'lucide-react'
import DashboardClient from './DashboardClient'

interface Task {
  id: string
  title: string
  deadline: string | null
  course_id: string
  course?: { title: string; emoji: string }
}

interface Enrollment {
  course_id: string
  progress: number
  course?: { id: string; title: string; emoji: string; category: string }
}

interface Props {
  fullName: string
  totalXp: number
  currentLevel: number
  streak: number
  activeCourses: number
  completedCourses: number
  submittedCount: number
  avgScore: number
  pendingTasks: Task[]
  ongoingEnrollments: Enrollment[]
  xpInLevel: number
  xpPct: number
}

const QUOTES = [
  "Har bir katta yutuq kichik qadamlardan boshlanadi.",
  "Bugun o'rganganingiz — ertangi muvaffaqiyatingiz.",
  "Freelancer bo'lish — o'z kelajagingizni o'zingiz qurishdir.",
  "Bilim — sarmoya, lekin u hech qachon yo'qolmaydi.",
  "Har kun bir narsa o'rganing va yil oxirida 365 yangi narsa bilasiz.",
  "Qiyinchilik — rivojlanishning belgisi.",
  "Muvaffaqiyat — bu odatlarning mahsuli.",
]

const XP_PER_LEVEL = 1000

export default function DashboardInner({
  fullName, totalXp, currentLevel, streak,
  activeCourses, completedCourses, submittedCount, avgScore,
  pendingTasks, ongoingEnrollments, xpInLevel, xpPct,
}: Props) {
  const { isDark } = useMountedTheme()

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Xayrli tong' : hour < 18 ? 'Xayrli kun' : 'Xayrli kech'
  const quote = QUOTES[new Date().getDay() % QUOTES.length]

  const stats = [
    { label: "O'qiyotgan kurslar", value: activeCourses, icon: BookOpen, color: 'text-blue-400', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.15)' },
    { label: 'Tugatgan kurslar', value: completedCourses, icon: CheckCircle2, color: 'text-emerald-400', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.15)' },
    { label: 'Topshirilgan ishlar', value: submittedCount, icon: ClipboardCheck, color: 'text-purple-400', bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.15)' },
    { label: "O'rtacha baho", value: avgScore ? `${avgScore}/100` : '—', icon: Star, color: 'text-amber-400', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.15)' },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {greeting}, <span className={isDark ? 'text-blue-400' : 'text-blue-600'}>{fullName}!</span>
          </h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
            {new Date().toLocaleDateString('uz-UZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)' }}>
            <Flame className="h-4 w-4 text-orange-400" />
            <span className="text-orange-400 text-sm font-semibold">{streak} kun</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <Zap className="h-4 w-4 text-amber-400" />
            <span className="text-amber-400 text-sm font-semibold">{totalXp.toLocaleString()} XP</span>
          </div>
        </div>
      </div>

      {/* Motivatsion iqtibos */}
      <div className="rounded-2xl px-5 py-4"
        style={{ background: isDark ? 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(139,92,246,0.08))' : 'linear-gradient(135deg, #eff6ff, #f3e8ff)', border: isDark ? '1px solid rgba(99,102,241,0.15)' : '1px solid rgba(99,102,241,0.2)' }}>
        <p className={`text-sm italic ${isDark ? 'text-white/70' : 'text-gray-700'}`}>💡 &ldquo;{quote}&rdquo;</p>
      </div>

      {/* XP Progress */}
      <div className="rounded-2xl p-5"
        style={isDark ? { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' } : { background: 'white', border: '1px solid #e5e7eb' }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold text-white ${
              isDark ? 'bg-gradient-to-br from-amber-500 to-amber-600' : 'bg-gradient-to-br from-amber-400 to-amber-500'
            }`}>
              {currentLevel}
            </div>
            <div>
              <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Level {currentLevel}</p>
              <p className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-500'}`}>Keyingi levelga: {XP_PER_LEVEL - xpInLevel} XP</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-amber-400 font-bold">{xpInLevel.toLocaleString()}</p>
            <p className={`text-xs ${isDark ? 'text-white/30' : 'text-gray-400'}`}>/ {XP_PER_LEVEL.toLocaleString()} XP</p>
          </div>
        </div>
        <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}>
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full"
            style={{ width: `${xpPct}%` }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="rounded-2xl p-4"
            style={{ background: stat.bg, border: `1px solid ${stat.border}` }}>
            <div className={`${stat.color} mb-2`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stat.value}</p>
            <p className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-500'}`}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Current Progress Circle */}
      <div className="rounded-2xl p-6"
        style={isDark ? { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' } : { background: 'white', border: '1px solid #e5e7eb' }}>
        <h2 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Joriy progress</h2>
        <DashboardClient progress={ongoingEnrollments.length > 0 ? Math.round(ongoingEnrollments.reduce((a, e) => a + e.progress, 0) / ongoingEnrollments.length) : 0} />
      </div>

      {/* Ongoing Courses */}
      {ongoingEnrollments.length > 0 && (
        <div className="space-y-4">
          <h2 className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>Davom etayotgan kurslar</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ongoingEnrollments.map((enrollment) => (
              <div key={enrollment.course_id} className="rounded-2xl p-4 group cursor-pointer"
                style={isDark ? { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' } : { background: 'white', border: '1px solid #e5e7eb' }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-lg ${
                    isDark ? 'bg-gradient-to-br from-blue-600 to-blue-800' : 'bg-gradient-to-br from-blue-500 to-blue-600'
                  }`}>
                    {enrollment.course?.emoji || '📚'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`font-semibold text-sm truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {enrollment.course?.title || 'Kurs'}
                    </p>
                    <p className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                      {enrollment.course?.category}
                    </p>
                  </div>
                </div>
                <div className="mb-2">
                  <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}>
                    <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full" style={{ width: `${enrollment.progress}%` }} />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{enrollment.progress}%</span>
                  <ArrowRight className={`h-4 w-4 ${isDark ? 'text-white/30' : 'text-gray-400'} group-hover:text-blue-500 transition-colors`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending Tasks */}
      {pendingTasks.length > 0 && (
        <div className="space-y-4">
          <h2 className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>Kutilayotgan topshiriqlar</h2>
          <div className="space-y-3">
            {pendingTasks.map((task) => (
              <div key={task.id} className="flex items-center gap-4 p-4 rounded-xl"
                style={isDark ? { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' } : { background: 'white', border: '1px solid #e5e7eb' }}>
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                  isDark ? 'bg-orange-500/10 text-orange-400' : 'bg-orange-100 text-orange-600'
                }`}>
                  <Clock className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium text-sm truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{task.title}</p>
                  <p className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-500'}`}>{task.course?.title}</p>
                </div>
                {task.deadline && (
                  <span className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                    {new Date(task.deadline).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' })}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <a href="/student/courses" className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
          isDark ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}>
          <BookOpen className="h-4 w-4" /> Kurslar
        </a>
        <a href="/student/tasks" className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
          isDark ? 'bg-white/5 hover:bg-white/10 text-white border border-white/10' : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200'
        }`}>
          <ClipboardCheck className="h-4 w-4" /> Topshiriqlar
        </a>
        <a href="/student/leaderboard" className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
          isDark ? 'bg-white/5 hover:bg-white/10 text-white border border-white/10' : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200'
        }`}>
          <TrendingUp className="h-4 w-4" /> Reyting
        </a>
      </div>
    </div>
  )
}