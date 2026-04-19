'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
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
    <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm shadow-2xl">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-2xl font-bold text-white text-center">
          Ro&apos;yxatdan o&apos;tish
        </CardTitle>
        <CardDescription className="text-center text-slate-400">
          Bepul ta&apos;lim olishni boshlang
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Server xatosi */}
          {serverError && (
            <div className="bg-red-900/40 border border-red-700 text-red-300 text-sm rounded-lg px-4 py-3">
              {serverError}
            </div>
          )}

          {/* Ism Familiya */}
          <div className="space-y-1.5">
            <Label htmlFor="full_name" className="text-slate-300">
              Ism va familiya
            </Label>
            <Input
              id="full_name"
              placeholder="Sarvar Raximov"
              {...register('full_name')}
              className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.full_name && (
              <p className="text-red-400 text-xs mt-1">{errors.full_name.message}</p>
            )}
          </div>

          {/* Yosh */}
          <div className="space-y-1.5">
            <Label htmlFor="age" className="text-slate-300">
              Yosh <span className="text-slate-500 text-xs">(13—25)</span>
            </Label>
            <Input
              id="age"
              type="number"
              min={13}
              max={25}
              placeholder="18"
              {...register('age', { valueAsNumber: true })}
              className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500"
            />
            {errors.age && (
              <p className="text-red-400 text-xs mt-1">{errors.age.message}</p>
            )}
          </div>

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
              className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500"
            />
            {errors.email && (
              <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Parol */}
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-slate-300">
              Parol
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Kamida 6 ta belgi"
                {...register('password')}
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Parolni tasdiqlash */}
          <div className="space-y-1.5">
            <Label htmlFor="confirm_password" className="text-slate-300">
              Parolni tasdiqlang
            </Label>
            <div className="relative">
              <Input
                id="confirm_password"
                type={showConfirm ? 'text' : 'password'}
                placeholder="Parolni qayta kiriting"
                {...register('confirm_password')}
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirm_password && (
              <p className="text-red-400 text-xs mt-1">{errors.confirm_password.message}</p>
            )}
          </div>

          {/* Rol tanlash */}
          <div className="space-y-2">
            <Label className="text-slate-300">Rolni tanlang</Label>
            <div className="grid grid-cols-2 gap-3">
              {ROLE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setValue('role', option.value, { shouldValidate: true })}
                  className={`p-3 rounded-lg border-2 text-left transition-all duration-200 ${
                    selectedRole === option.value
                      ? 'border-blue-500 bg-blue-900/30 text-white'
                      : 'border-slate-600 bg-slate-700/30 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  <div className={`mb-1.5 ${selectedRole === option.value ? 'text-blue-400' : 'text-slate-400'}`}>
                    {option.icon}
                  </div>
                  <div className="font-medium text-sm">{option.label}</div>
                  <div className="text-xs text-slate-400 mt-0.5 leading-tight">
                    {option.description}
                  </div>
                </button>
              ))}
            </div>
            {errors.role && (
              <p className="text-red-400 text-xs mt-1">{errors.role.message}</p>
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
        <p className="text-slate-400 text-sm">
          Allaqachon hisobingiz bormi?{' '}
          <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium">
            Kirish
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
