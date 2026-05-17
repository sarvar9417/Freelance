'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, BookOpen, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useMountedTheme } from '@/hooks/useTheme'

export default function EnrollButton({ courseId }: { courseId: string }) {
  const { isDark } = useMountedTheme()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [enrolled, setEnrolled] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkEnrollment() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      
      const { data } = await supabase.from('enrollments').select('id').eq('student_id', user.id).eq('course_id', courseId).single()
      if (data) setEnrolled(true)
      setLoading(false)
    }
    checkEnrollment()
  }, [courseId])

  const handleEnroll = () => {
    startTransition(async () => {
      try {
        const res = await fetch('/api/enroll', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ courseId }),
        })
        const data = await res.json()

        if (!res.ok) {
          toast.error(data.error ?? 'Xatolik yuz berdi', {
            style: { background: 'rgba(15,20,40,0.95)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' },
          })
          return
        }

        setEnrolled(true)
        toast.success('Kursga muvaffaqiyatli yozildingiz! 🎓', {
          description: "Mening kurslarim bo'limidan davom etting",
          duration: 4000,
          style: { background: 'rgba(15,20,40,0.95)', border: '1px solid rgba(16,185,129,0.3)', color: '#fff' },
        })
        router.refresh()
      } catch {
        toast.error('Tarmoq xatosi. Qayta urinib ko\'ring.')
      }
    })
  }

  if (loading) return <div className="w-full py-3 rounded-xl animate-pulse bg-white/10" />

  if (enrolled) {
    return (
      <div className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold ${isDark ? '' : 'bg-emerald-50 border border-emerald-200 text-emerald-600'}`}
        style={isDark ? { background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399' } : {}}>
        <CheckCircle2 className="h-4 w-4" />
        Muvaffaqiyatli yozildingiz
      </div>
    )
  }

  return (
    <button
      onClick={handleEnroll}
      disabled={isPending}
      className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-60 hover:opacity-90 ${isDark ? 'text-white' : 'text-white'}`}
      style={isDark ? { background: 'linear-gradient(135deg, rgba(59,130,246,0.8), rgba(99,102,241,0.8))' } : { background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}
    >
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <BookOpen className="h-4 w-4" />}
      Kursga yozilish
    </button>
  )
}