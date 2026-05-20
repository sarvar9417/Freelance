'use client'

/* ── Supabase SQL (ixtiyoriy) ──────────────────────────────────────────────
CREATE TABLE user_goals (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal       text NOT NULL,
  deadline   date,
  completed  boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Faqat o'z maqsadlari" ON user_goals
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
────────────────────────────────────────────────────────────────────────── */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMountedTheme } from '@/hooks/useTheme'
import {
  Target, Trophy, Play, CheckCircle2, Plus,
  Loader2, Calendar, Flame, Award, Send, Trash2,
} from 'lucide-react'
import DailyQuote from '@/components/motivation/DailyQuote'
import SuccessStories from '@/components/motivation/SuccessStories'
import { createClient } from '@/lib/supabase/client'

interface LeaderboardEntry {
  rank: number
  user_id: string
  full_name: string
  total_xp: number
  current_level: number
  streak: number
  achievement: string
}

const XP_ACHIEVEMENTS = [
  { min: 5000, title: 'Freelance ustasi', emoji: '🏆' },
  { min: 3000, title: 'Loyiha yulduzi', emoji: '⭐' },
  { min: 1500, title: 'Kurs bitiruvchi', emoji: '🎓' },
  { min: 500, title: 'Yangi yulduz', emoji: '🌱' },
  { min: 0, title: 'Boshlovchi', emoji: '💪' },
]

function getAchievement(xp: number) {
  return XP_ACHIEVEMENTS.find(a => xp >= a.min) ?? XP_ACHIEVEMENTS[XP_ACHIEVEMENTS.length - 1]
}

function getLevelBadge(level: number) {
  if (level >= 20) return '🥇'
  if (level >= 10) return '🥈'
  if (level >= 5) return '🥉'
  return level <= 1 ? '🌱' : '⭐'
}

/* ── Motivatsion videolar ── */
const VIDEOS = [
  {
    id: 1,
    title: 'Fiverr da 0 dan $1000 ga: Haqiqiy yo\'l xaritasi',
    channel: 'FreelancerSchool',
    duration: '18:32',
    views: '12.4K',
    category: 'Fiverr',
    color: 'from-emerald-600 to-emerald-800',
    emoji: '💰',
    youtubeId: 'BGHhOGagI7Q',
  },
  {
    id: 2,
    title: 'Upwork profil yaratish — Ekspert maslahatlar',
    channel: 'FreelancerSchool',
    duration: '24:15',
    views: '8.7K',
    category: 'Upwork',
    color: 'from-blue-600 to-blue-800',
    emoji: '🚀',
    youtubeId: 'VyocT99c2VI',
  },
  {
    id: 3,
    title: 'Portfolio qanday qilish kerak? 7 ta asosiy qoida',
    channel: 'FreelancerSchool',
    duration: '15:48',
    views: '21.2K',
    category: 'Portfolio',
    color: 'from-purple-600 to-purple-800',
    emoji: '🎨',
    youtubeId: '6zxJvxs-LNw',
  },
  {
    id: 4,
    title: 'Mijoz bilan birinchi muloqot — nima deysiz?',
    channel: 'FreelancerSchool',
    duration: '11:20',
    views: '6.9K',
    category: 'Muloqot',
    color: 'from-rose-600 to-rose-800',
    emoji: '🤝',
    youtubeId: 'aLMCdZowCQo',
  },
  {
    id: 5,
    title: 'Narx belgilash: Arzon bo\'lmang!',
    channel: 'FreelancerSchool',
    duration: '9:55',
    views: '15.3K',
    category: 'Biznes',
    color: 'from-amber-600 to-amber-800',
    emoji: '📊',
    youtubeId: 'ESl-1vI8nfs',
  },
  {
    id: 6,
    title: 'Ingliz tilisiz freelancing mumkinmi?',
    channel: 'FreelancerSchool',
    duration: '13:40',
    views: '19.8K',
    category: 'Til',
    color: 'from-cyan-600 to-cyan-800',
    emoji: '🌍',
    youtubeId: 'BGHhOGagI7Q',
  },
]

interface Goal {
  id: string
  goal: string
  deadline: string | null
  completed: boolean
  created_at: string
}

const AVATAR_GRADIENTS = [
  'from-blue-500 to-blue-700',
  'from-purple-500 to-purple-700',
  'from-emerald-500 to-emerald-700',
  'from-rose-500 to-rose-700',
  'from-amber-500 to-amber-700',
]

/* ── Frilanserlik bilimdon — Didaktik oʻyin ── */
const QUIZ_QUESTIONS = [
  {
    question: 'Frilanserlikda eng katta platforma?',
    options: ['Upwork', 'Freelancer', 'Fiverr'],
    correct: 0,
  },
  {
    question: 'Mijoz bilan birinchi muloqotda nima qilish kerak?',
    options: ['Darhol narx aytish', 'Aniq savol berish', 'Portfolio yuborish'],
    correct: 1,
  },
  {
    question: "Portfolio'da nechta ish bo'lishi kerak?",
    options: ['1-2 ta', '3-5 ta', '10+ ta'],
    correct: 1,
  },
  {
    question: "Fiverr'da yangi boshlovchi qancha narx qo'yishi mumkin?",
    options: ['$5-25', '$50-100', '$200+'],
    correct: 0,
  },
  {
    question: "Mijozni jalb qilishning eng yaxshi usuli?",
    options: ["Ko'p taklif yuborish", "Sifatli taklif yozish", "Arzon narx qo'yish"],
    correct: 1,
  },
]

function DidacticGame({ isDark }: { isDark: boolean }) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)
  const [score, setScore] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [finished, setFinished] = useState(false)

  const reset = () => {
    setStep(0)
    setScore(0)
    setSelected(null)
    setShowResult(false)
    setFinished(false)
  }

  const handleAnswer = (idx: number) => {
    if (selected !== null) return
    setSelected(idx)
    if (idx === QUIZ_QUESTIONS[step].correct) setScore(s => s + 1)
    setTimeout(() => {
      if (step < QUIZ_QUESTIONS.length - 1) {
        setStep(s => s + 1)
        setSelected(null)
      } else {
        setShowResult(true)
        setFinished(true)
      }
    }, 800)
  }

  const progress = ((step + (showResult ? 1 : 0)) / QUIZ_QUESTIONS.length) * 100

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`h-8 w-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg`}>
            <span className="text-sm">🧠</span>
          </div>
          <div>
            <h2 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>Frilanserlik bilimdon</h2>
            <p className={`text-sm ${isDark ? 'text-white/35' : 'text-gray-500'}`}>
              {finished ? `${score}/${QUIZ_QUESTIONS.length} to'g'ri` : 'Bilimingizni sinang'}
            </p>
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => { setOpen(!open); if (!open) reset() }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 transition-all shadow-lg shadow-emerald-900/30"
        >
          {open ? 'Yopish' : 'O\'ynash'}
          <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3 }}>
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </motion.div>
        </motion.button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="overflow-hidden rounded-2xl"
            style={isDark ? { border: '1px solid rgba(255,255,255,0.07)' } : { border: '1px solid #e5e7eb' }}
          >
            <div className={`p-6 ${isDark ? '' : 'bg-white'}`}>
              {!finished ? (
                <div className="space-y-6">
                  {/* Progress bar */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={isDark ? { background: 'rgba(255,255,255,0.07)' } : { background: '#e5e7eb' }}>
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                    <span className={`text-xs font-semibold tabular-nums flex-shrink-0 ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
                      {step + 1}/{QUIZ_QUESTIONS.length}
                    </span>
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={step}
                      initial={{ opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -24 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      <p className={`text-base font-semibold leading-relaxed ${isDark ? 'text-white/85' : 'text-gray-800'}`}>
                        {QUIZ_QUESTIONS[step].question}
                      </p>

                      <div className="grid gap-2.5">
                        {QUIZ_QUESTIONS[step].options.map((opt, idx) => {
                          let borderColor = ''
                          let bgColor = ''
                          if (selected === idx) {
                            if (idx === QUIZ_QUESTIONS[step].correct) {
                              borderColor = isDark ? 'border-emerald-500/50' : 'border-emerald-500'
                              bgColor = isDark ? 'rgba(16,185,129,0.1)' : '#ecfdf5'
                            } else {
                              borderColor = isDark ? 'border-rose-500/50' : 'border-rose-500'
                              bgColor = isDark ? 'rgba(244,63,94,0.1)' : '#fef2f2'
                            }
                          } else if (selected !== null && idx === QUIZ_QUESTIONS[step].correct) {
                            borderColor = isDark ? 'border-emerald-500/50' : 'border-emerald-500'
                            bgColor = isDark ? 'rgba(16,185,129,0.08)' : '#f0fdf4'
                          }

                          return (
                            <motion.button
                              key={idx}
                              whileHover={selected === null ? { scale: 1.01 } : {}}
                              whileTap={selected === null ? { scale: 0.99 } : {}}
                              onClick={() => handleAnswer(idx)}
                              disabled={selected !== null}
                              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                selected !== null ? 'cursor-default' : 'cursor-pointer'
                              } ${isDark ? 'text-white/80' : 'text-gray-700'}`}
                              style={{
                                background: bgColor || (isDark ? 'rgba(255,255,255,0.04)' : '#f9fafb'),
                                border: `1px solid ${borderColor || (isDark ? 'rgba(255,255,255,0.08)' : '#e5e7eb')}`,
                              }}
                            >
                              <div className="flex items-center gap-3">
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                                  selected !== null && idx === QUIZ_QUESTIONS[step].correct
                                    ? 'bg-emerald-500 text-white'
                                    : selected === idx
                                    ? 'bg-rose-500 text-white'
                                    : isDark
                                    ? 'bg-white/10 text-white/40'
                                    : 'bg-gray-200 text-gray-500'
                                }`}>
                                  {selected !== null && idx === QUIZ_QUESTIONS[step].correct
                                    ? '✓'
                                    : selected === idx
                                    ? '✗'
                                    : String.fromCharCode(65 + idx)}
                                </span>
                                {opt}
                              </div>
                            </motion.button>
                          )
                        })}
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-6 space-y-4"
                >
                  <span className="text-5xl block">
                    {score === QUIZ_QUESTIONS.length ? '🏆' : score >= 3 ? '👏' : '💪'}
                  </span>
                  <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {score === QUIZ_QUESTIONS.length
                      ? "Mukammal! Siz frilanserlik bo'yicha ekspertsiz!"
                      : score >= 3
                      ? "Yaxshi! Yana bir oz o'rganish kerak"
                      : "Qayta urinib ko'ring!"}
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                    {score}/{QUIZ_QUESTIONS.length} ta to&apos;g&apos;ri javob
                  </p>
                  <div className="flex justify-center gap-1.5">
                    {Array.from({ length: QUIZ_QUESTIONS.length }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                          i < score
                            ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'
                            : isDark
                            ? 'bg-white/5 text-white/20 border border-white/10'
                            : 'bg-gray-100 text-gray-300 border border-gray-200'
                        }`}
                      >
                        {i < score ? '✓' : i + 1}
                      </div>
                    ))}
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={reset}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 transition-all shadow-lg shadow-emerald-900/30"
                  >
                    Qayta o&apos;ynash
                  </motion.button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

export default function MotivationPage() {
  const { isDark } = useMountedTheme()

  const [goals, setGoals]         = useState<Goal[]>([])
  const [newGoal, setNewGoal]     = useState('')
  const [deadline, setDeadline]   = useState('')
  const [goalLoading, setGoalLoading] = useState(false)
  const [goalsFetched, setGoalsFetched] = useState(false)
  const [userId, setUserId]       = useState<string | null>(null)
  const [playingId, setPlayingId] = useState<number | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])

  /* ── Foydalanuvchi & maqsadlarni yuklash ── */
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return
      setUserId(data.user.id)
      const { data: g } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', data.user.id)
        .order('created_at', { ascending: false })
      setGoals(g ?? [])
      setGoalsFetched(true)

      const { data: lb } = await supabase
        .from('user_xp')
        .select('user_id, total_xp, current_level, users!inner(full_name, avatar_url)')
        .order('total_xp', { ascending: false })
        .limit(10)

      if (lb) {
        const mapped: LeaderboardEntry[] = lb.map((row: { user_id: string; total_xp: number; current_level: number; users: { full_name: string }[] }, idx: number) => {
          const ach = getAchievement(row.total_xp)
          const user = row.users?.[0]
          return {
            rank: idx + 1,
            user_id: row.user_id,
            full_name: user?.full_name ?? 'Foydalanuvchi',
            total_xp: row.total_xp,
            current_level: row.current_level,
            streak: Math.min(Math.floor(row.total_xp / 100), 365),
            achievement: ach.title,
          }
        })
        setLeaderboard(mapped)
      }
    })
  }, [])

  /* ── Maqsad qo'shish ── */
  const addGoal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newGoal.trim() || !userId) return
    setGoalLoading(true)
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from('user_goals')
        .insert({ user_id: userId, goal: newGoal.trim(), deadline: deadline || null })
        .select()
        .single()
      if (data) setGoals(prev => [data, ...prev])
      setNewGoal(''); setDeadline('')
    } catch { /* silently */ }
    finally { setGoalLoading(false) }
  }

  /* ── Maqsad bajarildi ── */
  const toggleGoal = async (goal: Goal) => {
    const supabase = createClient()
    await supabase.from('user_goals').update({ completed: !goal.completed }).eq('id', goal.id)
    setGoals(prev => prev.map(g => g.id === goal.id ? { ...g, completed: !g.completed } : g))
  }

  /* ── Maqsad o'chirish ── */
  const deleteGoal = async (id: string) => {
    const supabase = createClient()
    await supabase.from('user_goals').delete().eq('id', id)
    setGoals(prev => prev.filter(g => g.id !== id))
  }

  const completedCount = goals.filter(g => g.completed).length

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">

      {/* ── Hero ── */}
      <div className="text-center space-y-3">
        <motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className={`inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full ${isDark ? 'text-amber-400' : 'text-amber-600'}`}
          style={isDark ? { background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' } : { background: '#fef3c7', border: '1px solid #fcd34d' }}
        >
          <Flame className="h-4 w-4" /> Motivatsiya markazi
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className={`text-3xl sm:text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
        >
          Muvaffaqiyat — odatdan boshlanadi
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className={`max-w-xl mx-auto text-sm leading-relaxed ${isDark ? 'text-white/40' : 'text-gray-500'}`}
        >
          Har kuni ilhom oling, maqsad belgilang va eng yaxshi o&apos;quvchilar bilan raqobatlashing.
        </motion.p>
      </div>

      {/* ── Kunlik iqtibos ── */}
      <section>
        <DailyQuote />
      </section>

      {/* ── Haftaning eng yaxshi o'quvchisi ── */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg">
            <Award className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>Haftaning eng yaxshi o&apos;quvchisi</h2>
            <p className={`text-sm ${isDark ? 'text-white/35' : 'text-gray-500'}`}>XP — tajriba ballari asosida</p>
          </div>
        </div>

        <div
          className="rounded-2xl overflow-hidden"
          style={isDark ? { border: '1px solid rgba(255,255,255,0.07)' } : { border: '1px solid #e5e7eb' }}
        >
          {leaderboard.length === 0 ? (
            <div className={`px-5 py-8 text-center ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
              <p className="text-sm">Reyting yuklanmoqda...</p>
            </div>
          ) : (
            leaderboard.map((s, i) => {
              const initials = s.full_name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
              const gradColor = AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length]
              const isTop3 = i < 3
              const badge = getLevelBadge(s.current_level)

              return (
                <motion.div
                  key={s.rank}
                  initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07, duration: 0.3 }}
                  className={`flex items-center gap-4 px-5 py-4 transition-colors ${isDark ? (i < leaderboard.length - 1 ? 'border-b border-white/5' : '') : (i < leaderboard.length - 1 ? 'border-b border-gray-100' : '')} ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}
                  style={i === 0 ? (isDark ? { background: 'rgba(245,158,11,0.06)' } : { background: '#fefce8' }) : {}}
                >
                  <div className="relative w-7 text-center flex-shrink-0">
                    {isTop3 ? (
                      <span className="text-xl">{['🥇', '🥈', '🥉'][i]}</span>
                    ) : (
                      <span className={`text-xs font-bold ${isDark ? 'text-white/30' : 'text-gray-400'}`}>{s.rank}</span>
                    )}
                  </div>

                  <div className={`h-9 w-9 rounded-xl bg-gradient-to-br ${gradColor} flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-md`}>
                    {initials}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${isDark ? 'text-white/85' : 'text-gray-800'}`}>{s.full_name}</p>
                    <p className={`text-[10px] ${isDark ? 'text-white/30' : 'text-gray-400'}`}>{badge} {s.achievement}</p>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className={`flex items-center gap-1 text-xs ${isDark ? 'text-amber-400/70' : 'text-amber-600'}`}>
                      <Flame className="h-3 w-3" />
                      <span>{s.streak} kun</span>
                    </div>
                    <div className={`font-bold text-sm tabular-nums ${isTop3 ? (isDark ? 'text-amber-400' : 'text-amber-600') : (isDark ? 'text-white/50' : 'text-gray-400')}`}>
                      {s.total_xp.toLocaleString()} XP
                    </div>
                  </div>
                </motion.div>
              )
            })
          )}
        </div>
      </section>

      {/* ── Motivatsion videolar ── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center shadow-lg">
              <Play className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>Motivatsion video darslar</h2>
              <p className={`text-sm ${isDark ? 'text-white/35' : 'text-gray-500'}`}>Freelancing haqida eng yaxshi videolar</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {VIDEOS.map((v, i) => (
            <motion.div
              key={v.id}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.35 }}
              className={`rounded-2xl overflow-hidden group cursor-pointer hover:translate-y-[-2px] transition-transform ${isDark ? '' : 'bg-white'}`}
              style={isDark ? { border: '1px solid rgba(255,255,255,0.07)' } : { border: '1px solid #e5e7eb' }}
              onClick={() => setPlayingId(playingId === v.id ? null : v.id)}
            >
              {/* Thumbnail */}
              <div className={`h-36 bg-gradient-to-br ${v.color} relative flex items-center justify-center`}>
                <span className="text-4xl">{v.emoji}</span>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                    <Play className="h-5 w-5 text-white fill-white ml-0.5" />
                  </div>
                </div>
                <span
                  className="absolute bottom-2 right-2 text-[10px] font-bold text-white px-2 py-0.5 rounded-md"
                  style={{ background: 'rgba(0,0,0,0.6)' }}
                >
                  {v.duration}
                </span>
                <span
                  className="absolute top-2 left-2 text-[10px] font-semibold text-white px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(0,0,0,0.4)' }}
                >
                  {v.category}
                </span>
              </div>

              {/* Meta */}
              <div className={`p-4 ${isDark ? '' : 'bg-gray-50'}`}>
                <h3 className={`text-sm font-semibold leading-snug mb-2 transition-colors ${isDark ? 'text-white/85 group-hover:text-white' : 'text-gray-800 group-hover:text-gray-900'}`}>
                  {v.title}
                </h3>
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] ${isDark ? 'text-white/30' : 'text-gray-400'}`}>{v.channel}</span>
                  <span className={`text-[10px] ${isDark ? 'text-white/25' : 'text-gray-400'}`}>{v.views} ko&apos;rish</span>
                </div>
              </div>

              {/* YouTube player */}
              <AnimatePresence>
                {playingId === v.id && v.youtubeId && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                      <iframe
                        src={`https://www.youtube.com/embed/${v.youtubeId}?autoplay=1`}
                        title={v.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="absolute inset-0 w-full h-full"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Muvaffaqiyat hikoyalari ── */}
      <section>
        <SuccessStories />
      </section>

      {/* ── Maqsad belgilash ── */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg">
            <Target className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>Maqsad belgilash</h2>
            <p className={`text-sm ${isDark ? 'text-white/35' : 'text-gray-500'}`}>
              {userId
                ? goals.length > 0
                  ? `${completedCount}/${goals.length} ta maqsad bajarildi`
                  : 'O\'z maqsadingizni yozing'
                : 'Maqsad belgilash uchun kiring'
              }
            </p>
          </div>
        </div>

        {userId ? (
          <div
            className="rounded-2xl p-6 space-y-5"
            style={isDark ? { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' } : { background: 'white', border: '1px solid #e5e7eb' }}
          >
            {/* Forma */}
            <form onSubmit={addGoal} className="space-y-3">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newGoal}
                  onChange={e => setNewGoal(e.target.value)}
                  placeholder="Maqsadingizni yozing... (masalan: Fiverr da 5 ⭐ olish)"
                  className={`flex-1 px-4 py-2.5 rounded-xl text-sm outline-none focus:ring-1 focus:ring-blue-500/40 ${isDark ? 'text-white placeholder:text-white/20' : 'text-gray-900 placeholder:text-gray-400'}`}
                  style={isDark ? { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' } : { background: '#f9fafb', border: '1px solid #e5e7eb' }}
                />
                <button
                  type="submit"
                  disabled={!newGoal.trim() || goalLoading}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex-shrink-0"
                >
                  {goalLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4" /> <span className="hidden sm:inline">Qo&apos;shish</span></>}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className={`h-3.5 w-3.5 ${isDark ? 'text-white/25' : 'text-gray-400'}`} />
                <input
                  type="date"
                  value={deadline}
                  onChange={e => setDeadline(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className={`px-3 py-1.5 rounded-lg text-xs outline-none ${isDark ? 'text-white/60' : 'text-gray-700'}`}
                  style={isDark ? { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' } : { background: '#f9fafb', border: '1px solid #e5e7eb' }}
                />
                <span className={`text-xs ${isDark ? 'text-white/25' : 'text-gray-400'}`}>Muddati (ixtiyoriy)</span>
              </div>
            </form>

            {/* Maqsadlar ro'yxati */}
            {goals.length > 0 && (
              <div className="space-y-2">
                <AnimatePresence>
                  {goals.map(goal => (
                    <motion.div
                      key={goal.id}
                      initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}
                      className={`flex items-center gap-3 p-3.5 rounded-xl group transition-all ${
                        goal.completed ? 'opacity-50' : ''
                      }`}
                      style={isDark ? { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' } : { background: '#f9fafb', border: '1px solid #e5e7eb' }}
                    >
                      <button onClick={() => toggleGoal(goal)} className="flex-shrink-0">
                        <CheckCircle2 className={`h-5 w-5 transition-colors ${goal.completed ? 'text-emerald-500' : (isDark ? 'text-white/20 hover:text-emerald-400/60' : 'text-gray-300 hover:text-emerald-500')}`} />
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${goal.completed ? `line-through ${isDark ? 'text-white/30' : 'text-gray-400'}` : (isDark ? 'text-white/80' : 'text-gray-700')}`}>
                          {goal.goal}
                        </p>
                        {goal.deadline && (
                          <p className={`text-[10px] mt-0.5 flex items-center gap-1 ${isDark ? 'text-white/25' : 'text-gray-400'}`}>
                            <Calendar className="h-2.5 w-2.5" />
                            {new Date(goal.deadline).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => deleteGoal(goal.id)}
                        className={`transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0 ${isDark ? 'text-white/15 hover:text-rose-400' : 'text-gray-300 hover:text-red-500'}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Progress */}
                {goals.length > 0 && (
                  <div className="pt-2">
                    <div className={`flex items-center justify-between text-xs mb-1.5 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                      <span>Umumiy progress</span>
                      <span>{completedCount}/{goals.length}</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={isDark ? { background: 'rgba(255,255,255,0.07)' } : { background: '#e5e7eb' }}>
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${goals.length ? (completedCount / goals.length) * 100 : 0}%` }}
                        transition={{ duration: 0.6 }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {goalsFetched && goals.length === 0 && (
              <div className="text-center py-8 rounded-xl" style={isDark ? { background: 'rgba(255,255,255,0.02)', border: '2px dashed rgba(255,255,255,0.07)' } : { background: '#f9fafb', border: '2px dashed #e5e7eb' }}>
                <Target className={`h-8 w-8 mx-auto mb-2 ${isDark ? 'text-white/12' : 'text-gray-300'}`} />
                <p className={`text-sm ${isDark ? 'text-white/30' : 'text-gray-500'}`}>Hali maqsad yo&apos;q</p>
                <p className={`text-xs mt-1 ${isDark ? 'text-white/15' : 'text-gray-400'}`}>Yuqoridagi formadan birinchi maqsadingizni qo&apos;shing</p>
              </div>
            )}
          </div>
        ) : (
          <div
            className="rounded-2xl p-8 text-center"
            style={isDark ? { background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.15)' } : { background: '#eff6ff', border: '1px solid #dbeafe' }}
          >
            <Target className={`h-10 w-10 mx-auto mb-3 ${isDark ? 'text-blue-400/40' : 'text-blue-400/60'}`} />
            <p className={`text-sm mb-4 ${isDark ? 'text-white/50' : 'text-gray-600'}`}>Maqsad belgilash uchun tizimga kiring</p>
            <a href="/login">
              <button className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/30">
                Kirish
              </button>
            </a>
          </div>
        )}
      </section>

      {/* ── Didaktik oʻyin ── */}
      <DidacticGame isDark={isDark} />

      {/* ── Haftalik chaqiruv ── */}
      <motion.section
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
        className="rounded-2xl p-8 text-center relative overflow-hidden"
        style={isDark ? { background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(168,85,247,0.1))', border: '1px solid rgba(99,102,241,0.25)' } : { background: 'linear-gradient(135deg, #eff6ff, #f3e8ff)', border: '1px solid #e0e7ff' }}
      >
        <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none ${isDark ? 'bg-blue-600/8' : 'bg-blue-200/30'}`} />
        <div className={`absolute bottom-0 left-0 w-48 h-48 rounded-full blur-3xl pointer-events-none ${isDark ? 'bg-purple-600/8' : 'bg-purple-200/30'}`} />
        <div className="relative z-10">
          <Trophy className={`h-10 w-10 mx-auto mb-3 ${isDark ? 'text-amber-400' : 'text-amber-500'}`} />
          <h2 className={`font-bold text-xl mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Haftalik chaqiruv</h2>
          <p className={`text-sm max-w-md mx-auto mb-6 ${isDark ? 'text-white/50' : 'text-gray-600'}`}>
            Bu haftani Fiverr / Upwork da kamida 1 ta taklif yuborib yakunlang.
            Kirishning 80%i — harakat qilishda.
          </p>
          <a href="/platforms">
            <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition-all shadow-lg shadow-blue-900/30">
              <Send className="h-4 w-4" />
              Platformalarni ko&apos;rish
            </button>
          </a>
        </div>
      </motion.section>
    </div>
  )
}
