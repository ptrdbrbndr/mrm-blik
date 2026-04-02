'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface RealtimeSwipeCountProps {
  deckId: string
  initialCount: number
  initialParticipants: number
}

export default function RealtimeSwipeCount({
  deckId,
  initialCount,
  initialParticipants,
}: RealtimeSwipeCountProps) {
  const [swipeCount, setSwipeCount] = useState(initialCount)
  const [participants, setParticipants] = useState(initialParticipants)

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`swipes-${deckId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'swipes',
          filter: `deck_id=eq.${deckId}`,
        },
        () => {
          setSwipeCount((c) => c + 1)
          // Refetch participant count on new swipe
          supabase
            .from('swipes')
            .select('user_id, session_id')
            .eq('deck_id', deckId)
            .then(({ data }) => {
              if (data) {
                const unique = new Set(data.map((s) => s.user_id || s.session_id))
                setParticipants(unique.size)
              }
            })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [deckId])

  return (
    <div
      className="flex items-center gap-3 rounded-lg bg-accent/5 border border-accent/20 px-4 py-3"
      data-testid="realtime-swipe-count"
    >
      <div className="flex items-center gap-1.5">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
        </span>
        <span className="text-xs font-medium text-primary/60">Live</span>
      </div>
      <span className="text-sm font-semibold text-accent" data-testid="live-swipe-count">
        {swipeCount} swipe{swipeCount !== 1 ? 's' : ''}
      </span>
      <span className="text-xs text-primary/40" data-testid="live-participant-count">
        {participants} deelnemer{participants !== 1 ? 's' : ''}
      </span>
    </div>
  )
}
