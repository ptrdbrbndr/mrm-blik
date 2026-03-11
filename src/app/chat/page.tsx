import Link from 'next/link'
import Image from 'next/image'
import { getConversations } from '@/lib/actions/chat'
import type { ConversationWithDetails } from '@/types/database'

export const metadata = { title: 'Gesprekken' }

function formatDate(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays === 0) {
    return d.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })
  }
  if (diffDays === 1) return 'Gisteren'
  if (diffDays < 7) return `${diffDays}d geleden`
  return d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })
}

export default async function ChatPage() {
  const conversations: ConversationWithDetails[] = await getConversations()

  // Sort by last message timestamp (most recent first)
  const sorted = [...conversations].sort((a, b) => {
    const aTime = a.last_message?.created_at ?? a.created_at
    const bTime = b.last_message?.created_at ?? b.created_at
    return new Date(bTime).getTime() - new Date(aTime).getTime()
  })

  return (
    <main className="min-h-screen px-4 py-6 max-w-lg mx-auto" data-testid="chat-list-page">
      <h1 className="font-heading text-2xl font-bold text-primary mb-6">Gesprekken</h1>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-primary font-semibold mb-1">Nog geen gesprekken</p>
          <p className="text-primary/50 text-sm mb-6">Match eerst met iemand om een gesprek te starten.</p>
          <Link
            href="/matches"
            className="rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white hover:bg-accent-light transition-colors"
            data-testid="matches-link"
          >
            Bekijk matches
          </Link>
        </div>
      ) : (
        <ul className="space-y-2">
          {sorted.map((conv) => (
            <li key={conv.id}>
              <Link
                href={`/chat/${conv.match_id}`}
                className="flex items-center gap-4 rounded-2xl bg-white border border-primary/8 px-4 py-3.5 hover:border-primary/20 transition-all active:scale-[0.99]"
                data-testid={`conversation-item-${conv.match_id}`}
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-sand">
                    {conv.other_profile.avatar_url ? (
                      <Image
                        src={conv.other_profile.avatar_url}
                        alt={conv.other_profile.display_name ?? 'Avatar'}
                        width={56}
                        height={56}

                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-accent/15">
                        <span className="text-accent font-semibold text-lg">
                          {(conv.other_profile.display_name ?? '?')[0].toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  {conv.unread_count > 0 && (
                    <span
                      className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-danger text-white text-[10px] font-bold flex items-center justify-center px-1"
                      data-testid={`conv-unread-badge-${conv.match_id}`}
                    >
                      {conv.unread_count > 99 ? '99+' : conv.unread_count}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className={`text-sm text-primary truncate ${conv.unread_count > 0 ? 'font-bold' : 'font-semibold'}`}>
                      {conv.other_profile.display_name ?? 'Onbekend'}
                    </p>
                    <span className="text-primary/40 text-xs shrink-0">
                      {conv.last_message
                        ? formatDate(conv.last_message.created_at)
                        : formatDate(conv.created_at)}
                    </span>
                  </div>
                  <p className={`text-xs mt-0.5 truncate ${conv.unread_count > 0 ? 'text-primary font-medium' : 'text-primary/50'}`}>
                    {conv.last_message?.content ?? 'Stuur een berichtje!'}
                  </p>
                </div>

                {/* Chevron */}
                <svg className="w-4 h-4 text-primary/25 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
