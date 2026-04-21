'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Save, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  initialData: { full_name: string; bio: string; age: number | null }
  userId: string
}

export default function ProfileClient({ initialData, userId }: Props) {
  const router = useRouter()
  const [form, setForm] = useState(initialData)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const set = (key: keyof typeof form) => (val: string | number | null) =>
    setForm(prev => ({ ...prev, [key]: val }))

  const handleSave = () => {
    if (!form.full_name.trim()) { setError('Ism kiritilishi shart'); return }
    setError('')
    setSuccess('')
    startTransition(async () => {
      const supabase = createClient()
      const { error: err } = await supabase
        .from('users')
        .update({
          full_name: form.full_name.trim(),
          bio: form.bio.trim() || null,
          age: form.age,
        })
        .eq('id', userId)
      if (err) { setError(err.message); return }
      setSuccess("Ma'lumotlar saqlandi!")
      router.refresh()
    })
  }

  return (
    <div className="rounded-2xl p-5 space-y-4"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <h2 className="text-white font-semibold flex items-center gap-2">
        <User className="h-4 w-4 text-blue-400" /> Ma&apos;lumotlarni tahrirlash
      </h2>

      <div>
        <label className="text-white/50 text-xs mb-1.5 block">Ism familiya *</label>
        <input
          type="text"
          value={form.full_name}
          onChange={e => set('full_name')(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-white/20 outline-none focus:ring-1 focus:ring-blue-500/50"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
        />
      </div>

      <div>
        <label className="text-white/50 text-xs mb-1.5 block">Bio</label>
        <textarea
          value={form.bio}
          onChange={e => set('bio')(e.target.value)}
          rows={3}
          placeholder="O'zingiz haqida qisqacha..."
          className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-white/20 outline-none focus:ring-1 focus:ring-blue-500/50 resize-none"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
        />
      </div>

      <div>
        <label className="text-white/50 text-xs mb-1.5 block">Yosh</label>
        <input
          type="number"
          value={form.age ?? ''}
          onChange={e => set('age')(e.target.value ? Number(e.target.value) : null)}
          min={10} max={100}
          className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-white/20 outline-none focus:ring-1 focus:ring-blue-500/50"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
        />
      </div>

      {error && <p className="text-red-400 text-xs">{error}</p>}
      {success && <p className="text-emerald-400 text-xs">{success}</p>}

      <button
        onClick={handleSave}
        disabled={isPending}
        className="w-full py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-60 flex items-center justify-center gap-2"
        style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.8), rgba(99,102,241,0.8))' }}
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Saqlash
      </button>
    </div>
  )
}
