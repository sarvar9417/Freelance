'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Camera, Loader2, Calendar, ShieldCheck, BookOpen, Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useMountedTheme } from '@/hooks/useTheme'

const ROLE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  student: { label: "O'quvchi",   color: 'text-blue-400',    bg: 'bg-blue-500/15 border border-blue-500/25'     },
  teacher: { label: "O'qituvchi", color: 'text-emerald-400', bg: 'bg-emerald-500/15 border border-emerald-500/25' },
  admin:   { label: 'Admin',      color: 'text-amber-400',   bg: 'bg-amber-500/15 border border-amber-500/25'    },
}

interface Props {
  userId: string; fullName: string; email: string; role: string
  bio: string | null; avatarUrl: string | null; createdAt: string
}

export default function ProfileHeader({ userId, fullName, email, role, bio, avatarUrl, createdAt }: Props) {
  const { isDark } = useMountedTheme()
  const [avatar, setAvatar] = useState<string | null>(avatarUrl)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const initials = fullName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  const roleStyle = ROLE_LABELS[role] ?? ROLE_LABELS.student
  const MONTHS = ['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr']
  const d = new Date(createdAt)
  const joinDate = `${MONTHS[d.getMonth()]} ${d.getFullYear()}`

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { alert('Fayl hajmi 2MB dan oshmasin'); return }
    setUploading(true)
    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop()
      const path = `${userId}/avatar.${ext}`
      const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
      if (upErr) throw upErr
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
      await supabase.from('users').update({ avatar_url: publicUrl }).eq('id', userId)
      setAvatar(publicUrl + '?t=' + Date.now())
    } catch { alert("Xatolik yuz berdi. Qayta urinib ko'ring.") }
    finally { setUploading(false) }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
      className={`rounded-2xl p-6 sm:p-8 ${isDark ? 'border border-white/8' : 'bg-white border border-gray-200 shadow-sm'}`}
      style={isDark ? { background: 'rgba(255,255,255,0.03)' } : {}}>
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="flex-shrink-0 relative">
          <div className="relative h-24 w-24 sm:h-28 sm:w-28">
            {avatar ? (
              <img src={avatar} alt={fullName} className="h-full w-full rounded-2xl object-cover shadow-lg" />
            ) : (
              <div className="h-full w-full rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 flex items-center justify-center text-white text-3xl font-bold shadow-xl">
                {initials}
              </div>
            )}
            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              className="absolute -bottom-2 -right-2 h-8 w-8 rounded-xl flex items-center justify-center text-white transition-all shadow-lg"
              style={{ background: 'rgba(59,130,246,0.9)', border: `2px solid ${isDark ? 'rgba(8,12,23,1)' : '#fff'}` }}>
              {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
            </button>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleAvatarUpload} />
          </div>
          <p className={`text-[10px] text-center mt-3 max-w-[112px] ${isDark ? 'text-white/20' : 'text-gray-400'}`}>
            JPG, PNG · max 2MB
          </p>
        </div>

        <div className="flex-1 min-w-0">
          <div className="mb-3">
            <h1 className={`text-xl sm:text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>{fullName}</h1>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 ${roleStyle.bg} ${roleStyle.color}`}>
                <ShieldCheck className="h-3 w-3" />{roleStyle.label}
              </span>
              <span className={`text-xs flex items-center gap-1 ${isDark ? 'text-white/25' : 'text-gray-400'}`}>
                <Calendar className="h-3 w-3" />{joinDate} dan beri a&apos;zo
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <Mail className={`h-3.5 w-3.5 ${isDark ? 'text-white/25' : 'text-gray-400'}`} />
            <span className={`text-sm ${isDark ? 'text-white/50' : 'text-gray-500'}`}>{email}</span>
          </div>

          {bio ? (
            <p className={`text-sm leading-relaxed max-w-xl ${isDark ? 'text-white/55' : 'text-gray-600'}`}>{bio}</p>
          ) : (
            <p className={`text-sm italic ${isDark ? 'text-white/20' : 'text-gray-400'}`}>
              Bio qo&apos;shilmagan.{' '}
              <a href="/profile/settings" className="text-blue-400 not-italic hover:text-blue-500 transition-colors">Qo&apos;shish →</a>
            </p>
          )}

          {role === 'teacher' && (
            <div className="mt-4 inline-flex items-center gap-2 text-xs text-emerald-400 px-3 py-1.5 rounded-xl"
              style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
              <BookOpen className="h-3.5 w-3.5" />Tasdiqlangan o&apos;qituvchi
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
