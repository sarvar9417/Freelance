import { MessageSquare, ThumbsUp, Eye, Pin, Search } from 'lucide-react'

const POSTS = [
  {
    id: '1',
    title: "Upwork profilimni qanday yaxshilashim mumkin?",
    author: 'Jasur T.',
    avatar: 'JT',
    category: 'Savol',
    likes: 24,
    views: 183,
    replies: 8,
    time: '2 soat oldin',
    pinned: true,
    color: 'bg-blue-600',
  },
  {
    id: '2',
    title: "Figma'da auto layout qachon ishlatiladi?",
    author: 'Malika Y.',
    avatar: 'MY',
    category: 'Savol',
    likes: 15,
    views: 97,
    replies: 5,
    time: '5 soat oldin',
    pinned: false,
    color: 'bg-purple-600',
  },
  {
    id: '3',
    title: "Birinchi freelance buyurtmamni oldim! 🎉",
    author: 'Bobur A.',
    avatar: 'BA',
    category: 'Yangilik',
    likes: 62,
    views: 340,
    replies: 21,
    time: 'Kecha',
    pinned: false,
    color: 'bg-emerald-600',
  },
  {
    id: '4',
    title: "AIDA formula vs PAS formula — qaysi biri yaxshi?",
    author: 'Zulfiya K.',
    avatar: 'ZK',
    category: 'Muhokama',
    likes: 31,
    views: 210,
    replies: 13,
    time: '2 kun oldin',
    pinned: false,
    color: 'bg-rose-600',
  },
  {
    id: '5',
    title: "Proposal yozishda eng ko'p qilinadigan xatolar",
    author: 'Sarvar U.',
    avatar: 'SU',
    category: 'Tavsiya',
    likes: 88,
    views: 520,
    replies: 34,
    time: '3 kun oldin',
    pinned: true,
    color: 'bg-amber-600',
  },
]

const CATEGORY_COLORS: Record<string, string> = {
  Savol:    'bg-blue-500/15 text-blue-300',
  Yangilik: 'bg-emerald-500/15 text-emerald-300',
  Muhokama: 'bg-purple-500/15 text-purple-300',
  Tavsiya:  'bg-amber-500/15 text-amber-300',
}

export default function ForumPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Forum</h1>
          <p className="text-white/40 text-sm mt-1">O&apos;quvchilar hamjamiyati</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-blue-900/30">
          <MessageSquare className="h-4 w-4" />
          Yangi mavzu
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 px-4 py-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <Search className="h-4 w-4 text-white/30 flex-shrink-0" />
        <input
          type="text"
          placeholder="Forum ichida qidirish..."
          className="bg-transparent text-white text-sm placeholder:text-white/30 outline-none flex-1"
        />
      </div>

      {/* Posts */}
      <div className="space-y-3">
        {POSTS.map(post => (
          <div
            key={post.id}
            className="rounded-2xl p-5 hover:bg-white/[0.02] transition-all cursor-pointer group"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div className={`h-9 w-9 rounded-full ${post.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                {post.avatar}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  {post.pinned && <Pin className="h-3 w-3 text-amber-400 flex-shrink-0" />}
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[post.category] ?? 'bg-white/10 text-white/50'}`}>
                    {post.category}
                  </span>
                </div>
                <p className="text-white font-medium text-sm group-hover:text-blue-300 transition-colors leading-snug">
                  {post.title}
                </p>
                <div className="flex items-center gap-3 mt-2 text-white/30 text-xs flex-wrap">
                  <span>{post.author}</span>
                  <span>·</span>
                  <span>{post.time}</span>
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="h-3 w-3" />
                    {post.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {post.views}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    {post.replies} javob
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
