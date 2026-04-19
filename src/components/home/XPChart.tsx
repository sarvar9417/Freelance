'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Zap, TrendingUp } from 'lucide-react'

const WEEK_DATA = [
  { day: 'Du', xp: 120,  label: '120' },
  { day: 'Se', xp: 280,  label: '280' },
  { day: 'Ch', xp: 180,  label: '180' },
  { day: 'Pa', xp: 390,  label: '390' },
  { day: 'Ju', xp: 220,  label: '220' },
  { day: 'Sh', xp: 450,  label: '450' },
  { day: 'Ya', xp: 310,  label: '310' },
]

const MAX_XP = Math.max(...WEEK_DATA.map(d => d.xp))
const TOTAL_XP = WEEK_DATA.reduce((s, d) => s + d.xp, 0)
const TODAY_IDX = 5 // Shanba

export default function XPChart() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section className="relative py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass rounded-3xl p-8"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-8">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="h-4 w-4 text-amber-400" />
                  <p className="text-white/50 text-sm font-medium">Haftalik faollik</p>
                </div>
                <h3 className="text-white text-xl font-bold">Sizning XP tarixi</h3>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1.5 justify-end mb-1">
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400 text-sm font-semibold">+24%</span>
                </div>
                <p className="text-white/50 text-xs">o&apos;tgan haftadan</p>
              </div>
            </div>

            {/* Total XP */}
            <div className="flex items-center gap-6 mb-8">
              <div>
                <p className="text-3xl font-extrabold text-white">{TOTAL_XP.toLocaleString()}</p>
                <p className="text-white/40 text-xs mt-0.5">Jami XP bu hafta</p>
              </div>
              <div className="h-10 w-px bg-white/10" />
              <div>
                <p className="text-xl font-bold text-amber-400">🏆 Kumush</p>
                <p className="text-white/40 text-xs mt-0.5">Joriy daraja</p>
              </div>
              <div className="h-10 w-px bg-white/10" />
              <div>
                <p className="text-xl font-bold text-blue-400">🔥 14</p>
                <p className="text-white/40 text-xs mt-0.5">Kun streak</p>
              </div>
            </div>

            {/* Bar Chart */}
            <div ref={ref} className="flex items-end gap-3 h-40">
              {WEEK_DATA.map(({ day, xp, label }, i) => {
                const pct = (xp / MAX_XP) * 100
                const isToday = i === TODAY_IDX

                return (
                  <div key={day} className="flex-1 flex flex-col items-center gap-2">
                    {/* XP label on top */}
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={inView ? { opacity: 1 } : {}}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      className={`text-xs font-semibold ${isToday ? 'text-amber-400' : 'text-white/30'}`}
                    >
                      {label}
                    </motion.span>

                    {/* Bar wrapper */}
                    <div className="w-full flex-1 flex items-end">
                      <div className="w-full relative" style={{ height: '100%' }}>
                        {/* Background track */}
                        <div className="absolute inset-0 bg-white/5 rounded-xl" />

                        {/* Filled bar */}
                        <motion.div
                          className={`absolute bottom-0 left-0 right-0 rounded-xl ${
                            isToday
                              ? 'bg-gradient-to-t from-amber-500 to-amber-400 shadow-lg shadow-amber-900/40'
                              : 'bg-gradient-to-t from-blue-600 to-blue-400'
                          }`}
                          initial={{ height: '0%' }}
                          animate={inView ? { height: `${pct}%` } : { height: '0%' }}
                          transition={{ duration: 0.8, delay: 0.2 + i * 0.08, ease: 'easeOut' }}
                        />
                      </div>
                    </div>

                    {/* Day label */}
                    <span className={`text-xs font-medium ${isToday ? 'text-white' : 'text-white/40'}`}>
                      {day}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-5 mt-6 pt-5 border-t border-white/5">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-blue-400" />
                <span className="text-white/40 text-xs">Oddiy kun</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span className="text-white/40 text-xs">Bugun</span>
              </div>
              <div className="ml-auto">
                <span className="text-white/30 text-xs">1 XP = 1 daqiqa o&apos;qish</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
