import { createClient } from './client'
import type { RealtimeChannel } from '@supabase/supabase-js'

export type ForumPost = {
  id: string
  title: string
  content: string
  category: string
  author_id: string
  author_name: string
  author_avatar: string
  likes: number
  dislikes: number
  comment_count: number
  created_at: string
  updated_at: string
}

export type ForumComment = {
  id: string
  post_id: string
  author_id: string
  author_name: string
  author_avatar: string
  content: string
  likes: number
  created_at: string
}

export type ForumLike = {
  id: string
  post_id: string | null
  comment_id: string | null
  user_id: string
  type: 'like' | 'dislike'
}

/* ── SQL schema (Supabase SQL Editor da ishlatish uchun) ─────────────────
CREATE TABLE forum_posts (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title         text NOT NULL,
  content       text NOT NULL,
  category      text NOT NULL DEFAULT 'Savol',
  author_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name   text NOT NULL,
  author_avatar text NOT NULL DEFAULT '',
  likes         int  NOT NULL DEFAULT 0,
  dislikes      int  NOT NULL DEFAULT 0,
  comment_count int  NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE forum_comments (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id       uuid NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  author_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name   text NOT NULL,
  author_avatar text NOT NULL DEFAULT '',
  content       text NOT NULL,
  likes         int  NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE forum_likes (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    uuid REFERENCES forum_posts(id) ON DELETE CASCADE,
  comment_id uuid REFERENCES forum_comments(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type       text NOT NULL CHECK (type IN ('like','dislike')),
  UNIQUE(post_id, user_id),
  UNIQUE(comment_id, user_id)
);

-- Realtime yoqish
ALTER PUBLICATION supabase_realtime ADD TABLE forum_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE forum_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE forum_likes;

-- RLS (Row Level Security)
ALTER TABLE forum_posts    ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_likes    ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hammaga o'qish" ON forum_posts    FOR SELECT USING (true);
CREATE POLICY "Hammaga o'qish" ON forum_comments FOR SELECT USING (true);
CREATE POLICY "Hammaga o'qish" ON forum_likes    FOR SELECT USING (true);

CREATE POLICY "Faqat o'z postini yaratish"  ON forum_posts    FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Faqat o'z kommentini qo'shish" ON forum_comments FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Faqat o'zi like bosishi"    ON forum_likes    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Faqat o'z likeini o'chirish" ON forum_likes FOR DELETE USING (auth.uid() = user_id);
─────────────────────────────────────────────────────────────────────────── */

/** Post ro'yxatini olish */
export async function fetchPosts(opts?: {
  search?: string
  category?: string
  limit?: number
  offset?: number
}): Promise<ForumPost[]> {
  const supabase = createClient()
  let q = supabase
    .from('forum_posts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(opts?.limit ?? 30)

  if (opts?.offset) q = q.range(opts.offset, opts.offset + (opts.limit ?? 30) - 1)
  if (opts?.search) q = q.ilike('title', `%${opts.search}%`)
  if (opts?.category && opts.category !== 'Barchasi') q = q.eq('category', opts.category)

  const { data, error } = await q
  if (error) throw error
  return data ?? []
}

/** Bitta post */
export async function fetchPost(id: string): Promise<ForumPost | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('forum_posts')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return null
  return data
}

/** Post izohlarini olish */
export async function fetchComments(postId: string): Promise<ForumComment[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('forum_comments')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data ?? []
}

/** Post yaratish */
export async function createPost(payload: {
  title: string
  content: string
  category: string
  author_id: string
  author_name: string
  author_avatar: string
}): Promise<ForumPost> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('forum_posts')
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data
}

/** Izoh qo'shish */
export async function createComment(payload: {
  post_id: string
  author_id: string
  author_name: string
  author_avatar: string
  content: string
}): Promise<ForumComment> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('forum_comments')
    .insert(payload)
    .select()
    .single()
  if (error) throw error

  // comment_count ni oshirish (RPC yo'q bo'lsa manual)
  const { error: rpcError } = await supabase.rpc('increment_comment_count', { post_id: payload.post_id })
  if (rpcError) {
    const { data: post } = await supabase
      .from('forum_posts')
      .select('comment_count')
      .eq('id', payload.post_id)
      .single()
    if (post) {
      await supabase
        .from('forum_posts')
        .update({ comment_count: (post.comment_count ?? 0) + 1 })
        .eq('id', payload.post_id)
    }
  }

  return data
}

/** Post like/dislike */
export async function togglePostLike(
  postId: string,
  userId: string,
  type: 'like' | 'dislike'
): Promise<void> {
  const supabase = createClient()

  const { data: existing } = await supabase
    .from('forum_likes')
    .select('id, type')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .maybeSingle()

  if (existing) {
    if (existing.type === type) {
      // Olib tashlash
      await supabase.from('forum_likes').delete().eq('id', existing.id)
      await supabase
        .from('forum_posts')
        .select(type === 'like' ? 'likes' : 'dislikes')
        .eq('id', postId)
        .single()
        .then(({ data: post }) => {
          if (post) {
            const field = type === 'like' ? 'likes' : 'dislikes'
            const val = (post as Record<string, number>)[field]
            supabase.from('forum_posts').update({ [field]: Math.max(0, val - 1) }).eq('id', postId)
          }
        })
    } else {
      // O'zgartirish
      await supabase.from('forum_likes').update({ type }).eq('id', existing.id)
      const oppositeField = type === 'like' ? 'dislikes' : 'likes'
      const currentField = type === 'like' ? 'likes' : 'dislikes'
      const { data: post } = await supabase
        .from('forum_posts')
        .select(`${currentField}, ${oppositeField}`)
        .eq('id', postId)
        .single()
      if (post) {
        const p = post as Record<string, number>
        await supabase.from('forum_posts').update({
          [currentField]: (p[currentField] ?? 0) + 1,
          [oppositeField]: Math.max(0, (p[oppositeField] ?? 0) - 1),
        }).eq('id', postId)
      }
    }
  } else {
    // Yangi like
    await supabase.from('forum_likes').insert({ post_id: postId, user_id: userId, type })
    const field = type === 'like' ? 'likes' : 'dislikes'
    const { data: post } = await supabase
      .from('forum_posts')
      .select(field)
      .eq('id', postId)
      .single()
    if (post) {
      const p = post as Record<string, number>
      await supabase.from('forum_posts').update({ [field]: (p[field] ?? 0) + 1 }).eq('id', postId)
    }
  }
}

/** Foydalanuvchi like holati */
export async function getUserLike(
  postId: string,
  userId: string
): Promise<'like' | 'dislike' | null> {
  const supabase = createClient()
  const { data } = await supabase
    .from('forum_likes')
    .select('type')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .maybeSingle()
  return (data?.type as 'like' | 'dislike') ?? null
}

/** Real-time: yangi izohlarni tinglash */
export function subscribeToComments(
  postId: string,
  onInsert: (comment: ForumComment) => void
): RealtimeChannel {
  const supabase = createClient()
  const channel = supabase
    .channel(`comments:${postId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'forum_comments', filter: `post_id=eq.${postId}` },
      (payload) => onInsert(payload.new as ForumComment)
    )
    .subscribe()
  return channel
}

/** Real-time: postlar ro'yxatini yangilash */
export function subscribeToPosts(
  onInsert: (post: ForumPost) => void,
  onUpdate: (post: ForumPost) => void
): RealtimeChannel {
  const supabase = createClient()
  const channel = supabase
    .channel('forum_posts_changes')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'forum_posts' },
      (payload) => onInsert(payload.new as ForumPost)
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'forum_posts' },
      (payload) => onUpdate(payload.new as ForumPost)
    )
    .subscribe()
  return channel
}

/** Foydalanuvchining bir nechta post uchun like holati (bitta so'rov) */
export async function getUserPostLikes(
  userId: string,
  postIds: string[]
): Promise<Record<string, 'like' | 'dislike'>> {
  if (!postIds.length) return {}
  const supabase = createClient()
  const { data } = await supabase
    .from('forum_likes')
    .select('post_id, type')
    .eq('user_id', userId)
    .in('post_id', postIds)
  const result: Record<string, 'like' | 'dislike'> = {}
  data?.forEach(item => {
    if (item.post_id) result[item.post_id] = item.type as 'like' | 'dislike'
  })
  return result
}

/** Eng ko'p muhokama qilingan postlar */
export async function fetchTopPosts(limit = 5): Promise<ForumPost[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('forum_posts')
    .select('*')
    .order('comment_count', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data ?? []
}

export function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)

  if (mins  <  1) return 'Hozirgina'
  if (mins  < 60) return `${mins} daqiqa oldin`
  if (hours < 24) return `${hours} soat oldin`
  if (days  <  7) return `${days} kun oldin`
  return new Date(dateStr).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long' })
}
