import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, PenLine } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import CreatePostForm from '@/components/forum/CreatePostForm'

export const metadata = { title: 'Yangi post | Freelancer School' }

export default async function NewPostPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?redirectTo=/forum/post/new')

  /* Foydalanuvchi ismini olish */
  const { data: profile } = await supabase
    .from('users')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const userName =
    profile?.full_name ??
    user.user_metadata?.full_name ??
    user.email?.split('@')[0] ??
    'Foydalanuvchi'

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      {/* Ortga qaytish */}
      <Link
        href="/forum"
        className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Forumga qaytish
      </Link>

      {/* Sarlavha */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-lg shadow-blue-900/40">
            <PenLine className="h-4 w-4 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">Yangi post yaratish</h1>
        </div>
        <p className="text-white/35 text-sm ml-12">
          Savolingizni aniq va tushunarli yozing — ko&apos;proq javob olasiz
        </p>
      </div>

      {/* Forma */}
      <div
        className="rounded-2xl p-6"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <CreatePostForm
          userId={user.id}
          userName={userName}
          userAvatar={user.user_metadata?.avatar_url ?? ''}
        />
      </div>

      {/* Maslahat */}
      <div
        className="mt-4 rounded-xl p-4"
        style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.12)' }}
      >
        <p className="text-white/30 text-xs leading-relaxed">
          <span className="text-blue-400 font-semibold">Maslahat:</span>{' '}
          Sarlavhani aniq va qisqa qiling. Muammoni batafsil tushuntiring — bu ko&apos;proq yordam
          olishingizga imkon beradi.
        </p>
      </div>
    </div>
  )
}
