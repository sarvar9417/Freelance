'use client'

import { Globe, BookOpen, Briefcase, Puzzle, ArrowRight, CheckCircle2, ExternalLink } from 'lucide-react'
import { useMountedTheme } from '@/hooks/useTheme'
import { TASK_TYPE_LABELS } from '@/types'
import type { TaskType } from '@/types'

interface Props {
  taskType: string
  templateData: Record<string, unknown> | null
  isDark?: boolean
}

const METHODOLOGY_TEMPLATES: Record<string, {
  icon: React.ElementType
  title: string
  badge: string
  steps: string[]
  hint: string
}> = {
  web_kvest: {
    icon: Globe,
    title: 'Veb-Kvest topshirig\'i',
    badge: '🌐 Veb-Kvest',
    steps: [
      'Berilgan veb-manzillarni o\'rganing',
      'Topshiriq bo\'yicha ma\'lumot to\'plang',
      'To\'plangan ma\'lumotlarni tahlil qiling',
      'Natijani formatga mos holda taqdim eting',
    ],
    hint: 'Internet-resurslardan foydalanib, topshiriqni bajarishingiz kerak',
  },
  flipped_homework: {
    icon: BookOpen,
    title: 'Flipped Classroom — Uy vazifasi',
    badge: '🔄 Flipped — Uy',
    steps: [
      'Video darslikni diqqat bilan tomosha qiling',
      'Berilgan materiallarni o\'qing',
      'Tushunganingizni yozma bayon qiling',
      'Darsda muhokama qilish uchun savollar tayyorlang',
    ],
    hint: 'Materialni oldindan o\'rganib, darsga tayyor bo\'ling',
  },
  flipped_inclass: {
    icon: BookOpen,
    title: 'Flipped Classroom — Sinf ishi',
    badge: '🔄 Flipped — Sinf',
    steps: [
      'Uy vazifasida o\'rgangan materialni eslang',
      'Amaliy mashqni bajaring',
      'Guruh bilan muhokama qiling',
      'Natijani taqdimot qiling',
    ],
    hint: 'Uyda o\'rgangan bilimingizni amalda qo\'llang',
  },
  pbl_project: {
    icon: Briefcase,
    title: 'Project-Based Learning',
    badge: '📐 PBL Loyiha',
    steps: [
      'Loyiha mavzusini aniqlang',
      'Reja va muddatlarni belgilang',
      'Tadqiqot va ishlanma qiling',
      'Yakuniy mahsulotni taqdim eting',
    ],
    hint: 'Real loyiha ustida ishlab, amaliy ko\'nikma olasiz',
  },
  muammoli_problem: {
    icon: Puzzle,
    title: 'Muammoli vaziyat',
    badge: '🧩 Muammoli ta\'lim',
    steps: [
      'Muammoni diqqat bilan o\'qing va tahlil qiling',
      'Muammoning sabablarini aniqlang',
      'Yechim variantlarini ishlab chiqing',
      'Eng optimal yechimni asoslab bering',
    ],
    hint: 'Berilgan muammoli vaziyatga ijodiy yondashing',
  },
}

export default function MethodologyTemplate({ taskType, templateData }: Props) {
  const { isDark } = useMountedTheme()
  const template = METHODOLOGY_TEMPLATES[taskType]
  const label = TASK_TYPE_LABELS[taskType as TaskType]

  if (!template && taskType === 'standard') return null

  const Icon = template?.icon ?? Puzzle
  const desc = templateData?.description as string | undefined

  if (!template) {
    return (
      <div className="rounded-xl p-4 space-y-2"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center gap-2 text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : '#374151' }}>
          <Icon className="h-4 w-4" />
          <span className="font-medium">{label?.icon} {label?.label}</span>
        </div>
        {desc && (
          <p className={`text-xs leading-relaxed ${isDark ? 'text-white/40' : 'text-gray-500'}`}>{desc}</p>
        )}
      </div>
    )
  }

  return (
    <div className="rounded-xl overflow-hidden"
      style={{ background: isDark ? 'rgba(6,182,212,0.05)' : 'rgba(6,182,212,0.03)', border: '1px solid rgba(6,182,212,0.15)' }}>
      {/* Header */}
      <div className="flex items-center gap-2 p-3"
        style={{ background: isDark ? 'rgba(6,182,212,0.08)' : 'rgba(6,182,212,0.06)', borderBottom: '1px solid rgba(6,182,212,0.1)' }}>
        <Icon className="h-4 w-4" style={{ color: isDark ? 'rgb(34,211,238)' : 'rgb(8,145,178)' }} />
        <span className="text-sm font-medium" style={{ color: isDark ? 'rgb(34,211,238)' : 'rgb(8,145,178)' }}>
          {template.badge}
        </span>
      </div>
      <div className="p-3 space-y-3">
        <p className={`text-xs leading-relaxed ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
          <span className={`inline-flex items-center gap-1.5 font-medium ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>
            <ArrowRight className="h-3 w-3" /> Metodika:
          </span>
          {template.hint}
        </p>

        {desc && (
          <div className="rounded-lg p-3"
            style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', border: '1px solid rgba(6,182,212,0.1)' }}>
            <p className={`text-xs font-medium mb-1.5 ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
              <ExternalLink className="h-3 w-3 inline mr-1" />Qo&apos;shimcha ma&apos;lumot:
            </p>
            <p className={`text-xs leading-relaxed ${isDark ? 'text-white/70' : 'text-gray-700'}`}>{desc}</p>
          </div>
        )}

        {/* Steps */}
        <div className="space-y-1.5">
          <p className={`text-xs font-medium ${isDark ? 'text-white/50' : 'text-gray-500'}`}>Bosqichlar:</p>
          {template.steps.map((step, i) => (
            <div key={i} className="flex items-start gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 flex-shrink-0"
                style={{ color: isDark ? 'rgba(34,211,238,0.5)' : 'rgba(8,145,178,0.6)' }} />
              <span className={`text-xs ${isDark ? 'text-white/50' : 'text-gray-600'}`}>{step}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
