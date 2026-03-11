import { notFound, redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server'
import { getMessages } from '@/lib/actions/chat'
import ChatClient from './ChatClient'
import type { Profile } from '@/types/database'

interface Props {
  params: Promise<{ matchId: string }>
}

export default async function ChatDetailPage({ params }: Props) {
  const { matchId } = await params

  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Verify match exists and user belongs to it
  const { data: match } = await supabase
    .from('matches')
    .select('*')
    .eq('id', matchId)
    .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
    .single()

  if (!match) notFound()

  const otherId = match.user_a === user.id ? match.user_b : match.user_a

  const { data: otherProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', otherId)
    .single()

  if (!otherProfile) notFound()

  const initialMessages = await getMessages(matchId)

  return (
    <ChatClient
      matchId={matchId}
      initialMessages={initialMessages}
      otherProfile={otherProfile as Profile}
      currentUserId={user.id}
    />
  )
}
