'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  ArrowLeft, BookOpen, Clock, Users, Star, Play,
  CheckCircle2, Lock, ChevronDown, ChevronUp,
  Award, TrendingUp, MessageSquare,
} from 'lucide-react'
interface Lesson {
  id: string
  order: number
  title: string
  duration: string
  free: boolean
  completed: boolean
}

interface CourseDetail {
  id: string
  title: string
  emoji: string
  description: string
  longDescription: string
  instructor: string
  instructorAvatar: string
  category: string
  level: string
  color: string
  duration: string
  lessonCount?: number
  students: number
  rating: number
  enrolled: boolean
  progress: number
  whatYouLearn: string[]
  requirements: string[]
  lessons: Lesson[]
  tasks: number
  language: string
  lastUpdated: string
}

const COURSES: Record<string, CourseDetail> = {
  '1': {
    id: '1', title: 'Freelancing asoslari', emoji: '🚀',
    description: "Freelancing dunyosiga kirish, platforma tanlash, birinchi buyurtma olish.",
    longDescription: "Bu kurs sizni freelancing dunyasiga qadam qo'yishga tayyorlaydi. Upwork, Fiverr va boshqa platformalarda professional profil yaratishdan tortib, birinchi buyurtma olish va mijozlar bilan muloqot qilishgacha bo'lgan barcha jarayonlarni bosqichma-bosqich o'rganasiz.",
    instructor: 'Sarvar Usmonov', instructorAvatar: 'SU',
    category: 'Freelancing', level: "Boshlang'ich",
    color: 'from-blue-600 to-blue-800', duration: '6 soat',
    lessons: [
      { id: 'l1', order: 1, title: "Freelancingga kirish",           duration: '15 daqiqa', free: true,  completed: true  },
      { id: 'l2', order: 2, title: "Platformalar taqqoslanmasi",     duration: '22 daqiqa', free: true,  completed: true  },
      { id: 'l3', order: 3, title: "Upwork profil yaratish",         duration: '30 daqiqa', free: false, completed: false },
      { id: 'l4', order: 4, title: "Fiverr gig sozlash",             duration: '25 daqiqa', free: false, completed: false },
      { id: 'l5', order: 5, title: "Birinchi proposal yozish",       duration: '35 daqiqa', free: false, completed: false },
      { id: 'l6', order: 6, title: "Mijoz bilan muloqot sirlari",    duration: '28 daqiqa', free: false, completed: false },
      { id: 'l7', order: 7, title: "Narx belgilash strategiyasi",    duration: '20 daqiqa', free: false, completed: false },
      { id: 'l8', order: 8, title: "Portfolio yaratish",             duration: '40 daqiqa', free: false, completed: false },
      { id: 'l9', order: 9, title: "Shartnoma va to'lov",            duration: '18 daqiqa', free: false, completed: false },
      { id: 'l10',order:10, title: "Reytingni oshirish",             duration: '22 daqiqa', free: false, completed: false },
      { id: 'l11',order:11, title: "Passiv daromad",                 duration: '30 daqiqa', free: false, completed: false },
      { id: 'l12',order:12, title: "Xulosa va keyingi qadamlar",     duration: '15 daqiqa', free: false, completed: false },
    ],
    whatYouLearn: [
      "Professional Upwork va Fiverr profillarini yaratish",
      "Samarali proposal va cover letter yozish",
      "Mijoz bilan professional muloqot qilish",
      "Narx belgilash va muzokaralar olib borish",
      "Portfolio yaratish va reytingni oshirish",
      "Doimiy mijozlar bazasini shakllantirish",
    ],
    requirements: [
      "Internet aloqasi va kompyuter",
      "Asosiy ingliz tili bilimlari (B1 darajasi)",
      "O'rganishga ishtiyoq va sabr",
    ],
    students: 248, rating: 4.9, tasks: 4,
    language: "O'zbek tili", lastUpdated: "2025-yanvar",
    enrolled: true, progress: 17,
  },
  '2': {
    id: '2', title: 'Grafik Dizayn (Figma)', emoji: '🎨',
    description: "Figma orqali professional UI/UX dizayn yaratish.",
    longDescription: "Figma — dunyoning eng mashhur dizayn vositasi. Bu kursda siz Figma'ning barcha asosiy funksiyalarini o'rganib, real loyihalar uchun professional interfeys yaratishni o'zlashtirasiz.",
    instructor: 'Malika Yusupova', instructorAvatar: 'MY',
    category: 'Dizayn', level: "O'rta",
    color: 'from-purple-600 to-purple-800', duration: '14 soat',
    lessons: [
      { id: 'l1', order: 1, title: "Figmaga kirish va interfeys",    duration: '20 daqiqa', free: true,  completed: true  },
      { id: 'l2', order: 2, title: "Frames va Shapes asoslari",      duration: '25 daqiqa', free: true,  completed: false },
      { id: 'l3', order: 3, title: "Auto Layout",                    duration: '35 daqiqa', free: false, completed: false },
      { id: 'l4', order: 4, title: "Component Library",              duration: '40 daqiqa', free: false, completed: false },
      { id: 'l5', order: 5, title: "Typography va Color Systems",    duration: '30 daqiqa', free: false, completed: false },
    ],
    whatYouLearn: ["Figma asoslarini o'rganish", "UI komponentlar yaratish", "Real loyiha ustida ishlash"],
    requirements: ["Kompyuter (Mac yoki Windows)", "Figma bepul hisobi"],
    students: 183, rating: 4.8, tasks: 3,
    language: "O'zbek tili", lastUpdated: "2024-dekabr",
    enrolled: true, progress: 20,
  },
}

// Fallback
const DEFAULT_COURSE = COURSES['1']

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const course = COURSES[id] ?? DEFAULT_COURSE
  const [enrolled, setEnrolled] = useState(course.enrolled ?? false)
  const [enrolling, setEnrolling] = useState(false)
  const [syllabus, setSyllabus] = useState(true)

  const completedCount = course.lessons.filter(l => l.completed).length
  const progress = Math.round((completedCount / course.lessons.length) * 100)

  const handleEnroll = async () => {
    setEnrolling(true)
    await new Promise(r => setTimeout(r, 1200))
    setEnrolled(true)
    setEnrolling(false)
  }

  const firstLesson = course.lessons[0]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back */}
      <Link href="/courses" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm transition-colors">
        <ArrowLeft className="h-4 w-4" /> Barcha kurslar
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left — main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl overflow-hidden`}
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className={`h-44 bg-gradient-to-br ${course.color} relative flex items-center px-8`}>
              <div className="absolute inset-0 bg-black/20" />
              <span className="relative text-7xl mr-6">{course.emoji}</span>
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full text-white"
                    style={{ background: 'rgba(0,0,0,0.4)' }}>
                    {course.category}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full text-white/80 bg-black/30">
                    {course.level}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                  {course.title}
                </h1>
              </div>
            </div>

            <div className="p-6">
              <p className="text-white/60 text-sm leading-relaxed mb-6">{course.longDescription}</p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { icon: BookOpen, val: `${course.lessons.length} dars`, label: "O'quv dasturi" },
                  { icon: Clock,    val: course.duration,                  label: 'Umumiy vaqt'   },
                  { icon: Users,    val: course.students.toLocaleString(), label: "O'quvchilar"   },
                  { icon: Star,     val: `${course.rating}/5.0`,           label: 'Reyting'       },
                ].map(({ icon: Icon, val, label }) => (
                  <div key={label} className="text-center p-3 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <Icon className="h-4 w-4 text-white/30 mx-auto mb-1.5" />
                    <p className="text-white font-bold text-sm">{val}</p>
                    <p className="text-white/40 text-xs mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* What you learn */}
          <div className="rounded-2xl p-6"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-400" /> Nima o&apos;rganasiz
            </h2>
            <div className="grid sm:grid-cols-2 gap-2.5">
              {course.whatYouLearn.map((item, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span className="text-white/70 text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Syllabus */}
          <div className="rounded-2xl overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <button onClick={() => setSyllabus(!syllabus)}
              className="w-full flex items-center justify-between p-6 hover:bg-white/3 transition-colors">
              <h2 className="text-white font-semibold flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-blue-400" />
                O&apos;quv dasturi
                <span className="text-white/30 text-sm font-normal">({course.lessons.length} dars)</span>
              </h2>
              {syllabus ? <ChevronUp className="h-4 w-4 text-white/30" /> : <ChevronDown className="h-4 w-4 text-white/30" />}
            </button>

            {syllabus && (
              <div className="border-t border-white/5 divide-y divide-white/5">
                {course.lessons.map((lesson) => (
                  <div key={lesson.id}
                    className={`flex items-center gap-4 px-6 py-3.5 transition-all ${
                      enrolled || lesson.free
                        ? 'hover:bg-white/3 cursor-pointer'
                        : 'opacity-60 cursor-not-allowed'
                    }`}
                    onClick={() => {
                      if (enrolled || lesson.free) {
                        router.push(`/courses/${id}/lessons/${lesson.id}`)
                      }
                    }}>
                    <div className={`h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      lesson.completed
                        ? 'bg-emerald-500/20'
                        : lesson.free
                        ? 'bg-blue-500/15'
                        : 'bg-white/5'
                    }`}>
                      {lesson.completed ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      ) : lesson.free ? (
                        <Play className="h-3.5 w-3.5 text-blue-400" />
                      ) : enrolled ? (
                        <Play className="h-3.5 w-3.5 text-white/30" />
                      ) : (
                        <Lock className="h-3 w-3 text-white/25" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${
                        lesson.completed ? 'text-emerald-300' : 'text-white/80'
                      }`}>
                        {lesson.order}. {lesson.title}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {lesson.free && !enrolled && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-blue-300 bg-blue-400/10">
                          Bepul
                        </span>
                      )}
                      <span className="text-white/25 text-xs flex items-center gap-1">
                        <Clock className="h-3 w-3" />{lesson.duration}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Requirements */}
          <div className="rounded-2xl p-6"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h2 className="text-white font-semibold mb-4">Talablar</h2>
            <ul className="space-y-2">
              {course.requirements.map((req, i) => (
                <li key={i} className="flex items-start gap-2.5 text-white/60 text-sm">
                  <span className="text-white/30 mt-0.5">•</span> {req}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right — sidebar sticky card */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 space-y-4">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="rounded-2xl overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>

              {/* Preview thumbnail */}
              <div className={`h-36 bg-gradient-to-br ${course.color} flex items-center justify-center relative`}>
                <div className="absolute inset-0 bg-black/25" />
                <span className="relative text-6xl">{course.emoji}</span>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-14 w-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center cursor-pointer hover:bg-white/30 transition-all">
                    <Play className="h-6 w-6 text-white ml-0.5" />
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-4">
                {/* Price */}
                <div className="text-center">
                  <span className="text-3xl font-extrabold text-white">Bepul</span>
                  <p className="text-white/40 text-xs mt-1">Sertifikat bilan</p>
                </div>

                {/* Progress (if enrolled) */}
                {enrolled && (
                  <div>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-white/50 text-xs">Sizning progressingiz</span>
                      <span className="text-blue-400 text-xs font-semibold">{progress}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full"
                        style={{ width: `${progress}%` }} />
                    </div>
                    <p className="text-white/30 text-xs mt-1.5">{completedCount}/{course.lessons.length} dars bajarildi</p>
                  </div>
                )}

                {/* CTA button */}
                {enrolled ? (
                  <Link href={`/courses/${id}/lessons/${firstLesson.id}`}>
                    <button className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2">
                      <Play className="h-4 w-4" />
                      {progress > 0 ? 'Davom etish' : 'Boshlash'}
                    </button>
                  </Link>
                ) : (
                  <button onClick={handleEnroll} disabled={enrolling}
                    className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-70 transition-all shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2">
                    {enrolling ? (
                      <><span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />Yozilmoqda...</>
                    ) : (
                      <><CheckCircle2 className="h-4 w-4" />Kursga yozilish (Bepul)</>
                    )}
                  </button>
                )}

                {enrolled && (
                  <p className="text-center text-emerald-400 text-xs flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Siz bu kursga yozilgansiz
                  </p>
                )}

                {/* Features */}
                <div className="space-y-2 pt-2 border-t border-white/5">
                  {[
                    { icon: BookOpen,     text: `${course.lessons.length} ta video dars` },
                    { icon: Clock,        text: `${course.duration} umumiy davomiylik`   },
                    { icon: TrendingUp,   text: `${course.tasks} ta amaliy topshiriq`    },
                    { icon: MessageSquare,text: 'Forum va jamiyat kirishi'               },
                    { icon: Award,        text: 'Tugatish sertifikati'                   },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-2.5 text-white/50 text-xs">
                      <Icon className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                      {text}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Instructor card */}
            <div className="rounded-2xl p-5"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 className="text-white font-semibold text-sm mb-4">O&apos;qituvchi</h3>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                  {course.instructorAvatar}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{course.instructor}</p>
                  <p className="text-white/40 text-xs">Senior Freelancer · 5+ yil tajriba</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center">
                {[
                  { val: '4.9', label: 'Reyting' },
                  { val: '248', label: "O'quvchi" },
                ].map(({ val, label }) => (
                  <div key={label} className="rounded-lg p-2" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <p className="text-white font-bold text-sm">{val}</p>
                    <p className="text-white/30 text-xs">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Meta */}
            <div className="px-1 space-y-1.5">
              {[
                { label: 'Til',              val: course.language   },
                { label: 'Yangilangan',      val: course.lastUpdated },
                { label: 'Daraja',           val: course.level      },
              ].map(({ label, val }) => (
                <div key={label} className="flex justify-between text-xs">
                  <span className="text-white/30">{label}</span>
                  <span className="text-white/60 font-medium">{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
