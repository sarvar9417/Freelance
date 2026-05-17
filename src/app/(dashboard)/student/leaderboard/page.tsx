'use client'

import { redirect } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useMountedTheme } from '@/hooks/useTheme'
import { Trophy, Medal, Crown, Zap } from 'lucide-react'

export default function LeaderboardPage() {
  const { isDark } = useMountedTheme()
  const [users, setUsers] = useState<any[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { redirect('/login'); return }

      const { data: xpData } = await supabase.from('user_xp').select('total_xp, current_level, user_id').order('total_xp', { ascending: false }).limit(20)
      const userIds = (xpData ?? []).map(d => d.user_id)
      const { data: profiles } = userIds.length > 0 
        ? await supabase.from('users').select('id, full_name').in('id', userIds)
        : { data: [] }
      const profileMap = Object.fromEntries((profiles ?? []).map(p => [p.id, p.full_name]))

      const sorted = (xpData ?? []).map((d, i) => ({
        rank: i + 1,
        name: profileMap[d.user_id] || 'Noma\'lum',
        xp: d.total_xp,
        level: d.current_level,
      }))
      setUsers(sorted)
      
      const myXp = sorted.find(u => xpData?.find(x => x.user_id === user?.id && x.total_xp === u.xp))
      setCurrentUser(myXp || { rank: '-', xp: 0, level: 1 })
      setLoading(false)
    }
    loadData()
  }, [])

  if (loading) return <div className="max-w-3xl mx-auto animate-pulse"><div className="h-8 w-48 bg-white/10 rounded mb-2" /></div>

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Reyting</h1>
        <p className={`text-sm mt-1 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>Eng faol o'quvchilar</p>
      </div>

      {users.length > 0 && (
        <div className={`rounded-2xl p-6 ${isDark ? 'bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border border-amber-500/20' : 'bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200'}`}>
          <div className="flex items-center justify-center gap-4 mb-4">
            <Crown className="h-8 w-8 text-yellow-500" />
            <div>
              <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{users[0].name}</p>
              <p className={`text-sm ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>{users[0].xp.toLocaleString()} XP</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {users.slice(1).map((user, i) => (
          <div key={user.rank} className={`flex items-center gap-4 p-4 rounded-xl ${
            isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'
          }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              user.rank === 2 
                ? isDark ? 'bg-gray-400 text-gray-900' : 'bg-gray-300 text-gray-700'
                : isDark ? 'bg-orange-700 text-orange-200' : 'bg-orange-200 text-orange-700'
            }`}>
              {user.rank === 2 ? <Medal className="h-4 w-4" /> : user.rank}
            </div>
            <div className="flex-1">
              <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{user.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" />
              <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{user.xp.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>

      {currentUser && (
        <div className={`rounded-2xl p-4 ${isDark ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-200'}`}>
          <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>Sizning o'rnigiz</p>
          <div className="flex items-center justify-between mt-2">
            <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{currentUser.rank}</p>
            <p className={`text-sm ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{currentUser.xp} XP</p>
          </div>
        </div>
      )}
    </div>
  )
}