import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Trophy, Zap, Medal } from 'lucide-react'

export default async function LeaderboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: topXp } = await supabase
    .from('user_xp')
    .select('user_id, total_xp, current_level')
    .order('total_xp', { ascending: false })
    .limit(50)

  const userIds = (topXp ?? []).map(r => r.user_id)
  const { data: profiles } = userIds.length > 0
    ? await supabase.from('users').select('id, full_name').in('id', userIds)
    : { data: [] }
  const profileMap = Object.fromEntries((profiles ?? []).map(p => [p.id, p.full_name]))

  const { data: myXp } = await supabase
    .from('user_xp')
    .select('total_xp, current_level')
    .eq('user_id', user.id)
    .single()

  const myRank = (topXp ?? []).findIndex(r => r.user_id === user.id) + 1
  const myProfile = profileMap[user.id]

  const MEDAL = ['🥇', '🥈', '🥉']

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Trophy className="h-6 w-6 text-amber-400" /> Reyting
        </h1>
        <p className="text-white/40 text-sm mt-1">Eng faol o&apos;quvchilar</p>
      </div>

      {/* Mening o'rnim */}
      {myXp && (
        <div className="rounded-2xl p-4 flex items-center gap-4"
          style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.1))', border: '1px solid rgba(99,102,241,0.25)' }}>
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500/40 to-purple-500/40 flex items-center justify-center text-lg font-bold text-white flex-shrink-0">
            {(myProfile ?? "O'quvchi")[0]}
          </div>
          <div className="flex-1">
            <p className="text-white font-semibold text-sm">{myProfile ?? "Siz"}</p>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-amber-400 text-xs flex items-center gap-1">
                <Zap className="h-3 w-3" /> {(myXp.total_xp ?? 0).toLocaleString()} XP
              </span>
              <span className="text-white/40 text-xs">Level {myXp.current_level ?? 1}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-white/40 text-xs">Sizning o&apos;rningiz</p>
            <p className="text-white font-bold text-xl">#{myRank > 0 ? myRank : '50+'}</p>
          </div>
        </div>
      )}

      {/* Top list */}
      <div className="rounded-2xl overflow-hidden"
        style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
        {(topXp ?? []).length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-white/30 text-sm">Hali reyting mavjud emas</p>
          </div>
        ) : (
          <div>
            {(topXp ?? []).map((row, i) => {
              const isMe = row.user_id === user.id
              const name = profileMap[row.user_id] ?? "O'quvchi"
              const initials = name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
              return (
                <div
                  key={row.user_id}
                  className={`flex items-center gap-4 px-4 py-3.5 transition-colors ${isMe ? '' : 'hover:bg-white/[0.02]'}`}
                  style={{
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    background: isMe ? 'rgba(59,130,246,0.08)' : undefined,
                  }}
                >
                  {/* Rank */}
                  <div className="w-8 text-center flex-shrink-0">
                    {i < 3
                      ? <span className="text-xl">{MEDAL[i]}</span>
                      : <span className="text-white/30 text-sm font-medium">#{i + 1}</span>
                    }
                  </div>

                  {/* Avatar */}
                  <div className={`h-9 w-9 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${
                    isMe ? 'bg-gradient-to-br from-blue-500 to-blue-700' : 'bg-gradient-to-br from-white/10 to-white/5'
                  }`}>
                    {initials}
                  </div>

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${isMe ? 'text-blue-300' : 'text-white/80'}`}>
                      {name} {isMe && <span className="text-blue-400/60 text-xs">(Siz)</span>}
                    </p>
                    <p className="text-white/30 text-xs">Level {row.current_level ?? 1}</p>
                  </div>

                  {/* XP */}
                  <div className="flex items-center gap-1 text-amber-400 flex-shrink-0">
                    <Zap className="h-3.5 w-3.5" />
                    <span className="text-sm font-semibold">{(row.total_xp ?? 0).toLocaleString()}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
