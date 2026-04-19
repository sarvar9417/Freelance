import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Shield, Users, BookOpen, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function AdminDashboard() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/login')

  const [{ count: usersCount }, { count: coursesCount }] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('courses').select('*', { count: 'exact', head: true }),
  ])

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <header className="border-b border-slate-700 bg-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-purple-600 p-2 rounded-lg">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <span className="font-bold text-lg">Freelancer School</span>
            <span className="ml-2 text-xs bg-purple-900 text-purple-300 px-2 py-0.5 rounded-full">
              Admin
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-slate-400 text-sm">{profile?.full_name}</span>
          <form action="/api/auth/signout" method="post">
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
              <LogOut className="h-4 w-4 mr-1" />
              Chiqish
            </Button>
          </form>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-6">Admin Paneli</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-slate-300 text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-400" />
                Jami foydalanuvchilar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">{usersCount ?? 0}</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-slate-300 text-sm font-medium flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-green-400" />
                Jami kurslar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">{coursesCount ?? 0}</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
