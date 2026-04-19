'use client'

/* ── Server-side auth tekshiruvi kerak bo'lganda:
   import { redirect } from 'next/navigation'
   import { createClient } from '@/lib/supabase/server'
   ...
   if (!user) redirect('/login')
   Bu sahifa client-side chunki settings ko'p holat boshqaruvini talab qiladi.
─────────────────────────────────────────────────────────────────────────── */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, User, Lock, Bell, Globe, Loader2,
  CheckCircle2, AlertCircle, Eye, EyeOff, ChevronRight,
  Shield, Trash2, LogOut,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import EditProfileForm from '@/components/profile/EditProfileForm'

type Section = 'profile' | 'password' | 'notifications' | 'language' | 'danger'

const SECTIONS: { id: Section; label: string; icon: typeof User; desc: string }[] = [
  { id: 'profile',       label: 'Profil ma\'lumotlari', icon: User,   desc: 'Ism, yosh, bio tahrirlash'         },
  { id: 'password',      label: 'Parol',                icon: Lock,   desc: 'Parolni o\'zgartirish'             },
  { id: 'notifications', label: 'Bildirishnomalar',     icon: Bell,   desc: 'Email va push bildirishnomalar'    },
  { id: 'language',      label: 'Til',                  icon: Globe,  desc: 'Interfeys tilini tanlash'          },
  { id: 'danger',        label: 'Xavfli zona',          icon: Shield, desc: 'Akkauntni o\'chirish va boshqalar' },
]

const LANGUAGES = [
  { code: 'uz', label: "O'zbek",  flag: '🇺🇿' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
]

type NotifKey = 'email_new_post' | 'email_new_comment' | 'email_course_update' | 'push_tasks' | 'push_goals'
const NOTIF_OPTIONS: { key: NotifKey; label: string; desc: string }[] = [
  { key: 'email_new_post',     label: 'Yangi forum postlari',     desc: 'Yangi post chiqganda email'     },
  { key: 'email_new_comment',  label: 'Yangi izohlar',            desc: 'Postlarimga izoh yozilganda'    },
  { key: 'email_course_update',label: 'Kurs yangilanishlari',     desc: 'Kursga yangi dars qo\'shilganda'  },
  { key: 'push_tasks',         label: 'Topshiriq eslatmalari',    desc: 'Muddati yaqinlashganda eslatish' },
  { key: 'push_goals',         label: 'Maqsad eslatmalari',       desc: 'Maqsad muddati eslatmasi'       },
]

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 rounded-full transition-colors duration-200 ${checked ? 'bg-blue-600' : 'bg-white/10'}`}
    >
      <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  )
}

export default function SettingsPage() {
  const router = useRouter()
  const [section, setSection] = useState<Section>('profile')
  const [userId, setUserId]   = useState<string | null>(null)
  const [profile, setProfile] = useState<{ full_name: string; age: number | null; bio: string | null } | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)

  /* ── Parol ── */
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw]         = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showPw, setShowPw]       = useState(false)
  const [pwStatus, setPwStatus]   = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [pwError, setPwError]     = useState('')

  /* ── Bildirishnomalar ── */
  const [notifs, setNotifs] = useState<Record<NotifKey, boolean>>({
    email_new_post:      true,
    email_new_comment:   true,
    email_course_update: false,
    push_tasks:          true,
    push_goals:          false,
  })

  /* ── Til ── */
  const [lang, setLang] = useState('uz')

  /* ── Xavfli zona ── */
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleting, setDeleting]           = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push('/login'); return }
      setUserId(data.user.id)
      const { data: p } = await supabase
        .from('users')
        .select('full_name, age, bio')
        .eq('id', data.user.id)
        .single()
      setProfile(p ?? { full_name: data.user.user_metadata?.full_name ?? '', age: null, bio: null })
      setLoadingProfile(false)
    })

    /* LocalStorage dan sozlamalarni yuklash */
    try {
      const saved = localStorage.getItem('fs_notifs')
      if (saved) setNotifs(JSON.parse(saved))
      const savedLang = localStorage.getItem('fs_lang')
      if (savedLang) setLang(savedLang)
    } catch { /* ignore */ }
  }, [router])

  const saveNotifs = (updated: Record<NotifKey, boolean>) => {
    setNotifs(updated)
    localStorage.setItem('fs_notifs', JSON.stringify(updated))
  }

  const saveLang = (code: string) => {
    setLang(code)
    localStorage.setItem('fs_lang', code)
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwError('')
    if (newPw.length < 8) { setPwError('Yangi parol kamida 8 ta belgi'); return }
    if (newPw !== confirmPw) { setPwError('Parollar mos kelmadi'); return }
    setPwStatus('loading')
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password: newPw })
      if (error) throw error
      setPwStatus('success')
      setCurrentPw(''); setNewPw(''); setConfirmPw('')
      setTimeout(() => setPwStatus('idle'), 3000)
    } catch {
      setPwStatus('error')
      setPwError('Xatolik yuz berdi. Qayta urinib ko\'ring.')
    }
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 text-white/20 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

      {/* ── Navigatsiya ── */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/profile" className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 text-sm transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Profilga qaytish
        </Link>
        <span className="text-white/15">/</span>
        <span className="text-white/60 text-sm">Sozlamalar</span>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">

        {/* ── Chap menu ── */}
        <nav className="lg:col-span-1 space-y-1">
          {SECTIONS.map(s => {
            const Icon = s.icon
            const isActive = section === s.id
            return (
              <button
                key={s.id}
                onClick={() => setSection(s.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                  isActive
                    ? 'text-white border border-blue-500/30'
                    : 'text-white/40 hover:text-white/70 border border-transparent hover:border-white/8'
                } ${s.id === 'danger' ? '!text-rose-400/70 hover:!text-rose-400' : ''}`}
                style={isActive ? { background: 'rgba(59,130,246,0.1)' } : { background: 'rgba(255,255,255,0.02)' }}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <div className="min-w-0 flex-1 text-left">
                  <p className="text-sm font-medium truncate">{s.label}</p>
                </div>
                <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 opacity-40" />
              </button>
            )
          })}

          {/* Chiqish */}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/30 hover:text-rose-400 border border-transparent hover:border-rose-500/20 transition-all mt-4"
            style={{ background: 'rgba(255,255,255,0.02)' }}
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm font-medium">Chiqish</span>
          </button>
        </nav>

        {/* ── Asosiy kontent ── */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={section}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="rounded-2xl p-6"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
            >

              {/* ── Profil tahrirlash ── */}
              {section === 'profile' && (
                <div className="space-y-1">
                  <h2 className="text-white font-semibold text-base flex items-center gap-2 mb-1">
                    <User className="h-4 w-4 text-blue-400" />
                    Profil ma&apos;lumotlari
                  </h2>
                  <p className="text-white/35 text-sm mb-6">Ism, yosh va bio ni tahrirlang</p>
                  {userId && profile ? (
                    <EditProfileForm
                      userId={userId}
                      initialData={profile}
                    />
                  ) : (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-5 w-5 text-white/20 animate-spin" />
                    </div>
                  )}
                </div>
              )}

              {/* ── Parol ── */}
              {section === 'password' && (
                <div>
                  <h2 className="text-white font-semibold text-base flex items-center gap-2 mb-1">
                    <Lock className="h-4 w-4 text-blue-400" />
                    Parolni o&apos;zgartirish
                  </h2>
                  <p className="text-white/35 text-sm mb-6">Xavfsizlik uchun kuchli parol ishlating</p>

                  <AnimatePresence>
                    {pwStatus === 'success' && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="flex items-center gap-2 px-4 py-3 rounded-xl text-emerald-300 text-sm mb-4"
                        style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                        <CheckCircle2 className="h-4 w-4" /> Parol muvaffaqiyatli o&apos;zgartirildi!
                      </motion.div>
                    )}
                    {pwError && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="flex items-center gap-2 px-4 py-3 rounded-xl text-rose-300 text-sm mb-4"
                        style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)' }}>
                        <AlertCircle className="h-4 w-4" /> {pwError}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    {[
                      { label: 'Yangi parol',          value: newPw,       set: setNewPw,       placeholder: 'Kamida 8 ta belgi' },
                      { label: 'Yangi parolni tasdiqlang', value: confirmPw, set: setConfirmPw, placeholder: 'Parolni takrorlang' },
                    ].map(f => (
                      <div key={f.label} className="space-y-1.5">
                        <label className="text-white/45 text-xs font-semibold uppercase tracking-wider">{f.label}</label>
                        <div className="relative">
                          <input
                            type={showPw ? 'text' : 'password'}
                            value={f.value}
                            onChange={e => f.set(e.target.value)}
                            placeholder={f.placeholder}
                            className="w-full px-4 py-3 pr-10 rounded-xl text-sm text-white placeholder:text-white/20 outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                          />
                          <button type="button" onClick={() => setShowPw(v => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors">
                            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Parol kuchi ko'rsatkichi */}
                    {newPw && (
                      <div className="space-y-1">
                        <p className="text-white/30 text-[10px]">Parol kuchi</p>
                        <div className="flex gap-1">
                          {['bg-rose-500', 'bg-amber-500', 'bg-emerald-500'].map((color, i) => (
                            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${
                              newPw.length >= (i + 1) * 4 ? color : 'bg-white/10'
                            }`} />
                          ))}
                        </div>
                        <p className="text-white/20 text-[10px]">
                          {newPw.length < 4 ? 'Juda qisqa' : newPw.length < 8 ? 'O\'rta' : 'Kuchli'}
                        </p>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={pwStatus === 'loading' || !newPw || !confirmPw}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-900/30"
                    >
                      {pwStatus === 'loading'
                        ? <><Loader2 className="h-4 w-4 animate-spin" /> O&apos;zgartirilmoqda...</>
                        : <><Lock className="h-4 w-4" /> Parolni o&apos;zgartirish</>
                      }
                    </button>
                  </form>
                </div>
              )}

              {/* ── Bildirishnomalar ── */}
              {section === 'notifications' && (
                <div>
                  <h2 className="text-white font-semibold text-base flex items-center gap-2 mb-1">
                    <Bell className="h-4 w-4 text-blue-400" />
                    Bildirishnomalar
                  </h2>
                  <p className="text-white/35 text-sm mb-6">Qaysi bildirishnomalarni olishni tanlang</p>
                  <div className="space-y-3">
                    {NOTIF_OPTIONS.map(({ key, label, desc }) => (
                      <div
                        key={key}
                        className="flex items-center justify-between p-4 rounded-xl"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                      >
                        <div>
                          <p className="text-white/80 text-sm font-medium">{label}</p>
                          <p className="text-white/35 text-xs mt-0.5">{desc}</p>
                        </div>
                        <Toggle
                          checked={notifs[key]}
                          onChange={v => saveNotifs({ ...notifs, [key]: v })}
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-white/20 text-xs mt-4">
                    Sozlamalar qurilmangizda saqlanadi.
                  </p>
                </div>
              )}

              {/* ── Til ── */}
              {section === 'language' && (
                <div>
                  <h2 className="text-white font-semibold text-base flex items-center gap-2 mb-1">
                    <Globe className="h-4 w-4 text-blue-400" />
                    Interfeys tili
                  </h2>
                  <p className="text-white/35 text-sm mb-6">Qulay tilni tanlang</p>
                  <div className="space-y-3">
                    {LANGUAGES.map(l => (
                      <button
                        key={l.code}
                        onClick={() => saveLang(l.code)}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all ${
                          lang === l.code
                            ? 'border border-blue-500/30'
                            : 'border border-white/6 hover:border-white/12'
                        }`}
                        style={lang === l.code ? { background: 'rgba(59,130,246,0.1)' } : { background: 'rgba(255,255,255,0.03)' }}
                      >
                        <span className="text-2xl">{l.flag}</span>
                        <span className={`text-sm font-medium ${lang === l.code ? 'text-white' : 'text-white/60'}`}>
                          {l.label}
                        </span>
                        {lang === l.code && (
                          <CheckCircle2 className="h-4 w-4 text-blue-400 ml-auto" />
                        )}
                      </button>
                    ))}
                  </div>
                  <p className="text-white/20 text-xs mt-4">
                    Til o&apos;zgarishi keyingi yuklanishda qo&apos;llaniladi.
                  </p>
                </div>
              )}

              {/* ── Xavfli zona ── */}
              {section === 'danger' && (
                <div>
                  <h2 className="text-white font-semibold text-base flex items-center gap-2 mb-1">
                    <Shield className="h-4 w-4 text-rose-400" />
                    Xavfli zona
                  </h2>
                  <p className="text-white/35 text-sm mb-6">Bu amallar qaytarib bo&apos;lmaydi</p>

                  <div className="space-y-4">
                    {/* Ma'lumotlarni yuklab olish */}
                    <div
                      className="p-4 rounded-xl flex items-start justify-between gap-4"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                    >
                      <div>
                        <p className="text-white/80 text-sm font-medium">Ma&apos;lumotlarni eksport qilish</p>
                        <p className="text-white/35 text-xs mt-0.5">Barcha ma&apos;lumotlaringizni JSON formatda yuklab oling</p>
                      </div>
                      <button className="text-xs font-medium text-blue-400 border border-blue-500/25 px-3 py-1.5 rounded-lg hover:bg-blue-500/10 transition-all flex-shrink-0">
                        Eksport
                      </button>
                    </div>

                    {/* Akkauntni o'chirish */}
                    <div
                      className="p-4 rounded-xl"
                      style={{ background: 'rgba(244,63,94,0.05)', border: '1px solid rgba(244,63,94,0.2)' }}
                    >
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div>
                          <p className="text-rose-300 text-sm font-semibold">Akkauntni o&apos;chirish</p>
                          <p className="text-white/35 text-xs mt-0.5">
                            Barcha ma&apos;lumotlar, progress va sertifikatlar o&apos;chiriladi.
                          </p>
                        </div>
                        <Trash2 className="h-5 w-5 text-rose-400/60 flex-shrink-0" />
                      </div>

                      <div className="space-y-3">
                        <input
                          type="text"
                          value={deleteConfirm}
                          onChange={e => setDeleteConfirm(e.target.value)}
                          placeholder="Tasdiqlash uchun 'O'CHIR' deb yozing"
                          className="w-full px-3.5 py-2.5 rounded-xl text-sm text-white placeholder:text-white/20 outline-none"
                          style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.25)' }}
                        />
                        <button
                          disabled={deleteConfirm !== "O'CHIR" || deleting}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                          {deleting
                            ? <><Loader2 className="h-4 w-4 animate-spin" /> O&apos;chirilmoqda...</>
                            : <><Trash2 className="h-4 w-4" /> Akkauntni o&apos;chirish</>
                          }
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
