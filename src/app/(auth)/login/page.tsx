'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { loginSchema, type LoginFormData } from '@/lib/validations/auth'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      setSuccessMessage(
        "Ro'yxatdan muvaffaqiyatli o'tdingiz! Email manzilingizni tasdiqlang, so'ng kiring."
      )
    }
    if (searchParams.get('error') === 'auth_callback_error') {
      setServerError("Tasdiqlash xatosi yuz berdi. Qayta urinib ko'ring.")
    }
  }, [searchParams])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setServerError(null)

    try {
      const supabase = createClient()

      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setServerError("Email yoki parol noto'g'ri. Qayta tekshiring.")
        } else if (error.message.includes('Email not confirmed')) {
          setServerError("Email manzilingiz tasdiqlanmagan. Pochta qutingizni tekshiring.")
        } else if (error.message.includes('Too many requests')) {
          setServerError("Juda ko'p urinish. Biroz kutib, qayta urinib ko'ring.")
        } else {
          setServerError("Kirish amalga oshmadi. Iltimos, qayta urinib ko'ring.")
        }
        return
      }

      // Rol bo'yicha yo'naltirish
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single()

        // public.users da yozuv yo'q bo'lsa — metadata dan yaratamiz
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

        const redirectTo = searchParams.get('redirectTo')
        const role = profile?.role ?? user.user_metadata?.role ?? 'student'

        router.push(redirectTo ?? roleRedirects[role] ?? '/student')
        router.refresh()
      }
    } catch {
      setServerError("Tarmoq xatosi. Internet aloqangizni tekshiring.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm shadow-2xl">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-2xl font-bold text-white text-center">
          Xush kelibsiz!
        </CardTitle>
        <CardDescription className="text-center text-slate-400">
          Hisobingizga kiring
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Muvaffaqiyat xabari */}
          {successMessage && (
            <div className="bg-green-900/40 border border-green-700 text-green-300 text-sm rounded-lg px-4 py-3 flex items-start gap-2">
              <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Server xatosi */}
          {serverError && (
            <div className="bg-red-900/40 border border-red-700 text-red-300 text-sm rounded-lg px-4 py-3">
              {serverError}
            </div>
          )}

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-slate-300">
              Email manzil
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="sarvar@email.com"
              {...register('email')}
              autoComplete="email"
              className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.email && (
              <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Parol */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-slate-300">
                Parol
              </Label>
              <Link
                href="/forgot-password"
                className="text-xs text-blue-400 hover:text-blue-300"
              >
                Parolni unutdingizmi?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Parolingizni kiriting"
                {...register('password')}
                autoComplete="current-password"
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Submit tugmasi */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium h-11 mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Kirilmoqda...
              </>
            ) : (
              'Kirish'
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center pb-6 pt-2">
        <p className="text-slate-400 text-sm">
          Hisobingiz yo&apos;qmi?{' '}
          <Link href="/register" className="text-blue-400 hover:text-blue-300 font-medium">
            Ro&apos;yxatdan o&apos;tish
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse bg-slate-800/50 rounded-xl" />}>
      <LoginForm />
    </Suspense>
  )
}
