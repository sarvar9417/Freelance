'use client'

import { useState, useTransition } from 'react'
import { motion } from 'framer-motion'
import {
  Settings, Globe, Mail, FileText, Phone,
  Save, Loader2, CheckCircle, Info,
} from 'lucide-react'
import { saveSiteSettings } from '../actions'

const FIELDS = [
  {
    key: 'site_name',
    label: 'Sayt nomi',
    placeholder: 'Freelancer School',
    icon: Globe,
    type: 'text',
  },
  {
    key: 'contact_email',
    label: 'Kontakt email',
    placeholder: 'info@freelancerschool.uz',
    icon: Mail,
    type: 'email',
  },
  {
    key: 'contact_phone',
    label: 'Telefon raqam',
    placeholder: '+998 90 000 00 00',
    icon: Phone,
    type: 'tel',
  },
  {
    key: 'footer_text',
    label: 'Footer matni',
    placeholder: '© 2024 Freelancer School. Barcha huquqlar himoyalangan.',
    icon: FileText,
    type: 'textarea',
  },
]

interface Props {
  initialSettings: Record<string, string>
}

export default function SettingsClient({ initialSettings }: Props) {
  const [values, setValues] = useState<Record<string, string>>({
    site_name: initialSettings.site_name ?? '',
    contact_email: initialSettings.contact_email ?? '',
    contact_phone: initialSettings.contact_phone ?? '',
    footer_text: initialSettings.footer_text ?? '',
  })
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaved(false)

    startTransition(async () => {
      const result = await saveSiteSettings(values)
      if (result.error) {
        setError(result.error)
      } else {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    })
  }

  const set = (key: string) => (val: string) => setValues(prev => ({ ...prev, [key]: val }))

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Sayt sozlamalari</h1>
        <p className="text-white/40 text-sm mt-1">Saytning asosiy ma&apos;lumotlarini boshqarish</p>
      </div>

      {/* DB jadval yo'q bo'lsa haqida eslatma */}
      <div
        className="flex items-start gap-3 px-4 py-3.5 rounded-xl"
        style={{ background: 'rgba(139,92,246,0.07)', border: '1px solid rgba(139,92,246,0.15)' }}
      >
        <Info className="h-4 w-4 text-purple-400 flex-shrink-0 mt-0.5" />
        <p className="text-white/50 text-xs leading-relaxed">
          Sozlamalar Supabase&apos;dagi <code className="text-purple-400">site_settings</code> jadvalida saqlanadi.
          Jadval mavjud bo&apos;lmasa, quyidagi SQL bilan yarating:{' '}
          <code className="text-purple-300">CREATE TABLE site_settings (key text PRIMARY KEY, value text);</code>
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        {FIELDS.map((field, i) => {
          const Icon = field.icon
          return (
            <motion.div
              key={field.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="rounded-2xl p-5"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <label className="flex items-center gap-2 text-sm font-medium text-white/70 mb-3">
                <Icon className="h-4 w-4 text-purple-400" />
                {field.label}
              </label>
              {field.type === 'textarea' ? (
                <textarea
                  value={values[field.key]}
                  onChange={e => set(field.key)(e.target.value)}
                  placeholder={field.placeholder}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/25 outline-none focus:ring-1 focus:ring-purple-500/50 resize-none transition-all"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                />
              ) : (
                <input
                  type={field.type}
                  value={values[field.key]}
                  onChange={e => set(field.key)(e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/25 outline-none focus:ring-1 focus:ring-purple-500/50 transition-all"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                />
              )}
            </motion.div>
          )
        })}

        {error && (
          <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="flex items-center justify-between"
        >
          {saved && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 text-emerald-400 text-sm"
            >
              <CheckCircle className="h-4 w-4" />
              Sozlamalar saqlandi
            </motion.div>
          )}
          <div className="ml-auto">
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium bg-purple-600/80 hover:bg-purple-600 text-white transition-all disabled:opacity-50 shadow-lg shadow-purple-900/30"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Saqlash
            </button>
          </div>
        </motion.div>
      </form>

      {/* Tezkor harakatlar */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.42 }}
        className="rounded-2xl p-5"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Settings className="h-4 w-4 text-white/40" />
          <h2 className="text-white text-sm font-semibold">Tizim ma&apos;lumotlari</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          {[
            { label: 'Platforma', value: 'Next.js 14' },
            { label: 'Ma\'lumotlar bazasi', value: 'Supabase' },
            { label: 'Til', value: "O'zbek" },
            { label: 'Versiya', value: '1.0.0' },
          ].map(item => (
            <div
              key={item.label}
              className="flex justify-between px-3 py-2.5 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
            >
              <span className="text-white/40">{item.label}</span>
              <span className="text-white/70 font-medium">{item.value}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
