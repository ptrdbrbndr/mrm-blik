'use server'

import { createServerSupabase } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { ConversationWithDetails, Message } from '@/types/database'

export async function getConversations(): Promise<ConversationWithDetails[]> {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
    .order('created_at', { ascending: false })

  if (!matches || matches.length === 0) return []

  const results: ConversationWithDetails[] = []

  for (const match of matches) {
    const otherId = match.user_a === user.id ? match.user_b : match.user_a

    const [{ data: conv }, { data: otherProfile }, { data: lastMsg }, { count: unread }] = await Promise.all([
      supabase.from('conversations').select('*').eq('match_id', match.id).single(),
      supabase.from('profiles').select('*').eq('id', otherId).single(),
      supabase.from('messages').select('*').eq('conversation_id',
        (await supabase.from('conversations').select('id').eq('match_id', match.id).single()).data?.id ?? ''
      ).order('created_at', { ascending: false }).limit(1).single(),
      supabase.from('messages').select('*', { count: 'exact', head: true })
        .eq('conversation_id',
          (await supabase.from('conversations').select('id').eq('match_id', match.id).single()).data?.id ?? ''
        )
        .neq('sender_id', user.id)
        .is('read_at', null),
    ])

    if (conv && otherProfile) {
      results.push({
        ...conv,
        match,
        other_profile: otherProfile,
        last_message: lastMsg ?? null,
        unread_count: unread ?? 0,
      })
    }
  }

  return results
}

export async function getMessages(matchId: string): Promise<Message[]> {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: conv } = await supabase
    .from('conversations')
    .select('id')
    .eq('match_id', matchId)
    .single()

  if (!conv) return []

  const { data } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conv.id)
    .order('created_at', { ascending: true })

  // Markeer ongelezen berichten als gelezen
  await supabase
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('conversation_id', conv.id)
    .neq('sender_id', user.id)
    .is('read_at', null)

  return data ?? []
}

export async function sendMessage(matchId: string, content: string): Promise<{ error: string | null }> {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Niet ingelogd' }

  // Haal op of maak conversation aan bij eerste bericht
  let convId: string | null = null
  const { data: existing } = await supabase
    .from('conversations')
    .select('id')
    .eq('match_id', matchId)
    .single()

  if (existing) {
    convId = existing.id
  } else {
    const { data: created } = await supabase
      .from('conversations')
      .insert({ match_id: matchId })
      .select('id')
      .single()
    convId = created?.id ?? null
  }

  if (!convId) return { error: 'Gesprek kon niet worden aangemaakt' }

  const { error } = await supabase.from('messages').insert({
    conversation_id: convId,
    sender_id: user.id,
    content: content.trim(),
  })

  if (error) return { error: error.message }

  revalidatePath(`/chat/${matchId}`)
  revalidatePath('/chat')
  revalidatePath('/matches')
  return { error: null }
}
