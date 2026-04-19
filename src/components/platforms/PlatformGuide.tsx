'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2, XCircle, ChevronDown, ChevronRight,
  Zap, Shield, Globe, Star, DollarSign,
} from 'lucide-react'

interface Step { icon: string; title: string; desc: string }
interface Tip { text: string }
interface Platform {
  id: string
  name: string
  tagline: string
  logo: string
  color: string
  bgColor: string
  borderColor: string
  commission: string
  minLevel: string
  pros: string[]
  cons: string[]
  steps: Step[]
  tips: Tip[]
  bestFor: string[]
  url: string
}

const PLATFORMS: Platform[] = [
  {
    id: 'fiverr',
    name: 'Fiverr',
    tagline: 'Gig asosida ishlash — o\'z narxingizni o\'zingiz belgilaysiz',
    logo: '🟢',
    color: 'text-emerald-400',
    bgColor: 'rgba(16,185,129,0.08)',
    borderColor: 'rgba(16,185,129,0.2)',
    commission: '20%',
    minLevel: 'Boshlang\'ich',
    pros: [
      'Profil yaratish va gig e\'lon qilish bepul',
      'O\'z narxingizni belgilaysiz ($5 dan)',
      'Mijoz sizni topadi — siz kutasiz',
      'Tez boshlash mumkin',
      'Kichik loyihalar uchun ideal',
    ],
    cons: [
      'Boshida raqobat juda kuchli',
      'Har bir buyurtmadan 20% komissiya',
      'Birinchi reytingni qurish 2-3 oy oladi',
      'Bahali mijozlar topish qiyin',
    ],
    steps: [
      { icon: '1️⃣', title: 'Profil yarating', desc: 'Professional foto, qisqa va aniq bio, malakalaringizni ko\'rsating. Ingliz tilida yozing.' },
      { icon: '2️⃣', title: 'Gig yarating', desc: 'Taklif qiladigan xizmatingizni aniq sarlavha bilan e\'lon qiling. 3 ta narx pog\'onasi qo\'shing.' },
      { icon: '3️⃣', title: 'Portfolio qo\'shing', desc: 'Eng yaxshi ishlaringizni yuklab, gig ga qo\'shing. Portfolio — birinchi taassurot.' },
      { icon: '4️⃣', title: 'SEO optimizatsiya', desc: 'Sarlavha va tavsifda mijozlar qidiradigan kalit so\'zlarni ishlating.' },
      { icon: '5️⃣', title: 'Birinchi 5 ⭐', desc: 'Dastlabki buyurtmalar uchun narxni past qo\'ying, sifatni yuqori. 5 yulduz — kelajak uchun asos.' },
    ],
    tips: [
      { text: 'Gig sarlavhasi: "[Siz qiladigan narsa] + [Foyda] + [Vaqt yoki sifat ko\'rsatkichi]"' },
      { text: 'Har kuni Fiverr ga kiring — algoritm faol foydalanuvchilarni ko\'rsatadi' },
      { text: 'Buyer Request bo\'limini tekshiring — mijozlarning so\'rovlari bor' },
      { text: '"Express delivery" opsiyasini qo\'shing — ko\'p mijozlar tez natija istaydi' },
      { text: 'Birinchi javobingiz 1 soat ichida bo\'lsin — response rate muhim' },
    ],
    bestFor: ['Dizayn', 'Kontent yozish', 'Tarjima', 'Video montaj', 'Ma\'lumotlar kiritish'],
    url: 'fiverr.com',
  },
  {
    id: 'upwork',
    name: 'Upwork',
    tagline: 'Professional loyihalar — uzoq muddatli hamkorlik',
    logo: '🔵',
    color: 'text-blue-400',
    bgColor: 'rgba(59,130,246,0.08)',
    borderColor: 'rgba(59,130,246,0.2)',
    commission: '10–20%',
    minLevel: 'O\'rta',
    pros: [
      'Katta, professional mijozlar baza',
      'Uzoq muddatli shartnomalar imkoni',
      'Soatlik to\'lov tizimi mavjud',
      'Mijoz bilan bevosita muzokaralar',
      'Top Rated statusda kamroq raqobat',
    ],
    cons: [
      'Kirish qiyinroq — portfolio talab qilinadi',
      'Connects (taklif yuborish) puli ketadi',
      'Profil tasdiqlash kerak',
      'Birinchi ishni olish qiyin',
    ],
    steps: [
      { icon: '1️⃣', title: 'Profil to\'ldiring', desc: '100% to\'liq profil — foto, bio, tajriba, ko\'nikmalar. Har bo\'lim muhim.' },
      { icon: '2️⃣', title: 'Portfolio yarating', desc: 'Kamida 5 ta ish namunasi. Hali buyurtma bo\'lmagan bo\'lsa — o\'zingiz loyiha yarating.' },
      { icon: '3️⃣', title: 'Malaka testlari', desc: 'Upwork testlarini toping — ular profilingizni kuchaytiradi.' },
      { icon: '4️⃣', title: 'Takliflar yuboring', desc: 'Connects sarflab, loyihalarga taklif yuboring. Shablondan emas — har biri alohida.' },
      { icon: '5️⃣', title: 'Job Success 90%+', desc: 'Har bir loyihani a\'lo bajarib, 5 yulduz oling. 90% JSS — Top Rated yo\'li.' },
    ],
    tips: [
      { text: 'Taklif matni: "Muammoingizni tushundim + Mening yechimim + Tajribam" — 3 qism' },
      { text: 'Soatlik rate ni past boshlang ($8–12), keyin oshiring' },
      { text: 'Rising Talent nishoni olish uchun dastlabki 90 kunda 3+ ish bajaring' },
      { text: 'Mijoz bilan qo\'ng\'iroq o\'tkazing — ishonch tez oshadi' },
      { text: 'Specialized profile yarating — tor soha bo\'yicha profillar ko\'proq ishonadi' },
    ],
    bestFor: ['Dasturlash', 'Marketing', 'Moliyaviy maslahat', 'Loyiha boshqaruv', 'Grafik dizayn'],
    url: 'upwork.com',
  },
  {
    id: 'kwork',
    name: 'Kwork',
    tagline: 'Rossiyalik va O\'zbek mijozlar uchun qulay platforma',
    logo: '🟣',
    color: 'text-purple-400',
    bgColor: 'rgba(168,85,247,0.08)',
    borderColor: 'rgba(168,85,247,0.2)',
    commission: '20%',
    minLevel: 'Boshlang\'ich',
    pros: [
      'Rus tilidagi mijozlar bilan ishlash qulay',
      'O\'zbek freelancerlar uchun yaxshi start',
      'Kwork — Fiverr ning rus analogi',
      'Tez royxatdan o\'tish',
    ],
    cons: [
      'Xalqaro mijozlar kam',
      'Fiverr ga qaraganda kichikroq baza',
      'USD da emas — RUB da to\'lov',
    ],
    steps: [
      { icon: '1️⃣', title: 'Ro\'yxatdan o\'ting', desc: 'Profil ruscha yoki inglizcha to\'ldiring.' },
      { icon: '2️⃣', title: 'Kvor yarating', desc: 'Fiverr dagi gig kabi — o\'z xizmatingizni chiqaring.' },
      { icon: '3️⃣', title: 'Narx 500–5000 RUB', desc: 'Arzon boshla, keyinchalik oshir.' },
    ],
    tips: [
      { text: 'Kwork + Fiverr — ikkisini parallel yuritish — eng yaxshi strategiya' },
      { text: 'Rus tilini yaxshi bilsangiz — bu platforma siz uchun' },
      { text: 'O\'z sochangizda raqobat kamroq bo\'lgan nishalarni toping' },
    ],
    bestFor: ['Tarjima (O\'z-Rus)', 'Dizayn', 'Kontent', 'Ovozli xizmatlar'],
    url: 'kwork.ru',
  },
  {
    id: 'freelancer',
    name: 'Freelancer.com',
    tagline: 'Ko\'p loyihalar, keng geografiya',
    logo: '🟡',
    color: 'text-amber-400',
    bgColor: 'rgba(245,158,11,0.08)',
    borderColor: 'rgba(245,158,11,0.2)',
    commission: '10–20%',
    minLevel: 'O\'rta',
    pros: [
      'Juda katta loyihalar bazasi',
      'Ko\'p sohalarda ixtisoslar bor',
      'Konkurs tizimi — dizaynerlar uchun ideal',
      'Dunyo bo\'yicha mijozlar',
    ],
    cons: [
      'Spam va sifatsiz loyihalar ko\'p',
      'Raqobat juda yuqori',
      'To\'lov tizimi murakkab',
      'Yangi foydalanuvchilarga qiyin',
    ],
    steps: [
      { icon: '1️⃣', title: 'Profil yarating', desc: 'Barcha ko\'nikmalaringizni belgilang, portfolio qo\'shing.' },
      { icon: '2️⃣', title: 'Konkurs toping', desc: 'Dizaynerlar uchun — konkurslar ajoyib start.' },
      { icon: '3️⃣', title: 'Bid bering', desc: 'Har kuni yangi loyihalarga bid bering — raqobat kuchli.' },
    ],
    tips: [
      { text: 'Freelancer.com + Upwork kombinatsiyasi — keng imkoniyat' },
      { text: 'Contest bo\'limida g\'olib bo\'lish — tez reytingni oshiradi' },
      { text: 'Fixed price ni preferred qiling — soatlik da aldash bo\'lishi mumkin' },
    ],
    bestFor: ['Veb dasturlash', 'Dizayn konkurs', 'SEO', 'Ma\'lumotlar tahlili'],
    url: 'freelancer.com',
  },
]

function StepCard({ step }: { step: Step }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
      <span className="text-xl flex-shrink-0 mt-0.5">{step.icon}</span>
      <div>
        <p className="text-white/80 text-sm font-semibold mb-0.5">{step.title}</p>
        <p className="text-white/40 text-xs leading-relaxed">{step.desc}</p>
      </div>
    </div>
  )
}

export default function PlatformGuide() {
  const [active, setActive] = useState('fiverr')
  const [openStep, setOpenStep] = useState<number | null>(null)

  const platform = PLATFORMS.find(p => p.id === active)!

  return (
    <div className="space-y-5">
      {/* Tab tugmalar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {PLATFORMS.map(p => (
          <button
            key={p.id}
            onClick={() => { setActive(p.id); setOpenStep(null) }}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all border ${
              active === p.id
                ? `${p.color} border-current`
                : 'text-white/40 border-white/8 hover:text-white/70 hover:border-white/15'
            }`}
            style={active === p.id ? { background: p.bgColor } : { background: 'rgba(255,255,255,0.03)' }}
          >
            <span className="text-base">{p.logo}</span>
            {p.name}
          </button>
        ))}
      </div>

      {/* Platforma kontenti */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          className="space-y-4"
        >
          {/* Header */}
          <div
            className="rounded-2xl p-6"
            style={{ background: platform.bgColor, border: `1px solid ${platform.borderColor}` }}
          >
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{platform.logo}</span>
                  <div>
                    <h2 className={`text-xl font-bold ${platform.color}`}>{platform.name}</h2>
                    <p className="text-white/50 text-sm">{platform.url}</p>
                  </div>
                </div>
                <p className="text-white/70 text-sm leading-relaxed max-w-lg">{platform.tagline}</p>
              </div>
              <div className="flex flex-col gap-2 flex-shrink-0">
                <div className="flex items-center gap-2 text-xs">
                  <DollarSign className="h-3.5 w-3.5 text-white/30" />
                  <span className="text-white/40">Komissiya:</span>
                  <span className={`font-bold ${platform.color}`}>{platform.commission}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Zap className="h-3.5 w-3.5 text-white/30" />
                  <span className="text-white/40">Daraja:</span>
                  <span className="text-white/70 font-medium">{platform.minLevel}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pros / Cons */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div
              className="rounded-2xl p-5 space-y-3"
              style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)' }}
            >
              <h3 className="text-emerald-400 text-sm font-bold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> Afzalliklari
              </h3>
              <ul className="space-y-2">
                {platform.pros.map((p, i) => (
                  <li key={i} className="flex items-start gap-2 text-white/60 text-xs leading-relaxed">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500/60 flex-shrink-0 mt-0.5" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <div
              className="rounded-2xl p-5 space-y-3"
              style={{ background: 'rgba(244,63,94,0.05)', border: '1px solid rgba(244,63,94,0.15)' }}
            >
              <h3 className="text-rose-400 text-sm font-bold flex items-center gap-2">
                <XCircle className="h-4 w-4" /> Kamchiliklari
              </h3>
              <ul className="space-y-2">
                {platform.cons.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-white/60 text-xs leading-relaxed">
                    <XCircle className="h-3.5 w-3.5 text-rose-500/60 flex-shrink-0 mt-0.5" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Qadamlar */}
          <div
            className="rounded-2xl p-5"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-400" />
              Boshlash uchun qadamlar
            </h3>
            <div className="space-y-2">
              {platform.steps.map((step, i) => (
                <div key={i}>
                  <button
                    onClick={() => setOpenStep(openStep === i ? null : i)}
                    className="w-full flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-white/4 transition-colors text-left"
                  >
                    <span className="text-lg">{step.icon}</span>
                    <span className="text-white/75 text-sm font-medium flex-1">{step.title}</span>
                    <ChevronDown className={`h-4 w-4 text-white/25 transition-transform ${openStep === i ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {openStep === i && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="text-white/45 text-xs leading-relaxed px-4 pb-2 ml-10"
                      >
                        {step.desc}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>

          {/* Maslahatlar */}
          <div
            className="rounded-2xl p-5"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-400" />
              Pro maslahatlar
            </h3>
            <ul className="space-y-3">
              {platform.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <ChevronRight className="h-3.5 w-3.5 text-amber-400/70 flex-shrink-0 mt-0.5" />
                  <span className="text-white/60 text-sm leading-relaxed">{tip.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Mos keladi */}
          <div
            className="rounded-2xl p-5"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <h3 className="text-white/60 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
              <Globe className="h-3.5 w-3.5" /> Kim uchun ideal?
            </h3>
            <div className="flex flex-wrap gap-2">
              {platform.bestFor.map((bf, i) => (
                <span
                  key={i}
                  className={`text-xs font-medium px-3 py-1 rounded-full border ${platform.color}`}
                  style={{ background: platform.bgColor, borderColor: platform.borderColor }}
                >
                  {bf}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
