'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HelpCircle, ChevronDown, BookOpen, ClipboardCheck, Users, Settings, MessageCircle } from 'lucide-react'

const FAQS = [
  {
    category: 'Kurslar',
    icon: BookOpen,
    color: 'text-emerald-400',
    questions: [
      {
        q: 'Yangi kurs qanday yaratiladi?',
        a: 'Yon paneldagi "Kurslarim" bo\'limiga o\'ting va yuqori o\'ng burchakdagi "Yangi kurs" tugmasini bosing. Kurs nomi, tavsif, kategoriya va boshqa ma\'lumotlarni kiriting. Kurs admin tomonidan tekshirilgandan so\'ng nashr etiladi.',
      },
      {
        q: 'Kursimni qanday nashr etaman?',
        a: 'Kursni tahrirlash sahifasida "Kursni nashr etish" tumblerini yoqing va saqlang. Nashr etilgan kurslar admin tomonidan ko\'rib chiqiladi. Admin tasdiqlagunga qadar kurs o\'quvchilarga ko\'rinmaydi.',
      },
      {
        q: 'Kursga dars qanday qo\'shiladi?',
        a: 'Kurslar ro\'yxatidan kerakli kursni topib, "Darslar" tugmasini bosing. Yangi dars qo\'shish uchun "Yangi dars" tugmasini bosib, dars nomi, video URL va matnini kiriting.',
      },
      {
        q: 'Kursni o\'chirish mumkinmi?',
        a: 'Ha, kurs kartochkasidagi "O\'chirish" tugmasi orqali kursni o\'chirishingiz mumkin. Lekin ehtiyot bo\'ling — kurs o\'chirilsa, undagi barcha darslar, topshiriqlar va o\'quvchilar ma\'lumotlari ham o\'chiriladi.',
      },
    ],
  },
  {
    category: 'Topshiriqlar',
    icon: ClipboardCheck,
    color: 'text-amber-400',
    questions: [
      {
        q: 'Topshiriqni qanday tekshiraman?',
        a: '"Topshiriqlar tekshirish" sahifasiga o\'ting. U yerda barcha topshirilgan ishlarni ko\'rasiz. "Tekshirish" tugmasini bosib, ball qo\'ying va izoh yozing.',
      },
      {
        q: 'O\'quvchiga qayta topshirishni so\'rashim mumkinmi?',
        a: 'Ha. Tekshirish sahifasida "Qayta topshirishni so\'rash" tugmasi mavjud. Izoh yozib, o\'quvchiga qayta topshirish talabini yuboring.',
      },
      {
        q: 'Topshiriqda maksimal ball nechta bo\'lishi mumkin?',
        a: 'Hozirgi tizimda maksimal ball 1 dan 100 gacha belgilanishi mumkin. Topshiriq yaratishda "Maksimal ball" maydonida kerakli qiymatni kiriting.',
      },
    ],
  },
  {
    category: "O'quvchilar",
    icon: Users,
    color: 'text-blue-400',
    questions: [
      {
        q: 'O\'quvchilarimni qanday ko\'raman?',
        a: '"O\'quvchilarim" sahifasida barcha kurslaringizdagi o\'quvchilarni ko\'rasiz. Har bir o\'quvchining progressi, topshiriqlari va o\'rtacha bahosi ko\'rsatiladi.',
      },
      {
        q: 'Alohida kurs o\'quvchilarini ko\'rish mumkinmi?',
        a: 'Ha. Kurslar ro\'yxatidagi "O\'quvchilar" tugmasini bosing. U yerda faqat shu kursga yozilgan o\'quvchilarni ko\'rasiz.',
      },
    ],
  },
  {
    category: 'Sozlamalar',
    icon: Settings,
    color: 'text-purple-400',
    questions: [
      {
        q: 'Profilimni qanday yangilayman?',
        a: '"Sozlamalar" sahifasiga o\'ting. U yerda ism, yosh va bio ma\'lumotlaringizni yangilashingiz mumkin. Email manzilini o\'zgartirib bo\'lmaydi.',
      },
      {
        q: 'Parolimni qanday o\'zgartiraman?',
        a: 'Hozirgi versiyada parolni o\'zgartirish uchun tizimdan chiqib, kirish sahifasida "Parolni unutdim" havolasini bosing. Email ga tiklanish havolasi yuboriladi.',
      },
    ],
  },
]

function FAQ({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left hover:bg-white/[0.02] transition-colors"
      >
        <span className="text-white/80 text-sm font-medium">{question}</span>
        <ChevronDown className={`h-4 w-4 text-white/30 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div
              className="px-4 pb-4 text-white/50 text-sm leading-relaxed"
              style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
            >
              <div className="pt-3">{answer}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function HelpPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Yordam markazi</h1>
        <p className="text-white/40 text-sm mt-1">Ko&apos;p beriladigan savollar va javoblar</p>
      </div>

      {/* Kirish kartochkasi */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-6 flex items-start gap-4"
        style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.15)' }}
      >
        <div className="p-3 rounded-xl bg-emerald-500/10 flex-shrink-0">
          <HelpCircle className="h-5 w-5 text-emerald-400" />
        </div>
        <div>
          <p className="text-white font-semibold text-sm mb-1">O&apos;qituvchi bo&apos;limiga xush kelibsiz!</p>
          <p className="text-white/50 text-sm leading-relaxed">
            Quyida eng ko&apos;p beriladigan savollarga javoblar berilgan. Savolingizga javob topa olmagan bo&apos;lsangiz,
            admin bilan bog&apos;laning.
          </p>
        </div>
      </motion.div>

      {/* FAQ bo'limlari */}
      {FAQS.map((section, si) => {
        const Icon = section.icon
        return (
          <motion.div
            key={section.category}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: si * 0.07 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2 mb-3">
              <Icon className={`h-4 w-4 ${section.color}`} />
              <h2 className="text-white font-semibold text-sm">{section.category}</h2>
            </div>
            <div className="space-y-2">
              {section.questions.map((faq, qi) => (
                <FAQ key={qi} question={faq.q} answer={faq.a} />
              ))}
            </div>
          </motion.div>
        )
      })}

      {/* Bog'lanish */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="rounded-2xl p-6 text-center"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)' }}
      >
        <MessageCircle className="h-8 w-8 text-white/20 mx-auto mb-3" />
        <p className="text-white/50 text-sm mb-1">Savolingizga javob topa olmadingizmi?</p>
        <p className="text-white/25 text-xs">
          Admin panel orqali yoki platformaning forum bo&apos;limida savol bering
        </p>
      </motion.div>
    </div>
  )
}
