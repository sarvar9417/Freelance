'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMountedTheme } from '@/hooks/useTheme'
import { Quote, RefreshCw, Sparkles } from 'lucide-react'

const QUOTES = [
  { text: "Muvaffaqiyat bir marta keladi, lekin uni kutish ko'p yillar talab qiladi. Har bir kun — imkoniyat.", author: "Freelancer School" },
  { text: "Birinchi mijozingiz siz haqingizda hali bilmaydigan odamdir. Uni topish — sizning vazifangiz.", author: "Brendan Burchard" },
  { text: "Mahorat — tajribaning bolasi. Har bir loyiha sizni bir qadam oldinga olib boradi.", author: "Freelancer School" },
  { text: "O'z qiymatingizni bilmasangiz, boshqalar ham bilmaydi. Narxni aniq belgilang.", author: "Chris Ducker" },
  { text: "Eng yaxshi portfolio — bajarilgan ishlaringiz. Hoziroq birinchi loyihani boshlang.", author: "Freelancer School" },
  { text: "Har kuni bir kichik qadam katta natijalarga olib keladi. Izchillik — muvaffaqiyat kaliti.", author: "James Clear" },
  { text: "Mijoz bilan ishonch — eng qimmatli aktivingiz. Uni asrang.", author: "Freelancer School" },
  { text: "Qo'rquv — o'sishning belgisi. Qiyin narsalarni qilayotganingizda qo'rqish — bu to'g'ri yo'ldasiz.", author: "Seth Godin" },
  { text: "Freelancing — bu erkinlik, lekin erkinlik mas'uliyatni talab qiladi.", author: "Freelancer School" },
  { text: "Bitta ko'nikma bilan boshlab, keyin kengaytiring. Kenglashish emas — chuqurlik muhim.", author: "Cal Newport" },
  { text: "Har bir 'yo'q' javob sizni to'g'ri mijozga yaqinlashtiradi.", author: "Freelancer School" },
  { text: "Siz o'z vaqtingizni sotmaysiz — siz muammolarni yechimini sotasiz.", author: "Jonathan Stark" },
  { text: "Erta turuvchi qurt qushga yem bo'ladi. Erta boshlagan freelancer esa eng yaxshi loyihalarni oladi.", author: "Freelancer School" },
  { text: "O'rganish — daromad emas. Lekin o'rganmagan freelancerning daromadi ham yo'q.", author: "Freelancer School" },
  { text: "Raqobat — dushman emas, o'qituvchi. Eng yaxshilardan o'rganib, o'zingizni takomillashtiring.", author: "Freelancer School" },
  { text: "Birinchi yilingiz qiyin bo'ladi. Ikkinchi yilingiz osonroq. Uchinchisida siz boshqalarga o'rgatasiz.", author: "Freelancer School" },
  { text: "Sarlavhangiz, tavsifingiz, portfoliongiz — bularning har biri siz haqingizda gapiradi.", author: "Freelancer School" },
  { text: "Maqsadsiz harakat — harakatning ko'rinishi. Avval maqsad, keyin harakat.", author: "Tony Robbins" },
  { text: "Reytingingizni ko'tarish uchun faqat bitta yo'l bor: mijozni hayratda qoldirish.", author: "Freelancer School" },
  { text: "Hatto kichik yutuq ham nishonlashga arziydi. Bu sizni davom ettirishga undaydi.", author: "Freelancer School" },
  { text: "Ko'nikmalaringiz toʻlovga arziydi. Bepul ishlash — o'zingizni kamsitishdir.", author: "Freelancer School" },
  { text: "Eng muvaffaqiyatli freelancerlar tinimsiz o'rganishni to'xtatmaydi.", author: "Freelancer School" },
  { text: "Bir kun emas — bugun boshla. Keyinga qoldirish — muvaffaqiyatning eng katta dushmani.", author: "Mark Twain" },
  { text: "Portfolio — rezyumedan kuchliroq. Nima qila olishingizni ko'rsating.", author: "Freelancer School" },
  { text: "Har bir muloqot — imkoniyat. Har bir loyiha — tajriba. Har bir xato — saboq.", author: "Freelancer School" },
]

function getDayQuote(): typeof QUOTES[0] {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
  return QUOTES[dayOfYear % QUOTES.length]
}

export default function DailyQuote() {
  const { isDark } = useMountedTheme()

  const [quote, setQuote]         = useState(getDayQuote())
  const [visible, setVisible]     = useState(true)
  const [randomMode, setRandom]   = useState(false)

  const shuffle = () => {
    setVisible(false)
    setTimeout(() => {
      const rand = QUOTES[Math.floor(Math.random() * QUOTES.length)]
      setQuote(rand)
      setRandom(true)
      setVisible(true)
    }, 300)
  }

  const resetToDaily = () => {
    setVisible(false)
    setTimeout(() => { setQuote(getDayQuote()); setRandom(false); setVisible(true) }, 300)
  }

  return (
    <div
      className={`relative rounded-2xl p-8 overflow-hidden ${isDark ? '' : 'bg-gradient-to-br from-blue-50 to-purple-50'}`}
      style={isDark ? { background: 'linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(99,102,241,0.08) 100%)', border: '1px solid rgba(59,130,246,0.2)' } : { border: '1px solid #e0e7ff' }}
    >
      {/* Fon bezak */}
      <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none ${isDark ? 'bg-blue-600/5' : 'bg-blue-200/30'}`} />
      <div className={`absolute bottom-0 left-0 w-48 h-48 rounded-full blur-3xl pointer-events-none ${isDark ? 'bg-purple-600/5' : 'bg-purple-200/30'}`} />

      {/* Tepa qism */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className={`h-8 w-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg ${isDark ? '' : 'shadow-blue-200'}`}>
            <Sparkles className={`h-4 w-4 ${isDark ? 'text-white' : 'text-white'}`} />
          </div>
          <div>
            <p className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>Kunlik ilhom</p>
            {randomMode
              ? <p className={`text-[10px] ${isDark ? 'text-white/30' : 'text-gray-500'}`}>Tasodifiy iqtibos</p>
              : <p className={`text-[10px] ${isDark ? 'text-white/30' : 'text-gray-500'}`}>{new Date().toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long' })}</p>
            }
          </div>
        </div>
        <div className="flex items-center gap-2">
          {randomMode && (
            <button onClick={resetToDaily} className={`text-[10px] transition-colors px-2 py-1 rounded-lg ${isDark ? 'text-white/30 hover:text-white/60 hover:bg-white/5' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}>
              Bugungi
            </button>
          )}
          <button
            onClick={shuffle}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl transition-all ${isDark ? 'text-white/40 hover:text-white/70 hover:bg-white/6 border border-white/8' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 border border-gray-200'}`}
          >
            <RefreshCw className="h-3 w-3" /> Boshqasi
          </button>
        </div>
      </div>

      {/* Iqtibos */}
      <AnimatePresence mode="wait">
        {visible && (
          <motion.div
            key={quote.text}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28 }}
            className="relative z-10"
          >
            <Quote className={`h-8 w-8 mb-4 -ml-1 ${isDark ? 'text-blue-500/25' : 'text-blue-500/40'}`} />
            <blockquote className={`text-lg sm:text-xl font-medium leading-relaxed mb-5 ${isDark ? 'text-white' : 'text-gray-800'}`}>
              {quote.text}
            </blockquote>
            <p className={`text-sm font-medium ${isDark ? 'text-white/35' : 'text-gray-500'}`}>— {quote.author}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
