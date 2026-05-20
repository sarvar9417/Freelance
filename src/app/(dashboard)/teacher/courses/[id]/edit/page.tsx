'use client'

import { redirect } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useMountedTheme } from '@/hooks/useTheme'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'

export default function TeacherCourseEditPage({ params }: { params: { id: string } }) {
  const { isDark } = useMountedTheme()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [course, setCourse] = useState({
    title: '',
    description: '',
    category: '',
    emoji: '',
    methodologies: [] as string[],
    is_published: false,
  })

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { redirect('/login'); return }

      const { data } = await supabase.from('courses').select('*').eq('id', params.id).single()
      if (data) setCourse(data)
    }
    loadData()
  }, [params.id])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const supabase = createClient()
    await supabase.from('courses').update(course).eq('id', params.id)
    router.back()
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.back()} className={`p-2 rounded-lg ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}>
          <ArrowLeft className={`h-5 w-5 ${isDark ? 'text-white/60' : 'text-gray-600'}`} />
        </button>
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Kursni tahrirlash</h1>
      </div>

      <form onSubmit={handleSave} className={`space-y-6 p-6 rounded-2xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'}`}>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/80' : 'text-gray-700'}`}>Kurs nomi</label>
            <input
              type="text"
              value={course.title}
              onChange={e => setCourse({ ...course, title: e.target.value })}
              className={`w-full px-4 py-3 rounded-xl outline-none transition-colors ${
                isDark ? 'bg-white/5 border border-white/10 text-white focus:border-emerald-500' : 'bg-gray-50 border border-gray-200 text-gray-900 focus:border-emerald-500'
              }`}
              required
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/80' : 'text-gray-700'}`}>Emoji</label>
            <input
              type="text"
              value={course.emoji || ''}
              onChange={e => setCourse({ ...course, emoji: e.target.value })}
              className={`w-full px-4 py-3 rounded-xl outline-none transition-colors ${
                isDark ? 'bg-white/5 border border-white/10 text-white focus:border-emerald-500' : 'bg-gray-50 border border-gray-200 text-gray-900 focus:border-emerald-500'
              }`}
              placeholder="📚"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/80' : 'text-gray-700'}`}>Kategoriya</label>
            <select
              value={course.category}
              onChange={e => setCourse({ ...course, category: e.target.value })}
              className={`w-full px-4 py-3 rounded-xl outline-none transition-colors ${
                isDark ? 'bg-white/5 border border-white/10 text-white focus:border-emerald-500' : 'bg-gray-50 border border-gray-200 text-gray-900 focus:border-emerald-500'
              }`}
            >
              <option value="">Tanlang</option>
              <option value="Frontend">Frontend</option>
              <option value="Backend">Backend</option>
              <option value="Fullstack">Fullstack</option>
              <option value="Mobile">Mobile</option>
              <option value="DevOps">DevOps</option>
              <option value="AI/ML">AI/ML</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="col-span-2">
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/80' : 'text-gray-700'}`}>Tavsif</label>
            <textarea
              value={course.description || ''}
              onChange={e => setCourse({ ...course, description: e.target.value })}
              rows={4}
              className={`w-full px-4 py-3 rounded-xl outline-none transition-colors resize-none ${
                isDark ? 'bg-white/5 border border-white/10 text-white focus:border-emerald-500' : 'bg-gray-50 border border-gray-200 text-gray-900 focus:border-emerald-500'
              }`}
            />
          </div>

          <div className="col-span-2 flex items-center gap-3">
            <input
              type="checkbox"
              id="published"
              checked={course.is_published}
              onChange={e => setCourse({ ...course, is_published: e.target.checked })}
              className="w-5 h-5 rounded accent-emerald-500"
            />
            <label htmlFor="published" className={isDark ? 'text-white/80' : 'text-gray-700'}>Faol holatda</label>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium ${
            isDark ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
          } disabled:opacity-50`}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Saqlash
          </button>
        </div>
      </form>
    </div>
  )
}