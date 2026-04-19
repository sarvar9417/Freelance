'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Play, CheckCircle2, ChevronLeft, ChevronRight,
  BookOpen, ExternalLink, Volume2,
} from 'lucide-react'

interface Lesson {
  id: string
  order: number
  title: string
  video_url: string
  content: string
  duration: string
  completed: boolean
}

interface Props {
  lesson: Lesson
  allLessons: Lesson[]
  courseId: string
  onComplete: (lessonId: string) => void
  onNavigate: (lessonId: string) => void
  onGoToTask?: () => void
}

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
  return match ? match[1] : null
}

function getVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(\d+)/)
  return match ? match[1] : null
}

export default function LessonPlayer({ lesson, allLessons, onComplete, onNavigate, onGoToTask }: Props) {
  const [completed, setCompleted] = useState(lesson.completed)
  const [completing, setCompleting] = useState(false)
  const [tab, setTab] = useState<'video' | 'text'>('video')

  const currentIndex = allLessons.findIndex(l => l.id === lesson.id)
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null
  const completedCount = allLessons.filter(l => l.completed).length + (completed && !lesson.completed ? 1 : 0)

  const ytId = lesson.video_url ? getYouTubeId(lesson.video_url) : null
  const vimeoId = lesson.video_url ? getVimeoId(lesson.video_url) : null

  const handleComplete = async () => {
    if (completed) return
    setCompleting(true)
    await new Promise(r => setTimeout(r, 600))
    setCompleted(true)
    setCompleting(false)
    onComplete(lesson.id)
  }

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Progress bar top */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(completedCount / allLessons.length) * 100}%` }}
            transition={{ duration: 0.6 }}
          />
        </div>
        <span className="text-white/40 text-xs flex-shrink-0">
          {completedCount}/{allLessons.length} dars
        </span>
      </div>

      {/* Lesson title */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-white/40 text-xs mb-1">{lesson.order}-dars</p>
          <h1 className="text-white font-bold text-xl leading-snug">{lesson.title}</h1>
        </div>
        {completed ? (
          <div className="flex items-center gap-1.5 flex-shrink-0 text-emerald-400 text-sm font-semibold">
            <CheckCircle2 className="h-4 w-4" /> Ko&apos;rildi
          </div>
        ) : (
          <button onClick={handleComplete} disabled={completing}
            className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 transition-all shadow-lg shadow-emerald-900/30">
            {completing ? (
              <span className="h-3.5 w-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
            ) : (
              <CheckCircle2 className="h-3.5 w-3.5" />
            )}
            Bajarildi
          </button>
        )}
      </div>

      {/* Tab switcher */}
      {lesson.video_url && lesson.content && (
        <div className="flex gap-1 p-1 rounded-xl w-fit"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          {(['video', 'text'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t ? 'bg-blue-600 text-white' : 'text-white/40 hover:text-white'
              }`}>
              {t === 'video' ? <><Play className="h-3.5 w-3.5" />Video</> : <><BookOpen className="h-3.5 w-3.5" />Matn</>}
            </button>
          ))}
        </div>
      )}

      {/* Video player */}
      {(tab === 'video' || !lesson.content) && lesson.video_url && (
        <div className="rounded-2xl overflow-hidden bg-black aspect-video w-full"
          style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
          {ytId ? (
            <iframe
              src={`https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={lesson.title}
            />
          ) : vimeoId ? (
            <iframe
              src={`https://player.vimeo.com/video/${vimeoId}?color=3b82f6&title=0&byline=0`}
              className="w-full h-full"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              title={lesson.title}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3">
              <Volume2 className="h-10 w-10 text-white/20" />
              <p className="text-white/30 text-sm">Video yuklashda xato</p>
              <a href={lesson.video_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 text-sm transition-colors">
                <ExternalLink className="h-3.5 w-3.5" /> Tashqi havolada ko&apos;rish
              </a>
            </div>
          )}
        </div>
      )}

      {/* No video placeholder */}
      {!lesson.video_url && (
        <div className="rounded-2xl aspect-video flex flex-col items-center justify-center gap-3"
          style={{ background: 'rgba(255,255,255,0.03)', border: '2px dashed rgba(255,255,255,0.07)' }}>
          <BookOpen className="h-10 w-10 text-white/20" />
          <p className="text-white/30 text-sm">Bu dars uchun video mavjud emas</p>
          <p className="text-white/20 text-xs">Quyida matn formatida o&apos;qing</p>
        </div>
      )}

      {/* Text content */}
      {(tab === 'text' || !lesson.video_url) && lesson.content && (
        <div className="rounded-2xl p-6"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="h-4 w-4 text-blue-400" />
            <h3 className="text-white font-semibold text-sm">Dars matni</h3>
          </div>
          <div className="text-white/60 text-sm leading-relaxed whitespace-pre-line">
            {lesson.content}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={() => prevLesson && onNavigate(prevLesson.id)}
          disabled={!prevLesson}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">
            {prevLesson ? prevLesson.title : 'Oldingi dars'}
          </span>
          <span className="sm:hidden">Oldingi</span>
        </button>

        {onGoToTask && (
          <button onClick={onGoToTask}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
            style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.25)' }}>
            <span className="text-amber-400">📋</span>
            <span className="text-amber-300">Topshiriqqa o&apos;tish</span>
          </button>
        )}

        <button
          onClick={() => nextLesson && onNavigate(nextLesson.id)}
          disabled={!nextLesson}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
        >
          <span className="hidden sm:inline">
            {nextLesson ? nextLesson.title : 'Keyingi dars'}
          </span>
          <span className="sm:hidden">Keyingi</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
