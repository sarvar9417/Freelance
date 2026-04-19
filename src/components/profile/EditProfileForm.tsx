'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Save, Loader2, CheckCircle2, AlertCircle, User, Calendar, FileText } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const schema = z.object({
  full_name: z.string().min(2, 'Kamida 2 ta belgi').max(80, 'Ko\'pi bilan 80 ta belgi'),
  age: z
    .string()
    .optional()
    .refine(v => !v || (Number(v) >= 13 && Number(v) <= 100), 'Yosh 13–100 orasida bo\'lsin'),
  bio: z.string().max(300, 'Ko\'pi bilan 300 ta belgi').optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  userId: string
  initialData: {
    full_name: string
    age: number | null
    bio: string | null
  }
}

export default function EditProfileForm({ userId, initialData }: Props) {
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: initialData.full_name,
      age:       initialData.age?.toString() ?? '',
      bio:       initialData.bio ?? '',
    },
  })

  const onSubmit = async (data: FormData) => {
    setStatus('idle')
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('users')
        .update({
          full_name: data.full_name.trim(),
          age:       data.age ? Number(data.age) : null,
          bio:       data.bio?.trim() || null,
        })
        .eq('id', userId)

      if (error) throw error
      setStatus('success')
      setTimeout(() => setStatus('idle'), 3000)
    } catch (err) {
      console.error('Profile update error:', err)
      setStatus('error')
    }
  }

  const fields = [
    {
      key: 'full_name' as const,
      label: 'Ism va familiya',
      icon: User,
      placeholder: 'Ism Familiya',
      type: 'input',
      required: true,
    },
    {
      key: 'age' as const,
      label: 'Yosh',
      icon: Calendar,
      placeholder: '13–100',
      type: 'input',
      required: false,
    },
  ]

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

      {/* Status xabarlari */}
      <AnimatePresence>
        {status === 'success' && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-emerald-300 text-sm"
            style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}
          >
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            Profil muvaffaqiyatli yangilandi!
          </motion.div>
        )}
        {status === 'error' && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-rose-300 text-sm"
            style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)' }}
          >
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            Xatolik yuz berdi. Qayta urinib ko&apos;ring.
          </motion.div>
        )}
      </AnimatePresence>

      {/* Matn maydonlari */}
      {fields.map(({ key, label, icon: Icon, placeholder, required }) => (
        <div key={key} className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-white/50 text-xs font-semibold uppercase tracking-wider">
            <Icon className="h-3 w-3" />
            {label}
            {required && <span className="text-rose-400 normal-case font-normal">*</span>}
          </label>
          <input
            {...register(key)}
            type={key === 'age' ? 'number' : 'text'}
            placeholder={placeholder}
            className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder:text-white/20 outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
            style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${errors[key] ? 'rgba(244,63,94,0.5)' : 'rgba(255,255,255,0.08)'}` }}
          />
          {errors[key] && (
            <p className="text-rose-400 text-xs flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors[key]?.message}
            </p>
          )}
        </div>
      ))}

      {/* Bio */}
      <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-white/50 text-xs font-semibold uppercase tracking-wider">
          <FileText className="h-3 w-3" />
          Bio
        </label>
        <div className="relative">
          <textarea
            {...register('bio')}
            rows={4}
            placeholder="O'zingiz haqingizda qisqacha... Ko'nikmalaringiz, maqsadlaringiz, qiziqishlaringiz."
            className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder:text-white/20 outline-none focus:ring-1 focus:ring-blue-500/50 transition-all resize-none leading-relaxed"
            style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${errors.bio ? 'rgba(244,63,94,0.5)' : 'rgba(255,255,255,0.08)'}` }}
          />
        </div>
        {errors.bio && (
          <p className="text-rose-400 text-xs flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errors.bio.message}
          </p>
        )}
        <p className="text-white/20 text-[10px]">Ko&apos;pi bilan 300 ta belgi</p>
      </div>

      {/* Saqlash tugmasi */}
      <div className="flex items-center justify-between pt-2">
        <p className="text-white/25 text-xs">
          {isDirty ? '⚠️ Saqlanmagan o\'zgarishlar bor' : ''}
        </p>
        <motion.button
          type="submit"
          disabled={isSubmitting || !isDirty}
          whileHover={!isSubmitting && isDirty ? { scale: 1.02 } : {}}
          whileTap={!isSubmitting && isDirty ? { scale: 0.97 } : {}}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-900/30"
        >
          {isSubmitting
            ? <><Loader2 className="h-4 w-4 animate-spin" /> Saqlanmoqda...</>
            : <><Save className="h-4 w-4" /> Saqlash</>
          }
        </motion.button>
      </div>
    </form>
  )
}
