'use server'

import { createServerSupabase } from '@/lib/supabase/server'
import type { MatchWithProfile } from '@/types/database'

export async function getMatches(): Promise<MatchWithProfile[]> {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
    .order('created_at', { ascending: false })

  if (!matches || matches.length === 0) return []

  const results: MatchWithProfile[] = []

  for (const match of matches) {
    const otherId = match.user_a === user.id ? match.user_b : match.user_a

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', otherId)
      .single()

    if (profile) {
      // Haal laatste bericht op
      const { data: conv } = await supabase
        .from('conversations')
        .select('id')
        .eq('match_id', match.id)
        .single()

      let lastMessage: string | null = null
      let unreadCount = 0

      if (conv) {
        const { data: msg } = await supabase
          .from('messages')
          .select('content')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', conv.id)
          .neq('sender_id', user.id)
          .is('read_at', null)

        lastMessage = msg?.content ?? null
        unreadCount = count ?? 0
      }

      results.push({ ...match, profile, last_message: lastMessage, unread_count: unreadCount })
    }
  }

  return results
}
