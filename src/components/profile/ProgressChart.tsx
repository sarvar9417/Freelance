'use client'

import { motion } from 'framer-motion'
import { BookOpen, Award, CheckCircle2, Lock, Clock, Users, ClipboardList } from 'lucide-react'

const MOCK_COURSES = [
  {
    name: 'Freelancing asoslari',
    emoji: '🚀',
    progress: 78,
    completedLessons: 9,
    totalLessons: 12,
    color: 'from-blue-500 to-blue-700',
    barColor: 'bg-gradient-to-r from-blue-500 to-blue-400',
    status: 'active',
  },
  {
    name: 'Grafik Dizayn (Figma)',
    emoji: '🎨',
    progress: 100,
    completedLessons: 18,
    totalLessons: 18,
    color: 'from-purple-500 to-purple-700',
    barColor: 'bg-gradient-to-r from-purple-500 to-purple-400',
    status: 'completed',
  },
  {
    name: 'Copywriting Pro',
    emoji: '✍️',
    progress: 45,
    completedLessons: 5,
    totalLessons: 10,
    color: 'from-emerald-500 to-emerald-700',
    barColor: 'bg-gradient-to-r from-emerald-500 to-emerald-400',
    status: 'active',
  },
  {
    name: 'SMM va Kontent',
    emoji: '📱',
    progress: 0,
    completedLessons: 0,
    totalLessons: 15,
    color: 'from-pink-500 to-pink-700',
    barColor: 'bg-gradient-to-r from-pink-500 to-pink-400',
    status: 'locked',
  },
]

/* Haftalik faollik — so'nggi 7 kun (mock) */
const WEEKLY_ACTIVITY = [
  { day: 'Du', xp: 80,  active: true  },
  { day: 'Se', xp: 0,   active: false },
  { day: 'Ch', xp: 120, active: true  },
  { day: 'Pa', xp: 60,  active: true  },
  { day: 'Ju', xp: 200, active: true  },
  { day: 'Sh', xp: 40,  active: true  },
  { day: 'Ya', xp: 90,  active: true  },
]
const maxXP = Math.max(...WEEKLY_ACTIVITY.map(d => d.xp), 1)

const CERTS = MOCK_COURSES.filter(c => c.status === 'completed')

interface TeacherCourse {
  id: string
  title: string
  emoji: string
  students: number
  lessons: number
  avgProgress: number
}

const MOCK_TEACHER_COURSES: TeacherCourse[] = [
  { id: '1', title: 'Freelancing asoslari',  emoji: '🚀', students: 24, lessons: 12, avgProgress: 62 },
  { id: '2', title: 'Grafik Dizayn (Figma)', emoji: '🎨', students: 18, lessons: 18, avgProgress: 45 },
  { id: '3', title: 'Copywriting Pro',       emoji: '✍️', students: 31, lessons: 10, avgProgress: 78 },
]

interface Props {
  isTeacher: boolean
}

export default function ProgressChart({ isTeacher }: Props) {
  return (
    <div className="space-y-4">

      {/* ── Kurslar bo'yicha progress ── */}
      <div
        className="rounded-2xl p-6"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <h2 className="text-white font-semibold text-sm flex items-center gap-2 mb-5">
          <BookOpen className="h-4 w-4 text-blue-400" />
          {isTeacher ? "Yaratgan kurslar" : "Kurslar bo'yicha progress"}
        </h2>

        {isTeacher ? (
          <div className="space-y-3">
            {MOCK_TEACHER_COURSES.map((course, i) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex items-center gap-4 p-3.5 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <span className="text-2xl">{course.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-white/80 text-sm font-medium truncate">{course.title}</p>
                    <span className="text-emerald-400 text-xs font-bold flex-shrink-0 ml-2">
                      {course.avgProgress}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                      initial={{ width: 0 }} animate={{ width: `${course.avgProgress}%` }}
                      transition={{ duration: 0.9, delay: 0.2 + i * 0.1 }}
                    />
                  </div>
                  <div className="flex items-center gap-4 mt-1.5">
                    <span className="text-white/25 text-[10px] flex items-center gap-1">
                      <Users className="h-2.5 w-2.5" />{course.students} o&apos;quvchi
                    </span>
                    <span className="text-white/25 text-[10px] flex items-center gap-1">
                      <ClipboardList className="h-2.5 w-2.5" />{course.lessons} dars
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {MOCK_COURSES.map((course, i) => (
              <motion.div
                key={course.name}
                initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.09 }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-lg">{course.emoji}</span>
                  <span className="text-white/75 text-sm font-medium flex-1 truncate">{course.name}</span>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {course.status === 'completed' && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
                    {course.status === 'locked'    && <Lock className="h-3.5 w-3.5 text-white/20" />}
                    {course.status === 'active'    && <Clock className="h-3.5 w-3.5 text-blue-400" />}
                    <span className={`text-xs font-bold tabular-nums ${
                      course.progress === 100 ? 'text-emerald-400' :
                      course.progress === 0   ? 'text-white/20'    : 'text-blue-400'
                    }`}>
                      {course.progress}%
                    </span>
                  </div>
                </div>

                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                  <motion.div
                    className={`h-full rounded-full ${course.barColor}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${course.progress}%` }}
                    transition={{ duration: 1, delay: 0.15 + i * 0.1, ease: 'easeOut' }}
                  />
                </div>

                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-white/25 text-[10px]">
                    {course.completedLessons}/{course.totalLessons} dars
                  </span>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    course.status === 'completed' ? 'text-emerald-300 bg-emerald-500/10' :
                    course.status === 'locked'    ? 'text-white/20 bg-white/5'            :
                                                    'text-blue-300 bg-blue-500/10'
                  }`}>
                    {course.status === 'completed' ? 'Tugatildi' :
                     course.status === 'locked'    ? 'Qulflangan' : 'Jarayonda'}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* ── Haftalik faollik grafik ── */}
      {!isTeacher && (
        <div
          className="rounded-2xl p-6"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <h2 className="text-white font-semibold text-sm mb-5">
            📅 Haftalik faollik
          </h2>
          <div className="flex items-end gap-2 h-24">
            {WEEKLY_ACTIVITY.map((d, i) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="w-full relative flex items-end justify-center" style={{ height: '72px' }}>
                  <motion.div
                    className={`w-full rounded-t-lg ${d.active ? 'bg-gradient-to-t from-blue-600 to-blue-400' : 'bg-white/5'}`}
                    initial={{ height: 0 }}
                    animate={{ height: `${d.xp === 0 ? 4 : (d.xp / maxXP) * 100}%` }}
                    transition={{ duration: 0.6, delay: i * 0.06, ease: 'easeOut' }}
                    style={{ minHeight: '4px' }}
                  />
                  {d.active && d.xp > 0 && (
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-blue-300 text-[9px] font-bold whitespace-nowrap">
                      +{d.xp}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] font-medium ${d.active ? 'text-white/50' : 'text-white/15'}`}>
                  {d.day}
                </span>
              </div>
            ))}
          </div>
          <p className="text-white/20 text-xs mt-3 text-center">
            So&apos;nggi 7 kun · Jami {WEEKLY_ACTIVITY.reduce((s, d) => s + d.xp, 0)} XP
          </p>
        </div>
      )}

      {/* ── Sertifikatlar ── */}
      <div
        className="rounded-2xl p-6"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <h2 className="text-white font-semibold text-sm flex items-center gap-2 mb-4">
          <Award className="h-4 w-4 text-amber-400" />
          Sertifikatlar
          {CERTS.length > 0 && (
            <span className="text-amber-400 text-xs font-bold bg-amber-400/10 px-2 py-0.5 rounded-full">
              {CERTS.length} ta
            </span>
          )}
        </h2>

        {CERTS.length === 0 ? (
          <div
            className="text-center py-8 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.02)', border: '2px dashed rgba(255,255,255,0.06)' }}
          >
            <Award className="h-8 w-8 text-white/10 mx-auto mb-2" />
            <p className="text-white/25 text-sm">Hali sertifikat yo&apos;q</p>
            <p className="text-white/15 text-xs mt-1">Kursni 100% tugatib, sertifikat qo&apos;lga kiriting</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {CERTS.map((cert, i) => (
              <motion.div
                key={cert.name}
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-4 p-4 rounded-xl cursor-pointer hover:scale-[1.02] transition-transform"
                style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(245,158,11,0.05))', border: '1px solid rgba(245,158,11,0.2)' }}
              >
                <span className="text-2xl">{cert.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white/85 text-sm font-semibold truncate">{cert.name}</p>
                  <p className="text-amber-400/70 text-xs mt-0.5 flex items-center gap-1">
                    <Award className="h-3 w-3" /> Sertifikat olindi
                  </p>
                </div>
                <CheckCircle2 className="h-5 w-5 text-amber-400 flex-shrink-0" />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
