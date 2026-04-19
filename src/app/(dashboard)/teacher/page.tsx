import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import {
  BookOpen, Users, ClipboardList, TrendingUp,
  ArrowRight, Star, Clock, CheckCircle2, AlertCircle,
} from 'lucide-react'

const MOCK_COURSES = [
  { id: '1', title: 'Freelancing asoslari',  emoji: '🚀', students: 24, lessons: 12, tasks: 4, avgProgress: 62 },
  { id: '2', title: 'Grafik Dizayn (Figma)', emoji: '🎨', students: 18, lessons: 18, tasks: 3, avgProgress: 45 },
  { id: '3', title: 'Copywriting Pro',       emoji: '✍️', students: 31, lessons: 10, tasks: 5, avgProgress: 78 },
]

const PENDING_GRADES = [
  { id: '1', student: 'Jasur Toshmatov',  task: "Upwork profil",      course: 'Freelancing asoslari',  time: '2 soat oldin' },
  { id: '2', student: 'Malika Yusupova',  task: 'Logo dizayn',        course: 'Grafik Dizayn (Figma)', time: '5 soat oldin' },
  { id: '3', student: 'Bobur Aliyev',     task: "Birinchi proposal",  course: 'Freelancing asoslari',  time: 'Kecha' },
]

export default async function TeacherDashboard() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const firstName = profile?.full_name?.split(' ')[0] ?? "O'qituvchi"

  const totalStudents = MOCK_COURSES.reduce((s, c) => s + c.students, 0)
  const totalLessons = MOCK_COURSES.reduce((s, c) => s + c.lessons, 0)

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-white/40 text-sm mb-1">
            Bugun, {new Date().toLocaleDateString('uz-UZ', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Xush kelibsiz, <span className="text-emerald-400">{firstName}</span>! 👨‍🏫
          </h1>
        </div>
        <Link href="/teacher/courses?new=1">
          <button className="flex items-center gap-2 text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-900/30">
            Yangi kurs
            <ArrowRight className="h-4 w-4" />
          </button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: BookOpen,      value: MOCK_COURSES.length, label: 'Kurslar',       sub: 'ta kurs',            color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { icon: Users,         value: totalStudents,       label: "O'quvchilar",   sub: 'ta jami',            color: 'text-blue-400',    bg: 'bg-blue-500/10'    },
          { icon: ClipboardList, value: PENDING_GRADES.length, label: 'Kutmoqda',    sub: 'ta topshiriq',       color: 'text-amber-400',   bg: 'bg-amber-500/10'   },
          { icon: TrendingUp,    value: totalLessons,        label: 'Darslar',       sub: 'ta jami dars',       color: 'text-purple-400',  bg: 'bg-purple-500/10'  },
        ].map(({ icon: Icon, value, label, sub, color, bg }) => (
          <div key={label} className="rounded-2xl p-5"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className={`inline-flex p-2.5 rounded-xl ${bg} mb-3`}>
              <Icon className={`h-4 w-4 ${color}`} />
            </div>
            <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
            <p className="text-white text-sm font-medium">{label}</p>
            <p className="text-white/30 text-xs mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-4">
        {/* Kurslar ro'yxati */}
        <div className="lg:col-span-3 rounded-2xl p-6"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-emerald-400" />
              Mening kurslarim
            </h2>
            <Link href="/teacher/courses" className="text-emerald-400 hover:text-emerald-300 text-xs flex items-center gap-1 transition-colors">
              Barchasi <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {MOCK_COURSES.map(course => (
              <Link key={course.id} href={`/teacher/courses/${course.id}`}>
                <div className="flex items-center gap-4 p-3.5 rounded-xl hover:bg-white/3 transition-all group cursor-pointer"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="h-10 w-10 rounded-lg bg-emerald-900/40 flex items-center justify-center text-xl flex-shrink-0">
                    {course.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate group-hover:text-emerald-300 transition-colors">
                      {course.title}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-white/30 text-xs flex items-center gap-1">
                        <Users className="h-3 w-3" />{course.students} o&apos;quvchi
                      </span>
                      <span className="text-white/30 text-xs flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />{course.lessons} dars
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-emerald-400 text-sm font-semibold">{course.avgProgress}%</p>
                    <p className="text-white/30 text-xs">o&apos;rtacha</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Baholanmagan topshiriqlar */}
        <div className="lg:col-span-2 rounded-2xl p-6"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-400" />
              Kutmoqda
            </h2>
            <span className="bg-amber-500 text-white text-xs font-bold h-5 w-5 rounded-full flex items-center justify-center">
              {PENDING_GRADES.length}
            </span>
          </div>
          <div className="space-y-3">
            {PENDING_GRADES.map(item => (
              <Link key={item.id} href={`/teacher/courses/1/tasks`}>
                <div className="p-3.5 rounded-xl hover:bg-white/3 transition-all cursor-pointer group"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <p className="text-white text-sm font-medium truncate group-hover:text-amber-300 transition-colors">
                    {item.student}
                  </p>
                  <p className="text-white/40 text-xs truncate mt-0.5">{item.task}</p>
                  <div className="flex items-center gap-1 mt-1.5 text-white/20 text-xs">
                    <Clock className="h-3 w-3" />{item.time}
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <Link href="/teacher/students">
            <button className="w-full mt-4 py-2.5 rounded-xl text-sm font-medium text-amber-400 hover:text-white hover:bg-amber-500/10 transition-all flex items-center justify-center gap-2"
              style={{ border: '1px dashed rgba(245,158,11,0.3)' }}>
              <CheckCircle2 className="h-3.5 w-3.5" />
              Barchasini ko&apos;rish
            </button>
          </Link>
        </div>
      </div>

      {/* Quick stats per course */}
      <div>
        <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Star className="h-4 w-4 text-amber-400" />
          Kurslar bo&apos;yicha statistika
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {MOCK_COURSES.map(course => (
            <div key={course.id} className="rounded-2xl p-5"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{course.emoji}</span>
                <p className="text-white text-sm font-semibold leading-snug">{course.title}</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-white/40">O&apos;rtacha progress</span>
                  <span className="text-emerald-400 font-semibold">{course.avgProgress}%</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all"
                    style={{ width: `${course.avgProgress}%` }} />
                </div>
                <div className="flex justify-between text-xs mt-2">
                  <span className="text-white/30 flex items-center gap-1">
                    <Users className="h-3 w-3" />{course.students}
                  </span>
                  <span className="text-white/30 flex items-center gap-1">
                    <ClipboardList className="h-3 w-3" />{course.tasks} topshiriq
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
