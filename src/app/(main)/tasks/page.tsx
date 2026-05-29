'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  ClipboardList, Search, Filter, BookOpen, Clock,
  Zap, Star, Lightbulb, Globe, Home, School, FolderKanban, Puzzle
} from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useMountedTheme } from '@/hooks/useTheme'

interface Task {
  id: string
  title: string
  description: string | null
  deadline: string | null
  course_id: string
  difficulty_level: number
  order_index: number
  task_type: string
  course: { id: string; title: string; emoji: string | null } | null
}

const DIFFICULTY: Record<number, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  1: { label: 'Reproduktiv',        color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: <Zap className="h-3 w-3" /> },
  2: { label: 'Produktiv',          color: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/20',       icon: <Star className="h-3 w-3" /> },
  3: { label: 'Qisman-izlanishli',  color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20',     icon: <Lightbulb className="h-3 w-3" /> },
  4: { label: 'Kreativ',            color: 'text-purple-400',  bg: 'bg-purple-500/10 border-purple-500/20',   icon: <Star className="h-3 w-3" /> },
}

const TASK_TYPE_META: Record<string, { label: string; icon: React.ReactNode }> = {
  standard:          { label: 'Standart',          icon: <ClipboardList className="h-3 w-3" /> },
  web_kvest:         { label: 'Web-kvest',          icon: <Globe className="h-3 w-3" /> },
  flipped_homework:  { label: "Teskari o'rganish",  icon: <Home className="h-3 w-3" /> },
  flipped_inclass:   { label: 'Sinf ishi',          icon: <School className="h-3 w-3" /> },
  pbl_project:       { label: 'Loyiha',             icon: <FolderKanban className="h-3 w-3" /> },
  muammoli_problem:  { label: "Muammoli topshiriq", icon: <Puzzle className="h-3 w-3" /> },
}

export default function TasksPage() {
  const { isDark } = useMountedTheme()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterDifficulty, setFilterDifficulty] = useState<number | 'all'>('all')
  const [filterCourse, setFilterCourse] = useState<string>('all')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: tasksData } = await supabase
        .from('tasks')
        .select('id, title, description, deadline, course_id, difficulty_level, order_index, task_type')
        .order('difficulty_level', { ascending: true })
        .order('order_index', { ascending: true })

      if (!tasksData || tasksData.length === 0) {
        setLoading(false)
        return
      }

      const courseIds = Array.from(new Set(tasksData.map(t => t.course_id)))
      const { data: courses } = await supabase
        .from('courses')
        .select('id, title, emoji')
        .in('id', courseIds)

      const courseMap = Object.fromEntries((courses ?? []).map(c => [c.id, c]))

      setTasks(
        tasksData.map(t => ({
          ...t,
          difficulty_level: t.difficulty_level ?? 1,
          order_index: t.order_index ?? 0,
          task_type: t.task_type ?? 'standard',
          course: courseMap[t.course_id] ?? null,
        }))
      )
      setLoading(false)
    }
    load()
  }, [])

  const courses = useMemo(() => {
    const seen = new Map<string, { id: string; title: string; emoji: string | null }>()
    tasks.forEach(t => {
      if (t.course && !seen.has(t.course.id)) seen.set(t.course.id, t.course)
    })
    return Array.from(seen.values())
  }, [tasks])

  const filtered = useMemo(() => {
    return tasks.filter(t => {
      const matchSearch =
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        (t.description ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (t.course?.title ?? '').toLowerCase().includes(search.toLowerCase())
      const matchDiff = filterDifficulty === 'all' || t.difficulty_level === filterDifficulty
      const matchCourse = filterCourse === 'all' || t.course_id === filterCourse
      return matchSearch && matchDiff && matchCourse
    })
  }, [tasks, search, filterDifficulty, filterCourse])

  const stats = useMemo(() => ({
    total: tasks.length,
    byCourse: courses.length,
    byDiff: [1, 2, 3, 4].map(d => ({ d, count: tasks.filter(t => t.difficulty_level === d).length })),
  }), [tasks, courses])

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 ${isDark ? '' : 'min-h-screen'}`}>

      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }} className="text-center space-y-4">
        <div
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold ${isDark ? 'text-blue-300' : 'text-blue-600'}`}
          style={isDark
            ? { background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)' }
            : { background: '#eff6ff', border: '1px solid #bfdbfe' }}
        >
          <ClipboardList className="h-3.5 w-3.5" />
          {stats.total} ta topshiriq — {stats.byCourse} ta kursdan
        </div>
        <h1 className={`text-3xl sm:text-4xl font-extrabold leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Barcha topshiriqlar
        </h1>
        <p className={`text-sm max-w-xl mx-auto leading-relaxed ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
          O'qituvchilar yuklagan topshiriqlar. Kursga yozilib bajaring va baholash oling.
        </p>
      </motion.div>

      {/* Stats */}
      {!loading && tasks.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.byDiff.filter(d => d.count > 0).map(({ d, count }) => {
            const meta = DIFFICULTY[d]
            return (
              <button
                key={d}
                onClick={() => setFilterDifficulty(filterDifficulty === d ? 'all' : d)}
                className={`rounded-xl p-4 text-left transition-all border ${meta.bg} ${
                  filterDifficulty === d ? 'ring-2 ring-offset-1 ring-blue-500' : ''
                }`}
              >
                <p className={`text-2xl font-bold ${meta.color}`}>{count}</p>
                <p className={`text-xs font-medium mt-0.5 ${meta.color} opacity-80`}>{meta.label}</p>
              </button>
            )
          })}
        </motion.div>
      )}

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className={`rounded-2xl p-4 sm:p-5 space-y-3`}
        style={isDark
          ? { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }
          : { background: 'white', border: '1px solid #e5e7eb' }}
      >
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isDark ? 'text-white/30' : 'text-gray-400'}`} />
            <input
              type="text"
              placeholder="Topshiriq yoki kurs nomi..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={`w-full pl-9 pr-4 py-2.5 text-sm rounded-xl outline-none transition-colors ${
                isDark
                  ? 'bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-blue-500'
                  : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-blue-400'
              }`}
            />
          </div>

          {/* Course filter */}
          <div className="relative">
            <Filter className={`absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 ${isDark ? 'text-white/30' : 'text-gray-400'}`} />
            <select
              value={filterCourse}
              onChange={e => setFilterCourse(e.target.value)}
              className={`pl-8 pr-8 py-2.5 text-sm rounded-xl outline-none appearance-none cursor-pointer transition-colors ${
                isDark
                  ? 'bg-white/5 border border-white/10 text-white focus:border-blue-500'
                  : 'bg-gray-50 border border-gray-200 text-gray-900 focus:border-blue-400'
              }`}
            >
              <option value="all">Barcha kurslar</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.emoji ? `${c.emoji} ` : ''}{c.title}</option>
              ))}
            </select>
          </div>
        </div>

        <p className={`text-xs ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
          {filtered.length} ta topshiriq topildi
        </p>
      </motion.div>

      {/* Loading */}
      {loading && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={`rounded-2xl h-40 animate-pulse ${isDark ? 'bg-white/5' : 'bg-gray-100'}`} />
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div className={`rounded-2xl p-16 text-center ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
          <ClipboardList className={`h-12 w-12 mx-auto mb-4 ${isDark ? 'text-white/20' : 'text-gray-300'}`} />
          <p className={`font-medium ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
            {tasks.length === 0 ? "Hali topshiriq yuklanmagan" : "Topshiriq topilmadi"}
          </p>
        </div>
      )}

      {/* Tasks grid */}
      {!loading && filtered.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((task, i) => {
            const diff = DIFFICULTY[task.difficulty_level]
            const typeMeta = TASK_TYPE_META[task.task_type] ?? TASK_TYPE_META.standard
            const deadlinePast = task.deadline ? new Date(task.deadline) < new Date() : false

            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.04 }}
                whileHover={{ y: -3, transition: { duration: 0.18 } }}
                className={`rounded-2xl p-5 flex flex-col gap-3 transition-shadow ${
                  isDark
                    ? 'bg-white/5 border border-white/10 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-900/10'
                    : 'bg-white border border-gray-200 hover:border-blue-200 hover:shadow-md'
                }`}
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-2">
                  <div className={`h-11 w-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${
                    isDark ? 'bg-blue-500/10' : 'bg-blue-50'
                  }`}>
                    {task.course?.emoji ?? '📝'}
                  </div>
                  <div className="flex flex-wrap gap-1.5 justify-end">
                    {diff && (
                      <span className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium border ${diff.bg} ${diff.color}`}>
                        {diff.icon} {diff.label}
                      </span>
                    )}
                    {task.task_type !== 'standard' && (
                      <span className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium border ${
                        isDark
                          ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                          : 'bg-cyan-50 text-cyan-600 border-cyan-200'
                      }`}>
                        {typeMeta.icon} {typeMeta.label}
                      </span>
                    )}
                  </div>
                </div>

                {/* Title + description */}
                <div className="flex-1">
                  <h3 className={`font-semibold text-sm leading-snug ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className={`text-xs mt-1.5 line-clamp-2 leading-relaxed ${isDark ? 'text-white/45' : 'text-gray-500'}`}>
                      {task.description}
                    </p>
                  )}
                </div>

                {/* Bottom row */}
                <div className="flex items-center justify-between pt-2"
                  style={isDark ? { borderTop: '1px solid rgba(255,255,255,0.06)' } : { borderTop: '1px solid #f3f4f6' }}>
                  <div className="flex items-center gap-1.5">
                    <BookOpen className={`h-3.5 w-3.5 ${isDark ? 'text-white/30' : 'text-gray-400'}`} />
                    <span className={`text-xs truncate max-w-[120px] ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                      {task.course?.title ?? 'Kurs'}
                    </span>
                  </div>
                  {task.deadline && (
                    <div className={`flex items-center gap-1 text-xs ${
                      deadlinePast
                        ? isDark ? 'text-red-400' : 'text-red-500'
                        : isDark ? 'text-white/30' : 'text-gray-400'
                    }`}>
                      <Clock className="h-3 w-3" />
                      {new Date(task.deadline).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' })}
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* CTA */}
      {!loading && tasks.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="text-center py-6">
          <p className={`text-sm mb-4 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
            Topshiriqlarni bajarish uchun kursga yoziling
          </p>
          <Link href="/courses">
            <button className={`text-sm font-semibold px-6 py-2.5 rounded-xl transition-all ${
              isDark
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/30'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}>
              Kurslarga o'tish
            </button>
          </Link>
        </motion.div>
      )}
    </div>
  )
}
