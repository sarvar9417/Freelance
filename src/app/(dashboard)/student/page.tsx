import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import {
  BookOpen, ClipboardList, Zap, Flame, ArrowRight,
  TrendingUp, Clock, Star, ChevronRight,
} from 'lucide-react'
import DashboardClient from './DashboardClient'

const MOCK_COURSES = [
  { id: '1', title: 'Freelancing asoslari',  progress: 65, completedLessons: 8,  totalLessons: 12, emoji: '🚀', color: 'from-blue-600 to-blue-800' },
  { id: '2', title: 'Grafik Dizayn (Figma)', progress: 30, completedLessons: 5,  totalLessons: 18, emoji: '🎨', color: 'from-purple-600 to-purple-800' },
  { id: '3', title: 'Copywriting Pro',       progress: 90, completedLessons: 9,  totalLessons: 10, emoji: '✍️', color: 'from-emerald-600 to-emerald-800' },
]

const MOTIVATIONS = [
  { quote: "Muvaffaqiyat — bu har kuni kichik sa'y-harakatlar yig'indisi.", author: 'Robert Collier' },
  { quote: "O'rganish — bu eng kuchli qurol, uni dunyo o'zgartirish uchun ishlatish mumkin.", author: 'Nelson Mandela' },
  { quote: "Har bir mutaxassis bir vaqt boshlang'ich bo'lgan.", author: 'Helen Hayes' },
  { quote: "Freelancing — bu erkinlik, lekin erkinlik mas'uliyat talab qiladi.", author: 'Noma\'lum' },
  { quote: "Bugun qiyin tuyulgan narsa, ertaga ko'nikma bo'ladi.", author: 'Noma\'lum' },
  { quote: "Eng yaxshi investitsiya — bu o'z-o'zingizga investitsiya.", author: 'Warren Buffett' },
  { quote: "Imkoniyat ko'pincha qiyinchilik libosida keladi.", author: 'Winston Churchill' },
]

export default async function StudentDashboard() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const firstName = profile?.full_name?.split(' ')[0] ?? 'O\'quvchi'
  const todayMotivation = MOTIVATIONS[new Date().getDay() % MOTIVATIONS.length]
  const overallProgress = Math.round(
    MOCK_COURSES.reduce((s, c) => s + c.progress, 0) / MOCK_COURSES.length
  )

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* ── Welcome ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-white/40 text-sm mb-1">Bugun, {new Date().toLocaleDateString('uz-UZ', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Xush kelibsiz, <span className="text-blue-400">{firstName}</span>! 👋
          </h1>
        </div>
        <Link href="/student/courses">
          <button className="flex items-center gap-2 text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-900/30">
            Kurs boshlash
            <ArrowRight className="h-4 w-4" />
          </button>
        </Link>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: BookOpen,      value: '3',    label: 'Kurs',           sub: 'ta yozilgan',         color: 'text-blue-400',    bg: 'bg-blue-500/10'   },
          { icon: ClipboardList, value: '3',    label: 'Topshiriq',      sub: 'ta kutilmoqda',       color: 'text-amber-400',   bg: 'bg-amber-500/10'  },
          { icon: Zap,           value: '1,240',label: 'XP',             sub: 'jami ball',           color: 'text-purple-400',  bg: 'bg-purple-500/10' },
          { icon: Flame,         value: '7',    label: 'Streak',         sub: 'kunlik',              color: 'text-orange-400',  bg: 'bg-orange-500/10' },
        ].map(({ icon: Icon, value, label, sub, color, bg }) => (
          <div key={label} className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className={`inline-flex p-2.5 rounded-xl ${bg} mb-3`}>
              <Icon className={`h-4 w-4 ${color}`} />
            </div>
            <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
            <p className="text-white text-sm font-medium">{label}</p>
            <p className="text-white/30 text-xs mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* ── Overall progress + Motivation ── */}
      <div className="grid lg:grid-cols-5 gap-4">
        {/* Progress card */}
        <div className="lg:col-span-2 rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-white font-semibold">Umumiy progress</p>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </div>

          {/* Big circle progress */}
          <DashboardClient progress={overallProgress} />

          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="text-center p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <p className="text-emerald-400 font-bold text-lg">22</p>
              <p className="text-white/40 text-xs">dars tugatildi</p>
            </div>
            <div className="text-center p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <p className="text-blue-400 font-bold text-lg">18</p>
              <p className="text-white/40 text-xs">dars qoldi</p>
            </div>
          </div>
        </div>

        {/* Motivation */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          {/* Daily motivation */}
          <div className="flex-1 rounded-2xl p-6 flex flex-col justify-between"
            style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.12), rgba(139,92,246,0.08))', border: '1px solid rgba(59,130,246,0.2)' }}>
            <div className="flex items-center gap-2 mb-4">
              <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
              <span className="text-white/50 text-xs font-medium uppercase tracking-widest">Kunlik motivatsiya</span>
            </div>
            <blockquote>
              <p className="text-white text-lg font-medium leading-relaxed mb-4">
                &ldquo;{todayMotivation.quote}&rdquo;
              </p>
              <footer className="text-white/40 text-sm">— {todayMotivation.author}</footer>
            </blockquote>
          </div>

          {/* Quick links */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { href: '/student/tasks',   label: "Topshiriqlarni ko'rish",  icon: ClipboardList, color: 'text-amber-400',  bg: 'bg-amber-500/10'  },
              { href: '/student/progress',label: 'Progressimni ko\'rish',   icon: TrendingUp,    color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            ].map(({ href, label, icon: Icon, color, bg }) => (
              <Link key={href} href={href}>
                <div className="rounded-xl p-4 hover:bg-white/5 transition-all cursor-pointer group"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className={`inline-flex p-2 rounded-lg ${bg} mb-2`}>
                    <Icon className={`h-3.5 w-3.5 ${color}`} />
                  </div>
                  <p className="text-white text-xs font-medium group-hover:text-blue-300 transition-colors">{label}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Ongoing courses ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold">Davom etayotgan kurslar</h2>
          <Link href="/student/courses" className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm transition-colors">
            Barchasi <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="space-y-3">
          {MOCK_COURSES.map(({ id, title, progress, completedLessons, totalLessons, emoji, color }) => (
            <Link key={id} href={`/student/courses/${id}`}>
              <div className="flex items-center gap-4 p-4 rounded-2xl hover:bg-white/3 transition-all group cursor-pointer"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                {/* Emoji cover */}
                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-2xl flex-shrink-0`}>
                  {emoji}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-white font-medium text-sm truncate group-hover:text-blue-300 transition-colors">{title}</p>
                    <span className="text-blue-400 text-xs font-semibold flex-shrink-0 ml-2">{progress}%</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-1.5">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-white/30 text-xs flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      {completedLessons}/{totalLessons} dars
                    </span>
                    <span className="text-white/30 text-xs flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Davom etish
                    </span>
                  </div>
                </div>

                <ChevronRight className="h-4 w-4 text-white/20 group-hover:text-white/60 transition-colors flex-shrink-0" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
