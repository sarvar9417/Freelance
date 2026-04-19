import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock, Tag, MessageSquare } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import CommentSection from '@/components/forum/CommentSection'
import PostLikeBar from '@/components/forum/PostLikeBar'
import { formatTimeAgo } from '@/lib/supabase/realtime'

const CATEGORY_STYLES: Record<string, { text: string; bg: string }> = {
  Savol:    { text: 'text-blue-300',    bg: 'bg-blue-500/12 border border-blue-500/25' },
  Muhokama: { text: 'text-purple-300',  bg: 'bg-purple-500/12 border border-purple-500/25' },
  Yangilik: { text: 'text-emerald-300', bg: 'bg-emerald-500/12 border border-emerald-500/25' },
  Tavsiya:  { text: 'text-amber-300',   bg: 'bg-amber-500/12 border border-amber-500/25' },
  Yordam:   { text: 'text-rose-300',    bg: 'bg-rose-500/12 border border-rose-500/25' },
}

const AVATAR_COLORS = [
  'from-blue-600 to-blue-800',
  'from-purple-600 to-purple-800',
  'from-emerald-600 to-emerald-800',
  'from-rose-600 to-rose-800',
  'from-amber-600 to-amber-800',
]

export async function generateMetadata({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data } = await supabase.from('forum_posts').select('title').eq('id', params.id).single()
  return { title: data?.title ? `${data.title} | Forum` : 'Post | Forum' }
}

export default async function PostDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  /* ── Post va foydalanuvchi ma'lumotlari ── */
  const [{ data: post }, { data: { user } }] = await Promise.all([
    supabase.from('forum_posts').select('*').eq('id', params.id).single(),
    supabase.auth.getUser(),
  ])

  if (!post) notFound()

  /* ── Foydalanuvchi profili ── */
  let currentUser: { id: string; name: string; avatar: string } | null = null
  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('full_name')
      .eq('id', user.id)
      .single()

    currentUser = {
      id: user.id,
      name:
        profile?.full_name ??
        user.user_metadata?.full_name ??
        user.email?.split('@')[0] ??
        'Foydalanuvchi',
      avatar: user.user_metadata?.avatar_url ?? '',
    }
  }

  const catStyle = CATEGORY_STYLES[post.category] ?? CATEGORY_STYLES['Savol']
  const colorIdx = post.author_name.charCodeAt(0) % AVATAR_COLORS.length
  const initials = post.author_name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">

      {/* ── Ortga ── */}
      <Link
        href="/forum"
        className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 text-sm transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Forumga qaytish
      </Link>

      {/* ── Post kontenti ── */}
      <article
        className="rounded-2xl p-6 sm:p-8"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        {/* Meta */}
        <div className="flex items-center gap-2 flex-wrap mb-4">
          <span className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${catStyle.bg} ${catStyle.text}`}>
            <Tag className="h-3 w-3" />
            {post.category}
          </span>
          <span className="flex items-center gap-1.5 text-white/25 text-xs ml-auto">
            <Clock className="h-3 w-3" />
            {formatTimeAgo(post.created_at)}
          </span>
        </div>

        {/* Sarlavha */}
        <h1 className="text-xl sm:text-2xl font-bold text-white leading-snug mb-5">
          {post.title}
        </h1>

        {/* Kontent */}
        <div className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap mb-6">
          {post.content}
        </div>

        {/* Muallif */}
        <div
          className="flex items-center gap-3 pt-5"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div
            className={`h-9 w-9 rounded-xl bg-gradient-to-br ${AVATAR_COLORS[colorIdx]} flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-lg`}
          >
            {initials}
          </div>
          <div>
            <p className="text-white/80 text-sm font-semibold">{post.author_name}</p>
            <p className="text-white/25 text-xs">Post muallifi</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 text-white/30 text-xs">
            <MessageSquare className="h-3.5 w-3.5" />
            {post.comment_count} izoh
          </div>
        </div>

        {/* Like/Dislike tugmalari */}
        <div className="pt-4 mt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <PostLikeBar
            postId={post.id}
            initialLikes={post.likes}
            initialDislikes={post.dislikes}
            userId={user?.id ?? null}
          />
        </div>
      </article>

      {/* ── Izohlar (Real-time) ── */}
      <div
        className="rounded-2xl p-6"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <CommentSection postId={post.id} currentUser={currentUser} />
      </div>
    </div>
  )
}
