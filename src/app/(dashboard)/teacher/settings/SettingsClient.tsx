'use client'

import { useState, useTransition } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, FileText, Hash, Save, Loader2, CheckCircle2 } from 'lucide-react'
import { updateTeacherProfile } from '../actions'

interface Props {
  initial: {
    full_name: string
    email: string
    bio: string
    age: number | null
    avatar_url: string | null
  }
}

export default function SettingsClient({ initial }: Props) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    full_name: initial.full_name,
    bio: initial.bio,
    age: initial.age?.toString() ?? '',
  })

  const set = (key: keyof typeof form) => (val: string) =>
    setForm(prev => ({ ...prev, [key]: val }))

  const initials = form.full_name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'OQ'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.full_name.trim()) { setError('Ism kiritilishi shart'); return }
    setError('')
    setSuccess(false)

    startTransition(async () => {
      const result = await updateTeacherProfile({
        full_name: form.full_name,
        bio: form.bio,
        age: form.age ? parseInt(form.age) : null,
      })
      if (result.error) { setError(result.error); return }
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    })
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Sozlamalar</h1>
        <p className="text-white/40 text-sm mt-1">Profil ma&apos;lumotlaringizni yangilang</p>
      </div>

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm"
        >
          <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
          Profil muvaffaqiyatli yangilandi!
        </motion.div>
      )}

      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Avatar preview */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-5"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-xl font-bold text-white flex-shrink-0 shadow-lg shadow-emerald-900/40">
              {initials}
            </div>
            <div>
              <p className="text-white font-semibold">{form.full_name || "O'qituvchi"}</p>
              <p className="text-white/40 text-sm">{initial.email}</p>
              <p className="text-white/25 text-xs mt-1">O&apos;qituvchi</p>
            </div>
          </div>
        </motion.div>

        {/* Asosiy ma'lumotlar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="rounded-2xl p-5 space-y-4"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <h2 className="text-white text-sm font-semibold flex items-center gap-2">
            <User className="h-4 w-4 text-emerald-400" /> Shaxsiy ma&apos;lumotlar
          </h2>

          <div>
            <label className="text-white/50 text-xs mb-1.5 flex items-center gap-1">
              <User className="h-3 w-3" /> Ism va familiya *
            </label>
            <input
              type="text" value={form.full_name}
              onChange={e => set('full_name')(e.target.value)}
              placeholder="Ism Familiya"
              className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/25 outline-none focus:ring-1 focus:ring-emerald-500/50"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            />
          </div>

          <div>
            <label className="text-white/50 text-xs mb-1.5 flex items-center gap-1">
              <Mail className="h-3 w-3" /> Email (o&apos;zgartirib bo&apos;lmaydi)
            </label>
            <input
              type="email" value={initial.email} disabled
              className="w-full px-4 py-3 rounded-xl text-sm text-white/30 outline-none cursor-not-allowed"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}
            />
          </div>

          <div>
            <label className="text-white/50 text-xs mb-1.5 flex items-center gap-1">
              <Hash className="h-3 w-3" /> Yosh (ixtiyoriy)
            </label>
            <input
              type="number" min={16} max={99} value={form.age}
              onChange={e => set('age')(e.target.value)}
              placeholder="Masalan: 28"
              className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/25 outline-none focus:ring-1 focus:ring-emerald-500/50"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            />
          </div>

          <div>
            <label className="text-white/50 text-xs mb-1.5 flex items-center gap-1">
              <FileText className="h-3 w-3" /> Bio (ixtiyoriy)
            </label>
            <textarea
              value={form.bio}
              onChange={e => set('bio')(e.target.value)}
              placeholder="O'zingiz haqingizda qisqacha..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/25 outline-none focus:ring-1 focus:ring-emerald-500/50 resize-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            />
          </div>
        </motion.div>

        <button
          type="submit" disabled={isPending}
          className="w-full py-3 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
          style={{ background: 'linear-gradient(135deg, rgba(5,150,105,0.9), rgba(4,120,87,0.9))' }}
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          O&apos;zgarishlarni saqlash
        </button>
      </form>
    </div>
  )
}
