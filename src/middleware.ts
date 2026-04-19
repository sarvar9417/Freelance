import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password', '/forum', '/courses', '/motivation', '/platforms']
const AUTH_ROUTES = ['/login', '/register']

const ROLE_REDIRECTS: Record<string, string> = {
  student: '/student',
  teacher: '/teacher',
  admin: '/admin',
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const { supabaseResponse, user, supabase } = await updateSession(request)

  // Autentifikatsiya bo'lmagan foydalanuvchi himoyalangan sahifaga kirmoqchi
  if (!user && !PUBLIC_ROUTES.some((r) => pathname.startsWith(r)) && pathname !== '/') {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Autentifikatsiya bo'lgan foydalanuvchi login/register sahifasiga kirmoqchi
  if (user && AUTH_ROUTES.some((r) => pathname.startsWith(r))) {
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile) return supabaseResponse

    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = ROLE_REDIRECTS[profile.role] ?? '/student'
    return NextResponse.redirect(redirectUrl)
  }

  // Root sahifada autentifikatsiya bo'lgan foydalanuvchini dashboardga yo'naltirish
  if (user && pathname === '/') {
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile) return supabaseResponse

    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = ROLE_REDIRECTS[profile.role] ?? '/student'
    return NextResponse.redirect(redirectUrl)
  }

  // Rol asosida ruxsat tekshirish
  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    // users jadvalida yozuv yo'q bo'lsa user_metadata dan olamiz
    const role = profile?.role ?? user.user_metadata?.role ?? 'student'

    if (pathname.startsWith('/admin') && role !== 'admin') {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = ROLE_REDIRECTS[role] ?? '/student'
      return NextResponse.redirect(redirectUrl)
    }

    if (pathname.startsWith('/teacher') && !['teacher', 'admin'].includes(role)) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = ROLE_REDIRECTS[role] ?? '/student'
      return NextResponse.redirect(redirectUrl)
    }

    if (pathname.startsWith('/student') && !['student', 'admin'].includes(role)) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = ROLE_REDIRECTS[role] ?? '/teacher'
      return NextResponse.redirect(redirectUrl)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
