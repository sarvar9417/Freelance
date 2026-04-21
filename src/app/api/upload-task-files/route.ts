import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const BUCKET = 'task-files'

async function ensureBucket() {
  const admin = createAdminClient()
  const { data: buckets } = await admin.storage.listBuckets()
  if (!buckets?.find(b => b.name === BUCKET)) {
    await admin.storage.createBucket(BUCKET, { public: true, fileSizeLimit: 52428800 })
  }
  return admin
}

export async function POST(req: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('users').select('role').eq('id', user.id).single()
    if (!['teacher', 'admin'].includes(profile?.role ?? '')) {
      return NextResponse.json({ error: "Faqat o'qituvchilar fayl yuklashi mumkin" }, { status: 403 })
    }

    const formData = await req.formData()
    const files = formData.getAll('files') as File[]
    if (!files.length) return NextResponse.json({ error: 'Kamida bitta fayl yuklang' }, { status: 400 })

    const admin = await ensureBucket()
    const sessionId = (formData.get('sessionId') as string) || Date.now().toString()

    const urls: string[] = []
    for (const file of files) {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const path = `task-resources/${user.id}/${sessionId}/${Date.now()}_${safeName}`

      const { data: uploaded, error: uploadErr } = await admin.storage
        .from(BUCKET)
        .upload(path, file, { upsert: true, contentType: file.type || 'application/octet-stream' })

      if (uploadErr) {
        return NextResponse.json({ error: `Fayl yuklashda xatolik: ${uploadErr.message}` }, { status: 400 })
      }

      const { data: { publicUrl } } = admin.storage.from(BUCKET).getPublicUrl(uploaded.path)
      urls.push(publicUrl)
    }

    return NextResponse.json({ urls })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server xatosi'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
