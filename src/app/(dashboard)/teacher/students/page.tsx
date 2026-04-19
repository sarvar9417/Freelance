'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Users, Search, Star, TrendingUp, Clock,
  BookOpen, CheckCircle2, AlertCircle, ChevronDown,
  Filter,
} from 'lucide-react'
import GradingModal, { type SubmissionData } from '@/components/teacher/GradingModal'

interface Student {
  id: string
  name: string
  avatar: string
  email: string
  enrolledCourses: string[]
  overallProgress: number
  tasksSubmitted: number
  pendingGrades: number
  avgGrade: number | null
  lastActive: string
  streak: number
}

const STUDENTS: Student[] = [
  {
    id: '1', name: 'Jasur Toshmatov', avatar: 'JT', email: 'jasur@example.com',
    enrolledCourses: ['Freelancing asoslari', 'Grafik Dizayn (Figma)'],
    overallProgress: 75, tasksSubmitted: 5, pendingGrades: 1, avgGrade: 88, lastActive: '2 soat oldin', streak: 12,
  },
  {
    id: '2', name: 'Malika Yusupova', avatar: 'MY', email: 'malika@example.com',
    enrolledCourses: ['Grafik Dizayn (Figma)'],
    overallProgress: 45, tasksSubmitted: 2, pendingGrades: 2, avgGrade: null, lastActive: 'Kecha', streak: 5,
  },
  {
    id: '3', name: 'Bobur Aliyev', avatar: 'BA', email: 'bobur@example.com',
    enrolledCourses: ['Freelancing asoslari', 'Copywriting Pro'],
    overallProgress: 90, tasksSubmitted: 7, pendingGrades: 0, avgGrade: 93, lastActive: '1 soat oldin', streak: 20,
  },
  {
    id: '4', name: 'Zulfiya Karimova', avatar: 'ZK', email: 'zulfiya@example.com',
    enrolledCourses: ['Copywriting Pro'],
    overallProgress: 30, tasksSubmitted: 1, pendingGrades: 1, avgGrade: 72, lastActive: '3 kun oldin', streak: 2,
  },
  {
    id: '5', name: 'Sherzod Nazarov', avatar: 'SN', email: 'sherzod@example.com',
    enrolledCourses: ['Freelancing asoslari'],
    overallProgress: 60, tasksSubmitted: 3, pendingGrades: 0, avgGrade: 80, lastActive: '5 soat oldin', streak: 8,
  },
  {
    id: '6', name: 'Dilnoza Raximova', avatar: 'DR', email: 'dilnoza@example.com',
    enrolledCourses: ['Grafik Dizayn (Figma)', 'Copywriting Pro'],
    overallProgress: 55, tasksSubmitted: 4, pendingGrades: 3, avgGrade: null, lastActive: '2 kun oldin', streak: 3,
  },
]

const AVATAR_COLORS = [
  'from-blue-600 to-blue-800',
  'from-purple-600 to-purple-800',
  'from-emerald-600 to-emerald-800',
  'from-rose-600 to-rose-800',
  'from-amber-600 to-amber-800',
  'from-cyan-600 to-cyan-800',
]

const MOCK_PENDING: SubmissionData = {
  id: 'mock-1',
  studentName: 'Malika Yusupova',
  taskTitle: "Upwork profilini to'ldiring",
  course: 'Grafik Dizayn (Figma)',
  submittedAt: '2025-01-12 16:45',
  fileName: 'my-profile.pdf',
  currentGrade: null,
  currentFeedback: null,
  maxGrade: 100,
}

export default function StudentsPage() {
  const [search, setSearch] = useState('')
  const [filterCourse, setFilterCourse] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'name' | 'progress' | 'grade'>('progress')
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null)
  const [gradingSubmission, setGradingSubmission] = useState<SubmissionData | null>(null)

  const allCourses = Array.from(new Set(STUDENTS.flatMap(s => s.enrolledCourses)))

  const filtered = STUDENTS
    .filter(s => {
      const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase())
      const matchCourse = filterCourse === 'all' || s.enrolledCourses.includes(filterCourse)
      return matchSearch && matchCourse
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'progress') return b.overallProgress - a.overallProgress
      if (sortBy === 'grade') return (b.avgGrade ?? 0) - (a.avgGrade ?? 0)
      return 0
    })

  const totalPending = STUDENTS.reduce((s, st) => s + st.pendingGrades, 0)
  const avgProgress = Math.round(STUDENTS.reduce((s, st) => s + st.overallProgress, 0) / STUDENTS.length)

  const handleGrade = async (_id: string, _grade: number, _feedback: string) => {
    await new Promise(r => setTimeout(r, 1000))
    setGradingSubmission(null)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">O&apos;quvchilar</h1>
        <p className="text-white/40 text-sm mt-1">Barcha kurslardagi o&apos;quvchilar</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Users,        val: STUDENTS.length,  label: "Jami o'quvchilar", color: 'text-blue-400',    bg: 'bg-blue-500/10'    },
          { icon: TrendingUp,   val: `${avgProgress}%`,label: "O'rt. progress",   color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { icon: AlertCircle,  val: totalPending,     label: 'Baholanmagan',     color: 'text-amber-400',   bg: 'bg-amber-500/10'   },
          { icon: CheckCircle2, val: STUDENTS.filter(s => s.avgGrade !== null).length, label: 'Baholangan', color: 'text-purple-400', bg: 'bg-purple-500/10' },
        ].map(({ icon: Icon, val, label, color, bg }) => (
          <div key={label} className="rounded-2xl p-5"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className={`inline-flex p-2.5 rounded-xl ${bg} mb-3`}>
              <Icon className={`h-4 w-4 ${color}`} />
            </div>
            <p className={`text-2xl font-extrabold ${color}`}>{val}</p>
            <p className="text-white/50 text-xs mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Search className="h-4 w-4 text-white/30 flex-shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Ism yoki email orqali qidirish..."
            className="bg-transparent text-white text-sm placeholder:text-white/20 outline-none flex-1" />
        </div>

        {/* Course filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-white/30" />
          <select value={filterCourse} onChange={e => setFilterCourse(e.target.value)}
            className="bg-transparent text-white text-sm outline-none cursor-pointer px-3 py-2 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <option value="all" className="bg-slate-900">Barcha kurslar</option>
            {allCourses.map(c => (
              <option key={c} value={c} className="bg-slate-900">{c}</option>
            ))}
          </select>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-1 p-1 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          {(['progress', 'grade', 'name'] as const).map(s => (
            <button key={s} onClick={() => setSortBy(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                sortBy === s ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white'
              }`}>
              {s === 'progress' ? 'Progress' : s === 'grade' ? 'Baho' : 'Ism'}
            </button>
          ))}
        </div>
      </div>

      {/* Students list */}
      <div className="space-y-3">
        {filtered.map((student, i) => {
          const isExpanded = expandedStudent === student.id
          const gradeColor =
            (student.avgGrade ?? 0) >= 90 ? 'text-emerald-400' :
            (student.avgGrade ?? 0) >= 70 ? 'text-blue-400' :
            (student.avgGrade ?? 0) >= 50 ? 'text-amber-400' : 'text-white/30'

          return (
            <motion.div key={student.id}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="rounded-2xl overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>

              {/* Main row */}
              <button onClick={() => setExpandedStudent(isExpanded ? null : student.id)}
                className="w-full flex items-center gap-4 p-5 text-left hover:bg-white/3 transition-colors">

                {/* Avatar */}
                <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${AVATAR_COLORS[i % AVATAR_COLORS.length]} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                  {student.avatar}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-semibold text-sm">{student.name}</p>
                    {student.pendingGrades > 0 && (
                      <span className="bg-amber-500 text-white text-[10px] font-bold h-4 min-w-4 px-1 rounded-full flex items-center justify-center">
                        {student.pendingGrades}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    <span className="text-white/30 text-xs">{student.enrolledCourses.length} ta kurs</span>
                    <span className="text-white/20 text-xs flex items-center gap-1">
                      <Clock className="h-3 w-3" />{student.lastActive}
                    </span>
                  </div>
                </div>

                {/* Progress */}
                <div className="hidden sm:block w-32">
                  <div className="flex justify-between mb-1">
                    <span className="text-white/30 text-xs">Progress</span>
                    <span className="text-emerald-400 text-xs font-semibold">{student.overallProgress}%</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full"
                      style={{ width: `${student.overallProgress}%` }} />
                  </div>
                </div>

                {/* Grade */}
                <div className="hidden sm:block text-right w-20">
                  {student.avgGrade !== null ? (
                    <div>
                      <p className={`text-lg font-extrabold ${gradeColor}`}>{student.avgGrade}</p>
                      <p className="text-white/30 text-xs">o&apos;rt. baho</p>
                    </div>
                  ) : (
                    <p className="text-white/20 text-sm">—</p>
                  )}
                </div>

                <ChevronDown className={`h-4 w-4 text-white/20 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
              </button>

              {/* Expanded */}
              {isExpanded && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
                  className="border-t border-white/5 px-5 pb-5 pt-4 space-y-4">

                  {/* Kurslar */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-white/40 text-xs font-medium mb-2">Yozilgan kurslar</p>
                      <div className="space-y-1.5">
                        {student.enrolledCourses.map(course => (
                          <div key={course} className="flex items-center gap-2 text-sm">
                            <BookOpen className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                            <span className="text-white/70">{course}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Topshiriqlar', val: student.tasksSubmitted, color: 'text-blue-400' },
                        { label: 'Streak', val: `${student.streak} kun`, color: 'text-orange-400' },
                        { label: 'Progress', val: `${student.overallProgress}%`, color: 'text-emerald-400' },
                        { label: "O'rt. baho", val: student.avgGrade ? `${student.avgGrade}` : '—', color: 'text-amber-400' },
                      ].map(({ label, val, color }) => (
                        <div key={label} className="rounded-lg p-3 text-center"
                          style={{ background: 'rgba(255,255,255,0.03)' }}>
                          <p className={`text-lg font-bold ${color}`}>{val}</p>
                          <p className="text-white/30 text-xs mt-0.5">{label}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pending grades action */}
                  {student.pendingGrades > 0 && (
                    <button onClick={() => setGradingSubmission(MOCK_PENDING)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white bg-amber-600 hover:bg-amber-500 transition-all">
                      <Star className="h-4 w-4" />
                      {student.pendingGrades} ta topshiriqni baholash
                    </button>
                  )}
                </motion.div>
              )}
            </motion.div>
          )
        })}

        {filtered.length === 0 && (
          <div className="text-center py-16 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)' }}>
            <Users className="h-8 w-8 text-white/20 mx-auto mb-3" />
            <p className="text-white/40">Hech qanday o&apos;quvchi topilmadi</p>
          </div>
        )}
      </div>

      <GradingModal open={!!gradingSubmission} submission={gradingSubmission}
        onClose={() => setGradingSubmission(null)} onGrade={handleGrade} />
    </div>
  )
}
