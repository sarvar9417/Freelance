'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft, BookOpen, Users, ClipboardList, PlayCircle,
  ChevronRight, TrendingUp, Star, Clock, CheckCircle2,
  AlertCircle, Loader2,
} from 'lucide-react'

const MOCK_COURSES: Record<string, {
  title: string; emoji: string; description: string; category: string;
  lessons: number; tasks: number; color: string
}> = {
  '1': { title: 'Freelancing asoslari',  emoji: '🚀', description: "Freelancing dunyosiga kirish va birinchi buyurtma olish.", category: "Boshlang'ich", lessons: 12, tasks: 4, color: 'from-blue-600 to-blue-800' },
  '2': { title: 'Grafik Dizayn (Figma)', emoji: '🎨', description: "Figma orqali professional UI dizayn yaratish.",             category: "O'rta",         lessons: 18, tasks: 3, color: 'from-purple-600 to-purple-800' },
  '3': { title: 'Copywriting Pro',       emoji: '✍️', description: "Sotuvchi matnlar yozish va mijozlar bilan ishlash.",       category: "Boshlang'ich", lessons: 10, tasks: 5, color: 'from-emerald-600 to-emerald-800' },
}

const MOCK_STUDENTS = [
  { id: '1', name: 'Jasur Toshmatov',   progress: 75, grade: 88, tasksSubmitted: 3, lastActive: '2 soat oldin', avatar: 'JT' },
  { id: '2', name: 'Malika Yusupova',   progress: 45, grade: null, tasksSubmitted: 1, lastActive: 'Kecha', avatar: 'MY' },
  { id: '3', name: 'Bobur Aliyev',      progress: 90, grade: 95, tasksSubmitted: 4, lastActive: '1 soat oldin', avatar: 'BA' },
  { id: '4', name: 'Zulfiya Karimova',  progress: 30, grade: null, tasksSubmitted: 0, lastActive: '3 kun oldin', avatar: 'ZK' },
  { id: '5', name: 'Sherzod Nazarov',   progress: 60, grade: 72, tasksSubmitted: 2, lastActive: '5 soat oldin', avatar: 'SN' },
]

const COLORS = ['bg-blue-600', 'bg-purple-600', 'bg-emerald-600', 'bg-rose-600', 'bg-amber-600']

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const course = MOCK_COURSES[id] ?? MOCK_COURSES['1']
  const [tab, setTab] = useState<'students' | 'overview'>('overview')

  const avgProgress = Math.round(MOCK_STUDENTS.reduce((s, st) => s + st.progress, 0) / MOCK_STUDENTS.length)
  const graded = MOCK_STUDENTS.filter(s => s.grade !== null).length
  const avgGrade = graded > 0
    ? Math.round(MOCK_STUDENTS.filter(s => s.grade !== null).reduce((s, st) => s + (st.grade ?? 0), 0) / graded)
    : 0

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back */}
      <Link href="/teacher/courses" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm transition-colors">
        <ArrowLeft className="h-4 w-4" /> Kurslar ro&apos;yxati
      </Link>

      {/* Course header */}
      <div className={`rounded-2xl overflow-hidden`}
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className={`h-32 bg-gradient-to-br ${course.color} relative flex items-center px-8`}>
          <div className="absolute inset-0 bg-black/20" />
          <span className="relative text-5xl mr-5">{course.emoji}</span>
          <div className="relative">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full text-white mb-2 inline-block"
              style={{ background: 'rgba(0,0,0,0.4)' }}>
              {course.category}
            </span>
            <h1 className="text-2xl font-bold text-white">{course.title}</h1>
            <p className="text-white/60 text-sm mt-1">{course.description}</p>
          </div>
        </div>
        <div className="px-8 py-5 grid grid-cols-2 sm:grid-cols-4 gap-6">
          {[
            { icon: Users,        val: MOCK_STUDENTS.length, label: "O'quvchilar", color: 'text-blue-400'    },
            { icon: PlayCircle,   val: course.lessons,        label: 'Darslar',     color: 'text-purple-400'  },
            { icon: ClipboardList,val: course.tasks,          label: 'Topshiriqlar',color: 'text-amber-400'   },
            { icon: TrendingUp,   val: `${avgProgress}%`,     label: 'O\'rt. progress', color: 'text-emerald-400' },
          ].map(({ icon: Icon, val, label, color }) => (
            <div key={label} className="text-center">
              <Icon className={`h-4 w-4 ${color} mx-auto mb-1`} />
              <p className={`text-xl font-extrabold ${color}`}>{val}</p>
              <p className="text-white/40 text-xs">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-3 gap-3">
        {[
          { href: `/teacher/courses/${id}/lessons`, label: 'Darslarni boshqarish', icon: PlayCircle,    color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'rgba(59,130,246,0.2)'   },
          { href: `/teacher/courses/${id}/tasks`,   label: 'Topshiriqlar',          icon: ClipboardList, color: 'text-amber-400',  bg: 'bg-amber-500/10',  border: 'rgba(245,158,11,0.2)'   },
          { href: `/teacher/students`,              label: "O'quvchilar",           icon: Users,         color: 'text-emerald-400',bg: 'bg-emerald-500/10',border: 'rgba(16,185,129,0.2)'   },
        ].map(({ href, label, icon: Icon, color, bg, border }) => (
          <Link key={href} href={href}>
            <div className="flex items-center gap-3 p-4 rounded-xl hover:bg-white/5 transition-all cursor-pointer group"
              style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${border}` }}>
              <div className={`p-2 rounded-lg ${bg}`}><Icon className={`h-4 w-4 ${color}`} /></div>
              <span className="text-white text-sm font-medium group-hover:text-white/80">{label}</span>
              <ChevronRight className="h-3.5 w-3.5 text-white/20 ml-auto group-hover:text-white/50 transition-colors" />
            </div>
          </Link>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
        {(['overview', 'students'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t ? 'bg-emerald-600 text-white' : 'text-white/40 hover:text-white'
            }`}>
            {t === 'overview' ? "Ko'rinish" : "O'quvchilar"}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-2xl p-6"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" /> O&apos;quvchilar progressi
            </h2>
            <div className="space-y-4">
              {MOCK_STUDENTS.map((student, i) => (
                <div key={student.id} className="flex items-center gap-4">
                  <div className={`h-8 w-8 rounded-full ${COLORS[i % COLORS.length]} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                    {student.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-white text-sm font-medium truncate">{student.name}</p>
                      <span className="text-emerald-400 text-xs font-semibold flex-shrink-0 ml-2">{student.progress}%</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <motion.div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full"
                        initial={{ width: 0 }} animate={{ width: `${student.progress}%` }}
                        transition={{ duration: 0.8, delay: i * 0.1 }} />
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right w-16">
                    {student.grade !== null
                      ? <span className="text-amber-400 text-xs font-bold flex items-center gap-1 justify-end"><Star className="h-3 w-3 fill-amber-400" />{student.grade}</span>
                      : <span className="text-white/20 text-xs">—</span>
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl p-5"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <h3 className="text-white font-semibold text-sm mb-4">Statistika</h3>
              {[
                { icon: TrendingUp,   label: "O'rt. progress", val: `${avgProgress}%`, color: 'text-emerald-400' },
                { icon: Star,         label: "O'rt. baho",     val: avgGrade ? `${avgGrade}/100` : '—', color: 'text-amber-400' },
                { icon: CheckCircle2, label: 'Baholangan',     val: `${graded}/${MOCK_STUDENTS.length}`, color: 'text-blue-400' },
                { icon: AlertCircle,  label: 'Kutmoqda',       val: `${MOCK_STUDENTS.length - graded}`, color: 'text-red-400' },
              ].map(({ icon: Icon, label, val, color }) => (
                <div key={label} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-3.5 w-3.5 ${color}`} />
                    <span className="text-white/50 text-xs">{label}</span>
                  </div>
                  <span className={`text-sm font-bold ${color}`}>{val}</span>
                </div>
              ))}
            </div>

            <div className="rounded-2xl p-5"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <h3 className="text-white font-semibold text-sm mb-3">Oxirgi faollik</h3>
              {MOCK_STUDENTS.slice(0, 3).map((s, i) => (
                <div key={s.id} className="flex items-center gap-2.5 py-2">
                  <div className={`h-7 w-7 rounded-full ${COLORS[i % COLORS.length]} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                    {s.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-medium truncate">{s.name}</p>
                    <p className="text-white/30 text-xs flex items-center gap-1 mt-0.5">
                      <Clock className="h-2.5 w-2.5" />{s.lastActive}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'students' && (
        <div className="rounded-2xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="px-6 py-4 border-b border-white/5">
            <h2 className="text-white font-semibold">Barcha o&apos;quvchilar ({MOCK_STUDENTS.length})</h2>
          </div>
          <div className="divide-y divide-white/5">
            {MOCK_STUDENTS.map((student, i) => (
              <div key={student.id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/3 transition-all">
                <div className={`h-10 w-10 rounded-xl ${COLORS[i % COLORS.length]} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                  {student.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm">{student.name}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-white/30 text-xs">{student.tasksSubmitted} topshiriq</span>
                    <span className="text-white/20 text-xs flex items-center gap-1">
                      <Clock className="h-3 w-3" />{student.lastActive}
                    </span>
                  </div>
                </div>
                <div className="text-center w-20">
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-1">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${student.progress}%` }} />
                  </div>
                  <span className="text-emerald-400 text-xs font-semibold">{student.progress}%</span>
                </div>
                <div className="w-20 text-right">
                  {student.grade !== null
                    ? <span className="text-amber-400 text-sm font-bold">{student.grade}<span className="text-white/30 text-xs">/100</span></span>
                    : <span className="text-white/20 text-sm flex items-center gap-1 justify-end"><Loader2 className="h-3 w-3 animate-spin" />Kutmoqda</span>
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
