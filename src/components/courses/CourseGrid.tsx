'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Users, Clock, BookOpen, Star, ArrowRight, CheckCircle2 } from 'lucide-react'
import { METHODOLOGY_LABELS } from '@/types'
import type { Methodology } from '@/types'

export interface CourseItem {
  id: string
  title: string
  description: string
  instructor: string
  instructorAvatar: string
  category: string
  level: string
  emoji: string
  color: string
  duration: string
  lessons: number
  students: number
  rating: number
  enrolled?: boolean
  progress?: number
  methodologies?: string[]
}

interface Props {
  courses: CourseItem[]
  isDark?: boolean
}

const LEVEL_COLORS_DARK: Record<string, string> = {
  "Boshlang'ich": 'text-emerald-400 bg-emerald-400/10',
  "O'rta":        'text-amber-400 bg-amber-400/10',
  'Yuqori':       'text-red-400 bg-red-400/10',
}

const LEVEL_COLORS_LIGHT: Record<string, string> = {
  "Boshlang'ich": 'text-emerald-600 bg-emerald-50',
  "O'rta":        'text-amber-600 bg-amber-50',
  'Yuqori':       'text-red-600 bg-red-50',
}

export default function CourseGrid({ courses, isDark = true }: Props) {
  const levelColors = isDark ? LEVEL_COLORS_DARK : LEVEL_COLORS_LIGHT

  if (courses.length === 0) {
    return (
      <div className="text-center py-20 rounded-2xl"
        style={isDark ? { background: 'rgba(255,255,255,0.02)', border: '2px dashed rgba(255,255,255,0.07)' } : { background: '#f9fafb', border: '2px dashed #e5e7eb' }}>
        <BookOpen className={`h-10 w-10 mx-auto mb-3 ${isDark ? 'text-white/20' : 'text-gray-300'}`} />
        <p className={`font-medium ${isDark ? 'text-white/40' : 'text-gray-500'}`}>Kurs topilmadi</p>
        <p className={`text-sm mt-1 ${isDark ? 'text-white/20' : 'text-gray-400'}`}>Qidiruv yoki filtrni o&apos;zgartiring</p>
      </div>
    )
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {courses.map((course, i) => (
        <motion.div
          key={course.id}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.07 }}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className={`flex flex-col rounded-2xl overflow-hidden group ${isDark ? '' : 'bg-white border border-gray-200'}`}
          style={isDark ? { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' } : {}}
        >
          {/* Cover */}
          <div className={`relative h-36 bg-gradient-to-br ${course.color} flex items-center justify-center overflow-hidden`}>
            <div className="absolute inset-0 bg-black/20" />
            <span className="relative z-10 text-5xl">{course.emoji}</span>

            <div className="absolute top-3 left-3 flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full text-white"
                style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)' }}>
                {course.category}
              </span>
              {(course.methodologies ?? []).slice(0, 2).map(m => {
                const meta = METHODOLOGY_LABELS[m as Methodology]
                if (!meta) return null
                return (
                  <span key={m} className="text-xs font-semibold px-2 py-1 rounded-full"
                    style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)' }}>
                    {meta.icon} {meta.short}
                  </span>
                )
              })}
              {(course.methodologies?.length ?? 0) > 2 && (
                <span className="text-xs font-semibold px-2 py-1 rounded-full text-white/60"
                  style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)' }}>
                  +{(course.methodologies?.length ?? 0) - 2}
                </span>
              )}
            </div>

            <div className="absolute top-3 right-3">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${levelColors[course.level] ?? (isDark ? 'text-white/60 bg-white/10' : 'text-gray-600 bg-gray-100')}`}>
                {course.level}
              </span>
            </div>

            {course.enrolled && (
              <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-emerald-500/90 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                <CheckCircle2 className="h-3 w-3" /> Yozilgan
              </div>
            )}
          </div>

          {/* Body */}
          <div className="flex flex-col flex-1 p-5">
            <h3 className={`font-semibold text-sm leading-snug mb-1.5 transition-colors ${
              isDark ? 'text-white group-hover:text-blue-300' : 'text-gray-900 group-hover:text-blue-600'
            }`}>
              {course.title}
            </h3>
            <p className={`text-xs leading-relaxed mb-4 line-clamp-2 ${
              isDark ? 'text-white/40' : 'text-gray-500'
            }`}>{course.description}</p>

            {/* Instructor */}
            <div className="flex items-center gap-2 mb-4">
              <div className={`h-6 w-6 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 ${
                isDark ? 'from-blue-600 to-purple-600' : 'from-blue-500 to-purple-500'
              }`}>
                {course.instructorAvatar}
              </div>
              <span className={`text-xs ${isDark ? 'text-white/50' : 'text-gray-500'}`}>{course.instructor}</span>
            </div>

            {/* Progress (if enrolled) */}
            {course.enrolled && course.progress !== undefined && (
              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-500'}`}>Progress</span>
                  <span className={`text-xs font-semibold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{course.progress}%</span>
                </div>
                <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}>
                  <div className={`h-full bg-gradient-to-r rounded-full transition-all ${
                    isDark ? 'from-blue-600 to-blue-400' : 'from-blue-600 to-blue-500'
                  }`}
                    style={{ width: `${course.progress}%` }} />
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center gap-4 mb-5">
              <span className={`text-xs flex items-center gap-1 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                <BookOpen className="h-3 w-3" />{course.lessons} dars
              </span>
              <span className={`text-xs flex items-center gap-1 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                <Clock className="h-3 w-3" />{course.duration}
              </span>
              <span className={`text-xs flex items-center gap-1 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                <Users className="h-3 w-3" />{course.students.toLocaleString()}
              </span>
              <span className={`text-xs flex items-center gap-1 ${isDark ? 'text-amber-400' : 'text-amber-500'}`}>
                <Star className={`h-3 w-3 ${isDark ? 'fill-amber-400' : 'fill-amber-400'}`} />{course.rating}
              </span>
            </div>

            {/* CTA */}
            <div className="mt-auto">
              <Link href={`/courses/${course.id}`}>
                <button className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  course.enrolled
                    ? isDark
                      ? 'bg-white/6 hover:bg-white/10 text-white/70 hover:text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900'
                    : isDark
                      ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/30'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}>
                  {course.enrolled ? 'Davom etish' : "Kursga o'tish"}
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </Link>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
