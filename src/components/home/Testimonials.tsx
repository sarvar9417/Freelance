'use client'

import { motion } from 'framer-motion'
import { useMountedTheme } from '@/hooks/useTheme'
import { Star } from 'lucide-react'

const REVIEWS = [
  {
    name: 'Akbar Yusupov',
    role: 'Copywriter',
    city: 'Toshkent',
    income: '$1,200/oy',
    platform: 'Upwork',
    stars: 5,
    text: "6 oyda Upwork'da Top Rated bo'ldim. Kurslar juda amaliy va o'qituvchilar doimo javob berishadi. Bepulligi eng ajoyib tomoni.",
    initials: 'AY',
    color: 'bg-blue-600',
  },
  {
    name: 'Mohira Sultonova',
    role: 'Grafik Dizayner',
    city: 'Namangan',
    income: '$800/oy',
    platform: 'Fiverr',
    stars: 5,
    text: "Figma kursini tugatib, birinchi oyda 5 ta buyurtma oldim. Hozir Fiverr Level 1 Seller — va barchasi bepul o'rganildi!",
    initials: 'MS',
    color: 'bg-purple-600',
  },
  {
    name: 'Firdavs Raxmatov',
    role: 'SMM Mutaxassisi',
    city: 'Buxoro',
    income: '$650/oy',
    platform: 'Telegram',
    stars: 5,
    text: "SMM kursidan so'ng mahalliy bizneslar uchun kontent yaratishni boshladim. Forum orqali hamkorlar topdim. Ajoyib hamjamiyat.",
    initials: 'FR',
    color: 'bg-emerald-600',
  },
  {
    name: 'Sevinch Mirzayeva',
    role: 'Freelance Yozuvchi',
    city: 'Samarqand',
    income: '$1,050/oy',
    platform: 'Upwork',
    stars: 5,
    text: "Copywriting kursini tugatgach Upwork'da ishni boshladim. 3 oyda Job Success 100% bo'ldi. Kurslar ingliz tilida ham yordam berdi.",
    initials: 'SM',
    color: 'bg-rose-600',
  },
  {
    name: 'Ibrohim Holiqov',
    role: 'Video Montajchi',
    city: 'Andijon',
    income: '$1,400/oy',
    platform: 'Fiverr',
    stars: 5,
    text: "Video montaj bo'yicha kurs topib, Fiverr'da profil ochdim. Endi oyiga $1,400 ishlayman — bularning hammasi bepul o'rganildi!",
    initials: 'IH',
    color: 'bg-amber-600',
  },
]

export default function Testimonials() {
  const { isDark } = useMountedTheme()

  return (
    <section className={`relative py-20 ${isDark ? '' : 'bg-white'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className={`text-sm font-medium uppercase tracking-widest mb-2 ${
            isDark ? 'text-white/40' : 'text-gray-500'
          }`}>
            Fikrlar
          </p>
          <h2 className={`text-3xl sm:text-4xl font-bold ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            O&apos;quvchilarimiz{' '}
            <span className="gradient-text">nima deydi?</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {REVIEWS.map(({ name, role, city, income, platform, stars, text, initials, color }, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`rounded-3xl p-6 ${
                isDark
                  ? 'glass hover:bg-white/5'
                  : 'bg-white border border-gray-200 shadow-sm hover:shadow-md'
              }`}
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className={`${color} h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold text-sm`}>
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-sm truncate ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>{name}</p>
                  <p className={`text-xs ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                    {role} · {city}
                  </p>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: stars }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>

              {/* Text */}
              <p className={`text-sm leading-relaxed mb-4 ${
                isDark ? 'text-white/70' : 'text-gray-600'
              }`}>
                {text}
              </p>

              {/* Footer */}
              <div className={`flex items-center justify-between pt-3 border-t ${
                isDark ? 'border-white/5' : 'border-gray-100'
              }`}>
                <div className={`text-xs font-semibold ${
                  isDark ? 'text-emerald-400' : 'text-emerald-600'
                }`}>
                  {income}
                </div>
                <div className={`text-xs px-2 py-0.5 rounded-full ${
                  isDark ? 'bg-white/5 text-white/60' : 'bg-gray-100 text-gray-600'
                }`}>
                  {platform}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}