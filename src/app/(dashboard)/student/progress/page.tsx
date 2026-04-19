'use client'

import { useRef } from 'react'
import { useInView } from 'framer-motion'
import { TrendingUp, BookOpen, Star, Award, Clock, CheckCircle2 } from 'lucide-react'

const COURSES = [
  {
    id: '1',
    title: 'Freelancing asoslari',
    emoji: '🚀',
    color: 'from-blue-600 to-blue-800',
    barColor: 'from-blue-500 to-blue-400',
    progress: 65,
    completedLessons: 8,
    totalLessons: 12,
    grade: 88,
    timeSpent: '3s 20d',
  },
  {
    id: '2',
    title: 'Grafik Dizayn (Figma)',
    emoji: '🎨',
    color: 'from-purple-600 to-purple-800',
    barColor: 'from-purple-500 to-purple-400',
    progress: 30,
    completedLessons: 5,
    totalLessons: 18,
    grade: null,
    timeSpent: '1s 45d',
  },
  {
    id: '3',
    title: 'Copywriting Pro',
    emoji: '✍️',
    color: 'from-emerald-600 to-emerald-800',
    barColor: 'from-emerald-500 to-emerald-400',
    progress: 90,
    completedLessons: 9,
    totalLessons: 10,
    grade: 92,
    timeSpent: '4s 10d',
  },
  {
    id: '4',
    title: 'SMM Marketing',
    emoji: '📱',
    color: 'from-rose-600 to-rose-800',
    barColor: 'from-rose-500 to-rose-400',
    progress: 100,
    completedLessons: 14,
    totalLessons: 14,
    grade: 95,
    timeSpent: '7s 30d',
  },
]

const WEEKLY_XP = [
  { day: 'Du', xp: 120 },
  { day: 'Se', xp: 85 },
  { day: 'Ch', xp: 200 },
  { day: 'Pa', xp: 60 },
  { day: 'Ju', xp: 175 },
  { day: 'Sh', xp: 95 },
  { day: 'Ya', xp: 140 },
]

const maxXP = Math.max(...WEEKLY_XP.map(d => d.xp))

const ACHIEVEMENTS = [
  { icon: '🏆', label: 'Birinchi kurs', desc: "Birinchi kursni tugatdingiz", earned: true },
  { icon: '🔥', label: '7 kunlik streak', desc: "7 kun ketma-ket o'qidingiz", earned: true },
  { icon: '⭐', label: "A'lo baho", desc: '95+ ball oldingiz', earned: true },
  { icon: '📚', label: '3 kurs', desc: "3 ta kursga yozilgansiz", earned: true },
  { icon: '💎', label: '1000 XP', desc: "1000 XP yig'dingiz", earned: true },
  { icon: '🎯', label: '10 topshiriq', desc: '10 ta topshiriq bajardingiz', earned: false },
  { icon: '🚀', label: "Tez o'quvchi", desc: '1 haftada kurs tugating', earned: false },
  { icon: '👑', label: 'Top 10', desc: 'Reyting top-10ga kiring', earned: false },
]

function AnimatedBar({ progress, barColor }: { progress: number; barColor: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })

  return (
    <div ref={ref} className="h-2 bg-white/10 rounded-full overflow-hidden">
      <div
        className={`h-full bg-gradient-to-r ${barColor} rounded-full transition-all duration-1000 ease-out`}
        style={{ width: inView ? `${progress}%` : '0%' }}
      />
    </div>
  )
}

function XPBarChart() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })

  return (
    <div ref={ref} className="flex items-end gap-2 h-32">
      {WEEKLY_XP.map(({ day, xp }, i) => {
        const heightPct = (xp / maxXP) * 100
        return (
          <div key={day} className="flex-1 flex flex-col items-center gap-1.5">
            <div className="w-full relative flex items-end" style={{ height: '100px' }}>
              <div
                className="w-full rounded-t-md bg-gradient-to-t from-blue-700 to-blue-400 transition-all ease-out"
                style={{
                  height: inView ? `${heightPct}%` : '0%',
                  transitionDuration: `${600 + i * 80}ms`,
                  transitionDelay: inView ? `${i * 60}ms` : '0ms',
                }}
              />
            </div>
            <span className="text-white/30 text-[10px]">{day}</span>
          </div>
        )
      })}
    </div>
  )
}

export default function ProgressPage() {
  const overallProgress = Math.round(
    COURSES.reduce((s, c) => s + c.progress, 0) / COURSES.length
  )
  const totalCompleted = COURSES.reduce((s, c) => s + c.completedLessons, 0)
  const totalLessons = COURSES.reduce((s, c) => s + c.totalLessons, 0)
  const avgGrade = Math.round(
    COURSES.filter(c => c.grade !== null).reduce((s, c) => s + (c.grade ?? 0), 0) /
    COURSES.filter(c => c.grade !== null).length
  )

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Mening progressim</h1>
        <p className="text-white/40 text-sm mt-1">O&apos;quv faoliyatingiz va natijalar</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: TrendingUp,   value: `${overallProgress}%`, label: 'Umumiy progress',  color: 'text-blue-400',    bg: 'bg-blue-500/10'    },
          { icon: BookOpen,     value: `${totalCompleted}/${totalLessons}`, label: 'Darslar',  color: 'text-purple-400',  bg: 'bg-purple-500/10'  },
          { icon: Star,         value: `${avgGrade}/100`,     label: "O'rtacha baho",   color: 'text-amber-400',   bg: 'bg-amber-500/10'   },
          { icon: CheckCircle2, value: '1',                   label: 'Tugatilgan kurs',  color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        ].map(({ icon: Icon, value, label, color, bg }) => (
          <div key={label} className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className={`inline-flex p-2.5 rounded-xl ${bg} mb-3`}>
              <Icon className={`h-4 w-4 ${color}`} />
            </div>
            <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
            <p className="text-white/50 text-xs mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Course progress list */}
        <div className="lg:col-span-2 rounded-2xl p-6 space-y-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-blue-400" />
            <h2 className="text-white font-semibold">Kurslar bo&apos;yicha progress</h2>
          </div>

          {COURSES.map(course => (
            <div key={course.id} className="space-y-2">
              <div className="flex items-center gap-3">
                <div className={`h-9 w-9 rounded-lg bg-gradient-to-br ${course.color} flex items-center justify-center text-base flex-shrink-0`}>
                  {course.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-white text-sm font-medium truncate">{course.title}</p>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      {course.progress === 100 && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      )}
                      <span className={`text-xs font-bold ${course.progress === 100 ? 'text-emerald-400' : 'text-blue-400'}`}>
                        {course.progress}%
                      </span>
                    </div>
                  </div>
                  <AnimatedBar progress={course.progress} barColor={course.barColor} />
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-white/30 text-xs">{course.completedLessons}/{course.totalLessons} dars</span>
                    <div className="flex items-center gap-2">
                      {course.grade !== null && (
                        <span className="text-amber-400 text-xs font-semibold">{course.grade} ball</span>
                      )}
                      <span className="text-white/20 text-xs flex items-center gap-0.5">
                        <Clock className="h-2.5 w-2.5" />
                        {course.timeSpent}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Weekly XP chart */}
        <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white font-semibold text-sm">Haftalik XP</p>
              <p className="text-white/30 text-xs mt-0.5">Oxirgi 7 kun</p>
            </div>
            <div className="text-right">
              <p className="text-purple-400 font-bold text-lg">875</p>
              <p className="text-white/30 text-xs">bu hafta</p>
            </div>
          </div>
          <XPBarChart />
          <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 gap-3">
            <div className="text-center p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <p className="text-blue-400 font-bold">140</p>
              <p className="text-white/30 text-xs">bugun</p>
            </div>
            <div className="text-center p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <p className="text-purple-400 font-bold">1,240</p>
              <p className="text-white/30 text-xs">jami XP</p>
            </div>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center gap-2 mb-5">
          <Award className="h-4 w-4 text-amber-400" />
          <h2 className="text-white font-semibold">Yutuqlar</h2>
          <span className="text-white/30 text-sm">({ACHIEVEMENTS.filter(a => a.earned).length}/{ACHIEVEMENTS.length})</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {ACHIEVEMENTS.map(({ icon, label, desc, earned }) => (
            <div
              key={label}
              className={`rounded-xl p-4 text-center transition-all ${earned ? '' : 'opacity-30 grayscale'}`}
              style={{
                background: earned ? 'rgba(251,191,36,0.06)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${earned ? 'rgba(251,191,36,0.2)' : 'rgba(255,255,255,0.05)'}`,
              }}
            >
              <div className="text-2xl mb-2">{icon}</div>
              <p className={`text-xs font-semibold ${earned ? 'text-amber-300' : 'text-white/40'}`}>{label}</p>
              <p className="text-white/30 text-[10px] mt-0.5 leading-tight">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
