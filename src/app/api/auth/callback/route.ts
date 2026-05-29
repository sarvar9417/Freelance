import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single()

        if (!profile) {
          await supabase.from('users').upsert({
            id: user.id,
            email: user.email!,
            full_name: user.user_metadata?.full_name ?? "O'quvchi",
            age: user.user_metadata?.age ?? null,
            role: user.user_metadata?.role ?? 'student',
          })
        }

        const roleRedirects: Record<string, string> = {
          student: '/student',
          teacher: '/teacher',
          admin: '/admin',
        }

        const role = profile?.role ?? user.user_metadata?.role ?? 'student'
        return NextResponse.redirect(`${baseUrl}${roleRedirects[role]}`)
      }
    }
  }

  return NextResponse.redirect(`${baseUrl}/login?error=auth_callback_error`)
}
