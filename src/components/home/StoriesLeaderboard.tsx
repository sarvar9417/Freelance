'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
    initials: 'NE',
    name: 'Nilufar Ergasheva',
    city: "Farg'ona",
    age: 23,
    badge: 'Top Rated Plus',
    income: '$3,200',
    jobs: 89,
    rating: 5.0,
    platform: 'Upwork',
    quote: "Hozir oyiga $3,200 ishlayman va o'z studiyamni ochmoqchiman. FreelancerSchool mening hayotimni o'zgartirdi.",
    color: 'from-amber-600 to-orange-700',
    avatarColor: 'bg-amber-600',
  },
]

const LEADERBOARD = [
  { rank: 1, name: 'Sarvar M.',   city: 'Toshkent',  xp: 4820, streak: 14 },
  { rank: 2, name: 'Zilola K.',   city: 'Samarqand', xp: 4350, streak: 9  },
  { rank: 3, name: 'Bobur A.',    city: 'Namangan',  xp: 3980, streak: 21 },
  { rank: 4, name: 'Malika T.',   city: 'Buxoro',    xp: 3640, streak: 7  },
  { rank: 5, name: 'Sherzod R.',  city: 'Qarshi',    xp: 3290, streak: 5  },
  { rank: 6, name: 'Feruza N.',   city: 'Toshkent',  xp: 3100, streak: 12 },
  { rank: 7, name: 'Ulugbek H.',  city: 'Jizzax',    xp: 2870, streak: 3  },
  { rank: 8, name: 'Aziza M.',    city: 'Toshkent',  xp: 2640, streak: 8  },
  { rank: 9, name: 'Doniyor K.',  city: 'Nukus',     xp: 2410, streak: 6  },
  { rank: 10, name: "G'anisher O.", city: 'Andijon', xp: 2180, streak: 11 },
]

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Crown className="h-4 w-4 text-amber-400" />
  if (rank === 2) return <Medal className="h-4 w-4 text-slate-400" />
  if (rank === 3) return <Medal className="h-4 w-4 text-amber-700" />
  return <span className="text-white/30 text-sm font-mono w-4 text-center">{rank}</span>
}

export default function StoriesLeaderboard() {
  const [index, setIndex] = useState(0)
  const story = STORIES[index]

  const prev = () => setIndex(i => (i - 1 + STORIES.length) % STORIES.length)
  const next = () => setIndex(i => (i + 1) % STORIES.length)

  return (
    <section id="leaderboard" className="relative py-20">
      {/* BG orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-blue-900/8 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-white/40 text-sm font-medium uppercase tracking-widest mb-2">Natijalar</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            <span className="gradient-text">Muvaffaqiyat</span> tarihlari
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* ── LEFT: Story slider ── */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.35 }}
                className="glass rounded-3xl p-7 h-full"
              >
                {/* Platform badge */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`${story.avatarColor} h-14 w-14 rounded-2xl flex items-center justify-center text-xl font-bold text-white shadow-lg`}>
                      {story.initials}
                    </div>
                    <div>
                      <p className="text-white font-semibold">{story.name}</p>
                      <p className="text-white/40 text-sm">{story.city} · {story.age} yosh</p>
                    </div>
                  </div>
                  <div className="glass-dark rounded-xl px-3 py-1.5 text-center">
                    <p className="text-white/50 text-xs">{story.platform}</p>
                    <p className="text-amber-400 text-xs font-semibold">{story.badge}</p>
                  </div>
                </div>

                {/* Quote */}
                <p className="text-white/70 text-sm leading-relaxed italic mb-6">
                  &ldquo;{story.quote}&rdquo;
                </p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="glass-dark rounded-2xl p-3 text-center">
                    <p className="text-emerald-400 font-bold text-base">{story.income}</p>
                    <p className="text-white/40 text-xs mt-0.5">Oyda</p>
                  </div>
                  <div className="glass-dark rounded-2xl p-3 text-center">
                    <p className="text-blue-400 font-bold text-base">{story.jobs}</p>
                    <p className="text-white/40 text-xs mt-0.5">Ish</p>
                  </div>
                  <div className="glass-dark rounded-2xl p-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-amber-400 font-bold text-base">{story.rating}</span>
                    </div>
                    <p className="text-white/40 text-xs mt-0.5">Reyting</p>
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5">
                    {STORIES.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setIndex(i)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          i === index ? 'bg-blue-500 w-6' : 'bg-white/20 w-1.5 hover:bg-white/40'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={prev}
                      className="glass-dark h-9 w-9 rounded-xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={next}
                      className="glass-dark h-9 w-9 rounded-xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* ── RIGHT: Leaderboard + cards ── */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-4"
          >
            {/* Leaderboard */}
            <div className="glass rounded-3xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="h-4 w-4 text-amber-400" />
                <h3 className="text-white font-semibold text-sm">Bu haftaning yulduzlari</h3>
              </div>

              <div className="space-y-2">
                {LEADERBOARD.map(({ rank, name, city, xp }, i) => (
                  <motion.div
                    key={rank}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.04 }}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors hover:bg-white/5 ${
                      rank <= 3 ? 'bg-white/5' : ''
                    }`}
                  >
                    <div className="w-5 flex items-center justify-center">
                      <RankIcon rank={rank} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${rank <= 3 ? 'text-white' : 'text-white/70'}`}>
                        {name}
                      </p>
                      <p className="text-white/30 text-xs">{city}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs font-bold ${rank === 1 ? 'text-amber-400' : rank === 2 ? 'text-slate-400' : rank === 3 ? 'text-amber-700' : 'text-white/40'}`}>
                        {xp.toLocaleString()} XP
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Bottom row: streak + task */}
            <div className="grid grid-cols-2 gap-4">
              <div className="glass rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Flame className="h-4 w-4 text-orange-400" />
                  <span className="text-white/60 text-xs font-medium">Streak</span>
                </div>
                <p className="text-2xl font-extrabold text-orange-400">🔥 14</p>
                <p className="text-white/40 text-xs mt-1">kunlik streak</p>
                <div className="flex gap-1 mt-3">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full ${i < 6 ? 'bg-orange-500' : 'bg-white/10'}`}
                    />
                  ))}
                </div>
              </div>

              <div className="glass rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-blue-400" />
                  <span className="text-white/60 text-xs font-medium">Bugungi vazifa</span>
                </div>
                <p className="text-white text-xs leading-relaxed mb-3">
                  Upwork profilingizni to&apos;ldiring va birinchi proposal yozing
                </p>
                <div className="inline-flex items-center gap-1 bg-blue-500/20 border border-blue-400/30 rounded-lg px-2.5 py-1">
                  <span className="text-blue-300 text-xs font-bold">+150 XP</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
