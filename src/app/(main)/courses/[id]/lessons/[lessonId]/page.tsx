'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, CheckCircle2, Lock, Play,
  ClipboardList, BookOpen, Menu, X, ChevronRight,
} from 'lucide-react'
import LessonPlayer from '@/components/courses/LessonPlayer'
import TaskSubmission from '@/components/courses/TaskSubmission'
import { useMountedTheme } from '@/hooks/useTheme'

interface Lesson {
  id: string
  order: number
  title: string
  duration: string
  video_url: string
  content: string
  completed: boolean
}

const COURSES_DATA: Record<string, {
  title: string
  emoji: string
  color: string
  lessons: Lesson[]
  tasks: {
    id: string
    title: string
    description: string
    deadline: string
    fileRequirements: string
    maxGrade: number
    forLesson: string
    history: {
      id: string; fileName: string; fileSize: string;
      submittedAt: string; status: 'pending' | 'reviewed' | 'graded';
      grade?: number; feedback?: string
    }[]
  }[]
}> = {
  '1': {
    title: 'Freelancing asoslari', emoji: '🚀', color: 'from-blue-600 to-blue-800',
    lessons: [
      {
        id: 'l1', order: 1, title: "Freelancingga kirish", duration: '15 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        content: `Freelancing — bu mustaqil ishlash shakli bo'lib, siz bir yoki bir nechta mijozlar uchun masofadan xizmat ko'rsatasiz.\n\nAsosiy afzalliklar:\n• Erkin ish jadvali\n• Istaganingizdan ishlash\n• Daromadni o'zing belgilash\n• Turli loyihalar bilan ishlash\n\nFreelancer bo'lish uchun qanday ko'nikmalar kerak?\n1. Texnik ko'nikma (dizayn, dasturlash, matn yozish va h.k.)\n2. Muloqot ko'nikmasi\n3. Vaqtni boshqarish\n4. O'z-o'zini motivatsiya qilish`,
        completed: true,
      },
      {
        id: 'l2', order: 2, title: "Platformalar taqqoslanmasi", duration: '22 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        content: `Eng mashhur freelancing platformalari:\n\n🏆 Upwork\n• Katta loyihalar uchun eng yaxshi\n• Saatlik va belgilangan narx\n• Qat'iy screening jarayoni\n\n⭐ Fiverr\n• Kichik va o'rta loyihalar\n• Gig asosida ishlash\n• Tez boshlash mumkin\n\n💼 Toptal\n• Faqat top 3% mutaxassislar\n• Yuqori maosh\n• Qiyin sertifikatlashtirish\n\nTavsiya: Boshlang'ich uchun Upwork yoki Fiverr.`,
        completed: true,
      },
      {
        id: 'l3', order: 3, title: "Upwork profil yaratish", duration: '30 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        content: `Professional Upwork profili yaratish uchun:\n\n1. Professional foto\n• Aniq yuz ko'rinishi\n• Toza fon (oq yoki kulrang)\n• Professional kiyim\n\n2. Kuchli sarlavha\n• "WordPress Developer | 5+ yil tajriba"\n• Kalit so'zlar muhim\n\n3. Batafsil tavsif\n• O'z hikoyangiz\n• Ko'nikmalar va tajriba\n• Mijoz uchun qanday foyda\n\n4. Portfolio\n• Minimum 3-5 ta ish\n• Har biri uchun tavsif`,
        completed: false,
      },
      {
        id: 'l4', order: 4, title: "Fiverr gig sozlash", duration: '25 daqiqa',
        video_url: '',
        content: `Fiverr'da muvaffaqiyatli gig yaratish:\n\n📌 Gig nomi\n• Kalit so'z bilan boshlang\n• "I will create..." formatida\n\n💰 Paketlar (Basic, Standard, Premium)\n• Har birini aniq belgilang\n• Qo'shimcha xizmatlar (extras)\n\n🖼️ Gig rasmlari\n• Kamida 3 ta sifatli rasm\n• Before/After ko'rsating\n\n📝 Tavsif\n• Nima qilasiz?\n• Nima oling?\n• Muddati qancha?`,
        completed: false,
      },
      {
        id: 'l5', order: 5, title: "Birinchi proposal yozish", duration: '35 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        content: `Samarali proposal yozish formulasi:\n\n1️⃣ Muammo/Ehtiyojni tan oling\n"Siz X muammoni hal qilmoqchi ekansiz..."\n\n2️⃣ Yechimingizni taklif qiling\n"Men Y yondashuv orqali..."\n\n3️⃣ Tajribangizni ko'rsating\n"Shunga o'xshash Z loyihada..."\n\n4️⃣ Keyingi qadamni aniqlang\n"Boshlash uchun call o'tkazaylikmi?"\n\n❌ Xatolar:\n• Shablondan nusxa ko'chirish\n• Faqat o'zingiz haqida yozish\n• Narxni birinchi aytish`,
        completed: false,
      },
      {
        id: 'l6', order: 6, title: "Mijoz bilan muloqot sirlari", duration: '28 daqiqa',
        video_url: '',
        content: `Professional muloqot qoidalari:\n\n✅ Har doim:\n• 24 soat ichida javob bering\n• Aniq va qisqa yozing\n• Deadline haqida xabardor qiling\n\n❌ Hech qachon:\n• O'z muddatingizni buzmang\n• Xato bo'lsa yashirmang\n• Professional bo'ling`,
        completed: false,
      },
    ],
    tasks: [
      {
        id: 't1', title: "Upwork profilini to'ldiring", forLesson: 'l3',
        description: "Upwork platformasida to'liq profil yarating: professional foto, sarlavha, batafsil tavsif, ko'nikmalar va kamida 2 ta portfolio ishi. Profilni to'ldirgandan so'ng sahifaning skreenshot yoki PDF formatida saqlang.",
        deadline: '2025-03-01', fileRequirements: 'PDF, PNG, JPG — max 20MB', maxGrade: 100,
        history: [
          {
            id: 'sub1', fileName: 'upwork-profil.pdf', fileSize: '2.3 MB',
            submittedAt: '2025-01-10 14:30', status: 'graded',
            grade: 88, feedback: "Juda yaxshi profil! Sarlavha kuchli va professional. Tavsif batafsil va aniq yozilgan. Faqat portfolio qismini yanada to'ldirish kerak — hozircha faqat 1 ta ish bor, kamida 3 ta bo'lishi tavsiya etiladi."
          }
        ],
      },
      {
        id: 't2', title: "Birinchi proposal yozing", forLesson: 'l5',
        description: "Upwork yoki Fiverr'da real loyiha toping va o'sha loyiha uchun professional proposal tayyorlang. Proposal 150-300 so'z bo'lishi kerak va darsda o'rganilgan formula asosida yozilishi lozim. Skreenshot yoki PDF yuklang.",
        deadline: '2025-03-10', fileRequirements: 'PDF, DOC, DOCX — max 10MB', maxGrade: 100,
        history: [],
      },
    ],
  },
  '2': {
    title: 'Grafik Dizayn (Figma)', emoji: '🎨', color: 'from-purple-600 to-purple-800',
    lessons: [
      {
        id: 'l1', order: 1, title: "Figmaga kirish va interfeys", duration: '20 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        content: "Figma — bulutga asoslangan dizayn vositasi. Bu darsda interfeysni o'rganamiz.",
        completed: true,
      },
      {
        id: 'l2', order: 2, title: "Frames va Shapes asoslari", duration: '25 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        content: "Frames, Shapes va asosiy dizayn elementlari haqida.",
        completed: false,
      },
      {
        id: 'l3', order: 3, title: "Auto Layout", duration: '35 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=NrKX46Z3rkM',
        content: `Auto Layout — Figmaning eng kuchli funksiyalaridan biri.\n\nNima uchun kerak:\n• Elementlar avtomatik o'lchamga moslashadi\n• Responsive komponentlar yaratish oson\n• Padding va spacing bir joydan boshqariladi\n\nAsosiy qoidalar:\n1. Horizontal yoki Vertical yo'nalish tanlash\n2. Gap (oraliq) va Padding sozlash\n3. Hug/Fill/Fixed o'lcham tanlash`,
        completed: false,
      },
      {
        id: 'l4', order: 4, title: "Component va Variant sistemasi", duration: '40 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=k74IrUNaJVk',
        content: `Komponentlar — qayta ishlatiladigan dizayn elementlari.\n\nAsosiy tushunchalar:\n• Main component vs Instance\n• Variantlar bilan ishlash\n• Props va Overrides\n\nMisollar:\n- Button (primary, secondary, disabled)\n- Input field (default, focused, error)\n- Card (small, medium, large)`,
        completed: false,
      },
      {
        id: 'l5', order: 5, title: "Typography va Color Systems", duration: '30 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=2eMCFXKd-XY',
        content: `Professional dizayn tizimining asosi.\n\nTypography:\n• Font uyadlarini aniqlash (H1-H6, body, caption)\n• Line height va Letter spacing\n• Font weight ierarxiyasi\n\nColor System:\n• Primary, Secondary, Accent ranglar\n• Neutral (gray) palitra\n• Semantic ranglar (success, error, warning)`,
        completed: false,
      },
    ],
    tasks: [],
  },
  '5': {
    title: 'Web Dasturlash (HTML/CSS)', emoji: '💻', color: 'from-cyan-600 to-cyan-800',
    lessons: [
      {
        id: 'l1', order: 1, title: "HTML5 semantik teglar asoslari", duration: '25 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=UB1O30fR-EE',
        content: `HTML5 semantik teglar sahifaga ma'no beradi va SEO uchun muhim.\n\nAsosiy semantik teglar:\n• <header> — sahifa yoki bo'lim sarlavhasi\n• <nav> — navigatsiya menyusi\n• <main> — asosiy kontent\n• <article> — mustaqil kontent\n• <section> — tematik bo'lim\n• <aside> — qo'shimcha ma'lumot\n• <footer> — pastki qism\n\nNima uchun muhim:\n1. Ekran o'quvchilar (accessibility)\n2. SEO samaradorligi\n3. Kod tushunarliligini oshiradi`,
        completed: false,
      },
      {
        id: 'l2', order: 2, title: "HTML5 Forms va Validation", duration: '30 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=fNcJuPIZ2WE',
        content: `HTML5 forma elementlari va validatsiya.\n\nYangi input turlari:\n• type="email" — email tekshiruvi\n• type="number" — raqam kiritish\n• type="date" — sana tanlash\n• type="range" — slider\n• type="color" — rang tanlash\n\nValidatsiya atributlari:\n• required — majburiy maydon\n• minlength / maxlength — uzunlik chegarasi\n• pattern — regex tekshiruv\n• min / max — raqam oralig'i`,
        completed: false,
      },
      {
        id: 'l3', order: 3, title: "CSS3: Selectors va Box Model", duration: '28 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=yfoY53QXEnI',
        content: `CSS selektorlar va Box Model — CSS asosi.\n\nKuchli selektorlar:\n• :nth-child(n) — n-chi farzand\n• :not(selector) — istisno\n• [attr=value] — atribut selektor\n• ::before / ::after — pseudo-elementlar\n\nBox Model:\n┌─────────────────────┐\n│       Margin        │\n│  ┌───────────────┐  │\n│  │    Border     │  │\n│  │  ┌─────────┐  │  │\n│  │  │ Padding │  │  │\n│  │  │ Content │  │  │\n│  │  └─────────┘  │  │\n│  └───────────────┘  │\n└─────────────────────┘`,
        completed: false,
      },
      {
        id: 'l4', order: 4, title: "CSS Flexbox — to'liq qo'llanma", duration: '40 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=JJSoEo8JSnc',
        content: `Flexbox — bir o'lchovli layout tizimi.\n\nKonteyner xossalari:\n• display: flex\n• flex-direction: row | column\n• justify-content: center | space-between | space-around\n• align-items: center | flex-start | flex-end\n• flex-wrap: wrap | nowrap\n• gap: 16px\n\nElement xossalari:\n• flex: 1 — barcha bo'sh joyni egallash\n• flex-grow / flex-shrink / flex-basis\n• align-self — alohida alignment\n• order — tartibni o'zgartirish`,
        completed: false,
      },
      {
        id: 'l5', order: 5, title: "CSS Grid Layout", duration: '45 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=EiNiSFIPIQE',
        content: `CSS Grid — ikki o'lchovli layout tizimi.\n\nAsosiy xossalar:\n• display: grid\n• grid-template-columns: repeat(3, 1fr)\n• grid-template-rows: auto\n• gap: 20px\n• grid-column: 1 / 3 — bir nechta ustun egallash\n\nAmaliy misollar:\n• 12 ustunli grid tizimi\n• Card layout\n• Dashboard layout\n• Masonry effekti`,
        completed: false,
      },
      {
        id: 'l6', order: 6, title: "Responsive dizayn va Media Queries", duration: '35 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=srvUrASNj0s',
        content: `Responsive dizayn — har qanday qurilmada chiroyli ko'rinish.\n\nMobile-First yondashuv:\n/* Mobil (default) */\n.container { padding: 16px; }\n\n/* Tablet */\n@media (min-width: 768px) {\n  .container { padding: 32px; }\n}\n\n/* Desktop */\n@media (min-width: 1024px) {\n  .container { padding: 48px; }\n}\n\nBreakpoint standartlari:\n• sm: 640px\n• md: 768px\n• lg: 1024px\n• xl: 1280px`,
        completed: false,
      },
      {
        id: 'l7', order: 7, title: "CSS Animatsiya va Transitions", duration: '30 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=YszOvN5TZ4Q',
        content: `CSS bilan silliq animatsiyalar yaratish.\n\nTransitions:\n.button {\n  transition: all 0.3s ease;\n}\n.button:hover {\n  transform: translateY(-2px);\n  box-shadow: 0 4px 12px rgba(0,0,0,0.2);\n}\n\nKeyframe Animations:\n@keyframes fadeIn {\n  from { opacity: 0; transform: translateY(20px); }\n  to   { opacity: 1; transform: translateY(0); }\n}\n.element {\n  animation: fadeIn 0.5s ease forwards;\n}`,
        completed: false,
      },
      {
        id: 'l8', order: 8, title: "CSS Custom Properties (Variables)", duration: '22 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=PHO6TBq_auI',
        content: `CSS o'zgaruvchilar — tema yaratish va kodni qayta ishlatish.\n\n:root {\n  --primary: #3b82f6;\n  --secondary: #8b5cf6;\n  --text: #1f2937;\n  --bg: #ffffff;\n  --radius: 8px;\n  --spacing-md: 16px;\n}\n\n.button {\n  background: var(--primary);\n  border-radius: var(--radius);\n  padding: var(--spacing-md);\n}\n\nDark mode:\n[data-theme="dark"] {\n  --text: #f9fafb;\n  --bg: #111827;\n}`,
        completed: false,
      },
      {
        id: 'l9', order: 9, title: "SASS/SCSS asoslari", duration: '35 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=_a5j7KoflTs',
        content: `SCSS — CSS kuchaytirilgan versiyasi.\n\nAsosiy xususiyatlar:\n\n// O'zgaruvchilar\n$primary: #3b82f6;\n$radius: 8px;\n\n// Nesting\n.card {\n  padding: 20px;\n  &:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); }\n  &__title { font-size: 1.25rem; }\n  &--featured { border: 2px solid $primary; }\n}\n\n// Mixin\n@mixin flex-center {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}`,
        completed: false,
      },
      {
        id: 'l10', order: 10, title: "Tailwind CSS bilan tez ishlash", duration: '40 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=pfaSUYaSgRo',
        content: `Tailwind CSS — utility-first CSS framework.\n\nAfzalliklari:\n• CSS yozmasdan dizayn\n• JIT (Just-in-Time) kompilyatsiya\n• Responsive uchun prefix: sm: md: lg:\n• Dark mode: dark:\n\nMisollar:\n<button class="bg-blue-600 hover:bg-blue-500\n  text-white font-semibold\n  px-4 py-2 rounded-xl\n  transition-all duration-200\n  shadow-lg shadow-blue-900/30">\n  Bosing\n</button>\n\nTailwind.config.js orqali theme kengaytirish mumkin.`,
        completed: false,
      },
      {
        id: 'l11', order: 11, title: "Landing page yaratish — amaliy loyiha", duration: '55 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=p0bGHP-PXD4',
        content: `Amaliy loyiha: Professional Landing Page\n\nYaratilajak bo'limlar:\n1. Hero section (sarlavha + CTA)\n2. Features section (3-6 ta xususiyat)\n3. Testimonials (mijoz sharhlar)\n4. Pricing table\n5. FAQ accordion\n6. Contact form\n7. Footer\n\nTexnologiyalar: HTML5 + CSS3 + CSS Grid + Flexbox\n\nBosqichlar:\n• Wireframe chizish\n• HTML strukturasi\n• CSS stillar\n• Responsive qilish\n• Animatsiyalar qo'shish`,
        completed: false,
      },
      {
        id: 'l12', order: 12, title: "Web accessibility va SEO asoslari", duration: '25 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=e2nkq3h1P68',
        content: `Accessibility va SEO — professional web ishlab chiqaruvchi uchun zarur.\n\nAccessibility (a11y):\n• alt atributi rasmlarda\n• aria-label interaktiv elementlarda\n• Klaviatura navigatsiyasi\n• Rang kontrastini tekshirish\n• Ekran o'quvchilar uchun optimallash\n\nSEO asoslari:\n• <title> teging (60 belgidan kam)\n• <meta description>\n• Heading ierarxiyasi (H1 → H2 → H3)\n• Strukturalangan ma'lumot (JSON-LD)\n• Sahifa tezligi (Core Web Vitals)`,
        completed: false,
      },
    ],
    tasks: [
      {
        id: 't1', title: "Shaxsiy CV sahifangizni yarating", forLesson: 'l11',
        description: "HTML5 va CSS3 yordamida o'zingizning shaxsiy CV (resume) sahifangizni yarating. Sahifa responsive bo'lishi va kamida: header (ism, lavozim), about, skills, experience, contact bo'limlarini o'z ichiga olishi kerak.",
        deadline: '2025-04-15', fileRequirements: 'ZIP (HTML+CSS fayllar) — max 20MB', maxGrade: 100,
        history: [],
      },
    ],
  },
  '6': {
    title: 'JavaScript Asoslari', emoji: '⚡', color: 'from-yellow-600 to-orange-700',
    lessons: [
      {
        id: 'l1', order: 1, title: "JavaScript asoslari va ES6+ sintaksis", duration: '30 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=W6NZfCO5SIk',
        content: `JavaScript — web'ning yagona dasturlash tili.\n\nO'zgaruvchilar:\n• var — eski usul (foydalanmang)\n• let — o'zgaruvchan qiymat\n• const — o'zgarmas qiymat\n\nMa'lumot turlari:\n• string: "salom" | 'dunyo' | \`template\`\n• number: 42 | 3.14\n• boolean: true | false\n• null va undefined\n• array: [1, 2, 3]\n• object: { ism: "Ali", yosh: 25 }`,
        completed: false,
      },
      {
        id: 'l2', order: 2, title: "Arrow functions va template literals", duration: '25 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=NjsIiHgAa8M',
        content: `ES6 yangi xususiyatlar.\n\nArrow Functions:\n// Eski usul\nfunction qosh(a, b) { return a + b; }\n\n// Arrow function\nconst qosh = (a, b) => a + b;\nconst kvadrat = n => n * n;\nconst salomlash = () => "Salom!";\n\nTemplate Literals:\nconst ism = "Ali";\nconst yosh = 25;\nconsole.log(\`Salom, men \${ism}, \${yosh} yoshdaman\`);\n\n// Ko'p qatorli string\nconst html = \`\n  <div>\n    <h1>\${ism}</h1>\n  </div>\n\`;`,
        completed: false,
      },
      {
        id: 'l3', order: 3, title: "Destructuring, Spread va Rest", duration: '28 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=NIq3qLaHCIs',
        content: `Zamonaviy JavaScript xususiyatlari.\n\nDestructuring:\nconst shaxs = { ism: "Ali", yosh: 25, shahar: "Toshkent" };\nconst { ism, yosh } = shaxs;\n\nconst sonlar = [1, 2, 3, 4, 5];\nconst [birinchi, ikkinchi, ...qolganlar] = sonlar;\n\nSpread operator:\nconst arr1 = [1, 2, 3];\nconst arr2 = [...arr1, 4, 5]; // [1, 2, 3, 4, 5]\n\nconst obj1 = { a: 1, b: 2 };\nconst obj2 = { ...obj1, c: 3 }; // { a:1, b:2, c:3 }`,
        completed: false,
      },
      {
        id: 'l4', order: 4, title: "DOM manipulyatsiya va hodisalar", duration: '40 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=5fb2aPlgoys',
        content: `DOM bilan ishlash — web interaktivligining asosi.\n\nElementlarni topish:\ndocument.querySelector('.btn');\ndocument.querySelectorAll('li');\ndocument.getElementById('header');\n\nKontent o'zgartirish:\nel.textContent = "Yangi matn";\nel.innerHTML = "<span>HTML</span>";\nel.style.color = "red";\nel.classList.add('active');\n\nHodisalar (Events):\nbtn.addEventListener('click', (e) => {\n  e.preventDefault();\n  console.log("Bosildi!");\n});`,
        completed: false,
      },
      {
        id: 'l5', order: 5, title: "Array metodlar: map, filter, reduce", duration: '35 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=rRgD1yVwIvE',
        content: `Funktsional dasturlash usullari.\n\nmap — har elementni o'zgartirish:\nconst sonlar = [1, 2, 3, 4, 5];\nconst kvadratlar = sonlar.map(n => n * n);\n// [1, 4, 9, 16, 25]\n\nfilter — shartga mos elementlar:\nconst juftlar = sonlar.filter(n => n % 2 === 0);\n// [2, 4]\n\nreduce — bitta qiymatga keltirish:\nconst yigindi = sonlar.reduce((acc, n) => acc + n, 0);\n// 15\n\nZanjir (chaining):\nconst natija = sonlar\n  .filter(n => n > 2)\n  .map(n => n * 10);\n// [30, 40, 50]`,
        completed: false,
      },
      {
        id: 'l6', order: 6, title: "Obyektlar va Prototype zanjiri", duration: '32 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=4jb4AYEyhRc',
        content: `JavaScript'da obyektlar bilan ishlash.\n\nClass sintaksis:\nclass Odam {\n  constructor(ism, yosh) {\n    this.ism = ism;\n    this.yosh = yosh;\n  }\n  salomlash() {\n    return \`Salom, men \${this.ism}\`;\n  }\n}\n\nclass Talaba extends Odam {\n  constructor(ism, yosh, kurs) {\n    super(ism, yosh);\n    this.kurs = kurs;\n  }\n}\n\nconst ali = new Talaba("Ali", 22, "JavaScript");`,
        completed: false,
      },
      {
        id: 'l7', order: 7, title: "Promises va asinxron dasturlash", duration: '38 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=DHvZLI7Db8E',
        content: `Asinxron JavaScript — callback'dan Promise'gacha.\n\nPromise yaratish:\nconst lupmt = new Promise((resolve, reject) => {\n  setTimeout(() => {\n    resolve("Muvaffaqiyat!");\n    // reject("Xato!");\n  }, 2000);\n});\n\nPromise zanjiri:\nfetch('/api/users')\n  .then(res => res.json())\n  .then(data => console.log(data))\n  .catch(err => console.error(err))\n  .finally(() => setLoading(false));`,
        completed: false,
      },
      {
        id: 'l8', order: 8, title: "Async/Await bilan ishlash", duration: '30 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=V_Kr9OSfDeU',
        content: `Async/Await — Promises'ni oson yozish usuli.\n\nasync function foydalanuvchilarniYukla() {\n  try {\n    const response = await fetch('/api/users');\n    \n    if (!response.ok) {\n      throw new Error('Server xatosi');\n    }\n    \n    const users = await response.json();\n    return users;\n  } catch (error) {\n    console.error('Xato:', error.message);\n  }\n}\n\n// Parallel so'rovlar:\nconst [users, posts] = await Promise.all([\n  fetch('/api/users').then(r => r.json()),\n  fetch('/api/posts').then(r => r.json()),\n]);`,
        completed: false,
      },
      {
        id: 'l9', order: 9, title: "Fetch API va REST API bilan ishlash", duration: '40 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=cuEtnrL9-H0',
        content: `Fetch API bilan HTTP so'rovlar yuborish.\n\nGET so'rovi:\nconst res = await fetch('https://api.example.com/posts');\nconst posts = await res.json();\n\nPOST so'rovi:\nconst res = await fetch('/api/posts', {\n  method: 'POST',\n  headers: { 'Content-Type': 'application/json' },\n  body: JSON.stringify({ title: "Yangi post", body: "..." })\n});\n\nXato boshqarish:\nif (!res.ok) throw new Error(\`HTTP \${res.status}\`);\n\nReal API: https://jsonplaceholder.typicode.com`,
        completed: false,
      },
      {
        id: 'l10', order: 10, title: "Modullar va ES6 Import/Export", duration: '25 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=cRHQNNkYi1A',
        content: `JavaScript modullari — kodni tashkillash.\n\n// utils.js — eksport\nexport const qosh = (a, b) => a + b;\nexport const ayir = (a, b) => a - b;\nexport default class Logger { ... }\n\n// main.js — import\nimport Logger from './utils.js';\nimport { qosh, ayir } from './utils.js';\nimport * as utils from './utils.js';\n\n// Dinamik import (lazy loading)\nconst modul = await import('./heavy-module.js');`,
        completed: false,
      },
      {
        id: 'l11', order: 11, title: "Local Storage va Session Storage", duration: '22 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=AUOzvFzdIk4',
        content: `Brauzerda ma'lumot saqlash.\n\nLocalStorage (doimiy):\nlocalStorage.setItem('user', JSON.stringify(user));\nconst user = JSON.parse(localStorage.getItem('user'));\nlocalStorage.removeItem('user');\nlocalStorage.clear();\n\nSessionStorage (sessiya davomida):\nsessionStorage.setItem('token', 'abc123');\n\nCookie bilan farqi:\n• LocalStorage: 5-10MB, muddatsiz\n• SessionStorage: 5MB, brauzer yopilganda o'chadi\n• Cookie: 4KB, server bilan almashadi`,
        completed: false,
      },
      {
        id: 'l12', order: 12, title: "Loyiha: To-Do ilovasi yaratish", duration: '60 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=G0jO8kUrg-I',
        content: `Amaliy loyiha: To-Do ilovasi\n\nFunksiyalar:\n✅ Vazifa qo'shish\n✅ Vazifani bajarilgan deb belgilash\n✅ Vazifani o'chirish\n✅ Filtr: barchasi | bajarilgan | bajarilmagan\n✅ LocalStorage'ga saqlash\n\nTexnologiyalar:\n• HTML5 + CSS3 + Vanilla JavaScript\n• ES6 Modules\n• LocalStorage\n\nBosqichlar:\n1. HTML strukturasi\n2. CSS stillari\n3. Ma'lumotlar boshqaruvi (CRUD)\n4. DOM yangilash\n5. LocalStorage integratsiyasi`,
        completed: false,
      },
    ],
    tasks: [
      {
        id: 't1', title: "To-Do ilovasini yarating", forLesson: 'l12',
        description: "Vanilla JavaScript bilan to-do ilovasi yarating. Ilovada: vazifa qo'shish, o'chirish, bajarilgan deb belgilash, filtr (all/active/completed) va LocalStorage'ga saqlash funksiyalari bo'lishi shart. GitHub'ga yuklang va link yuboring.",
        deadline: '2025-04-30', fileRequirements: 'ZIP yoki GitHub link', maxGrade: 100,
        history: [],
      },
    ],
  },
  '7': {
    title: 'Illyustrator & Brending', emoji: '🖌️', color: 'from-fuchsia-600 to-pink-700',
    lessons: [
      {
        id: 'l1', order: 1, title: "Illustrator interfeysi va sozlamalar", duration: '20 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=Ib8UBwu3yGA',
        content: `Adobe Illustrator — professional vektor grafika dasturi.\n\nAsosiy farq: Raster vs Vektor\n• Raster (Photoshop): piksellardan tashkil topgan\n• Vektor (Illustrator): matematik formulalar — cheksiz kattalashtirish mumkin\n\nInterfeys:\n• Toolbox (chap panel)\n• Properties panel (o'ng)\n• Layers panel\n• Artboard — ish maydoni\n\nBirinchi sozlamalar:\n• Birlikni mm yoki px qilish\n• Color mode: CMYK (bosib chiqarish) yoki RGB (ekran)`,
        completed: false,
      },
      {
        id: 'l2', order: 2, title: "Pen Tool — professional o'zlashtirish", duration: '45 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=SvBn6TIHjAM',
        content: `Pen Tool — Illustrator'ning eng muhim asbobi.\n\nAsosiy tushunchalar:\n• Anchor point (nuqta)\n• Handle (yo'naltiruvchi)\n• Path (yo'l)\n• Closed vs Open path\n\nPen Tool bilan ishlash:\n1. Click — burchakli nuqta\n2. Click + drag — egri nuqta\n3. Alt + click — yo'nalishni o'zgartirish\n\nMashq:\n• To'g'ri chiziq chizish\n• Egri chiziq\n• S shaklida egri\n• Harflar konturini chizish`,
        completed: false,
      },
      {
        id: 'l3', order: 3, title: "Shape Builder va Pathfinder", duration: '30 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=z2bcqyRxFrI',
        content: `Shape Builder va Pathfinder bilan murakkab shakllar yaratish.\n\nShape Builder Tool:\n• Shakllarni birlashtirish: drag across\n• Shakllarni olib tashlash: Alt + click\n\nPathfinder panel:\n• Unite — birlashtirilgan shakl\n• Minus Front — old shaklni kesish\n• Intersect — kesishgan qism\n• Exclude — kesishgan qismni olib tashlash\n\nMashq loyihasi:\n• Soat ikonkasi yaratish\n• Yulduzcha\n• Strelka shakllar`,
        completed: false,
      },
      {
        id: 'l4', order: 4, title: "Typography va shrift tanlash", duration: '28 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=QrNi9FmdlxY',
        content: `Dizaynda tipografiya — kommunikatsiyaning asosi.\n\nShrift turlari:\n• Serif (Times, Georgia) — rasmiy, klassik\n• Sans-serif (Helvetica, Roboto) — zamonaviy, toza\n• Display — sarlavha uchun, dekorativ\n• Monospace (Courier) — kod uchun\n\nBrending uchun shrift tanlash:\n• Kompaniya xarakteriga mos\n• Ikki shrift maksimum (sarlavha + matn)\n• O'qilishi oson bo'lishi shart\n• Litsenziya tekshirish (Google Fonts — bepul)\n\nKombinatsiya misoli:\nSarlavha: Playfair Display (Serif)\nMatn: Inter (Sans-serif)`,
        completed: false,
      },
      {
        id: 'l5', order: 5, title: "Logotip dizayn — bosqichma-bosqich", duration: '60 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=1kP3iBSQJqQ',
        content: `Professional logotip yaratish jarayoni.\n\n1-bosqich: Brief va tadqiqot\n• Kompaniya sohasini tushunish\n• Raqobatchilarni o'rganish\n• Maqsadli auditoriyani aniqlash\n\n2-bosqich: Sketch\n• Qog'ozda 20-30 ta eskiz\n• Eng yaxshi 3-5 tasini tanlash\n\n3-bosqich: Digital yaratish\n• Illustrator'da vektorizatsiya\n• Rang palitrasini qo'llash\n• Turli versiyalar (horizontal, vertikal, icon)\n\n4-bosqich: Prezentatsiya\n• Mock-up'larda ko'rsatish\n• Oq va qora fon versiyalar`,
        completed: false,
      },
      {
        id: 'l6', order: 6, title: "Rang palitrasini tanlash va brending", duration: '35 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=AvgCkHrcj90',
        content: `Rang psixologiyasi va brending.\n\nRang ma'nolari:\n• Qizil — kuch, energiya, shoshilinch\n• Ko'k — ishonch, professionallik, xotirjamlik\n• Yashil — tabiat, salomatlik, o'sish\n• Sariq — baxt, optimizm, diqqat\n• Qora — hashamat, minimalizm\n• Oq — tozalik, soddalik\n\nPalitra yaratish:\n• Primary color (asosiy)\n• Secondary color (qo'shimcha)\n• Neutral (kulrang, qora, oq)\n• Adobe Color: color.adobe.com\n\nMashq: 5 ta brend rangini tahlil qiling`,
        completed: false,
      },
      {
        id: 'l7', order: 7, title: "Brendbuk va brand identity", duration: '50 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=eqMqpkZnL3g',
        content: `Brendbuk — brend qoidalari hujjati.\n\nBrendbukda nima bo'ladi:\n1. Logo va uning variatsiyalari\n2. Rang palitrasining kodi (HEX, CMYK, RGB)\n3. Tipografiya qoidalari\n4. Ikonografiya va ilustratsiyalar\n5. Fotografiya stili\n6. Foydalanish qoidalari (do/don't)\n\nBrand Identity elementlari:\n• Logo (asosiy identifikator)\n• Vizitka, letterhead\n• Ijtimoiy tarmoq shablonlari\n• Paket dizayni\n• Reklama materiallari\n\nAdobe InDesign brendbuk uchun eng yaxshi dastur`,
        completed: false,
      },
      {
        id: 'l8', order: 8, title: "Mock-up va prezentatsiya tayyorlash", duration: '30 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=OkjKBOCxpFQ',
        content: `Mock-up — dizaynni real hayotda ko'rsatish.\n\nMock-up turlari:\n• Fizik: stakan, ko'ylak, sumka\n• Digital: telefon, laptop ekranida\n• Muhit: ofis, ko'cha reklamasi\n\nBepul mock-up resurslari:\n• Freepik.com\n• Mockupworld.co\n• Unblast.com\n• Ls.graphics\n\nIllustrator'da Smart Object bilan ishlash:\n1. Mock-up faylini ochish\n2. Smart Object'ni ikki marta bosish\n3. Dizayningizni joylashtirish\n4. Saqlash — avtomatik yangilanadi\n\nPrezentatsiya uchun Behance yoki PDF tayyorlang`,
        completed: false,
      },
    ],
    tasks: [
      {
        id: 't1', title: "Logotip va mini brendbuk yarating", forLesson: 'l7',
        description: "Xayoliy kompaniya uchun logotip va mini brendbuk yarating. Logotip vektorli bo'lishi, brendbukda rang palitrasining kodlari (HEX, RGB), tipografiya va logotipning kamida 2 ta variatsiyasi (light/dark background) bo'lishi shart. AI yoki PDF formatida yuboring.",
        deadline: '2025-05-01', fileRequirements: 'AI, PDF, PNG — max 50MB', maxGrade: 100,
        history: [],
      },
    ],
  },
  '9': {
    title: 'Adobe Photoshop & Illustrator', emoji: '🖼️', color: 'from-orange-500 to-red-600',
    lessons: [
      {
        id: 'l1', order: 1, title: "Adobe Photoshop: Interfeys va asosiy asboblar", duration: '30 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=IyR_uYsRdPs',
        content: `Adobe Photoshop — dunyo bo'ylab #1 rasm tahrirlovchi.\n\nInterfeys:\n• Menu bar (yuqori)\n• Toolbar (chap)\n• Options bar (asbob sozlamalari)\n• Panels (o'ng: Layers, Properties, Color)\n\nAsosiy asboblar:\n• Move Tool (V) — elementlarni ko'chirish\n• Marquee (M) — to'rtburchak va oval tanlov\n• Lasso (L) — erkin tanlov\n• Magic Wand (W) — rang bo'yicha tanlov\n• Crop (C) — qirqish\n• Brush (B) — cho'tka\n• Clone Stamp (S) — klonlash\n• Text (T) — matn\n\nBirinchi loyiha: Fotosuratni crop va brightness/contrast bilan tahrirlash`,
        completed: false,
      },
      {
        id: 'l2', order: 2, title: "Qatlamlar (Layers) va maskalar", duration: '35 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=PUMA3fdkrTU',
        content: `Layers — Photoshop'ning asosi.\n\nLayer turlari:\n• Normal layer — rasm, grafika\n• Text layer — matn\n• Shape layer — vektor shakl\n• Adjustment layer — rang korreksiyasi\n• Smart Object — zarar yetkazmasdan tahrirlash\n\nLayer Masks:\n• Qora — yashiradi\n• Oq — ko'rsatadi\n• Cho'tka bilan nozik tahrirlash mumkin\n\nBlending Modes:\n• Normal, Multiply, Screen, Overlay\n• Color, Luminosity\n\nAmaliy: Ikki fotosuratni birlashtirish (double exposure)`,
        completed: false,
      },
      {
        id: 'l3', order: 3, title: "Rasmlarni tahrirlash va retush", duration: '40 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=8wQKYqoRMhY',
        content: `Professional rasm retushi texnikalari.\n\nOsmon almashtirish:\n• Quick Selection bilan osmonni tanlash\n• Layer Mask qo'llash\n• Yangi osmon joylash\n\nTeri retushi (natural):\n• Frequency Separation texnikasi\n• Dodge va Burn asboblari\n• Healing Brush\n\nRang korreksiyasi:\n• Curves (Ctrl/Cmd+M)\n• Hue/Saturation\n• Color Balance\n• Camera Raw Filter\n\nTarmoqlar uchun tayyorlash:\n• Web: sRGB, 72 PPI, JPEG\n• Chop: CMYK, 300 DPI, TIFF/PDF`,
        completed: false,
      },
      {
        id: 'l4', order: 4, title: "Adobe Illustrator: Interfeys va asosiy asboblar", duration: '28 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=Ib8UBwu3yGA',
        content: `Adobe Illustrator — professional vektor grafika dasturi.\n\nPhotoshop vs Illustrator:\n• Photoshop: raster (foto, effektlar)\n• Illustrator: vektor (logo, ikonka, illyustratsiya)\n\nAsosiy asboblar:\n• Selection Tool (V) — obyektni tanlash\n• Direct Selection (A) — nuqtalarni tanlash\n• Pen Tool (P) — yo'l chizish\n• Type Tool (T) — matn\n• Rectangle (M) — to'rtburchak\n• Ellipse (L) — doira\n• Star Tool — yulduz\n\nArtboard — bir faylda bir nechta dizayn sahifasi`,
        completed: false,
      },
      {
        id: 'l5', order: 5, title: "Vektor grafika va Pen Tool", duration: '45 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=SvBn6TIHjAM',
        content: `Pen Tool — Illustrator'ning eng muhim asbobi.\n\nVektor yo'llar:\n• Anchor points (nuqtalar)\n• Bezier handles (egrilik)\n• Closed/Open path\n\nPen Tool texnikasi:\n1. Click = to'g'ri segment\n2. Click + Drag = egri segment\n3. Alt = handle yo'nalishini o'zgartirish\n4. Shift = 45° cheklov\n\nMashq bosqichlari:\n• Kvadrat chizish (pen bilan)\n• Uchburchak\n• Banana shakli\n• Harflarni retrace qilish\n\nLive Trace: Raster rasmni vektorgachangaylash`,
        completed: false,
      },
      {
        id: 'l6', order: 6, title: "Logo dizayn — bosqichma-bosqich", duration: '60 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=1kP3iBSQJqQ',
        content: `Professional logo yaratish jarayoni.\n\nBosqich 1 — Research (Tadqiqot):\n• Mijoz sohasini o'rganish\n• Raqobatchilar logolarini tahlil\n• Kalit so'zlar: ishonch, texnologiya, do'stona...\n\nBosqich 2 — Sketch:\n• 20+ eskiz qog'ozda\n• Turli konsepsiyalar sinab ko'rish\n\nBosqich 3 — Digital:\n• Illustrator'da yaratish\n• Pen Tool + Shape Builder\n• Rang qo'llash\n\nBosqich 4 — Refinement:\n• Optik muvozanat\n• Turli o'lchamlarda tekshirish\n• Black/white versiya\n\nBosqich 5 — Eksport:\n• AI, SVG, EPS (vektor)\n• PNG 1x, 2x, 3x (raster)`,
        completed: false,
      },
      {
        id: 'l7', order: 7, title: "Brending: brand identity va brendbuk", duration: '50 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=eqMqpkZnL3g',
        content: `Brand identity — kompaniyaning vizual tili.\n\nBrand identity elementi:\n1. Logo (birlamchi va ikkilamchi)\n2. Rang palitrasining kodlari\n3. Tipografiya qoidalari\n4. Ikonografiya stili\n5. Fotografiya yo'nalishi\n6. Foydalanish qoidalari (do/don't)\n\nBrendbuk yaratish:\n• A4 yoki A3 format\n• Adobe InDesign yoki Illustrator\n• Minimum 10-15 sahifa\n\nMijozga topshirish paketi:\n✓ Logo fayllar (AI, SVG, PNG, PDF)\n✓ Brendbuk PDF\n✓ Rang kodlari hujjati\n✓ Shrift litsenziyalar`,
        completed: false,
      },
      {
        id: 'l8', order: 8, title: "Rang nazariyasi — professional dizayner siri", duration: '35 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=AvgCkHrcj90',
        content: `Rang nazariyasi — dizaynning asosi.\n\nRang modellari:\n• RGB (ekran: qizil+yashil+ko'k)\n• CMYK (bosib chiqarish)\n• HSB/HSL (inson idrokiga yaqin)\n\nRang uyg'unligi:\n• Komplementar (qarshi ranglar)\n• Analogli (qo'shni ranglar)\n• Triadik (uchburchak)\n• Monoxromatik (bir rangning soyalari)\n\nRang psixologiyasi:\n🔴 Qizil — kuch, shoshilinch, muhabbat\n🔵 Ko'k — ishonch, xotirjamlik\n🟢 Yashil — tabiat, salomatlik, pul\n🟡 Sariq — energiya, baxt, diqqat\n\nAdo Color: color.adobe.com — bepul palitra generator`,
        completed: false,
      },
      {
        id: 'l9', order: 9, title: "Tipografiya: shrift tanlash va kompozitsiya", duration: '32 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=QrNi9FmdlxY',
        content: `Tipografiya — matnni dizayn elementiga aylantirish.\n\nShrift turlari:\n• Serif: Times, Georgia, Garamond — klassik, rasmiy\n• Sans-serif: Helvetica, Inter, Roboto — zamonaviy\n• Display: decorativ, sarlavha uchun\n• Script: qo'lda yozilgan ko'rinish\n\nBrending uchun shrift tanlash qoidalari:\n1. Ikki shrift yetarli (sarlavha + matn)\n2. Kontrastli kombinatsiya (serif+sans)\n3. O'qilishi — #1 prioritet\n4. Maqsadli auditoriya mos bo'lishi\n\nBepul shrift resurslari:\n• fonts.google.com\n• fontsquirrel.com\n• dafont.com\n\nKerning, Leading, Tracking muhim sozlamalar`,
        completed: false,
      },
      {
        id: 'l10', order: 10, title: "Mijoz bilan ishlash: brief va muloqot", duration: '25 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=OkjKBOCxpFQ',
        content: `Professional mijoz bilan ishlash jarayoni.\n\nDesign Brief savollar:\n• Kompaniyangiz haqida 3 so'z bilan ayting\n• Kim sizning maqsadli auditoriyangiz?\n• Qaysi kompaniyalarning dizaynini yoqtirasiz?\n• Qaysilarini yoqtirmaysiz?\n• Qanday his-tuyg'u uyg'otishi kerak?\n• Qaysi ranglarni ko'rib bo'lmaysiz?\n• Deadline va byudjet?\n\nJarayon:\n1. Brief → Kontrakt → Avans to'lov\n2. Konsepsiya taklifi (2-3 ta variant)\n3. Mijoz tanlovi va reviziya\n4. Final versiya → Final to'lov\n5. Fayl topshirish\n\nReviziya chegarasini kontraktda belgilang (2-3 ta)`,
        completed: false,
      },
      {
        id: 'l11', order: 11, title: "Reviziya va feedback bilan ishlash", duration: '20 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=3n_2jAiH3pQ',
        content: `Reviziya jarayonini professional boshqarish.\n\nReviziya so'rovlarini qabul qilish:\n• Yozma formatda olish (email/chat)\n• Aniq vazifalarni sanab chiqish\n• Noaniq so'rovlarni aniqlashtirish\n\nMuloqot qoidalari:\n✓ 24 soat ichida javob bering\n✓ Progress haqida xabardor qiling\n✓ Muammolarni erta aytib qo'ying\n\nReviziya chegarasini saqlash:\n• "Bu 3-reviziya, kontrakt bo'yicha shu so'nggi"\n• Qo'shimcha o'zgartirish uchun narx belgilash\n\nKonflikt holatlarda:\n• Professional va xotirjam tuning\n• Kontrakt shartlarini eslatib qo'ying`,
        completed: false,
      },
      {
        id: 'l12', order: 12, title: "Portfolio yaratish va ish namunalari", duration: '40 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=3n_2jAiH3pQ',
        content: `Dizayner portfoliosi — ish topishning kaliti.\n\nPortfolio uchun nima kerak:\n• 5-10 ta yaxshi ish (miqdor emas, sifat)\n• Har bir ish uchun: muammo → yechim → natija\n• Mock-uplarda ko'rsatish\n• Case study yozish\n\nPortfolio platformalari:\n🎨 Behance — Adobe'ning rasmiy platforma\n🏀 Dribbble — dizaynerlar jamoasi\n💼 LinkedIn — professional tarmoq\n🌐 Shaxsiy sayt — eng professional\n\nCase Study strukturasi:\n1. Loyiha maqsadi\n2. Tadqiqot jarayoni\n3. Dizayn qarorlari\n4. Final natija\n5. Mijoz fikri (testimonial)`,
        completed: false,
      },
      {
        id: 'l13', order: 13, title: "Behance va Dribbble'da profil yaratish", duration: '22 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=LPJ30YK4HgA',
        content: `Ijtimoiy portfolio platformalarini to'ldirish.\n\nBehance:\n• Adobe Creative Cloud bilan integratsiya\n• Project yaratish va case study\n• Followers va appreciation tizimi\n• Ish topish: Behance Jobs\n\nDribbble:\n• Short-form dizayn ko'rsatish\n• Shot — 1 ta dizayn\n• Team qidirish imkoniyati\n• Pro plan: ajoyib imkoniyatlar\n\nProfil optimizatsiyasi:\n• Professional foto\n• Qisqa va aniq bio\n• Ko'nikmalar ro'yxati\n• Aloqa ma'lumotlari (email, Telegram)\n\nHashtag va teglash — ko'proq ko'rinish`,
        completed: false,
      },
      {
        id: 'l14', order: 14, title: "Upwork va Fiverr'da dizayner sifatida", duration: '30 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=LPJ30YK4HgA',
        content: `Freelancing platformalarda dizayner sifatida ishlash.\n\nUpwork uchun:\n• Portfolio va tavsif to'ldirish\n• Logo Design, Brand Identity, Print Design — kalit so'zlar\n• Soatlik narx: boshlang'ich $10-20/soat\n• Fixed-price loyihalar ham bor\n\nFiverr uchun:\n• Gig yaratish: "I will design a professional logo"\n• 3 paket: Basic (1 konsepsiya), Standard (2), Premium (3)\n• Delivery time muhim — 2-3 kun\n• Extras: source file, social media kit\n\nBirinchi mijozlarni topish:\n• Do'stlar va tanishlar\n• Mahalliy bizneslar\n• Non-profit tashkilotlar (tajriba uchun)\n• Portfolio uchun arzon/bepul ishlash`,
        completed: false,
      },
      {
        id: 'l15', order: 15, title: "Narx belgilash va muzokaralar", duration: '25 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=LPJ30YK4HgA',
        content: `Dizayner sifatida narx belgilash strategiyasi.\n\nNarx hisoblash usullari:\n1. Soatlik narx × vaqt\n2. Loyiha qiymati asosida (value-based)\n3. Paket narxlar\n\nO'rtacha narxlar (Uzbekiston bozori):\n• Logo dizayn: 300,000 — 1,500,000 so'm\n• Brendbuk: 500,000 — 3,000,000 so'm\n• Social media kit: 200,000 — 800,000 so'm\n\nNarxni oshirish:\n• Portfolio kuchaytirish\n• Ixtisoslashish (restaurant branding, tech startups)\n• Testimoniallar yig'ish\n• Doimiy mijozlar bazasini kengaytirish\n\nMuzokarada: Birinchi narx ayting, sabr qiling!`,
        completed: false,
      },
      {
        id: 'l16', order: 16, title: "Amaliy loyiha: Restoran uchun to'liq brending", duration: '75 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=eqMqpkZnL3g',
        content: `Yakuniy loyiha: "Navruz" restoraci uchun brending.\n\nNima yaratiladi:\n✅ Logotip (asosiy + variantlar)\n✅ Rang palitrasining kodlari\n✅ Tipografiya tanlovi\n✅ Vizitka dizayni\n✅ Menyusining muqovasi\n✅ Instagram profil rasmi\n✅ Mini brendbuk (4-6 sahifa)\n\nDasturlar: Photoshop + Illustrator\n\nTopshirish:\n• PDF brendbuk\n• PNG/SVG logo fayllar\n• Behance'ga yuklash\n\nBu loyiha sizning portfoliongizning asosini tashkil qiladi!`,
        completed: false,
      },
    ],
    tasks: [
      {
        id: 't1', title: "Restoran brendingini yarating", forLesson: 'l16',
        description: "Xayoliy yoki haqiqiy restoran uchun to'liq brending paketi tayyorlang: logotip, rang palitrasining kodlari, tipografiya, vizitka va mini brendbuk (PDF). Behance'ga yuklang va havolani yuboring.",
        deadline: '2025-05-15', fileRequirements: 'PDF, ZIP (logo fayllar) — max 100MB', maxGrade: 100,
        history: [],
      },
    ],
  },
  '10': {
    title: 'React va Modern Frontend', emoji: '⚛️', color: 'from-sky-500 to-blue-700',
    lessons: [
      {
        id: 'l1', order: 1, title: "React nima va nima uchun kerak", duration: '20 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=w7ejDZ8SWv8',
        content: `React — Facebook tomonidan yaratilgan UI kutubxonasi.\n\nNima uchun React:\n• Komponentli arxitektura — qayta ishlatish\n• Virtual DOM — tez yangilanish\n• Katta ekotizim\n• Katta kompaniyalar ishlatadi (Facebook, Airbnb, Netflix)\n\nReact vs boshqalar:\n• Vue.js — oson o'rganish\n• Angular — to'liq framework\n• React — eng mashhur, eng ko'p ish\n\nO'rnatish:\nnpx create-react-app mening-ilova\n# yoki\nnpm create vite@latest mening-ilova -- --template react\n\nVite — tezroq, zamonaviy tanlov`,
        completed: false,
      },
      {
        id: 'l2', order: 2, title: "Create React App va loyiha tuzilmasi", duration: '25 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=w7ejDZ8SWv8',
        content: `React loyihasi tuzilmasi.\n\nsrc/\n├── components/     # Qayta ishlatiladigan komponentlar\n├── pages/          # Sahifa komponentlar\n├── hooks/          # Custom hooks\n├── utils/          # Yordamchi funksiyalar\n├── assets/         # Rasmlar, fontlar\n├── App.jsx         # Asosiy komponent\n└── main.jsx        # Kirish nuqtasi\n\nMuhim fayllar:\n• package.json — bog'liqliklar\n• .env — muhit o'zgaruvchilar\n• vite.config.js — sozlamalar\n\nSkriptlar:\nnpm run dev     # Development server\nnpm run build   # Production build\nnpm run preview # Build preview`,
        completed: false,
      },
      {
        id: 'l3', order: 3, title: "JSX va komponentlar — asoslar", duration: '30 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=35lXWvCuM8o',
        content: `JSX — JavaScript + HTML aralashmasi.\n\nJSX qoidalari:\n• Bitta root element\n• className (class o'rniga)\n• htmlFor (for o'rniga)\n• Barcha teglar yopilishi shart: <img />\n• {} ichida JavaScript ifodalar\n\nFunksional komponent:\nfunction Salomlash({ ism }) {\n  return (\n    <div className="card">\n      <h1>Salom, {ism}!</h1>\n      <p>Bugun {new Date().toLocaleDateString()}</p>\n    </div>\n  );\n}\n\nexport default Salomlash;\n\n// Ishlatish:\n<Salomlash ism="Ali" />`,
        completed: false,
      },
      {
        id: 'l4', order: 4, title: "Props va ma'lumot uzatish", duration: '28 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=35lXWvCuM8o',
        content: `Props — komponentlarga ma'lumot uzatish.\n\nPropsni qabul qilish:\nfunction Karta({ sarlavha, tavsif, rang = 'blue' }) {\n  return (\n    <div style={{ borderColor: rang }}>\n      <h2>{sarlavha}</h2>\n      <p>{tavsif}</p>\n    </div>\n  );\n}\n\nProps turlari:\n• String: <Karta sarlavha="Salom" />\n• Number: <Karta baho={4.9} />\n• Boolean: <Karta aktiv />\n• Array: <Karta teglar={['JS', 'React']} />\n• Funksiya: <Karta onClick={handleClick} />\n• children: <Karta><p>Kontent</p></Karta>\n\nProps.children:\nfunction Card({ children }) {\n  return <div className="card">{children}</div>;\n}`,
        completed: false,
      },
      {
        id: 'l5', order: 5, title: "useState Hook — holat boshqarish", duration: '35 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=cF2lQ_gZeA8',
        content: `useState — komponent holatini boshqarish.\n\nimport { useState } from 'react';\n\nfunction Hisoblagich() {\n  const [son, setSon] = useState(0);\n\n  return (\n    <div>\n      <p>Son: {son}</p>\n      <button onClick={() => setSon(son + 1)}>+</button>\n      <button onClick={() => setSon(son - 1)}>-</button>\n      <button onClick={() => setSon(0)}>Reset</button>\n    </div>\n  );\n}\n\nMurakkab holat:\nconst [forma, setForma] = useState({\n  ism: '',\n  email: '',\n});\n\n// Yangilash:\nsetForma(prev => ({ ...prev, ism: 'Ali' }));`,
        completed: false,
      },
      {
        id: 'l6', order: 6, title: "useEffect Hook — yon effektlar", duration: '32 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=0ZJgIjIuY7U',
        content: `useEffect — komponent hayot siklini boshqarish.\n\nimport { useState, useEffect } from 'react';\n\nfunction Foydalanuvchilar() {\n  const [users, setUsers] = useState([]);\n  const [loading, setLoading] = useState(true);\n\n  useEffect(() => {\n    // Mount: komponent renderdan keyin\n    fetch('/api/users')\n      .then(r => r.json())\n      .then(data => {\n        setUsers(data);\n        setLoading(false);\n      });\n\n    // Cleanup (unmount):\n    return () => { /* tozalash */ };\n  }, []); // [] = faqat bir marta\n\n  // [userId] = userId o'zgarganda qayta\n\n  if (loading) return <p>Yuklanmoqda...</p>;\n  return <ul>{users.map(u => <li>{u.ism}</li>)}</ul>;\n}`,
        completed: false,
      },
      {
        id: 'l7', order: 7, title: "useRef, useMemo va useCallback", duration: '30 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=_AyFbAN9k4M',
        content: `Optimizatsiya Hooks'lari.\n\nuseRef — DOM elementi yoki o'zgarmas qiymat:\nconst inputRef = useRef(null);\n<input ref={inputRef} />\ninputRef.current.focus(); // fokus berish\n\nuseMemo — qimmat hisoblashni keshlash:\nconst filteredList = useMemo(() => {\n  return items.filter(i => i.aktiv);\n}, [items]); // items o'zgarganda qayta hisoblash\n\nuseCallback — funksiyani keshlash:\nconst handleClick = useCallback(() => {\n  doSomething(id);\n}, [id]);\n\n📌 Muhim: Hamma joyda ishlatish shart emas.\nFaqat performance muammo bo'lganda ishlatish.`,
        completed: false,
      },
      {
        id: 'l8', order: 8, title: "Custom Hooks yaratish", duration: '28 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=6ThXsUwLWvc',
        content: `Custom Hooks — mantiqni qayta ishlatish.\n\n// useFetch.js\nfunction useFetch(url) {\n  const [data, setData] = useState(null);\n  const [loading, setLoading] = useState(true);\n  const [error, setError] = useState(null);\n\n  useEffect(() => {\n    fetch(url)\n      .then(r => r.json())\n      .then(setData)\n      .catch(setError)\n      .finally(() => setLoading(false));\n  }, [url]);\n\n  return { data, loading, error };\n}\n\n// Ishlatish:\nfunction Komponent() {\n  const { data, loading } = useFetch('/api/posts');\n  if (loading) return <Spinner />;\n  return <PostList posts={data} />;\n}\n\nBoshqa foydali custom hooks:\n• useLocalStorage\n• useDebounce\n• useWindowSize\n• useMediaQuery`,
        completed: false,
      },
      {
        id: 'l9', order: 9, title: "Context API va global holat", duration: '35 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=5LrDIWkK_Bc',
        content: `Context API — props drilling'ni bartaraf etish.\n\nContext yaratish:\nconst AuthContext = createContext(null);\n\nexport function AuthProvider({ children }) {\n  const [user, setUser] = useState(null);\n\n  const login = (userData) => setUser(userData);\n  const logout = () => setUser(null);\n\n  return (\n    <AuthContext.Provider value={{ user, login, logout }}>\n      {children}\n    </AuthContext.Provider>\n  );\n}\n\nexport const useAuth = () => useContext(AuthContext);\n\n// Ishlatish (ixtiyoriy komponentda):\nconst { user, logout } = useAuth();\n\nKachon ishlatish:\n✓ Theme (dark/light)\n✓ User autentifikatsiya\n✓ Til (i18n)\n✗ Ko'p o'zgaradigan ma'lumotlar uchun Zustand ishlatish`,
        completed: false,
      },
      {
        id: 'l10', order: 10, title: "React Router v6", duration: '40 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=UWYOC8g5N_0',
        content: `React Router — SPA navigatsiyasi.\n\nnpm install react-router-dom\n\nAsosiy tuzilma:\nimport { BrowserRouter, Routes, Route } from 'react-router-dom';\n\nfunction App() {\n  return (\n    <BrowserRouter>\n      <Routes>\n        <Route path="/" element={<Bosh />} />\n        <Route path="/kurslar" element={<Kurslar />} />\n        <Route path="/kurslar/:id" element={<KursDetail />} />\n        <Route path="*" element={<NotFound />} />\n      </Routes>\n    </BrowserRouter>\n  );\n}\n\nNavigatsiya:\nimport { Link, useNavigate, useParams } from 'react-router-dom';\n<Link to="/kurslar">Kurslar</Link>\nconst nav = useNavigate(); nav('/kurslar');\nconst { id } = useParams();`,
        completed: false,
      },
      {
        id: 'l11', order: 11, title: "API bilan ishlash va ma'lumot yuklash", duration: '38 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=cuEtnrL9-H0',
        content: `React'da API bilan ishlash best practices.\n\nLoading holati boshqarish:\nfunction PostList() {\n  const [posts, setPosts] = useState([]);\n  const [loading, setLoading] = useState(true);\n  const [error, setError] = useState(null);\n\n  useEffect(() => {\n    const controller = new AbortController();\n    \n    fetch('https://jsonplaceholder.typicode.com/posts', {\n      signal: controller.signal\n    })\n      .then(r => r.json())\n      .then(setPosts)\n      .catch(err => {\n        if (err.name !== 'AbortError') setError(err.message);\n      })\n      .finally(() => setLoading(false));\n\n    return () => controller.abort(); // cleanup\n  }, []);\n\n  if (loading) return <Skeleton />;\n  if (error) return <ErrorMessage message={error} />;\n  return posts.map(p => <PostCard key={p.id} post={p} />);\n}`,
        completed: false,
      },
      {
        id: 'l12', order: 12, title: "Formalar va validatsiya", duration: '35 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=bU_eq8qyjic',
        content: `React Hook Form — eng yaxshi forma kutubxonasi.\n\nnpm install react-hook-form\n\nimport { useForm } from 'react-hook-form';\n\nfunction LoginForma() {\n  const { register, handleSubmit, formState: { errors } } = useForm();\n\n  const onSubmit = (data) => console.log(data);\n\n  return (\n    <form onSubmit={handleSubmit(onSubmit)}>\n      <input\n        {...register('email', {\n          required: 'Email majburiy',\n          pattern: { value: /\\S+@\\S+/, message: 'Email noto'g'ri' }\n        })}\n      />\n      {errors.email && <p>{errors.email.message}</p>}\n      <button type="submit">Kirish</button>\n    </form>\n  );\n}`,
        completed: false,
      },
      {
        id: 'l13', order: 13, title: "Komponentlarni optimallashtirish", duration: '30 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=_AyFbAN9k4M',
        content: `React Performance optimizatsiyasi.\n\nReact.memo — qayta render'ni oldini olish:\nconst PastaKomponent = React.memo(({ data }) => {\n  return <div>{data.title}</div>;\n});\n\nLazy Loading:\nconst HeavyComponent = React.lazy(() => import('./HeavyComponent'));\n\nfunction App() {\n  return (\n    <Suspense fallback={<Spinner />}>\n      <HeavyComponent />\n    </Suspense>\n  );\n}\n\nReact Developer Tools:\n• Profiler — qaysi komponent sekin\n• Highlight updates — ko'p render tekshirish\n\nKod bo'lish (Code Splitting):\n• Route asosida lazy loading\n• Aloqador bo'lmagan kod alohida bundle`,
        completed: false,
      },
      {
        id: 'l14', order: 14, title: "Testing: Jest va React Testing Library", duration: '35 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=7dTTFW269jM',
        content: `React'da testing — professional dasturchilik.\n\nTest turlari:\n• Unit test — alohida funksiya/komponent\n• Integration test — bir nechta komponent\n• E2E test — Cypress/Playwright\n\nimport { render, screen, fireEvent } from '@testing-library/react';\nimport Hisoblagich from './Hisoblagich';\n\ntest('bosqanda sonni oshiradi', () => {\n  render(<Hisoblagich />);\n  \n  const button = screen.getByText('+');\n  fireEvent.click(button);\n  \n  expect(screen.getByText('Son: 1')).toBeInTheDocument();\n});\n\nnpm test     # Jest'ni ishga tushirish`,
        completed: false,
      },
      {
        id: 'l15', order: 15, title: "Next.js bilan tanishuv", duration: '40 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=mTz0GXj8NN0',
        content: `Next.js — React'ning production-ready framework'i.\n\nNega Next.js:\n• Server-Side Rendering (SEO uchun)\n• Static Site Generation\n• File-based routing\n• API Routes\n• Image Optimization\n• TypeScript baked-in\n\nnpx create-next-app@latest mening-loyiha\n\nApp Router (Next.js 13+):\napp/\n├── page.tsx          # / sahifasi\n├── about/page.tsx    # /about\n├── blog/[id]/page.tsx # /blog/:id\n├── layout.tsx        # Umumiy layout\n└── api/users/route.ts # API endpoint\n\nServer vs Client Components:\n• Default: Server Component\n• 'use client' — Client Component`,
        completed: false,
      },
      {
        id: 'l16', order: 16, title: "TypeScript bilan React", duration: '45 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=jrKcJxF0lAU',
        content: `TypeScript — JavaScript + tip xavfsizligi.\n\nInterface va Type:\ninterface Foydalanuvchi {\n  id: number;\n  ism: string;\n  email: string;\n  aktiv?: boolean; // optional\n}\n\nKomponent tiplash:\ninterface Props {\n  sarlavha: string;\n  bola: React.ReactNode;\n  onClick?: () => void;\n}\n\nfunction Karta({ sarlavha, bola, onClick }: Props) {\n  return <div onClick={onClick}><h2>{sarlavha}</h2>{bola}</div>;\n}\n\nuseState tiplash:\nconst [user, setUser] = useState<Foydalanuvchi | null>(null);\n\nEvent tiplash:\nconst handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {\n  setValue(e.target.value);\n};`,
        completed: false,
      },
      {
        id: 'l17', order: 17, title: "Tailwind CSS bilan React", duration: '30 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=pfaSUYaSgRo',
        content: `Tailwind CSS + React — eng samarali kombinatsiya.\n\nnpm install -D tailwindcss postcss autoprefixer\nnpx tailwindcss init -p\n\ntailwind.config.js:\ncontent: ["./src/**/*.{js,jsx,ts,tsx}"]\n\nMisollar:\n<button className={\`\n  px-4 py-2 rounded-xl font-semibold\n  transition-all duration-200\n  \${aktiv\n    ? 'bg-blue-600 text-white hover:bg-blue-500'\n    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'\n  }\n\`}>\n  Bosing\n</button>\n\nclsx yoki cn() bilan:\nimport { clsx } from 'clsx';\nconst classes = clsx('base-class', { 'active': isActive });`,
        completed: false,
      },
      {
        id: 'l18', order: 18, title: "Loyiha: Weather App", duration: '60 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=GuA0_Z1llYU',
        content: `Amaliy loyiha: Ob-havo ilovasi.\n\nIshlatadigan texnologiyalar:\n• React + Vite\n• OpenWeatherMap API (bepul)\n• Tailwind CSS\n• axios yoki fetch\n\nFunksiyalar:\n• Shahar qidirish\n• Hozirgi ob-havo ko'rsatish\n• 5 kunlik prognoz\n• Harorat birligini almashtirish (°C/°F)\n• LocalStorage'ga oxirgi qidirishni saqlash\n\nAPI: https://openweathermap.org/api\nBepul plan: 1,000,000 so'rov/oy\n\nQadam-ba-qadam:\n1. Loyiha tuzilmasini sozlash\n2. API integratsiya\n3. UI komponentlar\n4. State boshqarish\n5. Error handling\n6. Responsive dizayn`,
        completed: false,
      },
      {
        id: 'l19', order: 19, title: "Loyiha: E-commerce sahifa", duration: '75 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=tEMrD9t85v4',
        content: `Yakuniy loyiha: E-commerce do'kon sahifasi.\n\nSahifalar:\n• / — asosiy sahifa (featured products)\n• /products — barcha mahsulotlar + filtr\n• /products/:id — mahsulot detail\n• /cart — savat\n• /checkout — buyurtma\n\nFunksiyalar:\n✅ Mahsulotlar ro'yxati va filtr\n✅ Savatga qo'shish (Context API)\n✅ Mahsulot detail sahifasi\n✅ Savatdagi miqdorni o'zgartirish\n✅ Buyurtma formasi (React Hook Form)\n✅ LocalStorage — savatni saqlash\n\nTashqi API: DummyJSON (bepul, fake products)\nhttps://dummyjson.com/products\n\nDeploy: Vercel'ga joylash`,
        completed: false,
      },
      {
        id: 'l20', order: 20, title: "Xulosa va keyingi qadamlar", duration: '20 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=w7ejDZ8SWv8',
        content: `React'ni o'rganib bo'lgach keyingi qadamlar.\n\nO'rganilgan mavzular:\n✅ JSX va komponentlar\n✅ Props va State\n✅ Hooks (useState, useEffect, useRef, useMemo)\n✅ Custom Hooks\n✅ Context API\n✅ React Router v6\n✅ API integratsiya\n✅ Forma validatsiya\n✅ Performance optimallashtirish\n✅ TypeScript + Tailwind\n\nKeyingi qadamlar:\n1. Next.js — to'liq o'rganish\n2. State management: Zustand yoki Redux\n3. Backend bilan integratsiya\n4. Real loyiha yaratish\n5. GitHub'ga yuklash\n6. Ish qidirish\n\nResurslar:\n• react.dev — rasmiy hujjatlar\n• ui.dev/react\n• Epic React by Kent C. Dodds`,
        completed: false,
      },
    ],
    tasks: [
      {
        id: 't1', title: "Weather App yarating", forLesson: 'l18',
        description: "React va OpenWeatherMap API bilan ob-havo ilovasi yarating. Ilovada shahar qidirish, hozirgi ob-havo va 5 kunlik prognoz bo'lishi shart. Tailwind CSS bilan responsive dizayn qiling. GitHub'ga yuklang.",
        deadline: '2025-05-20', fileRequirements: 'GitHub repository havolasi', maxGrade: 100,
        history: [],
      },
    ],
  },
  '11': {
    title: 'Backend, Database va Deployment', emoji: '🗄️', color: 'from-slate-600 to-gray-800',
    lessons: [
      {
        id: 'l1', order: 1, title: "Node.js — nima va qanday ishlaydi", duration: '25 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=TlB_eWDSMt4',
        content: `Node.js — brauzerdan tashqarida JavaScript.\n\nNode.js nima:\n• Chrome V8 engine asosida\n• Server-side JavaScript\n• Non-blocking I/O (asinxron)\n• Single-threaded, Event Loop\n\nKachon ishlatish:\n✓ REST API serverlar\n✓ Real-time ilovalar (chat)\n✓ Microservices\n✓ CLI asboblar\n\nO'rnatish: nodejs.org\n\nBirinchi dastur:\n// server.js\nconst http = require('http');\n\nconst server = http.createServer((req, res) => {\n  res.writeHead(200, { 'Content-Type': 'text/plain' });\n  res.end('Salom, Node.js!');\n});\n\nserver.listen(3000, () => {\n  console.log('Server: http://localhost:3000');\n});`,
        completed: false,
      },
      {
        id: 'l2', order: 2, title: "NPM va paket boshqarish", duration: '20 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=jHDhaSSKmB0',
        content: `NPM — Node Package Manager.\n\nAsosiy buyruqlar:\nnpm init -y              # yangi loyiha\nnpm install express      # paket o'rnatish\nnpm install -D nodemon   # dev dependency\nnpm uninstall express    # o'chirish\nnpm update               # yangilash\n\npackage.json:\n{\n  "scripts": {\n    "start": "node index.js",\n    "dev": "nodemon index.js"\n  },\n  "dependencies": { "express": "^4.18.0" },\n  "devDependencies": { "nodemon": "^3.0.0" }\n}\n\nnode_modules — .gitignore'ga qo'shing!\n\nPNPM yoki Bun — alternativalar (tezroq)`,
        completed: false,
      },
      {
        id: 'l3', order: 3, title: "Fayl tizimi va Event Loop", duration: '30 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=8aGhZQkoFbQ',
        content: `Node.js'ning asosiy modullari.\n\nFS (File System):\nconst fs = require('fs');\n\n// Sinxron (bloklovchi):\nconst content = fs.readFileSync('file.txt', 'utf8');\n\n// Asinxron (afzal):\nfs.readFile('file.txt', 'utf8', (err, data) => {\n  if (err) throw err;\n  console.log(data);\n});\n\n// Promise (zamonaviy):\nconst fs = require('fs/promises');\nconst data = await fs.readFile('file.txt', 'utf8');\n\nEvent Loop:\n1. Call Stack — joriy kod\n2. Microtask Queue — Promise callbacks\n3. Macrotask Queue — setTimeout, setInterval\n4. I/O callbacks — fs, network`,
        completed: false,
      },
      {
        id: 'l4', order: 4, title: "Express.js bilan server yaratish", duration: '35 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=L72fhGm1tfE',
        content: `Express.js — Node.js uchun eng mashhur web framework.\n\nnpm install express\n\nBasic server:\nconst express = require('express');\nconst app = express();\n\n// Middleware\napp.use(express.json()); // JSON parselash\napp.use(express.urlencoded({ extended: true }));\n\n// Route'lar\napp.get('/', (req, res) => {\n  res.json({ message: 'Salom, Express!' });\n});\n\napp.get('/users', async (req, res) => {\n  try {\n    const users = await User.find();\n    res.json(users);\n  } catch (err) {\n    res.status(500).json({ error: err.message });\n  }\n});\n\napp.listen(3000, () => console.log('Port 3000'));`,
        completed: false,
      },
      {
        id: 'l5', order: 5, title: "Routing va Middleware", duration: '32 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=lY6icfhap2o',
        content: `Express.js routing va middleware tizimi.\n\nRouter:\n// routes/users.js\nconst router = express.Router();\nrouter.get('/', getAllUsers);\nrouter.get('/:id', getUserById);\nrouter.post('/', createUser);\nrouter.put('/:id', updateUser);\nrouter.delete('/:id', deleteUser);\nmodule.exports = router;\n\n// app.js\napp.use('/api/users', usersRouter);\n\nMiddleware:\n// Custom middleware\nconst logger = (req, res, next) => {\n  console.log(\`\${req.method} \${req.url}\`);\n  next(); // Keyingi middleware'ga o'tish\n};\napp.use(logger);\n\n// Auth middleware\nconst auth = (req, res, next) => {\n  if (!req.headers.authorization) {\n    return res.status(401).json({ error: 'Token kerak' });\n  }\n  next();\n};`,
        completed: false,
      },
      {
        id: 'l6', order: 6, title: "REST API yaratish — CRUD", duration: '45 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=pKd0Rpw7O48',
        content: `To'liq REST API CRUD operatsiyalar.\n\nHTTP metodlar:\n• GET    /api/posts       — barchasi\n• GET    /api/posts/:id   — bittasi\n• POST   /api/posts       — yaratish\n• PUT    /api/posts/:id   — to'liq yangilash\n• PATCH  /api/posts/:id   — qisman yangilash\n• DELETE /api/posts/:id   — o'chirish\n\nHTTP status kodlar:\n• 200 OK\n• 201 Created\n• 204 No Content\n• 400 Bad Request\n• 401 Unauthorized\n• 403 Forbidden\n• 404 Not Found\n• 500 Internal Server Error\n\nRESTful qoidalar:\n• Resurs nomi ko'plikda: /posts, /users\n• Versioning: /api/v1/posts\n• Stateless: har so'rov mustaqil`,
        completed: false,
      },
      {
        id: 'l7', order: 7, title: "Kirish tekshiruvi va xatolarni boshqarish", duration: '28 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=lY6icfhap2o',
        content: `Input validatsiya va error handling.\n\nnpm install joi\n// yoki express-validator\n\nJoi bilan validatsiya:\nconst Joi = require('joi');\n\nconst userSchema = Joi.object({\n  ism: Joi.string().min(2).max(50).required(),\n  email: Joi.string().email().required(),\n  parol: Joi.string().min(6).required(),\n});\n\napp.post('/users', async (req, res) => {\n  const { error } = userSchema.validate(req.body);\n  if (error) return res.status(400).json({ error: error.details[0].message });\n  // ...\n});\n\nGlobal error handler:\napp.use((err, req, res, next) => {\n  console.error(err.stack);\n  res.status(err.status || 500).json({\n    error: err.message || 'Server xatosi'\n  });\n});`,
        completed: false,
      },
      {
        id: 'l8', order: 8, title: "MongoDB bilan ishlash", duration: '35 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=ofme2o29ngU',
        content: `MongoDB — NoSQL ma'lumotlar bazasi.\n\nO'rnatish: MongoDB Atlas (cloud, bepul tier)\n\nnpm install mongoose\n\nUlanish:\nconst mongoose = require('mongoose');\nawait mongoose.connect(process.env.MONGODB_URI);\n\nSchema va Model:\nconst userSchema = new mongoose.Schema({\n  ism: { type: String, required: true },\n  email: { type: String, required: true, unique: true },\n  parol: String,\n  yaratilgan: { type: Date, default: Date.now },\n});\n\nconst User = mongoose.model('User', userSchema);\n\nCRUD:\nawait User.create({ ism, email, parol });\nawait User.find({ aktiv: true });\nawait User.findById(id);\nawait User.findByIdAndUpdate(id, { ism });\nawait User.findByIdAndDelete(id);`,
        completed: false,
      },
      {
        id: 'l9', order: 9, title: "Mongoose ORM va sxemalar", duration: '40 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=DZBGEVgL2eE',
        content: `Mongoose — MongoDB uchun ODM.\n\nAdvanced Schema:\nconst postSchema = new mongoose.Schema({\n  sarlavha: { type: String, required: true, trim: true },\n  kontent: String,\n  muallif: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },\n  teglar: [String],\n  elon_qilingan: { type: Boolean, default: false },\n}, { timestamps: true }); // createdAt, updatedAt\n\n// Virtual field:\npostSchema.virtual('qisqaKontent').get(function() {\n  return this.kontent?.slice(0, 200) + '...';\n});\n\n// Populate (JOIN):\nconst posts = await Post\n  .find()\n  .populate('muallif', 'ism email')\n  .sort('-createdAt')\n  .limit(10);\n\n// Aggregation:\nconst stats = await Post.aggregate([\n  { $group: { _id: '$muallif', count: { $sum: 1 } } }\n]);`,
        completed: false,
      },
      {
        id: 'l10', order: 10, title: "PostgreSQL va SQL asoslari", duration: '40 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=qw--VYLpxG4',
        content: `PostgreSQL — kuchli relatsion ma'lumotlar bazasi.\n\nAsosiy SQL:\n-- Jadval yaratish\nCREATE TABLE users (\n  id SERIAL PRIMARY KEY,\n  ism VARCHAR(100) NOT NULL,\n  email VARCHAR(255) UNIQUE NOT NULL,\n  yosh INTEGER,\n  yaratilgan TIMESTAMP DEFAULT NOW()\n);\n\n-- Ma'lumot qo'shish\nINSERT INTO users (ism, email) VALUES ('Ali', 'ali@test.uz');\n\n-- O'qish\nSELECT * FROM users WHERE yosh > 18 ORDER BY ism LIMIT 10;\n\n-- Yangilash\nUPDATE users SET ism = 'Vali' WHERE id = 1;\n\n-- O'chirish\nDELETE FROM users WHERE id = 1;\n\n-- JOIN\nSELECT u.ism, p.sarlavha\nFROM users u\nJOIN posts p ON p.user_id = u.id;`,
        completed: false,
      },
      {
        id: 'l11', order: 11, title: "Prisma ORM bilan ishlash", duration: '38 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=RebA5J-rlwg',
        content: `Prisma — zamonaviy TypeScript ORM.\n\nnpm install prisma @prisma/client\nnpx prisma init\n\nprisma/schema.prisma:\nmodel User {\n  id        Int      @id @default(autoincrement())\n  email     String   @unique\n  ism       String\n  posts     Post[]\n  createdAt DateTime @default(now())\n}\n\nmodel Post {\n  id       Int    @id @default(autoincrement()\n  sarlavha String\n  kontent  String?\n  muallif  User   @relation(fields: [muallifId], references: [id])\n  muallifId Int\n}\n\nnpx prisma migrate dev\nnpx prisma studio # GUI\n\nCRUD:\nconst user = await prisma.user.create({ data: { email, ism } });\nconst users = await prisma.user.findMany({ include: { posts: true } });`,
        completed: false,
      },
      {
        id: 'l12', order: 12, title: "Ma'lumotlar bazasi munosabatlari", duration: '35 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=HXV3zeQKqGY',
        content: `Database relationships — jadvallar orasidagi munosabatlar.\n\nOne-to-Many (1:n):\n• 1 foydalanuvchi → ko'p postlar\n• users.id ← posts.user_id\n\nMany-to-Many (n:m):\n• Ko'p talabalar ↔ ko'p kurslar\n• enrollments oraliq jadvali kerak\n\nOne-to-One (1:1):\n• 1 foydalanuvchi — 1 profil\n\nForeign Key:\nCREATE TABLE posts (\n  id SERIAL PRIMARY KEY,\n  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,\n  sarlavha TEXT NOT NULL\n);\n\nIndexlar:\nCREATE INDEX idx_posts_user_id ON posts(user_id);\n-- Izlash tezligini oshiradi\n\nNormalizatsiya:\n• 1NF: takroriy gruplar yo'q\n• 2NF: to'liq bog'liqlik\n• 3NF: tranzitiv bog'liqlik yo'q`,
        completed: false,
      },
      {
        id: 'l13', order: 13, title: "JWT autentifikatsiya", duration: '45 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=mbsmsi7l3r4',
        content: `JWT (JSON Web Token) bilan xavfsiz autentifikatsiya.\n\nnpm install jsonwebtoken bcryptjs\n\nRo'yxatdan o'tish:\napp.post('/auth/register', async (req, res) => {\n  const { ism, email, parol } = req.body;\n  const hash = await bcrypt.hash(parol, 12);\n  const user = await User.create({ ism, email, parol: hash });\n  \n  const token = jwt.sign(\n    { userId: user.id },\n    process.env.JWT_SECRET,\n    { expiresIn: '7d' }\n  );\n  res.json({ token, user: { id: user.id, ism, email } });\n});\n\nToken tekshirish middleware:\nconst protect = async (req, res, next) => {\n  const token = req.headers.authorization?.split(' ')[1];\n  if (!token) return res.status(401).json({ error: 'Token kerak' });\n  const decoded = jwt.verify(token, process.env.JWT_SECRET);\n  req.user = await User.findById(decoded.userId);\n  next();\n};`,
        completed: false,
      },
      {
        id: 'l14', order: 14, title: "Parollarni xavfsiz saqlash (bcrypt)", duration: '25 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=AzA_LTDoFqY',
        content: `Parol xavfsizligi — eng muhim jihat.\n\nHech qachon parolni oddiy saqlang!\n\nBcrypt bilan:\nconst bcrypt = require('bcryptjs');\n\n// Hash (ro'yxatdan o'tishda):\nconst saltRounds = 12;\nconst hash = await bcrypt.hash(parol, saltRounds);\n\n// Tekshirish (kirishda):\nconst mosmi = await bcrypt.compare(kiritilganParol, saqlangan Hash);\nif (!mosmi) return res.status(401).json({ error: 'Parol noto'g'ri' });\n\nSaltRounds:\n• 10 — standart (tez)\n• 12 — xavfsiz\n• 14 — juda sekin (keraksiz)\n\nBoshqa himoya:\n• Rate limiting (brute-force'dan)\n• HTTPS majburiy\n• Parol kuchlilik tekshiruvi\n• 2FA (ikkita bosqichli tasdiqlash)`,
        completed: false,
      },
      {
        id: 'l15', order: 15, title: "Fayl yuklash va cloud storage", duration: '30 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=NZElg91l_ms',
        content: `Fayl yuklash va bulut saqlash.\n\nnpm install multer\n\nMulter — fayl yuklash middleware:\nconst multer = require('multer');\nconst upload = multer({ dest: 'uploads/' });\n\napp.post('/upload', upload.single('fayl'), (req, res) => {\n  res.json({ fayl: req.file });\n});\n\nCloudinary — bulut saqlash (bepul tier):\nnpm install cloudinary\n\nconst cloudinary = require('cloudinary').v2;\ncloudinary.config({ cloud_name, api_key, api_secret });\n\nconst natija = await cloudinary.uploader.upload(req.file.path);\nconst url = natija.secure_url;\n\nAlternativalar:\n• AWS S3 — eng keng tarqalgan\n• Supabase Storage — bepul tier yaxshi\n• Vercel Blob — Vercel loyihalar uchun`,
        completed: false,
      },
      {
        id: 'l16', order: 16, title: "Email yuborish (Nodemailer/Resend)", duration: '28 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=nF9g1825mwk',
        content: `Ilovadan email yuborish.\n\nNodemailer + Gmail:\nnpm install nodemailer\n\nconst nodemailer = require('nodemailer');\n\nconst transporter = nodemailer.createTransport({\n  service: 'Gmail',\n  auth: { user: process.env.EMAIL, pass: process.env.EMAIL_PASS }\n});\n\nawait transporter.sendMail({\n  from: process.env.EMAIL,\n  to: user.email,\n  subject: 'Xush kelibsiz!',\n  html: '<h1>Ro\\'yxatdan o\\'tdingiz!</h1>',\n});\n\nResend — zamonaviy alternativa:\nnpm install resend\nconst resend = new Resend(process.env.RESEND_API_KEY);\nawait resend.emails.send({\n  from: 'noreply@sizning.uz',\n  to: user.email,\n  subject: 'Xush kelibsiz!',\n  html: emailTemplate,\n});`,
        completed: false,
      },
      {
        id: 'l17', order: 17, title: "Vercel'ga deploy qilish", duration: '25 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=2HBIzEx6IZA',
        content: `Vercel — tez va oson deployment.\n\nVercel afzalliklari:\n• GitHub bilan integratsiya\n• Avtomatik SSL\n• Serverless Functions\n• Edge Network (tez yuklash)\n• Bepul tier — shaxsiy loyihalar\n\nDeployment:\n1. npm install -g vercel\n2. vercel login\n3. vercel (deploy)\n\nyoki GitHub orqali:\n1. vercel.com'ga kiring\n2. New Project\n3. GitHub repo'ni ulang\n4. O'zgaruvchilarni sozlang (Environment Variables)\n5. Deploy!\n\nvercel.json:\n{\n  "builds": [{ "src": "src/index.js", "use": "@vercel/node" }],\n  "routes": [{ "src": "/(.*)", "dest": "src/index.js" }]\n}`,
        completed: false,
      },
      {
        id: 'l18', order: 18, title: "Railway va Render'ga deploy", duration: '28 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=bnCOyGaSe84',
        content: `Railway va Render — backend deploy uchun eng yaxshi.\n\nRailway:\n• PostgreSQL va MongoDB bepul tier\n• GitHub bilan avtomatik deploy\n• Environment variables oson sozlash\n\nRender.com:\n• Bepul tier (750 soat/oy)\n• Web Services, Static Sites, Cron Jobs\n• PostgreSQL bepul tier\n\nRailway deployment:\n1. railway.app'ga kiring\n2. New Project → GitHub repo\n3. Variables → secrets qo'shish\n4. Deploy!\n\nEnvironment variables:\nDATABASE_URL=postgresql://...\nJWT_SECRET=uzunlotsir\nNODE_ENV=production\nPORT=3000\n\nDeploy tekshirish:\nrailway logs  # loglarni ko'rish`,
        completed: false,
      },
      {
        id: 'l19', order: 19, title: "Docker bilan konteynerizatsiya", duration: '35 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=3c-iBn73dDE',
        content: `Docker — "Menda ishlaydi" muammosini hal qiladi.\n\nDocker tushunchalari:\n• Image — dastur "retsepti"\n• Container — ishlaydigan image\n• Dockerfile — image qurish ko'rsatmasi\n• Docker Hub — image ombori\n\nDockerfile:\nFROM node:20-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci --only=production\nCOPY . .\nEXPOSE 3000\nCMD ["node", "src/index.js"]\n\nAsosiy buyruqlar:\ndocker build -t mening-ilova .   # image qurish\ndocker run -p 3000:3000 mening-ilova\ndocker ps                        # ishlaydigan konteynerlar\ndocker stop <id>\n\ndocker-compose.yml:\nservices:\n  app:\n    build: .\n    ports: ["3000:3000"]\n  db:\n    image: postgres:15\n    environment:\n      POSTGRES_DB: mydb`,
        completed: false,
      },
      {
        id: 'l20', order: 20, title: "CI/CD va GitHub Actions", duration: '30 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=R8_veQiYBjI',
        content: `GitHub Actions — avtomatik test va deploy.\n\n.github/workflows/deploy.yml:\nname: Deploy\n\non:\n  push:\n    branches: [main]\n\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with:\n          node-version: '20'\n      - run: npm ci\n      - run: npm test\n\n  deploy:\n    needs: test\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - name: Deploy to Vercel\n        uses: amondnet/vercel-action@v25\n        with:\n          vercel-token: \${{ secrets.VERCEL_TOKEN }}\n\nCI/CD afzalliklari:\n✓ Avtomatik testlar\n✓ Code quality tekshiruvi\n✓ Avtomatik deployment\n✓ Rollback imkoniyati`,
        completed: false,
      },
      {
        id: 'l21', order: 21, title: "API xavfsizligi va best practices", duration: '32 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=eMIx4GQTD9s',
        content: `API xavfsizligi — production uchun zarur.\n\nnpm install helmet cors express-rate-limit\n\nHelmet — HTTP header xavfsizligi:\napp.use(helmet());\n\nCORS — domenlararo so'rovlar:\napp.use(cors({\n  origin: ['https://mening-site.uz'],\n  methods: ['GET', 'POST', 'PUT', 'DELETE'],\n  allowedHeaders: ['Content-Type', 'Authorization'],\n}));\n\nRate Limiting — brute-force himoya:\nconst limiter = rateLimit({\n  windowMs: 15 * 60 * 1000, // 15 daqiqa\n  max: 100, // maksimum 100 so'rov\n  message: 'Juda ko\\'p so\\'rov, keyinroq urinib ko\\'ring'\n});\napp.use('/api/', limiter);\n\nBoshqa muhim jihatlar:\n• SQL Injection — Prisma/Mongoose himoya qiladi\n• XSS — input sanitizatsiya\n• .env — sirlarni expose qilmang\n• HTTPS — HTTP emas`,
        completed: false,
      },
      {
        id: 'l22', order: 22, title: "Performance va caching (Redis)", duration: '35 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=jgpVdJB2sKQ',
        content: `Performance optimallashtirish va caching.\n\nRedis — xotiradagi ma'lumot ombori:\nnpm install ioredis\n\nconst Redis = require('ioredis');\nconst redis = new Redis(process.env.REDIS_URL);\n\n// Kesh qo'yish:\nconst cached = await redis.get('users:all');\nif (cached) return res.json(JSON.parse(cached));\n\nconst users = await User.find();\nawait redis.setex('users:all', 300, JSON.stringify(users)); // 5 daqiqa\nres.json(users);\n\nDatabase optimizatsiyasi:\n• Indekslar qo'shish (tez qidirish)\n• N+1 muammosidan qochish (populate)\n• Pagination (limit/offset)\n• Faqat kerakli maydonlarni olish (select)\n\nRedis Upstash — serverless Redis (bepul tier)`,
        completed: false,
      },
      {
        id: 'l23', order: 23, title: "Monitoring va logging", duration: '25 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=8I7ws6GihLQ',
        content: `Production ilovani monitoring qilish.\n\nWinston — professional logging:\nnpm install winston\n\nconst winston = require('winston');\nconst logger = winston.createLogger({\n  level: 'info',\n  format: winston.format.json(),\n  transports: [\n    new winston.transports.File({ filename: 'error.log', level: 'error' }),\n    new winston.transports.File({ filename: 'combined.log' }),\n    new winston.transports.Console(),\n  ],\n});\n\nlogger.info('Server boshlandi');\nlogger.error('Database xatosi', { error: err.message });\n\nMonitoring xizmatlari:\n• Sentry — xato monitoring (bepul tier)\n• UptimeRobot — uptime monitoring\n• DataDog — to'liq monitoring (pullik)\n• Grafana + Prometheus — open source`,
        completed: false,
      },
      {
        id: 'l24', order: 24, title: "Yakuniy loyiha: To'liq REST API", duration: '90 daqiqa',
        video_url: 'https://www.youtube.com/watch?v=pKd0Rpw7O48',
        content: `Yakuniy loyiha: Kurs platformasi REST API\n\nEndpointlar:\n• POST /auth/register\n• POST /auth/login\n• GET  /api/courses\n• GET  /api/courses/:id\n• POST /api/courses (admin)\n• GET  /api/lessons/:id\n• POST /api/enroll/:courseId\n• GET  /api/profile\n• PUT  /api/profile\n\nTexnologiyalar:\n✅ Node.js + Express.js\n✅ MongoDB (Mongoose) yoki PostgreSQL (Prisma)\n✅ JWT autentifikatsiya\n✅ Bcrypt parol himoyasi\n✅ Multer fayl yuklash\n✅ Input validatsiya (Joi)\n✅ Helmet + CORS + Rate Limiting\n✅ GitHub Actions CI/CD\n✅ Railway yoki Render'ga deploy\n\nHujjatlashtirish:\n• README.md\n• Postman Collection\n• API endpoints hujjati`,
        completed: false,
      },
    ],
    tasks: [
      {
        id: 't1', title: "To'liq REST API yarating va deploy qiling", forLesson: 'l24',
        description: "Node.js, Express va MongoDB yoki PostgreSQL bilan kurs platformasi uchun REST API yarating. API'da autentifikatsiya (JWT), CRUD operatsiyalar bo'lishi shart. Railway yoki Render'ga deploy qiling. Postman Collection va GitHub repo havolasini yuboring.",
        deadline: '2025-06-01', fileRequirements: 'GitHub link va deployed API URL', maxGrade: 100,
        history: [],
      },
    ],
  },
}

const DEFAULT_COURSE = COURSES_DATA['1']

export default function LessonViewPage() {
  const { id, lessonId } = useParams<{ id: string; lessonId: string }>()
  const router = useRouter()
  const { isDark } = useMountedTheme()

  const course = COURSES_DATA[id] ?? DEFAULT_COURSE
  const [lessons, setLessons] = useState(course.lessons)
  const [activeTab, setActiveTab] = useState<'lesson' | 'task'>('lesson')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const currentLesson = lessons.find(l => l.id === lessonId) ?? lessons[0]
  const currentTask = course.tasks.find(t => t.forLesson === currentLesson.id) ?? null

  const handleComplete = (lId: string) => {
    setLessons(ls => ls.map(l => l.id === lId ? { ...l, completed: true } : l))
  }

  const handleNavigate = (nextId: string) => {
    router.push(`/courses/${id}/lessons/${nextId}`)
  }

  const completedCount = lessons.filter(l => l.completed).length
  const progress = Math.round((completedCount / lessons.length) * 100)

  const sidebarBg  = isDark ? '#080d16'           : '#ffffff'
  const sidebarBdr = isDark ? 'border-white/8'    : 'border-gray-200'
  const mainBg     = isDark ? ''                  : 'bg-gray-50'
  const tabBg      = isDark
    ? { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }
    : { background: '#f3f4f6', border: '1px solid #e5e7eb' }
  const backLink   = isDark ? 'text-white/40 hover:text-white' : 'text-gray-400 hover:text-gray-900'
  const menuBtn    = isDark
    ? 'text-white/40 hover:text-white hover:bg-white/5'
    : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100'
  const tabInactive = isDark ? 'text-white/40 hover:text-white' : 'text-gray-500 hover:text-gray-900'

  return (
    <div className={`flex h-[calc(100vh-56px)] overflow-hidden ${mainBg}`}>
      {/* Lesson sidebar */}
      <>
        {/* Mobile overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div key="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/60 z-30 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)} />
          )}
        </AnimatePresence>

        {/* Mobile sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              key="sidebar"
              initial={{ x: -320 }} animate={{ x: 0 }} exit={{ x: -320 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className={`lg:hidden fixed left-0 top-0 bottom-0 w-80 z-40 flex flex-col border-r ${sidebarBdr}`}
              style={{ background: sidebarBg }}>
              <SidebarContent
                course={course} lessons={lessons} currentLesson={currentLesson}
                id={id} progress={progress} completedCount={completedCount}
                isDark={isDark} onClose={() => setSidebarOpen(false)} />
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Desktop sidebar */}
        <aside
          className={`hidden lg:flex flex-col w-72 xl:w-80 flex-shrink-0 border-r ${sidebarBdr} overflow-y-auto`}
          style={{ background: sidebarBg }}>
          <SidebarContent
            course={course} lessons={lessons} currentLesson={currentLesson}
            id={id} progress={progress} completedCount={completedCount}
            isDark={isDark} />
        </aside>
      </>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
          {/* Top bar */}
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)}
              className={`lg:hidden p-2 rounded-xl transition-all ${menuBtn}`}>
              <Menu className="h-5 w-5" />
            </button>
            <Link href={`/courses/${id}`}
              className={`flex items-center gap-2 text-sm transition-colors ${backLink}`}>
              <ArrowLeft className="h-4 w-4" />{course.title}
            </Link>

            {/* Tab switcher */}
            {currentTask && (
              <div className="ml-auto flex gap-1 p-1 rounded-xl" style={tabBg}>
                <button onClick={() => setActiveTab('lesson')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeTab === 'lesson' ? 'bg-blue-600 text-white' : tabInactive
                  }`}>
                  <Play className="h-3.5 w-3.5" /> Dars
                </button>
                <button onClick={() => setActiveTab('task')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeTab === 'task' ? 'bg-amber-600 text-white' : tabInactive
                  }`}>
                  <ClipboardList className="h-3.5 w-3.5" /> Topshiriq
                </button>
              </div>
            )}
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'lesson' ? (
              <motion.div key="lesson" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                <LessonPlayer
                  lesson={currentLesson} allLessons={lessons}
                  courseId={id}
                  onComplete={handleComplete} onNavigate={handleNavigate}
                  onGoToTask={currentTask ? () => setActiveTab('task') : undefined}
                />
              </motion.div>
            ) : currentTask ? (
              <motion.div key="task" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                <TaskSubmission
                  taskId={currentTask.id} taskTitle={currentTask.title}
                  taskDescription={currentTask.description} deadline={currentTask.deadline}
                  fileRequirements={currentTask.fileRequirements} maxGrade={currentTask.maxGrade}
                  history={currentTask.history}
                />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

/* ─── Sidebar inner component ─── */
function SidebarContent({ course, lessons, currentLesson, id, progress, completedCount, isDark, onClose }: {
  course: typeof COURSES_DATA[string]
  lessons: Lesson[]
  currentLesson: Lesson
  id: string
  progress: number
  completedCount: number
  isDark: boolean
  onClose?: () => void
}) {
  const router = useRouter()

  const heading   = isDark ? 'text-white'     : 'text-gray-900'
  const muted     = isDark ? 'text-white/40'  : 'text-gray-400'
  const divider   = isDark ? 'border-white/5' : 'border-gray-100'
  const sectionLbl= isDark ? 'text-white/30'  : 'text-gray-400'
  const durText   = isDark ? 'text-white/20'  : 'text-gray-300'

  return (
    <>
      {/* Header */}
      <div className={`p-4 border-b ${divider}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{course.emoji}</span>
            <p className={`font-semibold text-sm leading-tight line-clamp-2 ${heading}`}>{course.title}</p>
          </div>
          {onClose && (
            <button onClick={onClose} className={`flex-shrink-0 ml-2 ${muted} hover:${heading} transition-colors`}>
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex justify-between mb-1.5">
          <span className={`text-xs ${muted}`}>{completedCount}/{lessons.length} dars</span>
          <span className="text-blue-500 text-xs font-semibold">{progress}%</span>
        </div>
        <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}>
          <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all"
            style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Lessons list */}
      <div className="flex-1 overflow-y-auto p-2">
        <p className={`text-xs font-medium px-3 py-2 ${sectionLbl}`}>O&apos;quv dasturi</p>
        <div className="space-y-0.5">
          {lessons.map(lesson => {
            const isActive = lesson.id === currentLesson.id
            return (
              <button key={lesson.id}
                onClick={() => {
                  router.push(`/courses/${id}/lessons/${lesson.id}`)
                  onClose?.()
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                  isActive
                    ? isDark
                      ? 'bg-blue-600/20 border border-blue-500/30'
                      : 'bg-blue-50 border border-blue-200'
                    : isDark ? 'hover:bg-white/4' : 'hover:bg-gray-50'
                }`}>
                <div className={`h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  lesson.completed
                    ? 'bg-emerald-500/15'
                    : isActive
                    ? isDark ? 'bg-blue-500/25' : 'bg-blue-100'
                    : isDark ? 'bg-white/5' : 'bg-gray-100'
                }`}>
                  {lesson.completed ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  ) : isActive ? (
                    <Play className="h-3.5 w-3.5 text-blue-500" />
                  ) : (
                    <BookOpen className={`h-3 w-3 ${muted}`} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-medium leading-snug truncate ${
                    isActive
                      ? 'text-blue-500'
                      : lesson.completed
                      ? isDark ? 'text-white/60' : 'text-gray-500'
                      : isDark ? 'text-white/50' : 'text-gray-600'
                  }`}>
                    {lesson.order}. {lesson.title}
                  </p>
                  <p className={`text-[10px] mt-0.5 ${durText}`}>{lesson.duration}</p>
                </div>
                {isActive && <ChevronRight className="h-3 w-3 text-blue-500/60 flex-shrink-0" />}
              </button>
            )
          })}
        </div>
      </div>

      {/* Back to courses */}
      <div className={`p-3 border-t ${divider}`}>
        <Link href="/courses">
          <button className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium transition-all ${
            isDark
              ? 'text-white/30 hover:text-white hover:bg-white/5'
              : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
          }`}>
            <ArrowLeft className="h-3.5 w-3.5" /> Kurslarga qaytish
          </button>
        </Link>
      </div>
    </>
  )
}
