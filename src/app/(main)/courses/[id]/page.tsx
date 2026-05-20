'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useMountedTheme } from '@/hooks/useTheme'
import {
  ArrowLeft, BookOpen, Clock, Users, Star, Play,
  CheckCircle2, Lock, ChevronDown, ChevronUp,
  Award, TrendingUp, MessageSquare,
} from 'lucide-react'
interface Lesson {
  id: string
  order: number
  title: string
  duration: string
  free: boolean
  completed: boolean
}

interface CourseDetail {
  id: string
  title: string
  emoji: string
  description: string
  longDescription: string
  instructor: string
  instructorAvatar: string
  category: string
  level: string
  color: string
  duration: string
  lessonCount?: number
  students: number
  rating: number
  enrolled: boolean
  progress: number
  whatYouLearn: string[]
  requirements: string[]
  lessons: Lesson[]
  tasks: number
  language: string
  lastUpdated: string
}

const COURSES: Record<string, CourseDetail> = {
  '1': {
    id: '1', title: 'Freelancing asoslari', emoji: '🚀',
    description: "Freelancing dunyosiga kirish, platforma tanlash, birinchi buyurtma olish.",
    longDescription: "Bu kurs sizni freelancing dunyasiga qadam qo'yishga tayyorlaydi. Upwork, Fiverr va boshqa platformalarda professional profil yaratishdan tortib, birinchi buyurtma olish va mijozlar bilan muloqot qilishgacha bo'lgan barcha jarayonlarni bosqichma-bosqich o'rganasiz.",
    instructor: 'Sarvar Usmonov', instructorAvatar: 'SU',
    category: 'Freelancing', level: "Boshlang'ich",
    color: 'from-blue-600 to-blue-800', duration: '6 soat',
    lessons: [
      { id: 'l1', order: 1, title: "Freelancingga kirish",           duration: '15 daqiqa', free: true,  completed: true  },
      { id: 'l2', order: 2, title: "Platformalar taqqoslanmasi",     duration: '22 daqiqa', free: true,  completed: true  },
      { id: 'l3', order: 3, title: "Upwork profil yaratish",         duration: '30 daqiqa', free: false, completed: false },
      { id: 'l4', order: 4, title: "Fiverr gig sozlash",             duration: '25 daqiqa', free: false, completed: false },
      { id: 'l5', order: 5, title: "Birinchi proposal yozish",       duration: '35 daqiqa', free: false, completed: false },
      { id: 'l6', order: 6, title: "Mijoz bilan muloqot sirlari",    duration: '28 daqiqa', free: false, completed: false },
      { id: 'l7', order: 7, title: "Narx belgilash strategiyasi",    duration: '20 daqiqa', free: false, completed: false },
      { id: 'l8', order: 8, title: "Portfolio yaratish",             duration: '40 daqiqa', free: false, completed: false },
      { id: 'l9', order: 9, title: "Shartnoma va to'lov",            duration: '18 daqiqa', free: false, completed: false },
      { id: 'l10',order:10, title: "Reytingni oshirish",             duration: '22 daqiqa', free: false, completed: false },
      { id: 'l11',order:11, title: "Passiv daromad",                 duration: '30 daqiqa', free: false, completed: false },
      { id: 'l12',order:12, title: "Xulosa va keyingi qadamlar",     duration: '15 daqiqa', free: false, completed: false },
    ],
    whatYouLearn: [
      "Professional Upwork va Fiverr profillarini yaratish",
      "Samarali proposal va cover letter yozish",
      "Mijoz bilan professional muloqot qilish",
      "Narx belgilash va muzokaralar olib borish",
      "Portfolio yaratish va reytingni oshirish",
      "Doimiy mijozlar bazasini shakllantirish",
    ],
    requirements: [
      "Internet aloqasi va kompyuter",
      "Asosiy ingliz tili bilimlari (B1 darajasi)",
      "O'rganishga ishtiyoq va sabr",
    ],
    students: 248, rating: 4.9, tasks: 4,
    language: "O'zbek tili", lastUpdated: "2025-yanvar",
    enrolled: true, progress: 17,
  },
  '2': {
    id: '2', title: 'Grafik Dizayn (Figma)', emoji: '🎨',
    description: "Figma orqali professional UI/UX dizayn yaratish.",
    longDescription: "Figma — dunyoning eng mashhur dizayn vositasi. Bu kursda siz Figma'ning barcha asosiy funksiyalarini o'rganib, real loyihalar uchun professional interfeys yaratishni o'zlashtirasiz. Auto Layout, komponentlar va dizayn tizimlarini o'rganasiz.",
    instructor: 'Malika Yusupova', instructorAvatar: 'MY',
    category: 'Dizayn', level: "O'rta",
    color: 'from-purple-600 to-purple-800', duration: '14 soat',
    lessons: [
      { id: 'l1', order: 1, title: "Figmaga kirish va interfeys",          duration: '20 daqiqa', free: true,  completed: true  },
      { id: 'l2', order: 2, title: "Frames, Groups va Shapes asoslari",    duration: '25 daqiqa', free: true,  completed: false },
      { id: 'l3', order: 3, title: "Auto Layout bilan ishlash",            duration: '35 daqiqa', free: false, completed: false },
      { id: 'l4', order: 4, title: "Component va Variant sistemasi",       duration: '40 daqiqa', free: false, completed: false },
      { id: 'l5', order: 5, title: "Typography va Color Systems",          duration: '30 daqiqa', free: false, completed: false },
      { id: 'l6', order: 6, title: "Prototiplash va animatsiya",           duration: '35 daqiqa', free: false, completed: false },
      { id: 'l7', order: 7, title: "Design Tokens va stil kutubxonasi",    duration: '28 daqiqa', free: false, completed: false },
      { id: 'l8', order: 8, title: "Mobile va Desktop responsive dizayn",  duration: '40 daqiqa', free: false, completed: false },
      { id: 'l9', order: 9, title: "Jamoa bilan ishlash va Handoff",       duration: '22 daqiqa', free: false, completed: false },
    ],
    whatYouLearn: [
      "Figma interfeysini professional darajada boshqarish",
      "Auto Layout va komponentlar sistemasini o'rganish",
      "Real loyiha uchun UI/UX dizayn yaratish",
      "Figma prototiplash va animatsiya qilish",
      "Dasturchilar uchun Handoff tayyorlash",
      "Dizayn sistemasini (Design System) qurish",
    ],
    requirements: ["Kompyuter (Mac yoki Windows)", "Figma bepul hisobi", "Asosiy dizayn tushunchalari"],
    students: 183, rating: 4.8, tasks: 3,
    language: "O'zbek tili", lastUpdated: "2025-yanvar",
    enrolled: true, progress: 20,
  },
  '3': {
    id: '3', title: 'Copywriting Pro', emoji: '✍️',
    description: "Sotuvchi matnlar yozish, AIDA va PAS formulalar, landing page va email copywriting.",
    longDescription: "Copywriting — eng yuqori daromad keltiruvchi freelancing yo'nalishlaridan biri. Bu kursda siz psixologik sotish texnikalarini, AIDA va PAS formulalarini, hamda real landing page va email kampaniyalari yozishni o'rganasiz.",
    instructor: 'Bobur Aliyev', instructorAvatar: 'BA',
    category: 'Copywriting', level: "Boshlang'ich",
    color: 'from-emerald-600 to-emerald-800', duration: '5 soat',
    lessons: [
      { id: 'l1', order: 1,  title: "Copywriting nima va nima uchun kerak",   duration: '15 daqiqa', free: true,  completed: false },
      { id: 'l2', order: 2,  title: "Maqsadli auditoriya va buyer persona",   duration: '20 daqiqa', free: true,  completed: false },
      { id: 'l3', order: 3,  title: "AIDA formulasi amalda",                  duration: '25 daqiqa', free: false, completed: false },
      { id: 'l4', order: 4,  title: "PAS va BAB formulalari",                 duration: '22 daqiqa', free: false, completed: false },
      { id: 'l5', order: 5,  title: "Sarlavha va CTA yozish sirlari",         duration: '28 daqiqa', free: false, completed: false },
      { id: 'l6', order: 6,  title: "Landing page copywriting",               duration: '35 daqiqa', free: false, completed: false },
      { id: 'l7', order: 7,  title: "Email marketing copywriting",            duration: '30 daqiqa', free: false, completed: false },
      { id: 'l8', order: 8,  title: "Social media uchun matn yozish",         duration: '20 daqiqa', free: false, completed: false },
      { id: 'l9', order: 9,  title: "SEO va kalit so'zlar bilan ishlash",     duration: '25 daqiqa', free: false, completed: false },
      { id: 'l10', order: 10, title: "Xulosa: portfolio va narx belgilash",   duration: '20 daqiqa', free: false, completed: false },
    ],
    whatYouLearn: [
      "Psixologik sotish texnikalarini o'zlashtirish",
      "AIDA, PAS, BAB formulalari bilan ishlash",
      "Landing page va Email copywriting yozish",
      "Kuchli sarlavha va Call-to-Action yaratish",
      "SEO uchun optimallashtirilgan kontent yozish",
      "Copywriter sifatida portfolio va narx belgilash",
    ],
    requirements: ["O'zbek yoki rus tilini yaxshi bilish", "Asosiy yozish ko'nikmalari", "Word yoki Google Docs"],
    students: 312, rating: 4.7, tasks: 3,
    language: "O'zbek tili", lastUpdated: "2025-fevral",
    enrolled: false, progress: 0,
  },
  '4': {
    id: '4', title: 'SMM Marketing', emoji: '📱',
    description: "Instagram, TikTok va Facebook uchun kontent strategiyasi, hashtag analiz va reklama.",
    longDescription: "Ijtimoiy tarmoqlarda marketing — hozirgi kunda eng talab yuqori yo'nalishlardan biri. Bu kursda Instagram, TikTok va Facebook uchun kontent strategiyasi yaratish, reklama kampaniyalari ishga tushirish va analitika bilan ishlashni o'rganasiz.",
    instructor: 'Zulfiya Karimova', instructorAvatar: 'ZK',
    category: 'Marketing', level: "O'rta",
    color: 'from-rose-600 to-rose-800', duration: '8 soat',
    lessons: [
      { id: 'l1', order: 1,  title: "SMM asoslari va platforma tanlash",          duration: '18 daqiqa', free: true,  completed: false },
      { id: 'l2', order: 2,  title: "Instagram profil va bio optimallashtirish",   duration: '22 daqiqa', free: true,  completed: false },
      { id: 'l3', order: 3,  title: "Kontent strategiyasi va editorial plan",      duration: '30 daqiqa', free: false, completed: false },
      { id: 'l4', order: 4,  title: "Instagram Reels va Stories sirlari",          duration: '28 daqiqa', free: false, completed: false },
      { id: 'l5', order: 5,  title: "TikTok uchun viral kontent yaratish",         duration: '35 daqiqa', free: false, completed: false },
      { id: 'l6', order: 6,  title: "Hashtag strategiyasi va tahlil",              duration: '20 daqiqa', free: false, completed: false },
      { id: 'l7', order: 7,  title: "Meta Ads: Facebook va Instagram reklama",     duration: '40 daqiqa', free: false, completed: false },
      { id: 'l8', order: 8,  title: "Influencer marketing va hamkorliklar",        duration: '25 daqiqa', free: false, completed: false },
      { id: 'l9', order: 9,  title: "Analytics va KPI hisoblash",                  duration: '28 daqiqa', free: false, completed: false },
      { id: 'l10', order: 10, title: "SMM manager sifatida mijoz topish",          duration: '22 daqiqa', free: false, completed: false },
      { id: 'l11', order: 11, title: "Case study: real biznes uchun SMM",          duration: '35 daqiqa', free: false, completed: false },
    ],
    whatYouLearn: [
      "Instagram, TikTok va Facebook uchun kontent strategiyasi",
      "Viral kontent yaratish texnikalari",
      "Meta Ads bilan reklama kampaniyalari ishga tushirish",
      "Hashtag analiz va auditoriya o'sishi",
      "SMM analytics va KPI hisoblash",
      "SMM manager sifatida portfolio va mijoz topish",
    ],
    requirements: ["Smartphone yoki kompyuter", "Ijtimoiy tarmoqlarda faol profil", "Kontent yaratishga qiziqish"],
    students: 427, rating: 4.9, tasks: 4,
    language: "O'zbek tili", lastUpdated: "2025-mart",
    enrolled: false, progress: 0,
  },
  '5': {
    id: '5', title: 'Web Dasturlash (HTML/CSS)', emoji: '💻',
    description: "HTML5, CSS3, Flexbox va Grid orqali zamonaviy veb-sahifalar yaratish.",
    longDescription: "Bu kursda HTML5 va CSS3'ning zamonaviy va keng qamrovli imkoniyatlarini o'rganasiz. Semantik HTML, CSS animatsiyalar, Flexbox, Grid va Responsive dizayn orqali professional darajada veb-sahifalar yaratishni o'zlashtirasiz.",
    instructor: 'Jasur Toshmatov', instructorAvatar: 'JT',
    category: 'Dasturlash', level: "Boshlang'ich",
    color: 'from-cyan-600 to-cyan-800', duration: '12 soat',
    lessons: [
      { id: 'l1', order: 1,  title: "HTML5 semantik teglar asoslari",              duration: '25 daqiqa', free: true,  completed: false },
      { id: 'l2', order: 2,  title: "HTML5 Forms va Validation",                   duration: '30 daqiqa', free: true,  completed: false },
      { id: 'l3', order: 3,  title: "CSS3: Selectors va Box Model",                duration: '28 daqiqa', free: false, completed: false },
      { id: 'l4', order: 4,  title: "CSS Flexbox — to'liq qo'llanma",              duration: '40 daqiqa', free: false, completed: false },
      { id: 'l5', order: 5,  title: "CSS Grid Layout — zamonaviy grid tizimi",     duration: '45 daqiqa', free: false, completed: false },
      { id: 'l6', order: 6,  title: "Responsive dizayn va Media Queries",          duration: '35 daqiqa', free: false, completed: false },
      { id: 'l7', order: 7,  title: "CSS Animatsiya va Transitions",               duration: '30 daqiqa', free: false, completed: false },
      { id: 'l8', order: 8,  title: "CSS Custom Properties (Variables)",           duration: '22 daqiqa', free: false, completed: false },
      { id: 'l9', order: 9,  title: "SASS/SCSS — CSS preprocessor",               duration: '35 daqiqa', free: false, completed: false },
      { id: 'l10', order: 10, title: "Tailwind CSS bilan tez ishlash",            duration: '40 daqiqa', free: false, completed: false },
      { id: 'l11', order: 11, title: "HTML/CSS bilan landing page yaratish",      duration: '55 daqiqa', free: false, completed: false },
      { id: 'l12', order: 12, title: "Web accessibility va SEO asoslari",         duration: '25 daqiqa', free: false, completed: false },
    ],
    whatYouLearn: [
      "HTML5 semantik teglar va zamonaviy strukturalar",
      "CSS Flexbox va Grid bilan murakkab layoutlar",
      "Responsive dizayn va Mobile-First yondashuv",
      "CSS Animatsiyalar va Transitions",
      "SASS/SCSS bilan professional CSS yozish",
      "Tailwind CSS bilan tez prototiplash",
    ],
    requirements: ["Kompyuter (Windows, Mac yoki Linux)", "VS Code yoki boshqa kod muharrir", "Dasturlash tajribasi shart emas"],
    students: 391, rating: 4.8, tasks: 5,
    language: "O'zbek tili", lastUpdated: "2025-yanvar",
    enrolled: false, progress: 0,
  },
  '6': {
    id: '6', title: 'JavaScript Asoslari', emoji: '⚡',
    description: "JavaScript ES6+, DOM manipulyatsiya, async/await va real loyihalar orqali o'rganish.",
    longDescription: "JavaScript — web dasturlashning eng muhim tili. Bu kursda ES6+ yangi xususiyatlarini, DOM manipulyatsiyasi, asinxron dasturlash (Promises, async/await), va Fetch API orqali real loyihalar yaratishni o'rganasiz.",
    instructor: 'Jasur Toshmatov', instructorAvatar: 'JT',
    category: 'Dasturlash', level: "O'rta",
    color: 'from-yellow-600 to-orange-700', duration: '18 soat',
    lessons: [
      { id: 'l1', order: 1,  title: "JavaScript asoslari va ES6+ sintaksis",       duration: '30 daqiqa', free: true,  completed: false },
      { id: 'l2', order: 2,  title: "let, const, arrow functions va template literals", duration: '25 daqiqa', free: true, completed: false },
      { id: 'l3', order: 3,  title: "Destructuring, Spread va Rest operatorlar",   duration: '28 daqiqa', free: false, completed: false },
      { id: 'l4', order: 4,  title: "DOM manipulyatsiya va hodisalar",             duration: '40 daqiqa', free: false, completed: false },
      { id: 'l5', order: 5,  title: "Massivlar bilan ishlash: map, filter, reduce", duration: '35 daqiqa', free: false, completed: false },
      { id: 'l6', order: 6,  title: "Obyektlar va Prototype zanjiri",              duration: '32 daqiqa', free: false, completed: false },
      { id: 'l7', order: 7,  title: "Promises va asinxron dasturlash",             duration: '38 daqiqa', free: false, completed: false },
      { id: 'l8', order: 8,  title: "Async/Await bilan ishlash",                  duration: '30 daqiqa', free: false, completed: false },
      { id: 'l9', order: 9,  title: "Fetch API va REST API bilan ishlash",         duration: '40 daqiqa', free: false, completed: false },
      { id: 'l10', order: 10, title: "Modullar va ES6 Import/Export",             duration: '25 daqiqa', free: false, completed: false },
      { id: 'l11', order: 11, title: "Local Storage va Session Storage",          duration: '22 daqiqa', free: false, completed: false },
      { id: 'l12', order: 12, title: "Loyiha: To-Do ilovasi yaratish",           duration: '60 daqiqa', free: false, completed: false },
    ],
    whatYouLearn: [
      "JavaScript ES6+ zamonaviy sintaksisini o'zlashtirish",
      "DOM manipulyatsiya va event handling",
      "Asinxron dasturlash: Promises, async/await",
      "Fetch API bilan REST API integratsiyasi",
      "Massivlar bilan funktsional dasturlash",
      "Real loyiha yaratish: To-Do ilovasi",
    ],
    requirements: ["HTML va CSS asosiy bilimlari", "Kompyuter va kod muharrir", "Mantiqiy fikrlash qobiliyati"],
    students: 267, rating: 4.7, tasks: 4,
    language: "O'zbek tili", lastUpdated: "2025-fevral",
    enrolled: false, progress: 0,
  },
  '7': {
    id: '7', title: 'Illyustrator & Brending', emoji: '🖌️',
    description: "Adobe Illustrator orqali logo, brending va vektor grafika yaratish.",
    longDescription: "Adobe Illustrator — professional logo va brending yaratishda standart dastur. Bu kursda vektorli grafika yaratish, pen tool o'zlashtirish, logotip dizayn va brendbuk tayyorlashni o'rganasiz.",
    instructor: 'Malika Yusupova', instructorAvatar: 'MY',
    category: 'Dizayn', level: 'Yuqori',
    color: 'from-fuchsia-600 to-pink-700', duration: '10 soat',
    lessons: [
      { id: 'l1', order: 1,  title: "Illustrator interfeysi va sozlamalar",       duration: '20 daqiqa', free: true,  completed: false },
      { id: 'l2', order: 2,  title: "Pen Tool — professional darajada o'zlashtirish", duration: '45 daqiqa', free: true, completed: false },
      { id: 'l3', order: 3,  title: "Shape Builder va Pathfinder",                duration: '30 daqiqa', free: false, completed: false },
      { id: 'l4', order: 4,  title: "Typography va shrift tanlash",               duration: '28 daqiqa', free: false, completed: false },
      { id: 'l5', order: 5,  title: "Logotip dizayn — bosqichma-bosqich",         duration: '60 daqiqa', free: false, completed: false },
      { id: 'l6', order: 6,  title: "Rang palitrasini tanlash va brending",       duration: '35 daqiqa', free: false, completed: false },
      { id: 'l7', order: 7,  title: "Brendbuk va brand identity yaratish",        duration: '50 daqiqa', free: false, completed: false },
      { id: 'l8', order: 8,  title: "Mock-up va prezentatsiya tayyorlash",        duration: '30 daqiqa', free: false, completed: false },
    ],
    whatYouLearn: [
      "Adobe Illustrator'ni professional darajada boshqarish",
      "Pen Tool bilan murakkab vektorlar yaratish",
      "Professional logotip dizayn qilish",
      "Brendbuk va brand identity tayyorlash",
      "Rang nazariyasi va brending qoidalari",
      "Dizayner sifatida portfolio yaratish",
    ],
    requirements: ["Adobe Illustrator (trial yoki to'liq versiya)", "Asosiy kompyuter ko'nikmalari", "Dizaynga qiziqish"],
    students: 142, rating: 4.6, tasks: 3,
    language: "O'zbek tili", lastUpdated: "2024-dekabr",
    enrolled: false, progress: 0,
  },
  '9': {
    id: '9', title: 'Adobe Photoshop & Illustrator', emoji: '🖼️',
    description: "Photoshop va Illustrator asoslaridan logo dizayn, brending, rang nazariyasi va tipografiyagacha.",
    longDescription: "Bu kurs grafik dizaynchilik yo'lida eng muhim vositalar — Adobe Photoshop va Illustrator'ni o'rganishdan boshlab, logo dizayn, brending, rang nazariyasi, tipografiya, mijoz bilan ishlash va freelancing platformalarda pul ishlashgacha bo'lgan barcha bosqichlarni qamrab oladi.",
    instructor: 'Malika Yusupova', instructorAvatar: 'MY',
    category: 'Dizayn', level: "Boshlang'ich",
    color: 'from-orange-500 to-red-600', duration: '20 soat',
    lessons: [
      { id: 'l1', order: 1,  title: "Adobe Photoshop: Interfeys va asosiy asboblar", duration: '30 daqiqa', free: true,  completed: false },
      { id: 'l2', order: 2,  title: "Qatlamlar (Layers) va maskalar bilan ishlash",  duration: '35 daqiqa', free: true,  completed: false },
      { id: 'l3', order: 3,  title: "Rasmlarni tahrirlash va retush qilish",         duration: '40 daqiqa', free: false, completed: false },
      { id: 'l4', order: 4,  title: "Adobe Illustrator: Interfeys va asosiy asboblar", duration: '28 daqiqa', free: false, completed: false },
      { id: 'l5', order: 5,  title: "Vektor grafika va Pen Tool o'zlashtirish",     duration: '45 daqiqa', free: false, completed: false },
      { id: 'l6', order: 6,  title: "Logo dizayn yaratish — bosqichma-bosqich",     duration: '60 daqiqa', free: false, completed: false },
      { id: 'l7', order: 7,  title: "Brending: brand identity va brendbuk",         duration: '50 daqiqa', free: false, completed: false },
      { id: 'l8', order: 8,  title: "Rang nazariyasi — professional dizayner siri", duration: '35 daqiqa', free: false, completed: false },
      { id: 'l9', order: 9,  title: "Tipografiya: shrift tanlash va kompozitsiya",  duration: '32 daqiqa', free: false, completed: false },
      { id: 'l10', order: 10, title: "Mijoz bilan ishlash: brief va muloqot",      duration: '25 daqiqa', free: false, completed: false },
      { id: 'l11', order: 11, title: "Reviziya va feedback bilan ishlash",         duration: '20 daqiqa', free: false, completed: false },
      { id: 'l12', order: 12, title: "Portfolio yaratish va ish namunalarini tayyorlash", duration: '40 daqiqa', free: false, completed: false },
      { id: 'l13', order: 13, title: "Behance va Dribbble'da profil yaratish",    duration: '22 daqiqa', free: false, completed: false },
      { id: 'l14', order: 14, title: "Upwork va Fiverr'da dizayner sifatida ishlash", duration: '30 daqiqa', free: false, completed: false },
      { id: 'l15', order: 15, title: "Narx belgilash va muzokaralar",             duration: '25 daqiqa', free: false, completed: false },
      { id: 'l16', order: 16, title: "Amaliy loyiha: Restoran uchun to'liq brending", duration: '75 daqiqa', free: false, completed: false },
    ],
    whatYouLearn: [
      "Adobe Photoshop bilan professional rasmlar tahrirlash",
      "Adobe Illustrator bilan vektorli grafika yaratish",
      "Professional logotip va brending dizayni",
      "Rang nazariyasi va tipografiya qoidalari",
      "Mijoz bilan professional ishlash ko'nikmalari",
      "Portfolio yaratish va freelancing platformalarda pul ishlash",
    ],
    requirements: [
      "Adobe Creative Cloud (trial versiya bepul)",
      "Kompyuter (Windows yoki Mac)",
      "Dizaynga ishtiyoq — oldingi tajriba shart emas",
    ],
    students: 356, rating: 4.9, tasks: 5,
    language: "O'zbek tili", lastUpdated: "2025-mart",
    enrolled: false, progress: 0,
  },
  '10': {
    id: '10', title: 'React va Modern Frontend', emoji: '⚛️',
    description: "React, Hooks, Context API va zamonaviy frontend development texnikalari.",
    longDescription: "React — dunyodagi eng mashhur frontend JavaScript kutubxonasi. Bu kursda React asoslaridan boshlab, Hooks, Context API, React Router va real ilovalar yaratishgacha bo'lgan barcha mavzularni amaliy loyihalar orqali o'rganasiz.",
    instructor: 'Jasur Toshmatov', instructorAvatar: 'JT',
    category: 'Dasturlash', level: "O'rta",
    color: 'from-sky-500 to-blue-700', duration: '16 soat',
    lessons: [
      { id: 'l1', order: 1,  title: "React nima va nima uchun kerak",              duration: '20 daqiqa', free: true,  completed: false },
      { id: 'l2', order: 2,  title: "Create React App va loyiha tuzilmasi",        duration: '25 daqiqa', free: true,  completed: false },
      { id: 'l3', order: 3,  title: "JSX va komponentlar — asoslar",               duration: '30 daqiqa', free: false, completed: false },
      { id: 'l4', order: 4,  title: "Props va ma'lumot uzatish",                   duration: '28 daqiqa', free: false, completed: false },
      { id: 'l5', order: 5,  title: "useState Hook — holat boshqarish",            duration: '35 daqiqa', free: false, completed: false },
      { id: 'l6', order: 6,  title: "useEffect Hook — yon effektlar",              duration: '32 daqiqa', free: false, completed: false },
      { id: 'l7', order: 7,  title: "useRef, useMemo va useCallback",              duration: '30 daqiqa', free: false, completed: false },
      { id: 'l8', order: 8,  title: "Custom Hooks yaratish",                       duration: '28 daqiqa', free: false, completed: false },
      { id: 'l9', order: 9,  title: "Context API va global holat",                 duration: '35 daqiqa', free: false, completed: false },
      { id: 'l10', order: 10, title: "React Router v6 — sahifalar va navigatsiya", duration: '40 daqiqa', free: false, completed: false },
      { id: 'l11', order: 11, title: "API bilan ishlash va ma'lumot yuklash",     duration: '38 daqiqa', free: false, completed: false },
      { id: 'l12', order: 12, title: "Formalar va validatsiya (React Hook Form)",  duration: '35 daqiqa', free: false, completed: false },
      { id: 'l13', order: 13, title: "Komponentlarni optimallashtirish",           duration: '30 daqiqa', free: false, completed: false },
      { id: 'l14', order: 14, title: "Testing: Jest va React Testing Library",     duration: '35 daqiqa', free: false, completed: false },
      { id: 'l15', order: 15, title: "Next.js bilan tanishuv",                    duration: '40 daqiqa', free: false, completed: false },
      { id: 'l16', order: 16, title: "TypeScript bilan React",                    duration: '45 daqiqa', free: false, completed: false },
      { id: 'l17', order: 17, title: "Tailwind CSS bilan React stylish",          duration: '30 daqiqa', free: false, completed: false },
      { id: 'l18', order: 18, title: "Loyiha: Weather App (API integratsiyali)",  duration: '60 daqiqa', free: false, completed: false },
      { id: 'l19', order: 19, title: "Loyiha: E-commerce sahifa yaratish",        duration: '75 daqiqa', free: false, completed: false },
      { id: 'l20', order: 20, title: "Xulosa va keyingi qadamlar",                duration: '20 daqiqa', free: false, completed: false },
    ],
    whatYouLearn: [
      "React komponentlar va JSX sintaksisini o'zlashtirish",
      "Hooks: useState, useEffect, useRef va custom hooks",
      "Context API bilan global holat boshqarish",
      "React Router v6 bilan SPA yaratish",
      "REST API bilan real ma'lumotlar bilan ishlash",
      "TypeScript va Next.js bilan React rivojlantirish",
    ],
    requirements: [
      "JavaScript ES6+ asoslari (zarur)",
      "HTML va CSS bilimlari",
      "Node.js va npm o'rnatilgan kompyuter",
    ],
    students: 289, rating: 4.8, tasks: 5,
    language: "O'zbek tili", lastUpdated: "2025-mart",
    enrolled: false, progress: 0,
  },
  '11': {
    id: '11', title: 'Backend, Database va Deployment', emoji: '🗄️',
    description: "Node.js, Express.js, MongoDB/PostgreSQL bilan server yaratish va cloudga deploy qilish.",
    longDescription: "Bu kursda Node.js va Express.js bilan server-side dasturlash, MongoDB va PostgreSQL bilan ma'lumotlar bazasi, REST API yaratish, JWT autentifikatsiya, va Vercel/Railway kabi platformalarda deploy qilishni to'liq o'rganasiz.",
    instructor: 'Jasur Toshmatov', instructorAvatar: 'JT',
    category: 'Dasturlash', level: 'Yuqori',
    color: 'from-slate-600 to-gray-800', duration: '22 soat',
    lessons: [
      { id: 'l1', order: 1,  title: "Node.js — nima va qanday ishlaydi",           duration: '25 daqiqa', free: true,  completed: false },
      { id: 'l2', order: 2,  title: "NPM va paket boshqarish",                     duration: '20 daqiqa', free: true,  completed: false },
      { id: 'l3', order: 3,  title: "Fayl tizimi va Event Loop tushunchasi",       duration: '30 daqiqa', free: false, completed: false },
      { id: 'l4', order: 4,  title: "Express.js bilan server yaratish",            duration: '35 daqiqa', free: false, completed: false },
      { id: 'l5', order: 5,  title: "Routing va Middleware",                       duration: '32 daqiqa', free: false, completed: false },
      { id: 'l6', order: 6,  title: "REST API yaratish — CRUD operatsiyalar",      duration: '45 daqiqa', free: false, completed: false },
      { id: 'l7', order: 7,  title: "Kirish tekshiruvi va xatolarni boshqarish",   duration: '28 daqiqa', free: false, completed: false },
      { id: 'l8', order: 8,  title: "MongoDB bilan ishlash — asoslar",             duration: '35 daqiqa', free: false, completed: false },
      { id: 'l9', order: 9,  title: "Mongoose ORM va sxemalar",                    duration: '40 daqiqa', free: false, completed: false },
      { id: 'l10', order: 10, title: "PostgreSQL va SQL asoslari",                 duration: '40 daqiqa', free: false, completed: false },
      { id: 'l11', order: 11, title: "Prisma ORM bilan ishlash",                  duration: '38 daqiqa', free: false, completed: false },
      { id: 'l12', order: 12, title: "Ma'lumotlar bazasi munosabatlari",           duration: '35 daqiqa', free: false, completed: false },
      { id: 'l13', order: 13, title: "JWT autentifikatsiya va avtorizatsiya",      duration: '45 daqiqa', free: false, completed: false },
      { id: 'l14', order: 14, title: "Parollarni xavfsiz saqlash (bcrypt)",       duration: '25 daqiqa', free: false, completed: false },
      { id: 'l15', order: 15, title: "Fayl yuklash va cloud storage",             duration: '30 daqiqa', free: false, completed: false },
      { id: 'l16', order: 16, title: "Email yuborish (Nodemailer/Resend)",        duration: '28 daqiqa', free: false, completed: false },
      { id: 'l17', order: 17, title: "Vercel'ga deploy qilish",                   duration: '25 daqiqa', free: false, completed: false },
      { id: 'l18', order: 18, title: "Railway va Render'ga deploy qilish",        duration: '28 daqiqa', free: false, completed: false },
      { id: 'l19', order: 19, title: "Docker bilan konteynerizatsiya asoslari",   duration: '35 daqiqa', free: false, completed: false },
      { id: 'l20', order: 20, title: "CI/CD va GitHub Actions",                   duration: '30 daqiqa', free: false, completed: false },
      { id: 'l21', order: 21, title: "API xavfsizligi va best practices",         duration: '32 daqiqa', free: false, completed: false },
      { id: 'l22', order: 22, title: "Performance va caching (Redis)",            duration: '35 daqiqa', free: false, completed: false },
      { id: 'l23', order: 23, title: "Monitoring va logging",                     duration: '25 daqiqa', free: false, completed: false },
      { id: 'l24', order: 24, title: "Loyiha: To'liq REST API va deploy",        duration: '90 daqiqa', free: false, completed: false },
    ],
    whatYouLearn: [
      "Node.js va Express.js bilan server yaratish",
      "MongoDB va PostgreSQL bilan ma'lumotlar bazasi",
      "JWT bilan xavfsiz autentifikatsiya tizimi",
      "REST API yaratish va hujjatlashtirish",
      "Vercel, Railway va Docker bilan deployment",
      "CI/CD va GitHub Actions bilan avtomatlash",
    ],
    requirements: [
      "JavaScript ES6+ va Node.js asosiy bilimlari",
      "React yoki boshqa frontend framework bilimlari",
      "Terminal/Command Line bilan ishlash tajribasi",
    ],
    students: 167, rating: 4.7, tasks: 6,
    language: "O'zbek tili", lastUpdated: "2025-aprel",
    enrolled: false, progress: 0,
  },
}

const DEFAULT_COURSE = COURSES['1']

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { isDark } = useMountedTheme()
  const course = COURSES[id] ?? DEFAULT_COURSE
  const [enrolled, setEnrolled] = useState(course.enrolled ?? false)
  const [enrolling, setEnrolling] = useState(false)
  const [syllabus, setSyllabus] = useState(true)

  const completedCount = course.lessons.filter(l => l.completed).length
  const progress = Math.round((completedCount / course.lessons.length) * 100)

  const handleEnroll = async () => {
    setEnrolling(true)
    await new Promise(r => setTimeout(r, 1200))
    setEnrolled(true)
    setEnrolling(false)
  }

  const firstLesson = course.lessons[0]

  /* ── shared style helpers ── */
  const card = isDark
    ? { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }
    : { background: '#ffffff', border: '1px solid #e5e7eb' }

  const cardSm = isDark
    ? { background: 'rgba(255,255,255,0.04)' }
    : { background: '#f9fafb', border: '1px solid #f3f4f6' }

  const heading  = isDark ? 'text-white'      : 'text-gray-900'
  const subText  = isDark ? 'text-white/60'   : 'text-gray-500'
  const mutedText= isDark ? 'text-white/40'   : 'text-gray-400'
  const bodyText = isDark ? 'text-white/70'   : 'text-gray-600'
  const divider  = isDark ? 'border-white/5'  : 'border-gray-100'
  const hoverRow = isDark ? 'hover:bg-white/3': 'hover:bg-gray-50'

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 ${isDark ? '' : 'bg-gray-50/50 min-h-screen'}`}>
      {/* Back */}
      <Link href="/courses"
        className={`inline-flex items-center gap-2 text-sm transition-colors ${
          isDark ? 'text-white/40 hover:text-white' : 'text-gray-400 hover:text-gray-900'
        }`}>
        <ArrowLeft className="h-4 w-4" /> Barcha kurslar
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left — main content */}
        <div className="lg:col-span-2 space-y-6">

          {/* Hero card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl overflow-hidden" style={card}>
            <div className={`h-44 bg-gradient-to-br ${course.color} relative flex items-center px-8`}>
              <div className="absolute inset-0 bg-black/20" />
              <span className="relative text-7xl mr-6">{course.emoji}</span>
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full text-white"
                    style={{ background: 'rgba(0,0,0,0.4)' }}>
                    {course.category}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full text-white/80 bg-black/30">
                    {course.level}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                  {course.title}
                </h1>
              </div>
            </div>

            <div className="p-6">
              <p className={`text-sm leading-relaxed mb-6 ${subText}`}>{course.longDescription}</p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { icon: BookOpen, val: `${course.lessons.length} dars`, label: "O'quv dasturi" },
                  { icon: Clock,    val: course.duration,                  label: 'Umumiy vaqt'   },
                  { icon: Users,    val: course.students.toLocaleString(), label: "O'quvchilar"   },
                  { icon: Star,     val: `${course.rating}/5.0`,           label: 'Reyting'       },
                ].map(({ icon: Icon, val, label }) => (
                  <div key={label} className="text-center p-3 rounded-xl" style={cardSm}>
                    <Icon className={`h-4 w-4 mx-auto mb-1.5 ${mutedText}`} />
                    <p className={`font-bold text-sm ${heading}`}>{val}</p>
                    <p className={`text-xs mt-0.5 ${mutedText}`}>{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* What you learn */}
          <div className="rounded-2xl p-6" style={card}>
            <h2 className={`font-semibold mb-4 flex items-center gap-2 ${heading}`}>
              <Award className="h-4 w-4 text-amber-400" /> Nima o&apos;rganasiz
            </h2>
            <div className="grid sm:grid-cols-2 gap-2.5">
              {course.whatYouLearn.map((item, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className={`text-sm ${bodyText}`}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Syllabus */}
          <div className="rounded-2xl overflow-hidden" style={card}>
            <button onClick={() => setSyllabus(!syllabus)}
              className={`w-full flex items-center justify-between p-6 transition-colors ${
                isDark ? 'hover:bg-white/3' : 'hover:bg-gray-50'
              }`}>
              <h2 className={`font-semibold flex items-center gap-2 ${heading}`}>
                <BookOpen className="h-4 w-4 text-blue-500" />
                O&apos;quv dasturi
                <span className={`text-sm font-normal ${mutedText}`}>({course.lessons.length} dars)</span>
              </h2>
              {syllabus
                ? <ChevronUp  className={`h-4 w-4 ${mutedText}`} />
                : <ChevronDown className={`h-4 w-4 ${mutedText}`} />}
            </button>

            {syllabus && (
              <div className={`border-t ${divider} divide-y ${divider}`}>
                {course.lessons.map((lesson) => (
                  <div key={lesson.id}
                    className={`flex items-center gap-4 px-6 py-3.5 transition-all ${
                      enrolled || lesson.free
                        ? `${hoverRow} cursor-pointer`
                        : 'opacity-50 cursor-not-allowed'
                    }`}
                    onClick={() => {
                      if (enrolled || lesson.free) router.push(`/courses/${id}/lessons/${lesson.id}`)
                    }}>

                    {/* Icon */}
                    <div className={`h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      lesson.completed
                        ? 'bg-emerald-500/15'
                        : lesson.free
                        ? 'bg-blue-500/10'
                        : isDark ? 'bg-white/5' : 'bg-gray-100'
                    }`}>
                      {lesson.completed ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      ) : lesson.free ? (
                        <Play className="h-3.5 w-3.5 text-blue-500" />
                      ) : enrolled ? (
                        <Play className={`h-3.5 w-3.5 ${mutedText}`} />
                      ) : (
                        <Lock className={`h-3 w-3 ${mutedText}`} />
                      )}
                    </div>

                    {/* Title */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${
                        lesson.completed
                          ? 'text-emerald-500'
                          : isDark ? 'text-white/80' : 'text-gray-800'
                      }`}>
                        {lesson.order}. {lesson.title}
                      </p>
                    </div>

                    {/* Badge + duration */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {lesson.free && !enrolled && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-blue-600 bg-blue-100">
                          Bepul
                        </span>
                      )}
                      <span className={`text-xs flex items-center gap-1 ${mutedText}`}>
                        <Clock className="h-3 w-3" />{lesson.duration}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Requirements */}
          <div className="rounded-2xl p-6" style={card}>
            <h2 className={`font-semibold mb-4 ${heading}`}>Talablar</h2>
            <ul className="space-y-2.5">
              {course.requirements.map((req, i) => (
                <li key={i} className={`flex items-start gap-2.5 text-sm ${bodyText}`}>
                  <span className={`mt-0.5 ${mutedText}`}>•</span> {req}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right — sticky sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 space-y-4">

            {/* Enroll card */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="rounded-2xl overflow-hidden" style={card}>

              {/* Thumbnail */}
              <div className={`h-36 bg-gradient-to-br ${course.color} flex items-center justify-center relative`}>
                <div className="absolute inset-0 bg-black/25" />
                <span className="relative text-6xl">{course.emoji}</span>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-14 w-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center cursor-pointer hover:bg-white/30 transition-all">
                    <Play className="h-6 w-6 text-white ml-0.5" />
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-4">
                {/* Price */}
                <div className="text-center">
                  <span className={`text-3xl font-extrabold ${heading}`}>Bepul</span>
                  <p className={`text-xs mt-1 ${mutedText}`}>Sertifikat bilan</p>
                </div>

                {/* Progress */}
                {enrolled && (
                  <div>
                    <div className="flex justify-between mb-1.5">
                      <span className={`text-xs ${subText}`}>Sizning progressingiz</span>
                      <span className="text-blue-500 text-xs font-semibold">{progress}%</span>
                    </div>
                    <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}>
                      <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full"
                        style={{ width: `${progress}%` }} />
                    </div>
                    <p className={`text-xs mt-1.5 ${mutedText}`}>
                      {completedCount}/{course.lessons.length} dars bajarildi
                    </p>
                  </div>
                )}

                {/* CTA */}
                {enrolled ? (
                  <Link href={`/courses/${id}/lessons/${firstLesson.id}`}>
                    <button className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2">
                      <Play className="h-4 w-4" />
                      {progress > 0 ? 'Davom etish' : 'Boshlash'}
                    </button>
                  </Link>
                ) : (
                  <button onClick={handleEnroll} disabled={enrolling}
                    className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-70 transition-all shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2">
                    {enrolling ? (
                      <><span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />Yozilmoqda...</>
                    ) : (
                      <><CheckCircle2 className="h-4 w-4" />Kursga yozilish (Bepul)</>
                    )}
                  </button>
                )}

                {enrolled && (
                  <p className="text-center text-emerald-500 text-xs flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Siz bu kursga yozilgansiz
                  </p>
                )}

                {/* Features list */}
                <div className={`space-y-2 pt-2 border-t ${divider}`}>
                  {[
                    { icon: BookOpen,      text: `${course.lessons.length} ta video dars` },
                    { icon: Clock,         text: `${course.duration} umumiy davomiylik`   },
                    { icon: TrendingUp,    text: `${course.tasks} ta amaliy topshiriq`    },
                    { icon: MessageSquare, text: 'Forum va jamiyat kirishi'               },
                    { icon: Award,         text: 'Tugatish sertifikati'                   },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} className={`flex items-center gap-2.5 text-xs ${subText}`}>
                      <Icon className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                      {text}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Instructor card */}
            <div className="rounded-2xl p-5" style={card}>
              <h3 className={`font-semibold text-sm mb-4 ${heading}`}>O&apos;qituvchi</h3>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0 text-sm">
                  {course.instructorAvatar}
                </div>
                <div>
                  <p className={`font-semibold text-sm ${heading}`}>{course.instructor}</p>
                  <p className={`text-xs ${mutedText}`}>Senior Freelancer · 5+ yil tajriba</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center">
                {[
                  { val: course.rating.toString(), label: 'Reyting' },
                  { val: course.students.toLocaleString(), label: "O'quvchi" },
                ].map(({ val, label }) => (
                  <div key={label} className="rounded-lg p-2" style={cardSm}>
                    <p className={`font-bold text-sm ${heading}`}>{val}</p>
                    <p className={`text-xs ${mutedText}`}>{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Meta */}
            <div className="px-1 space-y-2">
              {[
                { label: 'Til',         val: course.language    },
                { label: 'Yangilangan', val: course.lastUpdated },
                { label: 'Daraja',      val: course.level       },
              ].map(({ label, val }) => (
                <div key={label} className="flex justify-between text-xs">
                  <span className={mutedText}>{label}</span>
                  <span className={`font-medium ${subText}`}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
