'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMountedTheme } from '@/hooks/useTheme'
import { Loader2, ArrowLeft, CheckCircle, Mail } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/lib/validations/auth'

export default function ForgotPasswordPage() {
  const { isDark } = useMountedTheme()
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true)
    setServerError(null)

    try {
      const supabase = createClient()

      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/api/auth/callback?next=/reset-password`,
      })

      if (error) {
        setServerError("Xatolik yuz berdi. Iltimos, qayta urinib ko'ring.")
        return
      }

      setIsSent(true)
    } catch {
      setServerError("Tarmoq xatosi. Internet aloqangizni tekshiring.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSent) {
    return (
      <Card className={`border backdrop-blur-sm shadow-2xl ${
        isDark ? 'border-slate-700 bg-slate-800/50' : 'border-gray-200 bg-white'
      }`}>
        <CardContent className="pt-8 pb-8">
          <div className="flex flex-col items-center text-center gap-4">
            <div className={`rounded-full p-4 ${
              isDark ? 'bg-green-900/40 border border-green-700' : 'bg-green-50 border border-green-200'
            }`}>
              <CheckCircle className={`h-8 w-8 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
            </div>
            <div>
              <h2 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Xat yuborildi!</h2>
              <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                <span className={`font-medium ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{getValues('email')}</span>{' '}
                manziliga parolni tiklash ko&apos;rsatmasi yuborildi.
                Pochta qutingizni tekshiring.
              </p>
            </div>
            <div className={`rounded-lg p-3 w-full ${isDark ? 'bg-slate-700/50' : 'bg-gray-100'}`}>
              <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span>Xat spam papkasiga tushgan bo&apos;lishi mumkin</span>
              </div>
            </div>
            <Link href="/login" className="w-full">
              <Button variant="outline" className={`w-full ${
                isDark ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kirish sahifasiga qaytish
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`border backdrop-blur-sm shadow-2xl ${
      isDark ? 'border-slate-700 bg-slate-800/50' : 'border-gray-200 bg-white'
    }`}>
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className={`text-2xl font-bold text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Parolni tiklash
        </CardTitle>
        <CardDescription className={`text-center ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
          Email manzilingizni kiriting — tiklash ko&apos;rsatmasini yuboramiz
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {serverError && (
            <div className={`text-sm rounded-lg px-4 py-3 ${
              isDark ? 'bg-red-900/40 border border-red-700 text-red-300' : 'bg-red-50 border border-red-200 text-red-600'
            }`}>
              {serverError}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email" className={isDark ? 'text-slate-300' : 'text-gray-700'}>
              Email manzil
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="sarvar@email.com"
              {...register('email')}
              autoComplete="email"
              className={isDark 
                ? 'bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500'
                : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-blue-500'
              }
            />
            {errors.email && (
              <p className={`text-xs mt-1 ${isDark ? 'text-red-400' : 'text-red-500'}`}>{errors.email.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium h-11"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Yuborilmoqda...
              </>
            ) : (
              'Tiklash xatini yuborish'
            )}
          </Button>

          <Link href="/login" className="block">
            <Button
              type="button"
              variant="ghost"
              className={`w-full ${isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kirish sahifasiga qaytish
            </Button>
          </Link>
        </form>
      </CardContent>
    </Card>
  )
}
