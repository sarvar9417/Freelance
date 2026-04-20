import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import UsersTable from '@/components/admin/UsersTable'
import { Users } from 'lucide-react'

export default async function AdminUsersPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/admin')

  const { data: users, error } = await supabase
    .from('users')
    .select('id, email, full_name, age, role, avatar_url, bio, created_at')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Sarlavha */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Foydalanuvchilar</h1>
          <p className="text-white/40 text-sm mt-1">
            Barcha ro&apos;yxatdan o&apos;tgan foydalanuvchilarni boshqarish
          </p>
        </div>
        <div
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm"
          style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)' }}
        >
          <Users className="h-4 w-4 text-blue-400" />
          <span className="text-blue-400 font-semibold">{users?.length ?? 0}</span>
          <span className="text-white/40">nafar</span>
        </div>
      </div>

      {/* Jadval */}
      {error ? (
        <div
          className="rounded-2xl p-6 text-center"
          style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)' }}
        >
          <p className="text-red-400 text-sm">Ma&apos;lumotlarni yuklashda xatolik: {error.message}</p>
        </div>
      ) : (
        <UsersTable users={users ?? []} />
      )}
    </div>
  )
}
