import { z } from 'zod'

export const registerSchema = z
  .object({
    full_name: z
      .string()
      .min(3, "Ism va familiya kamida 3 ta harf bo'lishi kerak")
      .max(60, "Ism va familiya 60 ta harfdan oshmasin"),

    age: z
      .number({ error: 'Yoshni raqam sifatida kiriting' })
      .int()
      .min(13, 'Platforma 13 yoshdan boshlab foydalanish mumkin')
      .max(25, "Platforma 25 yoshgacha mo'ljallangan"),

    email: z
      .email("Email manzili noto'g'ri formatda")
      .min(1, "Email manzilini kiriting"),

    password: z
      .string()
      .min(6, "Parol kamida 6 ta belgidan iborat bo'lishi kerak")
      .max(72, "Parol 72 ta belgidan oshmasin"),

    confirm_password: z.string().min(1, "Parolni tasdiqlang"),

    role: z.enum(['student', 'teacher'], {
      error: "Rol tanlash majburiy",
    }),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Parollar mos kelmadi",
    path: ['confirm_password'],
  })

export const loginSchema = z.object({
  email: z
    .email("Email manzili noto'g'ri formatda")
    .min(1, "Email manzilini kiriting"),

  password: z
    .string()
    .min(1, "Parolni kiriting"),
})

export const forgotPasswordSchema = z.object({
  email: z
    .email("Email manzili noto'g'ri formatda")
    .min(1, "Email manzilini kiriting"),
})

export type RegisterFormData = z.infer<typeof registerSchema>
export type LoginFormData = z.infer<typeof loginSchema>
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
