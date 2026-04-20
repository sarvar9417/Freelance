'use client'

import { motion } from 'framer-motion'
import { Users, BookOpen, MessageSquare, Activity, TrendingUp } from 'lucide-react'

interface StatCard {
  label: string
  value: number
  icon: React.ElementType
  color: string
  bg: string
  border: string
  change?: string
}

interface DayData {
  date: string
  count: number
}

interface Props {
  usersCount: number
  coursesCount: number
  postsCount: number
  activeToday: number
  registrationChart: DayData[]
}

function StatCardItem({ card, index }: { card: StatCard; index: number }) {
  const Icon = card.icon
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="rounded-2xl p-5 flex items-start gap-4"
      style={{ background: card.bg, border: `1px solid ${card.border}` }}
    >
      <div
        className="p-2.5 rounded-xl flex-shrink-0"
        style={{ background: card.bg, border: `1px solid ${card.border}` }}
      >
        <Icon className={`h-5 w-5 ${card.color}`} />
      </div>
      <div className="min-w-0">
        <p className="text-white/40 text-xs font-medium mb-1">{card.label}</p>
        <p className={`text-3xl font-bold ${card.color}`}>{card.value.toLocaleString()}</p>
        {card.change && (
          <p className="text-white/30 text-xs mt-1 flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-emerald-400" />
            {card.change}
          </p>
        )}
      </div>
    </motion.div>
  )
}

function RegistrationChart({ data }: { data: DayData[] }) {
  const max = Math.max(...data.map(d => d.count), 1)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="rounded-2xl p-5 col-span-full md:col-span-2"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div className="flex items-center gap-2 mb-5">
        <TrendingUp className="h-4 w-4 text-purple-400" />
        <h3 className="text-white text-sm font-semibold">Yangi ro&apos;yxatdan o&apos;tganlar (so&apos;nggi 7 kun)</h3>
      </div>

      <div className="flex items-end gap-2 h-28">
        {data.map((d, i) => {
          const height = max > 0 ? Math.max((d.count / max) * 100, 4) : 4
          return (
            <div key={d.date} className="flex-1 flex flex-col items-center gap-1.5">
              <span className="text-white/40 text-xs">{d.count > 0 ? d.count : ''}</span>
              <motion.div
                className="w-full rounded-t-md"
                style={{
                  background: 'linear-gradient(to top, rgba(139,92,246,0.7), rgba(139,92,246,0.3))',
                  border: '1px solid rgba(139,92,246,0.3)',
                  height: `${height}%`,
                  minHeight: '4px',
                }}
                initial={{ scaleY: 0, originY: 1 }}
                animate={{ scaleY: 1, originY: 1 }}
                transition={{ delay: i * 0.06 + 0.4, duration: 0.5, ease: 'easeOut' }}
              />
              <span className="text-white/30 text-xs">
                {new Date(d.date).toLocaleDateString('uz-UZ', { month: 'short', day: 'numeric' })}
              </span>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}

export default function StatsOverview({ usersCount, coursesCount, postsCount, activeToday, registrationChart }: Props) {
  const cards: StatCard[] = [
    {
      label: 'Jami foydalanuvchilar',
      value: usersCount,
      icon: Users,
      color: 'text-blue-400',
      bg: 'rgba(59,130,246,0.06)',
      border: 'rgba(59,130,246,0.15)',
    },
    {
      label: 'Jami kurslar',
      value: coursesCount,
      icon: BookOpen,
      color: 'text-emerald-400',
      bg: 'rgba(16,185,129,0.06)',
      border: 'rgba(16,185,129,0.15)',
    },
    {
      label: 'Forum postlari',
      value: postsCount,
      icon: MessageSquare,
      color: 'text-amber-400',
      bg: 'rgba(245,158,11,0.06)',
      border: 'rgba(245,158,11,0.15)',
    },
    {
      label: 'Bugun faol',
      value: activeToday,
      icon: Activity,
      color: 'text-purple-400',
      bg: 'rgba(139,92,246,0.06)',
      border: 'rgba(139,92,246,0.15)',
    },
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <StatCardItem key={card.label} card={card} index={i} />
        ))}
      </div>
      <RegistrationChart data={registrationChart} />
    </div>
  )
}
