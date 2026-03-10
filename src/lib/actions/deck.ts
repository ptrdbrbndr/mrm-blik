'use server'

import { createServerSupabase } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { nanoid } from 'nanoid'
import type { DeckStatus } from '@/types/database'

export async function createDeck(formData: FormData) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get user's workspace
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (!workspace) throw new Error('Geen workspace gevonden')

  const title = formData.get('title') as string
  const description = formData.get('description') as string | null

  const { data: deck, error } = await supabase
    .from('decks')
    .insert({
      workspace_id: workspace.id,
      title,
      description: description || null,
      share_token: nanoid(12),
      created_by: user.id,
      status: 'draft',
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  redirect(`/deck/${deck.id}`)
}

export async function updateDeck(deckId: string, data: { title?: string; description?: string | null; deadline?: string | null }) {
  const supabase = await createServerSupabase()
  const { error } = await supabase
    .from('decks')
    .update(data)
    .eq('id', deckId)

  if (error) throw new Error(error.message)
}

export async function updateDeckStatus(deckId: string, status: DeckStatus) {
  const supabase = await createServerSupabase()
  const { error } = await supabase
    .from('decks')
    .update({ status })
    .eq('id', deckId)

  if (error) throw new Error(error.message)
}

export async function deleteDeck(deckId: string) {
  const supabase = await createServerSupabase()
  const { error } = await supabase
    .from('decks')
    .delete()
    .eq('id', deckId)

  if (error) throw new Error(error.message)
  redirect('/dashboard')
}
