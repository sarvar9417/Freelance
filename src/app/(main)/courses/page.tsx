'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import CourseFilters, { type FilterState } from '@/components/courses/CourseFilters'
import CourseGrid, { type CourseItem } from '@/components/courses/CourseGrid'

const ALL_COURSES: CourseItem[] = [
  {
    id: '1', title: 'Freelancing asoslari', emoji: '🚀',
    description: "Freelancing dunyosiga kirish, platforma tanlash, birinchi buyurtma olish va mijozlar bilan ishlash sirlari.",
    instructor: 'Sarvar Usmonov', instructorAvatar: 'SU',
    category: 'Freelancing', level: "Boshlang'ich",
    color: 'from-blue-600 to-blue-800', duration: '6 soat',
    lessons: 12, students: 248, rating: 4.9,
    enrolled: true, progress: 65,
  },
  {
    id: '2', title: 'Grafik Dizayn (Figma)', emoji: '🎨',
    description: "Figma orqali professional UI/UX dizayn yaratish, component library va auto layout o'rganish.",
    instructor: 'Malika Yusupova', instructorAvatar: 'MY',
    category: 'Dizayn', level: "O'rta",
    color: 'from-purple-600 to-purple-800', duration: '14 soat',
    lessons: 18, students: 183, rating: 4.8,
    enrolled: true, progress: 30,
  },
  {
    id: '3', title: 'Copywriting Pro', emoji: '✍️',
    description: "Sotuvchi matnlar yozish, AIDA va PAS formulalar, landing page va email copywriting.",
    instructor: 'Bobur Aliyev', instructorAvatar: 'BA',
    category: 'Copywriting', level: "Boshlang'ich",
    color: 'from-emerald-600 to-emerald-800', duration: '5 soat',
    lessons: 10, students: 312, rating: 4.7,
    enrolled: false,
  },
  {
    id: '4', title: 'SMM Marketing', emoji: '📱',
    description: "Instagram, TikTok va Facebook uchun kontent strategiyasi, hashtag analiz va reklama.",
    instructor: 'Zulfiya Karimova', instructorAvatar: 'ZK',
    category: 'Marketing', level: "O'rta",
    color: 'from-rose-600 to-rose-800', duration: '8 soat',
    lessons: 14, students: 427, rating: 4.9,
    enrolled: false,
  },
  {
    id: '5', title: 'Web Dasturlash (HTML/CSS)', emoji: '💻',
    description: "HTML5, CSS3, Flexbox va Grid orqali zamonaviy veb-sahifalar yaratish asoslari.",
    instructor: 'Jasur Toshmatov', instructorAvatar: 'JT',
    category: 'Dasturlash', level: "Boshlang'ich",
    color: 'from-cyan-600 to-cyan-800', duration: '12 soat',
    lessons: 20, students: 391, rating: 4.8,
    enrolled: false,
  },
  {
    id: '6', title: 'JavaScript Asoslari', emoji: '⚡',
    description: "JavaScript ES6+, DOM manipulyatsiya, async/await va real loyihalar orqali o'rganish.",
    instructor: 'Jasur Toshmatov', instructorAvatar: 'JT',
    category: 'Dasturlash', level: "O'rta",
    color: 'from-yellow-600 to-orange-700', duration: '18 soat',
    lessons: 24, students: 267, rating: 4.7,
    enrolled: false,
  },
  {
    id: '7', title: 'Illyustrator & Brending', emoji: '🖌️',
    description: "Adobe Illustrator orqali logo, brending va vektor grafika yaratish.",
    instructor: 'Malika Yusupova', instructorAvatar: 'MY',
    category: 'Dizayn', level: 'Yuqori',
    color: 'from-fuchsia-600 to-pink-700', duration: '10 soat',
    lessons: 15, students: 142, rating: 4.6,
    enrolled: false,
  },
  {
    id: '8', title: 'Video Montaj (CapCut Pro)', emoji: '🎬',
    description: "CapCut va Premiere Pro orqali professional video montaj, effektlar va rang korreksiyasi.",
    instructor: 'Sherzod Nazarov', instructorAvatar: 'SN',
    category: 'Marketing', level: "Boshlang'ich",
    color: 'from-indigo-600 to-violet-700', duration: '7 soat',
    lessons: 11, students: 198, rating: 4.8,
    enrolled: false,
  },
]

export default function CoursesPage() {
  const [filters, setFilters] = useState<FilterState>({
    search: '', category: 'Barchasi', level: 'Barchasi',
  })

  const filtered = useMemo(() => {
    return ALL_COURSES.filter(c => {
      const matchSearch =
        c.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        c.instructor.toLowerCase().includes(filters.search.toLowerCase()) ||
        c.description.toLowerCase().includes(filters.search.toLowerCase())
      const matchCat = filters.category === 'Barchasi' || c.category === filters.category
      const matchLvl = filters.level === 'Barchasi' || c.level === filters.level
      return matchSearch && matchCat && matchLvl
    })
  }, [filters])

  const enrolled = ALL_COURSES.filter(c => c.enrolled)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }} className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-blue-300"
          style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)' }}>
          <Sparkles className="h-3.5 w-3.5" /> 24+ ta kurs — barchasi bepul
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
          O&apos;zingizni rivojlantiring,<br />
          <span className="text-blue-400">freelancer bo&apos;ling</span>
        </h1>
        <p className="text-white/50 text-sm max-w-xl mx-auto leading-relaxed">
          Har bir dars amaliy ko&apos;nikmaga yo&apos;naltirilgan. O&apos;rganing, bajaring, ishlang.
        </p>
      </motion.div>

      {/* Enrolled courses (if any) */}
      {enrolled.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-5">
            <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
            <h2 className="text-white font-semibold">Davom etayotgan kurslarim</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {enrolled.map((course, i) => (
              <motion.div key={course.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                className="flex items-center gap-4 p-4 rounded-2xl cursor-pointer group"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(59,130,246,0.2)' }}
                onClick={() => window.location.href = `/courses/${course.id}`}>
                <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${course.color} flex items-center justify-center text-2xl flex-shrink-0`}>
                  {course.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm truncate group-hover:text-blue-300 transition-colors">
                    {course.title}
                  </p>
                  <div className="mt-2">
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full"
                        style={{ width: `${course.progress}%` }} />
                    </div>
                    <p className="text-blue-400 text-xs font-semibold mt-1">{course.progress}% bajarildi</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* All courses */}
      <section className="space-y-6">
        <h2 className="text-white font-semibold text-lg">Barcha kurslar</h2>

        {/* Filters */}
        <div className="rounded-2xl p-5"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <CourseFilters filters={filters} onChange={setFilters} totalResults={filtered.length} />
        </div>

        {/* Grid */}
        <CourseGrid courses={filtered} />
      </section>
    </div>
  )
}
