'use client'

import { redirect } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useMountedTheme } from '@/hooks/useTheme'
import { Sparkles, Search, Plus, Edit, Trash2 } from 'lucide-react'

export default function AdminMotivationPage() {
  const { isDark } = useMountedTheme()
  const [goals, setGoals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { redirect('/login'); return }

      const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
      if (profile?.role !== 'admin') { redirect('/login'); return }

      // Placeholder data - in real app would fetch from database
      setGoals([
        { id: '1', title: 'Kunlik maqsadlar', description: 'Har kuni 1 ta yangi narsa o\'rganish', category: 'daily' },
        { id: '2', title: 'Haftalik muvaffaqiyat', description: 'Haftasiga 1 ta kurs tugatish', category: 'weekly' },
        { id: '3', title: 'Oylik reja', description: 'Har oy 1 ta portfolio yaratish', category: 'monthly' },
      ])
      setLoading(false)
    }
    loadData()
  }, [])

  if (loading) return <div className="max-w-5xl mx-auto animate-pulse"><div className="h-8 w-48 bg-white/10 rounded mb-4" /></div>

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Motivatsiya</h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>Maqsadlar va iqtiboslar</p>
        </div>
        <button className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium ${
          isDark ? 'bg-purple-600 hover:bg-purple-500 text-white' : 'bg-purple-600 hover:bg-purple-700 text-white'
        }`}>
          <Plus className="h-4 w-4" /> Yangi maqsad
        </button>
      </div>

      <div className="grid gap-4">
        {goals.map(goal => (
          <div key={goal.id} className={`flex items-center gap-4 p-4 rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'}`}>
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
              <Sparkles className={`h-5 w-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
            </div>
            <div className="flex-1">
              <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{goal.title}</h3>
              <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-500'}`}>{goal.description}</p>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${isDark ? 'bg-white/10 text-white/60' : 'bg-gray-100 text-gray-600'}`}>
              {goal.category}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}