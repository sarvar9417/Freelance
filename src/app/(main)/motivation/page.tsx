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
import {
  Target, Trophy, Play, CheckCircle2, Plus,
  Loader2, Calendar, Flame, Award, Send, Trash2,
} from 'lucide-react'
import DailyQuote from '@/components/motivation/DailyQuote'
import SuccessStories from '@/components/motivation/SuccessStories'
import { createClient } from '@/lib/supabase/client'

/* ── Haftaning eng yaxshi o'quvchisi (mock) ── */
const TOP_STUDENTS = [
  { rank: 1, name: 'Jasur Toshmatov',  xp: 2840, badge: '🥇', streak: 21, achievement: 'Forum yulduzi' },
  { rank: 2, name: 'Malika Yusupova',  xp: 2610, badge: '🥈', streak: 14, achievement: 'Kurs bitiruvchi' },
  { rank: 3, name: 'Bobur Karimov',    xp: 2390, badge: '🥉', streak: 18, achievement: 'Loyiha ustasi' },
  { rank: 4, name: 'Dilnoza Xasanova', xp: 2100, badge: '4️⃣', streak: 9,  achievement: 'Izohlar qiroli' },
  { rank: 5, name: 'Ulugbek Mirzaev',  xp: 1980, badge: '5️⃣', streak: 7,  achievement: 'Yangi yulduz' },
]

/* ── Motivatsion videolar (mock) ── */
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

export default function MotivationPage() {
  const [goals, setGoals]         = useState<Goal[]>([])
  const [newGoal, setNewGoal]     = useState('')
  const [deadline, setDeadline]   = useState('')
  const [goalLoading, setGoalLoading] = useState(false)
  const [goalsFetched, setGoalsFetched] = useState(false)
  const [userId, setUserId]       = useState<string | null>(null)
  const [playingId, setPlayingId] = useState<number | null>(null)

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
          className="inline-flex items-center gap-2 text-amber-400 text-sm font-semibold px-4 py-2 rounded-full"
          style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}
        >
          <Flame className="h-4 w-4" /> Motivatsiya markazi
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="text-3xl sm:text-4xl font-bold text-white"
        >
          Muvaffaqiyat — odatdan boshlanadi
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="text-white/40 max-w-xl mx-auto text-sm leading-relaxed"
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
            <h2 className="text-white font-bold text-lg">Haftaning eng yaxshi o&apos;quvchisi</h2>
            <p className="text-white/35 text-sm">XP — tajriba ballari asosida</p>
          </div>
        </div>

        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: '1px solid rgba(255,255,255,0.07)' }}
        >
          {TOP_STUDENTS.map((s, i) => {
            const initials = s.name.split(' ').map(w => w[0]).join('').toUpperCase()
            const gradColor = AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length]
            const isTop3 = i < 3

            return (
              <motion.div
                key={s.rank}
                initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07, duration: 0.3 }}
                className={`flex items-center gap-4 px-5 py-4 transition-colors hover:bg-white/3 ${
                  i < TOP_STUDENTS.length - 1 ? 'border-b border-white/5' : ''
                } ${isTop3 ? '' : ''}`}
                style={i === 0 ? { background: 'rgba(245,158,11,0.06)' } : {}}
              >
                <span className="text-xl w-7 text-center flex-shrink-0">{s.badge}</span>

                <div className={`h-9 w-9 rounded-xl bg-gradient-to-br ${gradColor} flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-md`}>
                  {initials}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-white/85 text-sm font-semibold truncate">{s.name}</p>
                  <p className="text-white/30 text-[10px]">{s.achievement}</p>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="flex items-center gap-1 text-amber-400/70 text-xs">
                    <Flame className="h-3 w-3" />
                    <span>{s.streak} kun</span>
                  </div>
                  <div className={`font-bold text-sm tabular-nums ${isTop3 ? 'text-amber-400' : 'text-white/50'}`}>
                    {s.xp.toLocaleString()} XP
                  </div>
                </div>
              </motion.div>
            )
          })}
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
              <h2 className="text-white font-bold text-lg">Motivatsion video darslar</h2>
              <p className="text-white/35 text-sm">Freelancing haqida eng yaxshi videolar</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {VIDEOS.map((v, i) => (
            <motion.div
              key={v.id}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.35 }}
              className="rounded-2xl overflow-hidden group cursor-pointer hover:translate-y-[-2px] transition-transform"
              style={{ border: '1px solid rgba(255,255,255,0.07)' }}
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
              <div className="p-4" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <h3 className="text-white/85 text-sm font-semibold leading-snug mb-2 group-hover:text-white transition-colors">
                  {v.title}
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-white/30 text-[10px]">{v.channel}</span>
                  <span className="text-white/25 text-[10px]">{v.views} ko&apos;rish</span>
                </div>
              </div>

              {/* "Tez kunda" placeholder */}
              <AnimatePresence>
                {playingId === v.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-4 pb-4 overflow-hidden"
                    style={{ background: 'rgba(255,255,255,0.03)' }}
                  >
                    <p className="text-white/40 text-xs text-center py-2 border border-white/8 rounded-xl">
                      🎬 Video tez orada qo&apos;shiladi
                    </p>
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
            <h2 className="text-white font-bold text-lg">Maqsad belgilash</h2>
            <p className="text-white/35 text-sm">
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
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            {/* Forma */}
            <form onSubmit={addGoal} className="space-y-3">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newGoal}
                  onChange={e => setNewGoal(e.target.value)}
                  placeholder="Maqsadingizni yozing... (masalan: Fiverr da 5 ⭐ olish)"
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm text-white placeholder:text-white/20 outline-none focus:ring-1 focus:ring-blue-500/40"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
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
                <Calendar className="h-3.5 w-3.5 text-white/25" />
                <input
                  type="date"
                  value={deadline}
                  onChange={e => setDeadline(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="px-3 py-1.5 rounded-lg text-xs text-white/60 outline-none"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                />
                <span className="text-white/25 text-xs">Muddati (ixtiyoriy)</span>
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
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                      <button onClick={() => toggleGoal(goal)} className="flex-shrink-0">
                        <CheckCircle2 className={`h-5 w-5 transition-colors ${goal.completed ? 'text-emerald-400 fill-emerald-400/20' : 'text-white/20 hover:text-emerald-400/60'}`} />
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${goal.completed ? 'line-through text-white/30' : 'text-white/80'}`}>
                          {goal.goal}
                        </p>
                        {goal.deadline && (
                          <p className="text-[10px] text-white/25 mt-0.5 flex items-center gap-1">
                            <Calendar className="h-2.5 w-2.5" />
                            {new Date(goal.deadline).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => deleteGoal(goal.id)}
                        className="text-white/15 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Progress */}
                {goals.length > 0 && (
                  <div className="pt-2">
                    <div className="flex items-center justify-between text-xs text-white/30 mb-1.5">
                      <span>Umumiy progress</span>
                      <span>{completedCount}/{goals.length}</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
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
              <div className="text-center py-8 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '2px dashed rgba(255,255,255,0.07)' }}>
                <Target className="h-8 w-8 text-white/12 mx-auto mb-2" />
                <p className="text-white/30 text-sm">Hali maqsad yo&apos;q</p>
                <p className="text-white/15 text-xs mt-1">Yuqoridagi formadan birinchi maqsadingizni qo&apos;shing</p>
              </div>
            )}
          </div>
        ) : (
          <div
            className="rounded-2xl p-8 text-center"
            style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.15)' }}
          >
            <Target className="h-10 w-10 text-blue-400/40 mx-auto mb-3" />
            <p className="text-white/50 text-sm mb-4">Maqsad belgilash uchun tizimga kiring</p>
            <a href="/login">
              <button className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/30">
                Kirish
              </button>
            </a>
          </div>
        )}
      </section>

      {/* ── Haftalik chaqiruv ── */}
      <motion.section
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
        className="rounded-2xl p-8 text-center relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(168,85,247,0.1))', border: '1px solid rgba(99,102,241,0.25)' }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-600/8 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <Trophy className="h-10 w-10 text-amber-400 mx-auto mb-3" />
          <h2 className="text-white font-bold text-xl mb-2">Haftalik chaqiruv</h2>
          <p className="text-white/50 text-sm max-w-md mx-auto mb-6">
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
