'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, CheckCircle2, Lock, Play,
  ClipboardList, BookOpen, Menu, X, ChevronRight,
} from 'lucide-react'
import LessonPlayer from '@/components/courses/LessonPlayer'
import TaskSubmission from '@/components/courses/TaskSubmission'

interface Lesson {
  id: string
  order: number
  title: string
  duration: string
  video_url: string
  content: string
  completed: boolean
}

const COURSES_DATA: Record<string, {
  title: string
  emoji: string
  color: string
  lessons: Lesson[]
  tasks: {
    id: string
    title: string
    description: string
    deadline: string
    fileRequirements: string
    maxGrade: number
    forLesson: string
    history: {
      id: string; fileName: string; fileSize: string;
      submittedAt: string; status: 'pending' | 'reviewed' | 'graded';
      grade?: number; feedback?: string
    }[]
  }[]
}> = {
  '1': {
    title: 'Freelancing asoslari', emoji: '🚀', color: 'from-blue-600 to-blue-800',
    lessons: [
      {
        id: 'l1', order: 1, title: "Freelancingga kirish", duration: '15 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        content: `Freelancing — bu mustaqil ishlash shakli bo'lib, siz bir yoki bir nechta mijozlar uchun masofadan xizmat ko'rsatasiz.\n\nAsosiy afzalliklar:\n• Erkin ish jadvali\n• Istaganingizdan ishlash\n• Daromadni o'zing belgilash\n• Turli loyihalar bilan ishlash\n\nFreelancer bo'lish uchun qanday ko'nikmalar kerak?\n1. Texnik ko'nikma (dizayn, dasturlash, matn yozish va h.k.)\n2. Muloqot ko'nikmasi\n3. Vaqtni boshqarish\n4. O'z-o'zini motivatsiya qilish`,
        completed: true,
      },
      {
        id: 'l2', order: 2, title: "Platformalar taqqoslanmasi", duration: '22 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        content: `Eng mashhur freelancing platformalari:\n\n🏆 Upwork\n• Katta loyihalar uchun eng yaxshi\n• Saatlik va belgilangan narx\n• Qat'iy screening jarayoni\n\n⭐ Fiverr\n• Kichik va o'rta loyihalar\n• Gig asosida ishlash\n• Tez boshlash mumkin\n\n💼 Toptal\n• Faqat top 3% mutaxassislar\n• Yuqori maosh\n• Qiyin sertifikatlashtirish\n\nTavsiya: Boshlang'ich uchun Upwork yoki Fiverr.`,
        completed: true,
      },
      {
        id: 'l3', order: 3, title: "Upwork profil yaratish", duration: '30 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        content: `Professional Upwork profili yaratish uchun:\n\n1. Professional foto\n• Aniq yuz ko'rinishi\n• Toza fon (oq yoki kulrang)\n• Professional kiyim\n\n2. Kuchli sarlavha\n• "WordPress Developer | 5+ yil tajriba"\n• Kalit so'zlar muhim\n\n3. Batafsil tavsif\n• O'z hikoyangiz\n• Ko'nikmalar va tajriba\n• Mijoz uchun qanday foyda\n\n4. Portfolio\n• Minimum 3-5 ta ish\n• Har biri uchun tavsif`,
        completed: false,
      },
      {
        id: 'l4', order: 4, title: "Fiverr gig sozlash", duration: '25 daqiqa',
        video_url: '',
        content: `Fiverr'da muvaffaqiyatli gig yaratish:\n\n📌 Gig nomi\n• Kalit so'z bilan boshlang\n• "I will create..." formatida\n\n💰 Paketlar (Basic, Standard, Premium)\n• Har birini aniq belgilang\n• Qo'shimcha xizmatlar (extras)\n\n🖼️ Gig rasmlari\n• Kamida 3 ta sifatli rasm\n• Before/After ko'rsating\n\n📝 Tavsif\n• Nima qilasiz?\n• Nima oling?\n• Muddati qancha?`,
        completed: false,
      },
      {
        id: 'l5', order: 5, title: "Birinchi proposal yozish", duration: '35 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        content: `Samarali proposal yozish formulasi:\n\n1️⃣ Muammo/Ehtiyojni tan oling\n"Siz X muammoni hal qilmoqchi ekansiz..."\n\n2️⃣ Yechimingizni taklif qiling\n"Men Y yondashuv orqali..."\n\n3️⃣ Tajribangizni ko'rsating\n"Shunga o'xshash Z loyihada..."\n\n4️⃣ Keyingi qadamni aniqlang\n"Boshlash uchun call o'tkazaylikmi?"\n\n❌ Xatolar:\n• Shablondan nusxa ko'chirish\n• Faqat o'zingiz haqida yozish\n• Narxni birinchi aytish`,
        completed: false,
      },
      {
        id: 'l6', order: 6, title: "Mijoz bilan muloqot sirlari", duration: '28 daqiqa',
        video_url: '',
        content: `Professional muloqot qoidalari:\n\n✅ Har doim:\n• 24 soat ichida javob bering\n• Aniq va qisqa yozing\n• Deadline haqida xabardor qiling\n\n❌ Hech qachon:\n• O'z muddatingizni buzmang\n• Xato bo'lsa yashirmang\n• Professional bo'ling`,
        completed: false,
      },
    ],
    tasks: [
      {
        id: 't1', title: "Upwork profilini to'ldiring", forLesson: 'l3',
        description: "Upwork platformasida to'liq profil yarating: professional foto, sarlavha, batafsil tavsif, ko'nikmalar va kamida 2 ta portfolio ishi. Profilni to'ldirgandan so'ng sahifaning skreenshot yoki PDF formatida saqlang.",
        deadline: '2025-03-01', fileRequirements: 'PDF, PNG, JPG — max 20MB', maxGrade: 100,
        history: [
          {
            id: 'sub1', fileName: 'upwork-profil.pdf', fileSize: '2.3 MB',
            submittedAt: '2025-01-10 14:30', status: 'graded',
            grade: 88, feedback: "Juda yaxshi profil! Sarlavha kuchli va professional. Tavsif batafsil va aniq yozilgan. Faqat portfolio qismini yanada to'ldirish kerak — hozircha faqat 1 ta ish bor, kamida 3 ta bo'lishi tavsiya etiladi."
          }
        ],
      },
      {
        id: 't2', title: "Birinchi proposal yozing", forLesson: 'l5',
        description: "Upwork yoki Fiverr'da real loyiha toping va o'sha loyiha uchun professional proposal tayyorlang. Proposal 150-300 so'z bo'lishi kerak va darsda o'rganilgan formula asosida yozilishi lozim. Skreenshot yoki PDF yuklang.",
        deadline: '2025-03-10', fileRequirements: 'PDF, DOC, DOCX — max 10MB', maxGrade: 100,
        history: [],
      },
    ],
  },
  '2': {
    title: 'Grafik Dizayn (Figma)', emoji: '🎨', color: 'from-purple-600 to-purple-800',
    lessons: [
      {
        id: 'l1', order: 1, title: "Figmaga kirish va interfeys", duration: '20 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        content: "Figma — bulutga asoslangan dizayn vositasi. Bu darsda interfeysni o'rganamiz.",
        completed: true,
      },
      {
        id: 'l2', order: 2, title: "Frames va Shapes asoslari", duration: '25 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        content: "Frames, Shapes va asosiy dizayn elementlari haqida.",
        completed: false,
      },
      {
        id: 'l3', order: 3, title: "Auto Layout", duration: '35 daqiqa',
        video_url: '',
        content: "Auto Layout — Figmaning eng kuchli funksiyalaridan biri.",
        completed: false,
      },
    ],
    tasks: [],
  },
}

const DEFAULT_COURSE = COURSES_DATA['1']

export default function LessonViewPage() {
  const { id, lessonId } = useParams<{ id: string; lessonId: string }>()
  const router = useRouter()

  const course = COURSES_DATA[id] ?? DEFAULT_COURSE
  const [lessons, setLessons] = useState(course.lessons)
  const [activeTab, setActiveTab] = useState<'lesson' | 'task'>('lesson')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const currentLesson = lessons.find(l => l.id === lessonId) ?? lessons[0]
  const currentTask = course.tasks.find(t => t.forLesson === currentLesson.id) ?? null

  const handleComplete = (lId: string) => {
    setLessons(ls => ls.map(l => l.id === lId ? { ...l, completed: true } : l))
  }

  const handleNavigate = (nextId: string) => {
    router.push(`/courses/${id}/lessons/${nextId}`)
  }

  const completedCount = lessons.filter(l => l.completed).length
  const progress = Math.round((completedCount / lessons.length) * 100)

  return (
    <div className="flex h-[calc(100vh-56px)] overflow-hidden">
      {/* Lesson sidebar */}
      <>
        {/* Mobile overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div key="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/60 z-30 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)} />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <AnimatePresence>
          {(sidebarOpen) && (
            <motion.aside
              key="sidebar"
              initial={{ x: -320 }} animate={{ x: 0 }} exit={{ x: -320 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-80 z-40 flex flex-col border-r border-white/8"
              style={{ background: '#080d16' }}>
              <SidebarContent
                course={course} lessons={lessons} currentLesson={currentLesson}
                id={id} progress={progress} completedCount={completedCount}
                onClose={() => setSidebarOpen(false)} />
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Desktop sidebar */}
        <aside className="hidden lg:flex flex-col w-72 xl:w-80 flex-shrink-0 border-r border-white/7 overflow-y-auto"
          style={{ background: 'rgba(7,11,20,0.9)' }}>
          <SidebarContent
            course={course} lessons={lessons} currentLesson={currentLesson}
            id={id} progress={progress} completedCount={completedCount} />
        </aside>
      </>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
          {/* Top bar */}
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all">
              <Menu className="h-5 w-5" />
            </button>
            <Link href={`/courses/${id}`} className="flex items-center gap-2 text-white/40 hover:text-white text-sm transition-colors">
              <ArrowLeft className="h-4 w-4" />{course.title}
            </Link>

            {/* Tab switcher */}
            {currentTask && (
              <div className="ml-auto flex gap-1 p-1 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <button onClick={() => setActiveTab('lesson')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeTab === 'lesson' ? 'bg-blue-600 text-white' : 'text-white/40 hover:text-white'
                  }`}>
                  <Play className="h-3.5 w-3.5" /> Dars
                </button>
                <button onClick={() => setActiveTab('task')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeTab === 'task' ? 'bg-amber-600 text-white' : 'text-white/40 hover:text-white'
                  }`}>
                  <ClipboardList className="h-3.5 w-3.5" /> Topshiriq
                </button>
              </div>
            )}
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'lesson' ? (
              <motion.div key="lesson" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                <LessonPlayer
                  lesson={currentLesson} allLessons={lessons}
                  courseId={id}
                  onComplete={handleComplete} onNavigate={handleNavigate}
                  onGoToTask={currentTask ? () => setActiveTab('task') : undefined}
                />
              </motion.div>
            ) : currentTask ? (
              <motion.div key="task" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                <TaskSubmission
                  taskId={currentTask.id} taskTitle={currentTask.title}
                  taskDescription={currentTask.description} deadline={currentTask.deadline}
                  fileRequirements={currentTask.fileRequirements} maxGrade={currentTask.maxGrade}
                  history={currentTask.history}
                />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

/* ─── Sidebar inner component ─── */
function SidebarContent({ course, lessons, currentLesson, id, progress, completedCount, onClose }: {
  course: typeof COURSES_DATA[string]
  lessons: Lesson[]
  currentLesson: Lesson
  id: string
  progress: number
  completedCount: number
  onClose?: () => void
}) {
  const router = useRouter()

  return (
    <>
      {/* Header */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{course.emoji}</span>
            <p className="text-white font-semibold text-sm leading-tight line-clamp-2">{course.title}</p>
          </div>
          {onClose && (
            <button onClick={onClose} className="text-white/30 hover:text-white flex-shrink-0 ml-2">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex justify-between mb-1.5">
          <span className="text-white/40 text-xs">{completedCount}/{lessons.length} dars</span>
          <span className="text-blue-400 text-xs font-semibold">{progress}%</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all"
            style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Lessons list */}
      <div className="flex-1 overflow-y-auto p-2">
        <p className="text-white/30 text-xs font-medium px-3 py-2">O&apos;quv dasturi</p>
        <div className="space-y-0.5">
          {lessons.map(lesson => {
            const isActive = lesson.id === currentLesson.id
            return (
              <button key={lesson.id}
                onClick={() => {
                  router.push(`/courses/${id}/lessons/${lesson.id}`)
                  onClose?.()
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                  isActive
                    ? 'bg-blue-600/20 border border-blue-500/30'
                    : 'hover:bg-white/4'
                }`}>
                <div className={`h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  lesson.completed
                    ? 'bg-emerald-500/20'
                    : isActive
                    ? 'bg-blue-500/25'
                    : 'bg-white/5'
                }`}>
                  {lesson.completed ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  ) : isActive ? (
                    <Play className="h-3.5 w-3.5 text-blue-400" />
                  ) : (
                    <BookOpen className="h-3 w-3 text-white/25" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-medium leading-snug truncate ${
                    isActive ? 'text-blue-300' : lesson.completed ? 'text-white/60' : 'text-white/50'
                  }`}>
                    {lesson.order}. {lesson.title}
                  </p>
                  <p className="text-white/20 text-[10px] mt-0.5">{lesson.duration}</p>
                </div>
                {isActive && <ChevronRight className="h-3 w-3 text-blue-400/60 flex-shrink-0" />}
              </button>
            )
          })}
        </div>
      </div>

      {/* Back to courses */}
      <div className="p-3 border-t border-white/5">
        <Link href="/courses">
          <button className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium text-white/30 hover:text-white hover:bg-white/5 transition-all">
            <ArrowLeft className="h-3.5 w-3.5" /> Kurslarga qaytish
          </button>
        </Link>
      </div>
    </>
  )
}
