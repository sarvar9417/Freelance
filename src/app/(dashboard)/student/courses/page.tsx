import { BookOpen, Search } from 'lucide-react'
import CourseCard, { type CourseCardData } from '@/components/student/CourseCard'

const COURSES: CourseCardData[] = [
  {
    id: '1',
    title: 'Freelancing asoslari',
    instructor: 'Sarvar Usmonov',
    category: "Boshlang'ich",
    emoji: '🚀',
    progress: 65,
    totalLessons: 12,
    completedLessons: 8,
    lastLesson: '5-dars: Upwork profili',
    duration: '6 soat',
    color: 'from-blue-600 to-blue-800',
  },
  {
    id: '2',
    title: 'Grafik Dizayn (Figma)',
    instructor: 'Malika Yusupova',
    category: "O'rta",
    emoji: '🎨',
    progress: 30,
    totalLessons: 18,
    completedLessons: 5,
    lastLesson: '5-dars: Auto Layout',
    duration: '14 soat',
    color: 'from-purple-600 to-purple-800',
  },
  {
    id: '3',
    title: 'Copywriting Pro',
    instructor: 'Bobur Aliyev',
    category: "Boshlang'ich",
    emoji: '✍️',
    progress: 90,
    totalLessons: 10,
    completedLessons: 9,
    lastLesson: '9-dars: Case study',
    duration: '5 soat',
    color: 'from-emerald-600 to-emerald-800',
  },
  {
    id: '4',
    title: 'SMM Marketing',
    instructor: 'Zulfiya Karimova',
    category: "O'rta",
    emoji: '📱',
    progress: 100,
    totalLessons: 14,
    completedLessons: 14,
    lastLesson: '14-dars: Analytics',
    duration: '8 soat',
    color: 'from-rose-600 to-rose-800',
  },
]

export default function CoursesPage() {
  const active = COURSES.filter(c => c.progress > 0 && c.progress < 100)
  const done   = COURSES.filter(c => c.progress >= 100)
  const notStarted = COURSES.filter(c => c.progress === 0)

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Mening kurslarim</h1>
          <p className="text-white/40 text-sm mt-1">{COURSES.length} ta kursga yozilganman</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Search className="h-4 w-4 text-white/30" />
          <input
            type="text"
            placeholder="Kurs qidirish..."
            className="bg-transparent text-white text-sm placeholder:text-white/30 outline-none w-40"
          />
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Davom etmoqda', count: active.length,    color: 'text-blue-400',    bg: 'bg-blue-500/10'    },
          { label: 'Tugallangan',   count: done.length,      color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Boshlanmagan', count: notStarted.length, color: 'text-white/40',    bg: 'bg-white/5'        },
        ].map(({ label, count, color }) => (
          <div key={label} className="rounded-2xl p-4 text-center"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p className={`text-2xl font-extrabold ${color}`}>{count}</p>
            <p className="text-white/50 text-xs mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Active */}
      {active.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
            <h2 className="text-white font-semibold">Davom etmoqda</h2>
            <span className="text-white/30 text-sm">({active.length})</span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {active.map((c, i) => <CourseCard key={c.id} course={c} index={i} />)}
          </div>
        </section>
      )}

      {/* Done */}
      {done.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <h2 className="text-white font-semibold">Tugallangan</h2>
            <span className="text-white/30 text-sm">({done.length})</span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {done.map((c, i) => <CourseCard key={c.id} course={c} index={i} />)}
          </div>
        </section>
      )}

      {/* Catalog CTA */}
      <div className="rounded-2xl p-8 text-center"
        style={{ background: 'linear-gradient(135deg,rgba(59,130,246,0.1),rgba(139,92,246,0.07))', border: '1px solid rgba(59,130,246,0.2)' }}>
        <BookOpen className="h-8 w-8 text-blue-400 mx-auto mb-3" />
        <h3 className="text-white font-semibold mb-2">Yangi kurs qidirmoqchimisiz?</h3>
        <p className="text-white/40 text-sm mb-5">24+ mutaxassis kursimiz mavjud — barchasi bepul</p>
        <button className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-2.5 rounded-xl transition-all text-sm shadow-lg shadow-blue-900/30">
          Kurslar katalogini ko&apos;rish
        </button>
      </div>
    </div>
  )
}
