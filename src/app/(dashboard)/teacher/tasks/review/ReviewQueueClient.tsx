'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Search, ChevronDown, Clock, CheckCircle2, RotateCcw, ArrowRight } from 'lucide-react'

interface Submission {
  id: string
  student_name: string
  student_email: string
  task_title: string
  course_title: string
  course_emoji: string
  submitted_at: string
  status: string
  score: number | null
  max_score: number
}

interface Course { id: string; title: string; emoji: string }

const STATUS_MAP = {
  pending:  { label: 'Kutilmoqda',        color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20',   icon: Clock },
  graded:   { label: 'Baholandi',          color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle2 },
  revision: { label: "Qayta topshiring",  color: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/20',       icon: RotateCcw },
}

export default function ReviewQueueClient({
  submissions: init, courses,
}: { submissions: Submission[]; courses: Course[] }) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [courseFilter, setCourseFilter] = useState('all')

  const filtered = init.filter(s => {
    const matchSearch =
      s.student_name.toLowerCase().includes(search.toLowerCase()) ||
      s.task_title.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || s.status === statusFilter
    const matchCourse = courseFilter === 'all' || s.course_title === courseFilter
    return matchSearch && matchStatus && matchCourse
  })

  return (
    <>
      {/* Filterlar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
          <input type="text" placeholder="O'quvchi yoki topshiriq bo'yicha qidirish..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-white/30 outline-none focus:ring-1 focus:ring-emerald-500/50"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
        </div>
        <div className="relative">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="pl-4 pr-8 py-2.5 rounded-xl text-sm text-white outline-none appearance-none cursor-pointer focus:ring-1 focus:ring-emerald-500/50"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <option value="all" className="bg-[#0d1220]">Barcha holatlar</option>
            <option value="pending" className="bg-[#0d1220]">Kutilmoqda</option>
            <option value="graded" className="bg-[#0d1220]">Baholandi</option>
            <option value="revision" className="bg-[#0d1220]">Qayta topshirish</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 pointer-events-none" />
        </div>
        {courses.length > 0 && (
          <div className="relative">
            <select value={courseFilter} onChange={e => setCourseFilter(e.target.value)}
              className="pl-4 pr-8 py-2.5 rounded-xl text-sm text-white outline-none appearance-none cursor-pointer focus:ring-1 focus:ring-emerald-500/50"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <option value="all" className="bg-[#0d1220]">Barcha kurslar</option>
              {courses.map(c => (
                <option key={c.id} value={c.title} className="bg-[#0d1220]">{c.emoji} {c.title}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 pointer-events-none" />
          </div>
        )}
      </div>

      {/* Jadval */}
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <th className="text-left text-xs font-medium text-white/40 px-4 py-3">O&apos;quvchi</th>
                <th className="text-left text-xs font-medium text-white/40 px-4 py-3 hidden sm:table-cell">Topshiriq</th>
                <th className="text-left text-xs font-medium text-white/40 px-4 py-3 hidden md:table-cell">Kurs</th>
                <th className="text-left text-xs font-medium text-white/40 px-4 py-3">Holat</th>
                <th className="text-left text-xs font-medium text-white/40 px-4 py-3 hidden lg:table-cell">Sana</th>
                <th className="text-right text-xs font-medium text-white/40 px-4 py-3">Amal</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-white/30 text-sm">
                    Topshirilgan ishlar topilmadi
                  </td>
                </tr>
              ) : filtered.map((s, i) => {
                const st = STATUS_MAP[s.status as keyof typeof STATUS_MAP] ?? STATUS_MAP.pending
                const StatusIcon = st.icon
                const initials = s.student_name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
                return (
                  <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className="hover:bg-white/[0.02] transition-colors"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500/30 to-blue-500/30 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <p className="text-white text-sm font-medium truncate">{s.student_name}</p>
                          <p className="text-white/30 text-xs truncate hidden sm:block">{s.student_email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden sm:table-cell">
                      <p className="text-white/70 text-sm truncate max-w-[160px]">{s.task_title}</p>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <p className="text-white/50 text-sm truncate">{s.course_emoji} {s.course_title}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${st.bg}`}>
                        <StatusIcon className={`h-3 w-3 ${st.color}`} />
                        <span className={st.color}>{st.label}</span>
                        {s.status === 'graded' && s.score !== null && (
                          <span className="text-white/40 ml-0.5">{s.score}/{s.max_score}</span>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <span className="text-white/30 text-xs">
                        {new Date(s.submitted_at).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' })}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Link href={`/teacher/submissions/${s.id}/review`}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          s.status === 'pending'
                            ? 'bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 border border-amber-500/20'
                            : 'text-white/30 hover:text-white hover:bg-white/5 border border-white/5'
                        }`}>
                        {s.status === 'pending' ? 'Tekshirish' : "Ko'rish"}
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3" style={{ background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <span className="text-white/30 text-xs">
            Jami: <span className="text-white/50 font-medium">{filtered.length}</span> ta ish
          </span>
        </div>
      </div>
    </>
  )
}
