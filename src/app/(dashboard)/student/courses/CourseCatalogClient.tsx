'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Search, Star, Users, BookOpen, CheckCircle2, ChevronDown } from 'lucide-react'
import { useMountedTheme } from '@/hooks/useTheme'

interface Course {
  id: string
  title: string
  description: string | null
  category: string | null
  level: string | null
  emoji: string | null
  image_url: string | null
  teacher_id: string
  teacherName: string
  enrollCount: number
  rating: number
  reviewCount: number
  isEnrolled: boolean
  created_at: string
}

const CATEGORIES = ['Barchasi', 'Web Development', 'Graphic Design', 'Content Writing', 'SMM', 'Virtual Assistant', 'Dasturlash', 'Marketing', 'Boshqa']
const LEVELS = ['Barchasi', "Boshlang'ich", "O'rta", 'Yuqori']
const SORTS = [
  { value: 'newest', label: 'Yangi' },
  { value: 'popular', label: 'Ommabop' },
  { value: 'rating', label: 'Reyting' },
]

function StarRating({ rating, isDark }: { rating: number; isDark: boolean }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`h-3 w-3 ${i <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : isDark ? 'text-white/20' : 'text-gray-300'}`}
        />
      ))}
    </div>
  )
}

export default function CourseCatalogClient({ courses: initialCourses }: { courses: Course[] }) {
  const { isDark } = useMountedTheme()
  const [courses, setCourses] = useState(initialCourses)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Barchasi')
  const [level, setLevel] = useState('Barchasi')
  const [sort, setSort] = useState('newest')

  const filtered = useMemo(() => {
    let list = [...courses]
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        c.teacherName.toLowerCase().includes(q)
      )
    }
    if (category !== 'Barchasi') list = list.filter(c => c.category === category)
    if (level !== 'Barchasi') list = list.filter(c => c.level === level)

    if (sort === 'popular') list.sort((a, b) => b.enrollCount - a.enrollCount)
    else if (sort === 'rating') list.sort((a, b) => b.rating - a.rating)
    else list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    return list
  }, [courses, search, category, level, sort])

  const enrolled = courses.filter(c => c.isEnrolled)

  return (
    <div className="space-y-6">
      {/* Enrolled summary */}
      {enrolled.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{ background: isDark ? 'rgba(59,130,246,0.08)' : '#eff6ff', border: isDark ? '1px solid rgba(59,130,246,0.2)' : '1px solid #bfdbfe' }}>
          <BookOpen className="h-4 w-4 text-blue-500" />
          <p className={isDark ? 'text-white/70 text-sm' : 'text-gray-700 text-sm'}>
            Siz <span className="text-blue-500 font-semibold">{enrolled.length} ta</span> kursga yozilgansiz
          </p>
        </div>
      )}

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isDark ? 'text-white/30' : 'text-gray-400'}`} />
          <input
            type="text"
            placeholder="Kurs yoki o'qituvchi qidirish..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none focus:ring-1 focus:ring-blue-500/50 ${
              isDark ? 'text-white placeholder-white/25 bg-white/5 border border-white/10' : 'text-gray-900 placeholder-gray-400 bg-white border border-gray-200'
            }`}
          />
        </div>
        <div className="relative">
          <select value={category} onChange={e => setCategory(e.target.value)}
            className={`pl-3 pr-8 py-2.5 rounded-xl text-sm outline-none appearance-none cursor-pointer ${
              isDark ? 'text-white bg-white/5 border border-white/10' : 'text-gray-900 bg-white border border-gray-200'
            }`}>
            {CATEGORIES.map(c => <option key={c} value={c} className={isDark ? 'bg-[#0d1220]' : 'bg-white'}>{c}</option>)}
          </select>
          <ChevronDown className={`absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none ${isDark ? 'text-white/30' : 'text-gray-400'}`} />
        </div>
        <div className="relative">
          <select value={level} onChange={e => setLevel(e.target.value)}
            className={`pl-3 pr-8 py-2.5 rounded-xl text-sm outline-none appearance-none cursor-pointer ${
              isDark ? 'text-white bg-white/5 border border-white/10' : 'text-gray-900 bg-white border border-gray-200'
            }`}>
            {LEVELS.map(l => <option key={l} value={l} className={isDark ? 'bg-[#0d1220]' : 'bg-white'}>{l}</option>)}
          </select>
          <ChevronDown className={`absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none ${isDark ? 'text-white/30' : 'text-gray-400'}`} />
        </div>
        <div className="relative">
          <select value={sort} onChange={e => setSort(e.target.value)}
            className={`pl-3 pr-8 py-2.5 rounded-xl text-sm outline-none appearance-none cursor-pointer ${
              isDark ? 'text-white bg-white/5 border border-white/10' : 'text-gray-900 bg-white border border-gray-200'
            }`}>
            {SORTS.map(s => <option key={s.value} value={s.value} className={isDark ? 'bg-[#0d1220]' : 'bg-white'}>{s.label}</option>)}
          </select>
          <ChevronDown className={`absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none ${isDark ? 'text-white/30' : 'text-gray-400'}`} />
        </div>
      </div>

      <p className={isDark ? 'text-white/30 text-sm' : 'text-gray-500 text-sm'}>{filtered.length} ta kurs topildi</p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className={`rounded-2xl p-12 text-center ${
          isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'
        }`}>
          <p className="text-5xl mb-4">🔍</p>
          <p className={isDark ? 'text-white/40 text-sm' : 'text-gray-500 text-sm'}>Kurs topilmadi</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((course, i) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              whileHover={{ y: -4 }}
              className={`rounded-2xl overflow-hidden group ${
                isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'
              }`}
            >
              <Link href={`/student/courses/${course.id}`}>
                {/* Cover */}
                <div className={`h-32 flex items-center justify-center text-5xl relative ${
                  isDark ? 'bg-gradient-to-br from-blue-600 to-blue-800' : 'bg-gradient-to-br from-blue-500 to-blue-600'
                }`}>
                  {course.emoji || '📚'}
                  {course.isEnrolled && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-xs font-medium">
                      <CheckCircle2 className="h-3 w-3" /> Yozilgan
                    </div>
                  )}
                  <span className={`absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full ${
                    isDark ? 'bg-white/10 text-white/60' : 'bg-black/5 text-gray-600'
                  }`}>
                    {course.level || "Boshlang'ich"}
                  </span>
                </div>

                {/* Body */}
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <h3 className={`text-sm font-semibold line-clamp-2 leading-snug ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {course.title}
                    </h3>
                    {course.rating > 0 && <StarRating rating={course.rating} isDark={isDark} />}
                  </div>

                  <p className={isDark ? 'text-white/40 text-xs line-clamp-2' : 'text-gray-500 text-xs line-clamp-2'}>
                    {course.description || 'Kurs tavsifi mavjud emas'}
                  </p>

                  <div className="flex items-center gap-2">
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                      isDark ? 'bg-gradient-to-br from-blue-500 to-purple-500' : 'bg-gradient-to-br from-blue-400 to-purple-500'
                    }`}>
                      {course.teacherName.slice(0, 2).toUpperCase()}
                    </div>
                    <span className={isDark ? 'text-white/50 text-xs truncate' : 'text-gray-500 text-xs truncate'}>
                      {course.teacherName}
                    </span>
                  </div>

                  <div className={`flex items-center gap-3 text-xs ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />{course.enrollCount}
                    </span>
                    {course.rating > 0 && (
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-amber-400 fill-amber-400" />{course.rating}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}