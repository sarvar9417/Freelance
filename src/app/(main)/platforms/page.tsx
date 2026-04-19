'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Briefcase, UserCheck, Image, DollarSign,
  MessageCircle, ChevronRight, CheckCircle2,
  Lightbulb, Star, AlertTriangle, ArrowRight,
} from 'lucide-react'
import PlatformGuide from '@/components/platforms/PlatformGuide'

/* ── Profil yaratish maslahatlar ── */
const PROFILE_TIPS = [
  {
    icon: '📸',
    title: 'Professional foto',
    desc: 'Toza fon, ravshan yuz, ishonchli ko\'rinish. Telefon kamerasi yetarli — jimiys fon qiling.',
    level: 'Muhim',
    levelColor: 'text-red-400',
  },
  {
    icon: '✍️',
    title: 'Qiziqarli bio',
    desc: 'Kim ekansiz + nima qilasiz + mijozga qanday yordam berasiz — uchala savol javobini 3-4 jumlada yozing.',
    level: 'Muhim',
    levelColor: 'text-red-400',
  },
  {
    icon: '🎯',
    title: 'Tor nisha tanlang',
    desc: '"Hamma narsani qilaman" emas — bir sohada mutaxassis bo\'lib ko\'rining. Tor nisha = ko\'proq ishonch.',
    level: 'Tavsiya',
    levelColor: 'text-amber-400',
  },
  {
    icon: '🌐',
    title: 'Ingliz tili',
    desc: 'Grammatika xatolari ishonchni kamaytiradi. Grammarly yoki ChatGPT orqali bio va tavsifni tekshiring.',
    level: 'Muhim',
    levelColor: 'text-red-400',
  },
  {
    icon: '🏅',
    title: 'Sertifikatlar',
    desc: 'Google, Coursera, Udemy sertifikatlarini profilingizga qo\'shing — bu tajribangizni tasdiqlaydi.',
    level: 'Bonus',
    levelColor: 'text-emerald-400',
  },
  {
    icon: '🔗',
    title: 'Ijtimoiy tarmoqlar',
    desc: 'LinkedIn, Behance, GitHub — sohangizga mos platforma havolasini profilingizga qo\'shing.',
    level: 'Tavsiya',
    levelColor: 'text-amber-400',
  },
]

/* ── Portfolio maslahatlar ── */
const PORTFOLIO_STEPS = [
  { step: '01', title: 'Real loyihalar birinchi', desc: 'Hali buyurtma yo\'q bo\'lsa — o\'zingiz loyiha yarating. Xayoliy brend uchun logo, vebsayt mockup, maqola.' },
  { step: '02', title: '3–5 ta sifatli ish', desc: 'Ko\'p emas — yaxshi. 3 ta ajoyib ish 15 ta o\'rtacha ishdan kuchliroq.' },
  { step: '03', title: 'Kontekst qo\'shing', desc: 'Faqat rasm emas — "muammo nima edi, qanday yechdim" degan qisqa tavsif qo\'shing.' },
  { step: '04', title: 'Yangilab turing', desc: 'Har oy eng yaxshi yangi ishingizni qo\'shing, eskilarini olib tashlang.' },
  { step: '05', title: 'Platforma mos portfolio', desc: 'Behance — dizaynerlar uchun, GitHub — dasturchilar uchun, Notion — boshqalar uchun ideal.' },
]

/* ── Narx strategiyasi ── */
const PRICING_STRATEGIES = [
  {
    title: 'Boshlovchi (0–3 oy)',
    range: '$5–25 / loyiha',
    tips: [
      'Narxni past boshlang — reytingni o\'sishiga e\'tibor bering',
      'Har 5 ta musbat sharhdan so\'ng narxni 20% ko\'taring',
      'Bepul ishlamang — hech bo\'lmasa minimal narx oling',
    ],
    color: 'from-blue-600 to-blue-800',
    badge: '🌱 Boshlang\'ich',
  },
  {
    title: 'O\'rta daraja (3–12 oy)',
    range: '$25–100 / loyiha',
    tips: [
      'Paket narxlar yarating (Basic / Standard / Premium)',
      'Qo\'shimcha xizmatlar (addon) qo\'shing — tez yetkazish, qo\'shimcha o\'zgartirish',
      'Soatlik rate: $10–20',
    ],
    color: 'from-purple-600 to-purple-800',
    badge: '🚀 O\'rta',
  },
  {
    title: 'Professional (1 yil+)',
    range: '$100–500+ / loyiha',
    tips: [
      'Qiymatga ko\'ra narx belgilang — soatga emas',
      'Doimiy mijozlarga chegirma emas — bonus xizmat bering',
      'Soatlik rate: $25–50+',
    ],
    color: 'from-amber-500 to-amber-700',
    badge: '💎 Pro',
  },
]

/* ── Mijozlar bilan muloqot sirlari ── */
const COMMUNICATION_TIPS = [
  {
    emoji: '⚡',
    title: 'Tez javob',
    desc: '1 soat ichida javob bering. Tez javob — professional ko\'rinish + algoritmda oldingi o\'rin.',
    warning: false,
  },
  {
    emoji: '🎯',
    title: 'Aniq savol bering',
    desc: 'Loyiha boshlashdan oldin maqsad, meyorlar, muddatni aniq bilib oling. Noaniqlik — qayta ishlashning asosiy sababi.',
    warning: false,
  },
  {
    emoji: '📋',
    title: 'Shartnoma tuzing',
    desc: 'Katta loyihalarda yozma kelishuv bo\'lsin. "Milestones" qo\'shing — to\'lov bosqichlarga bo\'linsin.',
    warning: false,
  },
  {
    emoji: '🔄',
    title: 'Yangilik bering',
    desc: 'Loyiha davomida har 2–3 kunda qisqa yangilik yuboring. Mijoz xotirjam bo\'ladi.',
    warning: false,
  },
  {
    emoji: '⚠️',
    title: 'Muddatni o\'tkazmang',
    desc: 'Kechikish bo\'lsa — oldindan xabar bering. Muddatni o\'tkazib kutish — eng yomon variant.',
    warning: true,
  },
  {
    emoji: '🚫',
    title: 'Scope creep dan saqlaning',
    desc: 'Kelishilgandan tashqari ish qilmang. "Bu kichik o\'zgartirish" ko\'p marta takrorlanadi.',
    warning: true,
  },
  {
    emoji: '⭐',
    title: 'Sharh so\'rang',
    desc: 'Ish tugagach: "Agar mamnun bo\'lsangiz, sharh qoldiring" — ko\'pchilik eslamasdan qoldiradi.',
    warning: false,
  },
  {
    emoji: '💼',
    title: 'Doimiy mijoz yarating',
    desc: '"Keyingi loyiha bo\'lsa — xabar bering" deb yakunlang. Doimiy mijoz — eng yaxshi marketing.',
    warning: false,
  },
]

const SECTIONS = [
  { id: 'platforms', label: 'Platformalar', icon: Briefcase },
  { id: 'profile', label: 'Profil maslahat', icon: UserCheck },
  { id: 'portfolio', label: 'Portfolio', icon: Image },
  { id: 'pricing', label: 'Narx strategiyasi', icon: DollarSign },
  { id: 'communication', label: 'Mijozlar bilan', icon: MessageCircle },
]

export default function PlatformsPage() {
  const [activeSection, setActiveSection] = useState('platforms')

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">

      {/* ── Hero ── */}
      <div className="text-center space-y-3">
        <motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 text-blue-400 text-sm font-semibold px-4 py-2 rounded-full"
          style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}
        >
          <Briefcase className="h-4 w-4" /> Freelancing platformalari
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="text-3xl sm:text-4xl font-bold text-white"
        >
          Qayerdan va qanday boshlash
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="text-white/40 max-w-xl mx-auto text-sm leading-relaxed"
        >
          Fiverr, Upwork, Kwork va boshqa platformalarda muvaffaqiyatli ishlash uchun to&apos;liq qo&apos;llanma
        </motion.p>
      </div>

      {/* ── Navigatsiya tabs ── */}
      <div className="overflow-x-auto pb-1 scrollbar-hide">
        <div className="flex items-center gap-2 min-w-max">
          {SECTIONS.map(s => {
            const Icon = s.icon
            const isActive = activeSection === s.id
            return (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex-shrink-0 ${
                  isActive
                    ? 'text-white bg-blue-600 shadow-lg shadow-blue-900/30'
                    : 'text-white/45 border border-white/8 hover:text-white/70 hover:border-white/15'
                }`}
                style={!isActive ? { background: 'rgba(255,255,255,0.03)' } : {}}
              >
                <Icon className="h-4 w-4" />
                {s.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Platformalar ── */}
      {activeSection === 'platforms' && (
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <PlatformGuide />
        </motion.section>
      )}

      {/* ── Profil maslahatlar ── */}
      {activeSection === 'profile' && (
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
          <div>
            <h2 className="text-white font-bold text-xl mb-1">Ajoyib profil yaratish</h2>
            <p className="text-white/40 text-sm">Birinchi taassurot eng muhim — profil sizning vitrinangiz</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PROFILE_TIPS.map((tip, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="rounded-2xl p-5 space-y-3 hover:translate-y-[-2px] transition-transform"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div className="flex items-start justify-between">
                  <span className="text-2xl">{tip.icon}</span>
                  <span className={`text-[10px] font-bold ${tip.levelColor} px-2 py-0.5 rounded-full`}
                    style={{ background: 'rgba(255,255,255,0.05)' }}>
                    {tip.level}
                  </span>
                </div>
                <h3 className="text-white font-semibold text-sm">{tip.title}</h3>
                <p className="text-white/45 text-xs leading-relaxed">{tip.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Checklst */}
          <div
            className="rounded-2xl p-6"
            style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}
          >
            <h3 className="text-blue-400 font-bold text-sm mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> Profil to&apos;ldirish checklisti
            </h3>
            <div className="grid sm:grid-cols-2 gap-2">
              {[
                'Professional foto yuklash',
                'Bio inglizcha yozish',
                'Kamida 3 ta ko\'nikma qo\'shish',
                'Tajriba / ta\'lim to\'ldirish',
                'Kamida 3 ta portfolio ishi',
                'Soatlik narx belgilash',
                'Joylashuv to\'ldirish',
                'Profil URL sozlash',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-white/60 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-blue-400/60 flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* ── Portfolio ── */}
      {activeSection === 'portfolio' && (
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
          <div>
            <h2 className="text-white font-bold text-xl mb-1">Portfolio yaratish bo&apos;yicha qo&apos;llanma</h2>
            <p className="text-white/40 text-sm">Ishlaringiz gapirsin — so&apos;zlaringiz emas</p>
          </div>

          {/* Qadamlar */}
          <div className="space-y-3">
            {PORTFOLIO_STEPS.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.09 }}
                className="flex items-start gap-5 p-5 rounded-2xl group hover:bg-white/3 transition-colors"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <span className="text-white/15 font-black text-2xl flex-shrink-0 group-hover:text-white/25 transition-colors">
                  {step.step}
                </span>
                <div>
                  <h3 className="text-white/85 font-semibold text-sm mb-1">{step.title}</h3>
                  <p className="text-white/45 text-xs leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Video darslar */}
          <div
            className="rounded-2xl p-6 space-y-4"
            style={{ background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.15)' }}
          >
            <h3 className="text-purple-400 font-bold text-sm flex items-center gap-2">
              <Star className="h-4 w-4" /> Portfolio platformalari
            </h3>
            <div className="grid sm:grid-cols-3 gap-3">
              {[
                { name: 'Behance', icon: '🎨', forWhom: 'Dizaynerlar uchun', color: 'from-blue-600 to-blue-800' },
                { name: 'GitHub', icon: '💻', forWhom: 'Dasturchilar uchun', color: 'from-slate-600 to-slate-800' },
                { name: 'Notion', icon: '📝', forWhom: 'Barchasi uchun', color: 'from-gray-600 to-gray-800' },
              ].map((p, i) => (
                <div
                  key={i}
                  className="rounded-xl p-4 flex items-center gap-3"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <span className="text-2xl">{p.icon}</span>
                  <div>
                    <p className="text-white/80 font-semibold text-sm">{p.name}</p>
                    <p className="text-white/30 text-xs">{p.forWhom}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* ── Narx strategiyasi ── */}
      {activeSection === 'pricing' && (
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
          <div>
            <h2 className="text-white font-bold text-xl mb-1">Narx belgilash strategiyasi</h2>
            <p className="text-white/40 text-sm">Arzon bo&apos;lmang — sifatli va to&apos;g&apos;ri narxlang</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {PRICING_STRATEGIES.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl p-6 space-y-4 hover:translate-y-[-2px] transition-transform"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div>
                  <span className={`bg-gradient-to-r ${s.color} text-xs font-bold px-2.5 py-1 rounded-full text-white`}>
                    {s.badge}
                  </span>
                  <h3 className="text-white font-bold text-sm mt-3">{s.title}</h3>
                  <p className="text-white/50 text-xs mt-0.5">Taxminiy daraja: {s.range}</p>
                </div>
                <ul className="space-y-2">
                  {s.tips.map((tip, j) => (
                    <li key={j} className="flex items-start gap-2 text-white/55 text-xs leading-relaxed">
                      <ChevronRight className="h-3 w-3 text-white/25 flex-shrink-0 mt-0.5" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Muhim eslatma */}
          <div
            className="rounded-2xl p-5 flex items-start gap-4"
            style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}
          >
            <Lightbulb className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-300 font-semibold text-sm mb-1">Asosiy qoida</p>
              <p className="text-white/55 text-sm leading-relaxed">
                Narxni soatga emas — qadrga ko&apos;ra belgilang. 2 soatda yasagan logingiz uchun
                mijozga 10 yil xizmat qilsa, uni $5 ga berish mantiqsiz.
                Siz muammoni yechasiz — vaqtingizni sotmaysiz.
              </p>
            </div>
          </div>
        </motion.section>
      )}

      {/* ── Mijozlar bilan muloqot ── */}
      {activeSection === 'communication' && (
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
          <div>
            <h2 className="text-white font-bold text-xl mb-1">Mijozlar bilan muloqot sirlari</h2>
            <p className="text-white/40 text-sm">Professional muloqot — takroriy buyurtmalar kafolati</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {COMMUNICATION_TIPS.map((tip, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="rounded-2xl p-5 flex gap-4 hover:translate-y-[-1px] transition-transform"
                style={{
                  background: tip.warning ? 'rgba(244,63,94,0.05)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${tip.warning ? 'rgba(244,63,94,0.15)' : 'rgba(255,255,255,0.07)'}`,
                }}
              >
                <span className="text-2xl flex-shrink-0">{tip.emoji}</span>
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <h3 className={`font-semibold text-sm ${tip.warning ? 'text-rose-300' : 'text-white/85'}`}>
                      {tip.title}
                    </h3>
                    {tip.warning && (
                      <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
                    )}
                  </div>
                  <p className="text-white/45 text-xs leading-relaxed">{tip.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Birinchi muloqot shabloni */}
          <div
            className="rounded-2xl p-6 space-y-3"
            style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}
          >
            <h3 className="text-blue-400 font-bold text-sm flex items-center gap-2">
              <MessageCircle className="h-4 w-4" /> Birinchi xabar shabloni (Upwork)
            </h3>
            <div
              className="rounded-xl p-4 font-mono text-xs leading-relaxed text-white/65"
              style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <p>Hi [Ism],</p>
              <br />
              <p>I&apos;ve read your project description carefully and I understand you need [MUAMMO].</p>
              <br />
              <p>I&apos;ve worked on similar projects — [QISQA TAJRIBA 1-2 JUMLA].</p>
              <br />
              <p>Here&apos;s how I&apos;d approach your project: [QISQA REJA].</p>
              <br />
              <p>I can deliver [NATIJA] within [MUDDAT].</p>
              <br />
              <p>Could we schedule a quick call to discuss details?</p>
              <br />
              <p>Best,<br />[SIZNING ISMINGIZ]</p>
            </div>
            <p className="text-white/30 text-[10px]">
              * Shablonni to&apos;g&apos;ridan-to&apos;g&apos;ri ishlatmang — har bir taklif shaxsiylashtirilgan bo&apos;lishi kerak
            </p>
          </div>
        </motion.section>
      )}

      {/* ── Quyidagi qadam ── */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        className="rounded-2xl p-8 text-center relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.12), rgba(99,102,241,0.08))', border: '1px solid rgba(59,130,246,0.2)' }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/6 rounded-full blur-3xl pointer-events-none" />
        <h2 className="text-white font-bold text-xl mb-2 relative z-10">Tayyor bo&apos;ldingizmi?</h2>
        <p className="text-white/45 text-sm max-w-md mx-auto mb-6 relative z-10">
          Bilim o&apos;zi yetarli emas — birinchi qadamni bosing. Bugun Fiverr yoki Upwork da profil oching.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap relative z-10">
          <a href="https://fiverr.com" target="_blank" rel="noopener noreferrer">
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.3)' }}>
              🟢 Fiverr da profil och <ArrowRight className="h-4 w-4" />
            </button>
          </a>
          <a href="https://upwork.com" target="_blank" rel="noopener noreferrer">
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.3)' }}>
              🔵 Upwork da profil och <ArrowRight className="h-4 w-4" />
            </button>
          </a>
        </div>
      </motion.div>
    </div>
  )
}
