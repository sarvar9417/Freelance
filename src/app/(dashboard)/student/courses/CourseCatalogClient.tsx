'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Search, Star, Users, BookOpen, CheckCircle2, ChevronDown } from 'lucide-react'

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

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`h-3 w-3 ${i <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-white/20'}`}
        />
      ))}
    </div>
  )
}

export default function CourseCatalogClient({ courses }: { courses: Course[] }) {
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
    return list
  }, [courses, search, category, level, sort])

  const enrolled = courses.filter(c => c.isEnrolled)

  return (
    <div className="space-y-6">
      {/* Enrolled summary */}
      {enrolled.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}>
          <BookOpen className="h-4 w-4 text-blue-400" />
          <p className="text-white/70 text-sm">
            Siz <span className="text-blue-400 font-semibold">{enrolled.length} ta</span> kursga yozilgansiz
          </p>
        </div>
      )}

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
          <input
            type="text"
            placeholder="Kurs yoki o'qituvchi qidirish..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-white/25 outline-none focus:ring-1 focus:ring-blue-500/50"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          />
        </div>
        <div className="relative">
          <select value={category} onChange={e => setCategory(e.target.value)}
            className="pl-3 pr-8 py-2.5 rounded-xl text-sm text-white outline-none appearance-none cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {CATEGORIES.map(c => <option key={c} value={c} className="bg-[#0d1220]">{c}</option>)}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30 pointer-events-none" />
        </div>
        <div className="relative">
          <select value={level} onChange={e => setLevel(e.target.value)}
            className="pl-3 pr-8 py-2.5 rounded-xl text-sm text-white outline-none appearance-none cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {LEVELS.map(l => <option key={l} value={l} className="bg-[#0d1220]">{l}</option>)}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30 pointer-events-none" />
        </div>
        <div className="relative">
          <select value={sort} onChange={e => setSort(e.target.value)}
            className="pl-3 pr-8 py-2.5 rounded-xl text-sm text-white outline-none appearance-none cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {SORTS.map(s => <option key={s.value} value={s.value} className="bg-[#0d1220]">{s.label}</option>)}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30 pointer-events-none" />
        </div>
      </div>

      <p className="text-white/30 text-sm">{filtered.length} ta kurs topildi</p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl p-12 text-center"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-white/40 text-sm">Kurs topilmadi</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((course, i) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="rounded-2xl overflow-hidden group"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              {/* Cover */}
              <div className="h-32 flex items-center justify-center text-5xl relative"
                style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.15))' }}>
                {course.image_url
                  ? <img src={course.image_url} alt={course.title} className="w-full h-full object-cover" />
                  : <span>{course.emoji ?? '📚'}</span>
                }
                {course.isEnrolled && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/80 text-white text-xs font-medium">
                    <CheckCircle2 className="h-3 w-3" /> Yozilgan
                  </div>
                )}
              </div>

              <div className="p-4 space-y-3">
                {/* Category + level */}
                <div className="flex items-center gap-2">
                  {course.category && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/20">
                      {course.category}
                    </span>
                  )}
                  {course.level && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-white/40">
                      {course.level}
                    </span>
                  )}
                </div>

                <h3 className="text-white text-sm font-semibold line-clamp-2 leading-snug">{course.title}</h3>

                {course.description && (
                  <p className="text-white/40 text-xs line-clamp-2">{course.description}</p>
                )}

                {/* Teacher */}
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-500/50 to-purple-500/50 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                    {course.teacherName[0]}
                  </div>
                  <span className="text-white/50 text-xs truncate">{course.teacherName}</span>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-3 text-xs text-white/40">
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {course.enrollCount}
                  </div>
                  {course.rating > 0 && (
                    <div className="flex items-center gap-1">
                      <StarRating rating={course.rating} />
                      <span className="text-amber-400">{course.rating}</span>
                    </div>
                  )}
                </div>

                <Link href={`/student/courses/${course.id}`}
                  className="block w-full py-2 rounded-xl text-sm font-medium text-center transition-all"
                  style={course.isEnrolled
                    ? { background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' }
                    : { background: 'rgba(59,130,246,0.15)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.3)' }
                  }>
                  {course.isEnrolled ? 'Davom etish' : 'Batafsil'}
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
