'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { BookOpen, Clock, Play, CheckCircle } from 'lucide-react'

export interface CourseCardData {
  id: string
  title: string
  instructor: string
  category: string
  emoji: string
  progress: number
  totalLessons: number
  completedLessons: number
  lastLesson?: string
  duration?: string
  color: string
}

interface Props {
  course: CourseCardData
  index?: number
}

export default function CourseCard({ course, index = 0 }: Props) {
  const done = course.progress >= 100

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="flex flex-col rounded-2xl overflow-hidden group cursor-default"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      {/* Cover */}
      <div className={`relative h-28 bg-gradient-to-br ${course.color} flex items-center justify-center overflow-hidden`}>
        <div className="absolute inset-0 bg-black/20" />
        <span className="relative z-10 text-4xl">{course.emoji}</span>

        <div className="absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full text-white"
          style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}>
          {course.category}
        </div>

        {done && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-emerald-500/90 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
            <CheckCircle className="h-3 w-3" />
            Tugadi
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-5">
        <h3 className="text-white font-semibold text-sm leading-snug mb-1 group-hover:text-blue-300 transition-colors">
          {course.title}
        </h3>
        <p className="text-white/40 text-xs mb-4">{course.instructor}</p>

        {/* Progress */}
        <div className="mb-3">
          <div className="flex justify-between mb-1.5">
            <span className="text-white/50 text-xs flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              {course.completedLessons}/{course.totalLessons} dars
            </span>
            <span className={`text-xs font-semibold ${done ? 'text-emerald-400' : 'text-blue-400'}`}>
              {course.progress}%
            </span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${done
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                : 'bg-gradient-to-r from-blue-600 to-blue-400'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${course.progress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 + index * 0.08 }}
            />
          </div>
        </div>

        {/* Last lesson */}
        {course.lastLesson && (
          <p className="text-white/30 text-xs mb-4 flex items-center gap-1.5">
            <Clock className="h-3 w-3 flex-shrink-0" />
            Oxirgi: {course.lastLesson}
          </p>
        )}

        {/* CTA */}
        <div className="mt-auto">
          <Link href={`/student/courses/${course.id}`}>
            <button
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                done
                  ? 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/30 hover:shadow-blue-800/40'
              }`}
            >
              <Play className="h-3.5 w-3.5" />
              {done ? 'Qayta ko\'rish' : course.progress > 0 ? 'Davom etish' : 'Boshlash'}
            </button>
          </Link>
        </div>
      </div>
    </motion.div>
  )
}
