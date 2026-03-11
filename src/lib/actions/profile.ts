'use server'

import { createServerSupabase } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Profile } from '@/types/database'

export async function getMyProfile(): Promise<Profile | null> {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return data
}

export async function getProfileById(id: string): Promise<Profile | null> {
  const supabase = await createServerSupabase()
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .eq('onboarding_done', true)
    .single()

  return data
}

export async function updateProfile(updates: Partial<Profile>): Promise<{ error: string | null }> {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Niet ingelogd' }

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/profiel')
  return { error: null }
}

export async function uploadAvatar(formData: FormData): Promise<{ url: string | null; error: string | null }> {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { url: null, error: 'Niet ingelogd' }

  const file = formData.get('avatar') as File
  if (!file) return { url: null, error: 'Geen bestand' }

  const ext = file.name.split('.').pop()
  const path = `${user.id}/avatar.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true })

  if (uploadError) return { url: null, error: uploadError.message }

  const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)

  await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id)

  revalidatePath('/profiel')
  return { url: publicUrl, error: null }
}

export async function deleteAccount(): Promise<{ error: string | null }> {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Niet ingelogd' }

  const { error } = await supabase.auth.admin.deleteUser(user.id)
  if (error) return { error: error.message }

  return { error: null }
}
