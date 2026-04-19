'use client'

/* ── Supabase SQL (SQL Editor da ishlatish uchun) ─────────────────────────
CREATE TABLE success_stories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id   uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name text NOT NULL,
  title       text NOT NULL,
  content     text NOT NULL,
  achievement text NOT NULL DEFAULT 'Freelancer',
  earnings    text,
  approved    boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE success_stories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tasdiqlangan hikoyalar hamma uchun" ON success_stories FOR SELECT USING (approved = true);
CREATE POLICY "O'z hikoyasini qo'shish" ON success_stories FOR INSERT WITH CHECK (auth.uid() = author_id);
────────────────────────────────────────────────────────────────────────── */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Trophy, TrendingUp, Plus, Send, Loader2, X, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Story {
  id: string
  author_name: string
  title: string
  content: string
  achievement: string
  earnings?: string
  created_at: string
}

const MOCK_STORIES: Story[] = [
  {
    id: '1',
    author_name: 'Jasur Toshmatov',
    title: 'Fiverr da birinchi $500 ni qanday topdim',
    content: 'FreelancerSchool ga yozilishimdan 3 oy o\'tib, Fiverr da birinchi buyurtmamni oldim. Logo dizayn xizmati uchun $15 dan boshladim. Har kuni sifat yaxshilab, 6 oyda $500+ oylik daromadga erishdim. Eng muhimi — mijozlar bilan samimiy muloqot.',
    achievement: 'Dizayner',
    earnings: '$500/oy',
    created_at: '2024-11-15',
  },
  {
    id: '2',
    author_name: 'Malika Yusupova',
    title: 'Upwork da Top Rated Status ga erishdim',
    content: 'Tarjimon sifatida Upwork da ish boshladim. Birinchi 3 oy qiyin edi — faqat 2 ta buyurtma oldim. Lekin profil to\'ldirib, portfolio qo\'shib, Job Success 100%ga yetkazdim. Endi oyiga 15-20 ta loyiha bajaraman.',
    achievement: 'Tarjimon',
    earnings: '$800/oy',
    created_at: '2024-12-01',
  },
  {
    id: '3',
    author_name: 'Bobur Karimov',
    title: 'O\'zbek o\'quvchisidan xalqaro freelancerga',
    content: 'Dasturlashni bilardim, lekin mijoz topishni bilmasdim. FreelancerSchool kurslari orqali CV va profil yozishni o\'rgandim. Birinchi mijozim Germaniyadan edi. Endi remote asosda ishlayman va oylik daromadim avvalgidan 3 barobar ko\'paydi.',
    achievement: 'Dasturchi',
    earnings: '$1200/oy',
    created_at: '2025-01-10',
  },
  {
    id: '4',
    author_name: 'Dilnoza Xasanova',
    title: 'SMM manager sifatida mustaqil biznesga',
    content: 'Ijtimoiy tarmoqlarni yaxshi bilar edim, lekin daromad yo\'q edi. Kurs orqali narx belgilash va shartnoma tuzishni o\'rgandim. Hozir 5 ta doimiy mijozim bor — har oyda barqaror daromad.',
    achievement: 'SMM Manager',
    earnings: '$600/oy',
    created_at: '2025-02-20',
  },
]

const ACHIEVEMENT_COLORS: Record<string, string> = {
  Dizayner:    'from-purple-600 to-purple-800',
  Tarjimon:    'from-blue-600 to-blue-800',
  Dasturchi:   'from-emerald-600 to-emerald-800',
  'SMM Manager': 'from-rose-600 to-rose-800',
}

const AVATAR_GRADIENTS = [
  'from-blue-500 to-blue-700',
  'from-purple-500 to-purple-700',
  'from-emerald-500 to-emerald-700',
  'from-rose-500 to-rose-700',
  'from-amber-500 to-amber-700',
]

interface AddFormProps { onClose: () => void }

function AddStoryForm({ onClose }: AddFormProps) {
  const [form, setForm]       = useState({ title: '', content: '', achievement: '', earnings: '' })
  const [loading, setLoading] = useState(false)
  const [done, setDone]       = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.content.trim() || !form.achievement.trim()) return
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase.from('users').select('full_name').eq('id', user.id).single()
      const authorName = profile?.full_name ?? user.email?.split('@')[0] ?? 'Foydalanuvchi'

      await supabase.from('success_stories').insert({
        author_id:   user.id,
        author_name: authorName,
        title:       form.title.trim(),
        content:     form.content.trim(),
        achievement: form.achievement.trim(),
        earnings:    form.earnings.trim() || null,
        approved:    false,
      })
      setDone(true)
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="text-center py-8">
        <div className="h-12 w-12 rounded-2xl bg-emerald-500/15 flex items-center justify-center mx-auto mb-3">
          <Trophy className="h-6 w-6 text-emerald-400" />
        </div>
        <p className="text-white font-semibold mb-1">Hikoyangiz yuborildi!</p>
        <p className="text-white/40 text-sm">Tekshirib ko&apos;rib, tez orada chiqaramiz.</p>
        <button onClick={onClose} className="mt-4 text-sm text-white/40 hover:text-white/70 transition-colors">Yopish</button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-white font-semibold">O&apos;z hikoyangizni ulashing</h3>
        <button type="button" onClick={onClose} className="text-white/30 hover:text-white/60 transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>

      {[
        { key: 'title', label: 'Sarlavha', placeholder: 'Muvaffaqiyat hikoyangiz sarlavhasi', type: 'input' },
        { key: 'achievement', label: 'Kasb / Soha', placeholder: 'Dizayner, Dasturchi, Tarjimon...', type: 'input' },
        { key: 'earnings', label: 'Oylik daromad (ixtiyoriy)', placeholder: '$500/oy', type: 'input' },
      ].map(f => (
        <div key={f.key} className="space-y-1">
          <label className="text-white/40 text-xs font-medium">{f.label}</label>
          <input
            type="text"
            value={(form as Record<string, string>)[f.key]}
            onChange={e => setForm(v => ({ ...v, [f.key]: e.target.value }))}
            placeholder={f.placeholder}
            className="w-full px-3.5 py-2.5 rounded-xl text-sm text-white placeholder:text-white/20 outline-none focus:ring-1 focus:ring-blue-500/40"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          />
        </div>
      ))}

      <div className="space-y-1">
        <label className="text-white/40 text-xs font-medium">Hikoyangiz</label>
        <textarea
          value={form.content}
          onChange={e => setForm(v => ({ ...v, content: e.target.value }))}
          placeholder="Qanday boshladingiz, qiyinchiliklar, erishganlaringiz..."
          rows={5}
          className="w-full px-3.5 py-2.5 rounded-xl text-sm text-white placeholder:text-white/20 outline-none focus:ring-1 focus:ring-blue-500/40 resize-none leading-relaxed"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
        />
      </div>

      <button
        type="submit"
        disabled={loading || !form.title.trim() || !form.content.trim() || !form.achievement.trim()}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Yuborilmoqda...</> : <><Send className="h-4 w-4" /> Hikoyani yuborish</>}
      </button>
      <p className="text-white/20 text-[10px] text-center">Hikoyangiz tekshiruvdan so&apos;ng chiqariladi</p>
    </form>
  )
}

export default function SuccessStories() {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)

  useState(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setIsLoggedIn(!!data.user))
  })

  return (
    <div className="space-y-4">
      {/* Sarlavha */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-bold text-lg flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-400" />
            Muvaffaqiyat hikoyalari
          </h2>
          <p className="text-white/35 text-sm mt-0.5">O&apos;quvchilarimizning real natijalari</p>
        </div>
        {isLoggedIn && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 text-xs font-semibold text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 px-3.5 py-2 rounded-xl transition-all"
          >
            <Plus className="h-3.5 w-3.5" /> O&apos;z hikoyam
          </button>
        )}
      </div>

      {/* Hikoya yozish formasi */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="rounded-2xl p-5 overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <AddStoryForm onClose={() => setShowForm(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hikoyalar ro'yxati */}
      <div className="grid gap-4 sm:grid-cols-2">
        {MOCK_STORIES.map((story, i) => {
          const initials = story.author_name.split(' ').map(w => w[0]).join('').toUpperCase()
          const gradColor = AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length]
          const achColor  = ACHIEVEMENT_COLORS[story.achievement] ?? 'from-blue-600 to-blue-800'
          const isOpen    = expanded === story.id

          return (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.35 }}
              className="rounded-2xl p-5 flex flex-col gap-3 cursor-pointer group hover:translate-y-[-2px] transition-transform"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
              onClick={() => setExpanded(isOpen ? null : story.id)}
            >
              {/* Tepa */}
              <div className="flex items-start gap-3">
                <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${gradColor} flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-lg`}>
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-white/80 text-sm font-semibold">{story.author_name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white bg-gradient-to-r ${achColor}`}>
                      {story.achievement}
                    </span>
                  </div>
                  <p className="text-white font-medium text-sm leading-snug">{story.title}</p>
                </div>
              </div>

              {/* Daromad */}
              {story.earnings && (
                <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
                  <TrendingUp className="h-3.5 w-3.5" />
                  {story.earnings}
                </div>
              )}

              {/* Kontent */}
              <AnimatePresence>
                {isOpen ? (
                  <motion.p
                    key="full"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="text-white/55 text-sm leading-relaxed"
                  >
                    {story.content}
                  </motion.p>
                ) : (
                  <p className="text-white/40 text-xs leading-relaxed line-clamp-2">{story.content}</p>
                )}
              </AnimatePresence>

              {/* O'qish tugmasi */}
              <div className="flex items-center gap-1 text-blue-400/70 text-xs group-hover:text-blue-300 transition-colors mt-auto">
                {isOpen ? 'Yopish' : "To'liq o'qish"}
                <ChevronRight className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
              </div>

              {/* Yulduzlar */}
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} className="h-3 w-3 text-amber-400 fill-amber-400" />
                ))}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
