'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from 'next-themes'
import { ChevronLeft, ChevronRight, Star, Trophy, Flame, Target, Crown, Medal } from 'lucide-react'

const STORIES = [
  {
    initials: 'DN',
    name: 'Dilshod Nazarov',
    city: 'Toshkent',
    age: 24,
    badge: 'Top Rated',
    income: '$2,400',
    jobs: 47,
    rating: 5.0,
    platform: 'Upwork',
    quote: "FreelancerSchool menga copywriting va SMM ko'nikmalarini bepul o'rgatdi. 6 oyda birinchi Top Rated statusini oldim va endi barqaror daromad topaman.",
    color: 'from-blue-600 to-blue-800',
    avatarColor: 'bg-blue-600',
  },
  {
    initials: 'ZK',
    name: 'Zilola Karimova',
    city: 'Samarqand',
    age: 21,
    badge: 'Rising Talent',
    income: '$1,800',
    jobs: 31,
    rating: 4.9,
    platform: 'Fiverr',
    quote: "Web dizayn kursini tugatgach, Fiverr'da profil ochdim. Birinchi 3 oyda 31 ta buyurtma oldim. Hamma narsa bepul o'rganildi!",
    color: 'from-purple-600 to-purple-800',
    avatarColor: 'bg-purple-600',
  },
  {
    initials: 'JT',
    name: 'Jasur Toshmatov',
    city: "Andijon",
    age: 19,
    badge: 'Level 2 Seller',
    income: '$950',
    jobs: 18,
    rating: 4.8,
    platform: 'Fiverr',
    quote: "O'rta maktabni endigina tugatgandim. Endi logo va banner dizayn qilib oyiga $950 ishlayman. Barchasi shu platformadan boshlandi.",
    color: 'from-emerald-600 to-emerald-800',
    avatarColor: 'bg-emerald-600',
  },
  {
    initials: 'AM',
    name: 'Aziz Muhammad',
    city: 'Buxoro',
    age: 26,
    badge: 'Top Rated',
    income: '$3,200',
    jobs: 62,
    rating: 5.0,
    platform: 'Upwork',
    quote: "Full-stack dasturlash kursini o'rgandim. Endi React va Node.js da loyihalar qilib, oyiga $3,200 topaman. Bepul o'rganish men's uchun juda muhim edi.",
    color: 'from-amber-600 to-amber-800',
    avatarColor: 'bg-amber-600',
  },
]

const TOP_PERFORMERS = [
  { name: 'Dilshod N.', xp: 24500, streak: 45, tasks: 127 },
  { name: 'Zilola K.', xp: 23800, streak: 38, tasks: 112 },
  { name: 'Aziz M.', xp: 22100, streak: 52, tasks: 98 },
  { name: 'Jasur T.', xp: 19800, streak: 29, tasks: 87 },
  { name: 'Sevara A.', xp: 18400, streak: 34, tasks: 76 },
]

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Crown className="h-4 w-4 text-amber-400" />
  if (rank === 2) return <Medal className="h-4 w-4 text-slate-400" />
  if (rank === 3) return <Medal className="h-4 w-4 text-amber-700" />
  return <span className="text-sm font-mono w-4 text-center">{rank}</span>
}

export default function StoriesLeaderboard() {
  const [index, setIndex] = useState(0)
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const story = STORIES[index]

  const prev = () => setIndex(i => (i - 1 + STORIES.length) % STORIES.length)
  const next = () => setIndex(i => (i + 1) % STORIES.length)

  return (
    <section id="leaderboard" className={`relative py-20 ${isDark ? '' : 'bg-gray-50/50'}`}>
      {/* BG orb */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-3xl pointer-events-none ${
        isDark ? 'bg-blue-900/8' : 'bg-blue-500/[0.03]'
      }`} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className={`text-sm font-medium uppercase tracking-widest mb-2 ${
            isDark ? 'text-white/40' : 'text-gray-500'
          }`}>Natijalar</p>
          <h2 className={`text-3xl sm:text-4xl font-bold ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            <span className="gradient-text">Muvaffaqiyat</span> tarihlari
          </h2>
        </motion.div>

        {/* Stories Carousel */}
        <div className="mb-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.35 }}
              className={`rounded-3xl p-7 h-full ${
                isDark
                  ? 'glass'
                  : 'bg-white border border-gray-200 shadow-lg'
              }`}
            >
              {/* Platform badge */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`${story.avatarColor} h-14 w-14 rounded-2xl flex items-center justify-center text-xl font-bold text-white shadow-lg`}>
                    {story.initials}
                  </div>
                  <div>
                    <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{story.name}</p>
                    <p className={`text-sm ${isDark ? 'text-white/40' : 'text-gray-500'}`}>{story.city} · {story.age} yosh</p>
                  </div>
                </div>
                <div className={`rounded-xl px-3 py-1.5 text-center ${
                  isDark ? 'glass-dark' : 'bg-gray-50 border border-gray-200'
                }`}>
                  <p className={`text-xs ${isDark ? 'text-white/50' : 'text-gray-500'}`}>{story.platform}</p>
                  <p className="text-amber-500 text-xs font-semibold">{story.badge}</p>
                </div>
              </div>

              {/* Quote */}
              <p className={`text-sm leading-relaxed italic mb-6 ${
                isDark ? 'text-white/70' : 'text-gray-600'
              }`}>
                &ldquo;{story.quote}&rdquo;
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className={`rounded-2xl p-3 text-center ${
                  isDark ? 'glass-dark' : 'bg-gray-50 border border-gray-100'
                }`}>
                  <p className="text-emerald-600 font-bold text-base">{story.income}</p>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>Oyda</p>
                </div>
                <div className={`rounded-2xl p-3 text-center ${
                  isDark ? 'glass-dark' : 'bg-gray-50 border border-gray-100'
                }`}>
                  <p className="text-blue-600 font-bold text-base">{story.jobs}</p>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>Ish</p>
                </div>
                <div className={`rounded-2xl p-3 text-center ${
                  isDark ? 'glass-dark' : 'bg-gray-50 border border-gray-100'
                }`}>
                  <div className="flex items-center justify-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-amber-500 font-bold text-base">{story.rating}</span>
                  </div>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>Reyting</p>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {STORIES.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setIndex(i)}
                      className={`h-2 rounded-full transition-all ${
                        i === index
                          ? isDark ? 'w-8 bg-blue-500' : 'w-8 bg-blue-600'
                          : isDark ? 'w-2 bg-white/20' : 'w-2 bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={prev}
                    className={`p-2 rounded-lg transition-colors ${
                      isDark
                        ? 'text-white/40 hover:text-white hover:bg-white/10'
                        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={next}
                    className={`p-2 rounded-lg transition-colors ${
                      isDark
                        ? 'text-white/40 hover:text-white hover:bg-white/10'
                        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Top Performers */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* XP Leaderboard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`rounded-3xl p-6 ${
              isDark
                ? 'glass'
                : 'bg-white border border-gray-200 shadow-sm'
            }`}
          >
            <div className="flex items-center gap-2 mb-6">
              <Trophy className={`h-5 w-5 ${isDark ? 'text-amber-400' : 'text-amber-500'}`} />
              <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>XP Reyting</h3>
            </div>
            <div className="space-y-3">
              {TOP_PERFORMERS.map((p, i) => (
                <div
                  key={p.name}
                  className={`flex items-center gap-4 p-3 rounded-xl ${
                    isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'
                  }`}
                >
                  <RankIcon rank={i + 1} />
                  <div className="flex-1">
                    <p className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{p.name}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{p.xp.toLocaleString()}</p>
                    <p className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-500'}`}>XP</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Streak Leaderboard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className={`rounded-3xl p-6 ${
              isDark
                ? 'glass'
                : 'bg-white border border-gray-200 shadow-sm'
            }`}
          >
            <div className="flex items-center gap-2 mb-6">
              <Flame className="h-5 w-5 text-orange-500" />
              <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Streak Liderlari</h3>
            </div>
            <div className="space-y-3">
              {[...TOP_PERFORMERS].sort((a, b) => b.streak - a.streak).map((p, i) => (
                <div
                  key={p.name}
                  className={`flex items-center gap-4 p-3 rounded-xl ${
                    isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold ${
                    i === 0 ? 'bg-orange-500 text-white' :
                    i === 1 ? 'bg-orange-400 text-white' :
                    i === 2 ? 'bg-orange-300 text-white' :
                    isDark ? 'bg-white/10 text-white/40' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{p.name}</p>
                  </div>
                  <div className="flex items-center gap-1 text-right">
                    <Flame className={`h-4 w-4 ${isDark ? 'text-orange-400' : 'text-orange-500'}`} />
                    <p className={`font-bold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{p.streak}</p>
                    <span className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-500'}`}>kun</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}