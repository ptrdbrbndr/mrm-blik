'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { sendMessage } from '@/lib/actions/chat'
import type { Message, Profile } from '@/types/database'

interface Props {
  matchId: string
  initialMessages: Message[]
  otherProfile: Profile
  currentUserId: string
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })
}

export default function ChatClient({ matchId, initialMessages, otherProfile, currentUserId }: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const supabase = createClient()

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Realtime subscription
  useEffect(() => {
    // We need conversation_id — fetch it once
    let channelRef: ReturnType<typeof supabase.channel> | null = null

    supabase
      .from('conversations')
      .select('id')
      .eq('match_id', matchId)
      .single()
      .then(({ data: conv }) => {
        if (!conv) return

        channelRef = supabase
          .channel(`chat-${conv.id}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'messages',
              filter: `conversation_id=eq.${conv.id}`,
            },
            (payload) => {
              const newMsg = payload.new as Message
              setMessages((prev) => {
                // Avoid duplicates (optimistic updates)
                if (prev.some((m) => m.id === newMsg.id)) return prev
                return [...prev, newMsg]
              })
            }
          )
          .subscribe()
      })

    return () => {
      if (channelRef) {
        supabase.removeChannel(channelRef)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId])

  async function handleSend() {
    const content = input.trim()
    if (!content || sending) return

    setSending(true)
    setInput('')

    // Optimistic message
    const optimisticId = `optimistic-${Date.now()}`
    const optimistic: Message = {
      id: optimisticId,
      conversation_id: '',
      sender_id: currentUserId,
      content,
      read_at: null,
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, optimistic])

    const { error } = await sendMessage(matchId, content)

    if (error) {
      // Remove optimistic on error
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId))
      setInput(content)
    }

    setSending(false)
    textareaRef.current?.focus()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div
      className="flex flex-col h-[100dvh] bg-cream"
      data-testid="chat-page"
    >
      {/* Header */}
      <header className="shrink-0 flex items-center gap-3 px-4 py-3 bg-white border-b border-primary/10 safe-top">
        <Link
          href="/matches"
          className="flex items-center gap-1.5 text-primary/60 hover:text-primary transition-colors text-sm font-medium"
          data-testid="back-to-matches"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Matches
        </Link>

        <div className="flex items-center gap-2 ml-1">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-sand shrink-0">
            {otherProfile.avatar_url ? (
              <Image
                src={otherProfile.avatar_url}
                alt={otherProfile.display_name ?? 'Avatar'}
                width={32}
                height={32}
                unoptimized={true}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-accent/15">
                <span className="text-accent font-semibold text-xs">
                  {(otherProfile.display_name ?? '?')[0].toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <span className="font-semibold text-primary text-sm">
            {otherProfile.display_name ?? 'Onbekend'}
          </span>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full py-10 text-center">
            <p className="text-primary/40 text-sm">
              Stuur een berichtje aan {otherProfile.display_name ?? 'je match'}!
            </p>
          </div>
        )}

        {messages.map((msg) => {
          const isOwn = msg.sender_id === currentUserId
          return (
            <div
              key={msg.id}
              data-testid={`message-${msg.id}`}
              className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[75%] px-4 py-2.5 text-sm leading-relaxed ${
                  isOwn
                    ? 'bg-accent text-white rounded-2xl rounded-br-sm'
                    : 'bg-white border border-primary/10 text-primary rounded-2xl rounded-bl-sm'
                } ${msg.id.startsWith('optimistic-') ? 'opacity-60' : ''}`}
              >
                {msg.content}
              </div>
              <span className="text-primary/35 text-[10px] mt-1 px-1">
                {formatTime(msg.created_at)}
              </span>
            </div>
          )
        })}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 bg-white border-t border-primary/10 px-4 py-3 pb-[max(12px,env(safe-area-inset-bottom))]">
        <div className="flex items-end gap-2 max-w-lg mx-auto">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Schrijf een bericht..."
            rows={1}
            data-testid="message-input"
            className="flex-1 resize-none rounded-2xl border border-primary/20 bg-cream px-4 py-2.5 text-sm text-primary placeholder:text-primary/35 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 max-h-32 overflow-y-auto leading-relaxed"
            style={{ minHeight: '42px' }}
            onInput={(e) => {
              const el = e.currentTarget
              el.style.height = 'auto'
              el.style.height = `${Math.min(el.scrollHeight, 128)}px`
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            data-testid="send-button"
            className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-white hover:bg-accent-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            aria-label="Verstuur bericht"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
