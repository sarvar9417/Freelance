'use client'

import { redirect } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useMountedTheme } from '@/hooks/useTheme'
import { Settings, User, Bell, Shield } from 'lucide-react'

export default function AdminSettingsPage() {
  const { isDark } = useMountedTheme()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { redirect('/login'); return }

      const { data: profileData } = await supabase.from('users').select('full_name, email, role').eq('id', user.id).single()
      setProfile(profileData)
      setLoading(false)
    }
    loadData()
  }, [])

  if (loading) return <div className="max-w-2xl mx-auto animate-pulse"><div className="h-8 w-48 bg-white/10 rounded mb-4" /></div>

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Sozlamalar</h1>
        <p className={`text-sm mt-1 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>Admin sozlamalari</p>
      </div>

      <div className={`rounded-2xl p-6 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'}`}>
        <div className="flex items-center gap-3 mb-6">
          <User className={`h-5 w-5 ${isDark ? 'text-white/60' : 'text-gray-400'}`} />
          <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Profil</h2>
        </div>
        <div className="space-y-4">
          <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
            <p className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-500'}`}>Ism</p>
            <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{profile?.full_name || '—'}</p>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
            <p className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-500'}`}>Email</p>
            <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{profile?.email || '—'}</p>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
            <p className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-500'}`}>Rol</p>
            <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{profile?.role || '—'}</p>
          </div>
        </div>
      </div>

      <div className={`rounded-2xl p-6 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'}`}>
        <div className="flex items-center gap-3 mb-6">
          <Shield className={`h-5 w-5 ${isDark ? 'text-white/60' : 'text-gray-400'}`} />
          <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Xavfsizlik</h2>
        </div>
        <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-500'}`}>Parolni o'zgartirish uchun profil sahifasiga o'ting.</p>
      </div>
    </div>
  )
}