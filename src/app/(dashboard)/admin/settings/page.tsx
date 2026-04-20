import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SettingsClient from './SettingsClient'

export default async function AdminSettingsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/admin')

  const { data: rows } = await supabase
    .from('site_settings')
    .select('key, value')

  const settings: Record<string, string> = {}
  for (const row of rows ?? []) {
    settings[row.key] = row.value
  }

  return <SettingsClient initialSettings={settings} />
}
