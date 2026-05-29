'use client'

import { useState, useTransition } from 'react'
import { motion } from 'framer-motion'
import { Settings, Globe, Mail, FileText, Phone, Save, Loader2, CheckCircle, Info } from 'lucide-react'
import { saveSiteSettings } from '../actions'
import { useMountedTheme } from '@/hooks/useTheme'

const FIELDS = [
  { key: 'site_name',      label: 'Sayt nomi',      placeholder: 'Freelancer School',                              icon: Globe,     type: 'text'     },
  { key: 'contact_email',  label: 'Kontakt email',   placeholder: 'info@freelancerschool.uz',                       icon: Mail,      type: 'email'    },
  { key: 'contact_phone',  label: 'Telefon raqam',   placeholder: '+998 90 000 00 00',                              icon: Phone,     type: 'tel'      },
  { key: 'footer_text',    label: 'Footer matni',    placeholder: '© 2024 Freelancer School.',                     icon: FileText,  type: 'textarea' },
]

export default function SettingsClient({ initialSettings }: { initialSettings: Record<string, string> }) {
  const { isDark } = useMountedTheme()
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
      if (result.error) { setError(result.error) }
      else { setSaved(true); setTimeout(() => setSaved(false), 3000) }
    })
  }

  const set = (key: string) => (val: string) => setValues(prev => ({ ...prev, [key]: val }))

  const fieldStyle = isDark
    ? { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }
    : {}
  const fieldCls = `w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-1 focus:ring-purple-500/50 transition-all ${
    isDark
      ? 'text-white placeholder-white/25'
      : 'bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-purple-400'
  }`

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Sayt sozlamalari</h1>
        <p className={`text-sm mt-1 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>Saytning asosiy ma&apos;lumotlarini boshqarish</p>
      </div>

      <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl"
        style={isDark
          ? { background: 'rgba(139,92,246,0.07)', border: '1px solid rgba(139,92,246,0.15)' }
          : { background: '#f5f3ff', border: '1px solid #ddd6fe' }}>
        <Info className="h-4 w-4 text-purple-400 flex-shrink-0 mt-0.5" />
        <p className={`text-xs leading-relaxed ${isDark ? 'text-white/50' : 'text-purple-700'}`}>
          Sozlamalar Supabase&apos;dagi <code className="text-purple-400">site_settings</code> jadvalida saqlanadi.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        {FIELDS.map((field, i) => {
          const Icon = field.icon
          return (
            <motion.div key={field.key} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className={`rounded-2xl p-5 ${isDark ? 'border border-white/7' : 'bg-white border border-gray-200'}`}
              style={isDark ? { background: 'rgba(255,255,255,0.03)' } : {}}>
              <label className={`flex items-center gap-2 text-sm font-medium mb-3 ${isDark ? 'text-white/70' : 'text-gray-700'}`}>
                <Icon className="h-4 w-4 text-purple-400" />{field.label}
              </label>
              {field.type === 'textarea' ? (
                <textarea value={values[field.key]} onChange={e => set(field.key)(e.target.value)}
                  placeholder={field.placeholder} rows={3} style={fieldStyle}
                  className={`${fieldCls} resize-none`} />
              ) : (
                <input type={field.type} value={values[field.key]} onChange={e => set(field.key)(e.target.value)}
                  placeholder={field.placeholder} style={fieldStyle} className={fieldCls} />
              )}
            </motion.div>
          )
        })}

        {error && <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="flex items-center justify-between">
          {saved && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 text-emerald-400 text-sm">
              <CheckCircle className="h-4 w-4" />Sozlamalar saqlandi
            </motion.div>
          )}
          <div className="ml-auto">
            <button type="submit" disabled={isPending}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white transition-all disabled:opacity-50 shadow-lg shadow-purple-900/20">
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Saqlash
            </button>
          </div>
        </motion.div>
      </form>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42 }}
        className={`rounded-2xl p-5 ${isDark ? 'border border-white/7' : 'bg-white border border-gray-200'}`}
        style={isDark ? { background: 'rgba(255,255,255,0.03)' } : {}}>
        <div className="flex items-center gap-2 mb-4">
          <Settings className={`h-4 w-4 ${isDark ? 'text-white/40' : 'text-gray-400'}`} />
          <h2 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Tizim ma&apos;lumotlari</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          {[['Platforma', 'Next.js 14'], ["Ma'lumotlar bazasi", 'Supabase'], ['Til', "O'zbek"], ['Versiya', '1.0.0']].map(([label, value]) => (
            <div key={label} className={`flex justify-between px-3 py-2.5 rounded-xl ${isDark ? 'border border-white/5' : 'bg-gray-50 border border-gray-100'}`}
              style={isDark ? { background: 'rgba(255,255,255,0.03)' } : {}}>
              <span className={isDark ? 'text-white/40' : 'text-gray-500'}>{label}</span>
              <span className={`font-medium ${isDark ? 'text-white/70' : 'text-gray-700'}`}>{value}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
