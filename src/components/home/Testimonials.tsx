'use client'

import { motion } from 'framer-motion'
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
  {
    name: "Zulfiya Yo'ldosheva",
    role: 'Virtual Assistent',
    city: "Farg'ona",
    income: '$920/oy',
    platform: 'Upwork',
    stars: 5,
    text: "Freelancerlik nima ekanini bilmay boshladim. Hozir virtual assistent sifatida AQSHlik mijozlar bilan ishlayapman. Shu platforma tufayli.",
    initials: 'ZY',
    color: 'bg-cyan-600',
  },
]

function Stars({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: n }).map((_, i) => (
        <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
      ))}
    </div>
  )
}

export default function Testimonials() {
  return (
    <section id="testimonials" className="relative py-20">
      {/* BG */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-950/10 to-transparent pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-white/40 text-sm font-medium uppercase tracking-widest mb-2">Fikrlar</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            12,000+ o&apos;quvchi{' '}
            <span className="gradient-text">ishonadi</span>
          </h2>
          <p className="text-white/50 max-w-xl mx-auto">
            Haqiqiy natijalar, haqiqiy odamlar. Ular sizning oldingizdagi yo&apos;ldan o&apos;tishgan.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {REVIEWS.map(({ name, role, city, income, platform, stars, text, initials, color }, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="glass rounded-3xl p-6 flex flex-col gap-4 group"
            >
              {/* Stars */}
              <Stars n={stars} />

              {/* Text */}
              <p className="text-white/65 text-sm leading-relaxed flex-1">
                &ldquo;{text}&rdquo;
              </p>

              {/* Divider */}
              <div className="h-px bg-white/5" />

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className={`${color} h-10 w-10 rounded-xl flex items-center justify-center text-sm font-bold text-white shadow-lg flex-shrink-0`}>
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm truncate">{name}</p>
                  <p className="text-white/40 text-xs">{role} · {city}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-emerald-400 text-sm font-bold">{income}</p>
                  <p className="text-white/30 text-xs">{platform}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-14"
        >
          <p className="text-white/40 text-sm mb-5">
            Siz ham ularning qatoriga qo&apos;shiling
          </p>
          <a href="/register">
            <button className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold px-10 py-4 rounded-2xl transition-all duration-200 shadow-xl shadow-blue-900/40 hover:scale-105">
              Bepul ro&apos;yxatdan o&apos;tish →
            </button>
          </a>
        </motion.div>
      </div>
    </section>
  )
}
