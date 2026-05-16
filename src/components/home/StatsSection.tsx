'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { useTheme } from 'next-themes'
import { Users, BookOpen, Briefcase, DollarSign } from 'lucide-react'

interface Stat {
  icon: React.ElementType
  prefix: string
  value: number
  suffix: string
  label: string
  sub: string
  color: string
  glowLight: string
  glowDark: string
}

const STATS: Stat[] = [
  {
    icon: Users,
    prefix: '',
    value: 12000,
    suffix: '+',
    label: "Faol o'quvchilar",
    sub: "247 ta o'quvchi hozir o'qiyapti",
    color: 'text-blue-600',
    glowLight: 'bg-blue-50',
    glowDark: 'bg-blue-500/10',
  },
  {
    icon: BookOpen,
    prefix: '',
    value: 24,
    suffix: '+',
    label: 'Mutaxassis kurslar',
    sub: "4 ta yangi kurs qo'shildi",
    color: 'text-purple-600',
    glowLight: 'bg-purple-50',
    glowDark: 'bg-purple-500/10',
  },
  {
    icon: Briefcase,
    prefix: '',
    value: 89,
    suffix: '%',
    label: 'Ish topish darajasi',
    sub: '6 oy ichida birinchi buyurtma',
    color: 'text-emerald-600',
    glowLight: 'bg-emerald-50',
    glowDark: 'bg-emerald-500/10',
  },
  {
    icon: DollarSign,
    prefix: '$',
    value: 1.2,
    suffix: 'M+',
    label: "O'quvchilar daromadi",
    sub: "O'tgan yildan 3x ko'paydi",
    color: 'text-amber-600',
    glowLight: 'bg-amber-50',
    glowDark: 'bg-amber-500/10',
  },
]

function Counter({ value, prefix, suffix }: { value: number; prefix: string; suffix: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    const duration = 2200
    const start = Date.now()
    const isDecimal = value % 1 !== 0

    const tick = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = eased * value
      setCount(isDecimal ? Math.round(current * 10) / 10 : Math.round(current))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [inView, value])

  const display = value % 1 !== 0 ? count.toFixed(1) : count.toLocaleString()

  return (
    <span ref={ref}>
      {prefix}{display}{suffix}
    </span>
  )
}

export default function StatsSection() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <section className={`relative py-20 ${isDark ? '' : 'bg-gray-50/30'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <p className={`text-sm font-medium uppercase tracking-widest mb-2 ${
            isDark ? 'text-white/40' : 'text-gray-500'
          }`}>
            Raqamlarda
          </p>
          <h2 className={`text-3xl sm:text-4xl font-bold ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Nima uchun bizni{' '}
            <span className="gradient-text">tanlashadi?</span>
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {STATS.map(({ icon: Icon, prefix, value, suffix, label, sub, color, glowLight, glowDark }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className={`rounded-3xl p-6 group cursor-default ${
                isDark
                  ? 'glass hover:bg-white/5'
                  : 'bg-white border border-gray-200 shadow-sm hover:shadow-md'
              }`}
            >
              <div className={`inline-flex p-3 rounded-2xl mb-4 ${
                isDark ? glowDark : glowLight
              }`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>

              <div className={`text-3xl sm:text-4xl font-extrabold mb-1 ${color}`}>
                <Counter value={value} prefix={prefix} suffix={suffix} />
              </div>

              <p className={`font-semibold text-sm mb-2 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>{label}</p>

              <div className={`flex items-center gap-1.5 pt-3 border-t ${
                isDark ? 'border-white/5' : 'border-gray-100'
              }`}>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse inline-block flex-shrink-0" />
                <p className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-500'}`}>{sub}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}