'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMountedTheme } from '@/hooks/useTheme'
import { Eye, EyeOff, Loader2, GraduationCap, BookOpen } from 'lucide-react'

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
import { registerSchema, type RegisterFormData } from '@/lib/validations/auth'

type RoleOption = {
  value: 'student' | 'teacher'
  label: string
  description: string
  icon: React.ReactNode
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    value: 'student',
    label: "O'quvchi",
    description: "Kurslarni o'rganaman va vazifalarni bajaraman",
    icon: <GraduationCap className="h-5 w-5" />,
  },
  {
    value: 'teacher',
    label: "O'qituvchi",
    description: "Kurslar yarataman va o'quvchilarni o'qitaman",
    icon: <BookOpen className="h-5 w-5" />,
  },
]

export default function RegisterPage() {
  const router = useRouter()
  const { isDark } = useMountedTheme()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'student' },
  })

  const selectedRole = watch('role')

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    setServerError(null)

    try {
      const supabase = createClient()

      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.full_name,
            age: data.age,
            role: data.role,
          },
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/api/auth/callback`,
        },
      })

      if (error) {
        if (error.message.includes('already registered')) {
          setServerError("Bu email allaqachon ro'yxatdan o'tgan. Kirish sahifasiga o'ting.")
        } else if (error.message.includes('password')) {
          setServerError("Parol juda oddiy. Kuchliroq parol kiriting.")
        } else {
          setServerError("Xatolik yuz berdi. Iltimos, qayta urinib ko'ring.")
        }
        return
      }

      router.push('/login?registered=true')
    } catch {
      setServerError("Tarmoq xatosi. Internet aloqangizni tekshiring.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className={`border backdrop-blur-sm shadow-2xl ${
      isDark
        ? 'border-slate-700 bg-slate-800/50'
        : 'border-gray-200 bg-white shadow-lg'
    }`}>
      <CardHeader className="space-y-1 pb-4">
        <div className="flex justify-center mb-4">
          <div className={`p-3 rounded-2xl ${
            isDark
              ? 'bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-900/40'
              : 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/20'
          }`}>
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
        </div>
        <CardTitle className={`text-2xl font-bold text-center ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          Ro&apos;yxatdan o&apos;tish
        </CardTitle>
        <CardDescription className={`text-center ${
          isDark ? 'text-slate-400' : 'text-gray-500'
        }`}>
          Bepul ta&apos;lim olishni boshlang
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Server xatosi */}
          {serverError && (
            <div className={`border text-sm rounded-lg px-4 py-3 ${
              isDark
                ? 'bg-red-900/40 border-red-700 text-red-300'
                : 'bg-red-50 border-red-200 text-red-600'
            }`}>
              {serverError}
            </div>
          )}

          {/* Ism Familiya */}
          <div className="space-y-1.5">
            <Label htmlFor="full_name" className={
              isDark ? 'text-slate-300' : 'text-gray-700'
            }>
              Ism va familiya
            </Label>
            <Input
              id="full_name"
              placeholder="Sarvar Raximov"
              {...register('full_name')}
              className={
                isDark
                  ? 'bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500'
              }
            />
            {errors.full_name && (
              <p className={`text-xs mt-1 ${isDark ? 'text-red-400' : 'text-red-500'}`}>
                {errors.full_name.message}
              </p>
            )}
          </div>

          {/* Yosh */}
          <div className="space-y-1.5">
            <Label htmlFor="age" className={
              isDark ? 'text-slate-300' : 'text-gray-700'
            }>
              Yosh <span className={isDark ? 'text-slate-500' : 'text-gray-400'}>(13—25)</span>
            </Label>
            <Input
              id="age"
              type="number"
              min={13}
              max={25}
              placeholder="18"
              {...register('age', { valueAsNumber: true })}
              className={
                isDark
                  ? 'bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-blue-500'
              }
            />
            {errors.age && (
              <p className={`text-xs mt-1 ${isDark ? 'text-red-400' : 'text-red-500'}`}>
                {errors.age.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className={
              isDark ? 'text-slate-300' : 'text-gray-700'
            }>
              Email manzil
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="sarvar@email.com"
              {...register('email')}
              className={
                isDark
                  ? 'bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-blue-500'
              }
            />
            {errors.email && (
              <p className={`text-xs mt-1 ${isDark ? 'text-red-400' : 'text-red-500'}`}>
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Parol */}
          <div className="space-y-1.5">
            <Label htmlFor="password" className={
              isDark ? 'text-slate-300' : 'text-gray-700'
            }>
              Parol
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Kamida 6 ta belgi"
                {...register('password')}
                className={
                  isDark
                    ? 'bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 pr-10'
                    : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 pr-10'
                }
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${
                  isDark
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className={`text-xs mt-1 ${isDark ? 'text-red-400' : 'text-red-500'}`}>
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Parolni tasdiqlash */}
          <div className="space-y-1.5">
            <Label htmlFor="confirm_password" className={
              isDark ? 'text-slate-300' : 'text-gray-700'
            }>
              Parolni tasdiqlang
            </Label>
            <div className="relative">
              <Input
                id="confirm_password"
                type={showConfirm ? 'text' : 'password'}
                placeholder="Parolni qayta kiriting"
                {...register('confirm_password')}
                className={
                  isDark
                    ? 'bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 pr-10'
                    : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 pr-10'
                }
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${
                  isDark
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirm_password && (
              <p className={`text-xs mt-1 ${isDark ? 'text-red-400' : 'text-red-500'}`}>
                {errors.confirm_password.message}
              </p>
            )}
          </div>

          {/* Rol tanlash */}
          <div className="space-y-2">
            <Label className={
              isDark ? 'text-slate-300' : 'text-gray-700'
            }>Rolni tanlang</Label>
            <div className="grid grid-cols-2 gap-3">
              {ROLE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setValue('role', option.value, { shouldValidate: true })}
                  className={`p-3 rounded-lg border-2 text-left transition-all duration-200 ${
                    selectedRole === option.value
                      ? isDark
                        ? 'border-blue-500 bg-blue-900/30 text-white'
                        : 'border-blue-500 bg-blue-50 text-gray-900'
                      : isDark
                        ? 'border-slate-600 bg-slate-700/30 text-slate-300 hover:border-slate-500'
                        : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className={`mb-1.5 ${
                    selectedRole === option.value
                      ? isDark ? 'text-blue-400' : 'text-blue-600'
                      : isDark ? 'text-slate-400' : 'text-gray-400'
                  }`}>
                    {option.icon}
                  </div>
                  <div className="font-medium text-sm">{option.label}</div>
                  <div className={`text-xs mt-0.5 leading-tight ${
                    isDark ? 'text-slate-400' : 'text-gray-500'
                  }`}>
                    {option.description}
                  </div>
                </button>
              ))}
            </div>
            {errors.role && (
              <p className={`text-xs mt-1 ${isDark ? 'text-red-400' : 'text-red-500'}`}>
                {errors.role.message}
              </p>
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
                Ro&apos;yxatdan o&apos;tilmoqda...
              </>
            ) : (
              "Ro'yxatdan o'tish"
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center pb-6 pt-2">
        <p className={`text-sm ${
          isDark ? 'text-slate-400' : 'text-gray-500'
        }`}>
          Allaqachon hisobingiz bormi?{' '}
          <Link href="/login" className={`font-medium ${
            isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
          }`}>
            Kirish
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
