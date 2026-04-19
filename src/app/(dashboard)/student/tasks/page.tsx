import { ClipboardList, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react'
import TaskItem, { type TaskData } from '@/components/student/TaskItem'

const TASKS: TaskData[] = [
  {
    id: '1',
    title: "Upwork profilingizni to'ldiring",
    description: "Upwork platformasida to'liq profil yarating: professional foto, sarlavha, tavsif, ko'nikmalar va portfolio. Profilni PDF sifatida saqlang va yuklang.",
    course: 'Freelancing asoslari',
    deadline: '2025-01-15',
    status: 'pending',
    grade: null,
    maxGrade: 100,
    feedback: null,
  },
  {
    id: '2',
    title: "Birinchi proposal yozing",
    description: "Upwork yoki Fiverr'da real loyiha toping va professional proposal yozing. Proposal 150-300 so'z bo'lishi kerak. Skreenshot yoki PDF sifatida yuklang.",
    course: 'Freelancing asoslari',
    deadline: '2025-01-20',
    status: 'pending',
    grade: null,
    maxGrade: 100,
    feedback: null,
  },
  {
    id: '3',
    title: 'Logo dizayn qiling',
    description: "Figma'da xayoliy kompaniya uchun logo yarating. Vektor format, 3 xil rang varianti bo'lishi kerak. PNG va SVG formatida eksport qiling.",
    course: 'Grafik Dizayn (Figma)',
    deadline: '2025-01-10',
    status: 'submitted',
    grade: null,
    maxGrade: 100,
    feedback: null,
  },
  {
    id: '4',
    title: 'Sotuvchi matn yozing',
    description: "Mahsulot yoki xizmat uchun sotuvchi matn (sales copy) yozing. AIDA formulasidan foydalaning. 400-600 so'z hajmida bo'lishi kerak.",
    course: 'Copywriting Pro',
    deadline: '2024-12-28',
    status: 'graded',
    grade: 88,
    maxGrade: 100,
    feedback: "Juda yaxshi! AIDA formulasi to'g'ri qo'llanilgan. Sarlavha kuchli, ammo call-to-action qismini yanada aniqroq qilish mumkin edi. Umumiy baho: 88/100.",
  },
  {
    id: '5',
    title: 'SMM kontent rejasi tuzing',
    description: "Bir oylik Instagram kontent rejasi (content plan) tuzing. 30 ta post mavzusi, hashtag strategiyasi va posting jadvalini kiriting.",
    course: 'SMM Marketing',
    deadline: '2024-12-20',
    status: 'graded',
    grade: 95,
    maxGrade: 100,
    feedback: "A'lo daraja! Kontent strategiyasi juda professional. Hashtag tahlili batafsil bajarilgan. Faqat kichik tuzatish: Stories uchun ham reja qo'shilsa yanada mukammal bo'lardi.",
  },
]

const counts = {
  pending:   TASKS.filter(t => t.status === 'pending').length,
  submitted: TASKS.filter(t => t.status === 'submitted').length,
  graded:    TASKS.filter(t => t.status === 'graded').length,
}

export default function TasksPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Topshiriqlarim</h1>
        <p className="text-white/40 text-sm mt-1">Barcha kurslar bo&apos;yicha topshiriqlar</p>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Bajarilmagan',       count: counts.pending,   icon: AlertCircle,   color: 'text-amber-400',   bg: 'bg-amber-400/10 border-amber-400/20'   },
          { label: "Ko'rib chiqilmoqda", count: counts.submitted, icon: Loader2,       color: 'text-blue-400',    bg: 'bg-blue-400/10 border-blue-400/20'     },
          { label: 'Baholandi',          count: counts.graded,    icon: CheckCircle2,  color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20' },
        ].map(({ label, count, icon: Icon, color, bg }) => (
          <div key={label} className={`rounded-2xl p-4 flex flex-col items-center gap-1.5 border ${bg}`}>
            <Icon className={`h-4 w-4 ${color}`} />
            <p className={`text-xl font-extrabold ${color}`}>{count}</p>
            <p className="text-white/40 text-xs text-center leading-tight">{label}</p>
          </div>
        ))}
      </div>

      {/* Pending first */}
      {counts.pending > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="h-4 w-4 text-amber-400" />
            <h2 className="text-white font-semibold text-sm">Bajarilmagan topshiriqlar</h2>
            <span className="bg-amber-500 text-white text-xs font-bold h-5 w-5 rounded-full flex items-center justify-center">
              {counts.pending}
            </span>
          </div>
          <div className="space-y-3">
            {TASKS.filter(t => t.status === 'pending').map((t, i) => (
              <TaskItem key={t.id} task={t} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* Submitted */}
      {counts.submitted > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />
            <h2 className="text-white font-semibold text-sm">Ko&apos;rib chiqilmoqda</h2>
          </div>
          <div className="space-y-3">
            {TASKS.filter(t => t.status === 'submitted').map((t, i) => (
              <TaskItem key={t.id} task={t} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* Graded */}
      {counts.graded > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <h2 className="text-white font-semibold text-sm">Baholangan</h2>
          </div>
          <div className="space-y-3">
            {TASKS.filter(t => t.status === 'graded').map((t, i) => (
              <TaskItem key={t.id} task={t} index={i} />
            ))}
          </div>
        </section>
      )}

      {TASKS.length === 0 && (
        <div className="text-center py-16">
          <ClipboardList className="h-10 w-10 text-white/20 mx-auto mb-3" />
          <p className="text-white/40 text-sm">Hozircha topshiriq yo&apos;q</p>
        </div>
      )}
    </div>
  )
}
