import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { addXP } from '@/lib/xp'

export async function POST(req: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { amount, reason } = await req.json()
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'amount musbat son bo\'lishi kerak' }, { status: 400 })
    }

    const { newXp, newLevel, levelUp } = await addXP(supabase, user.id, amount)

    return NextResponse.json({ success: true, newXp, newLevel, levelUp, reason })
  } catch {
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 })
  }
}
