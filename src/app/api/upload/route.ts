import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const BUCKET = 'task-files'

async function ensureBucket() {
  const admin = createAdminClient()
  const { data: buckets } = await admin.storage.listBuckets()
  if (!buckets?.find(b => b.name === BUCKET)) {
    await admin.storage.createBucket(BUCKET, { public: true, fileSizeLimit: 52428800 }) // 50MB
  }
  return admin
}

export async function POST(req: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const formData = await req.formData()
    const taskId = formData.get('taskId') as string | null
    const files = formData.getAll('files') as File[]

    if (!taskId) return NextResponse.json({ error: 'taskId talab qilinadi' }, { status: 400 })
    if (!files.length) return NextResponse.json({ error: 'Kamida bitta fayl yuklang' }, { status: 400 })

    const admin = await ensureBucket()

    const urls: string[] = []
    for (const file of files) {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const path = `submissions/${user.id}/${taskId}/${Date.now()}_${safeName}`

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
