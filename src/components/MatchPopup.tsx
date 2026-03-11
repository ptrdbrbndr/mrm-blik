'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import type { Profile } from '@/types/database'

interface MatchPopupProps {
  profile: Profile | null
  onClose: () => void
  matchId: string
}

const SUPABASE_AVATAR_BASE =
  'https://vjwsflqtvcbvsbwabcfe.supabase.co/storage/v1/object/public/avatars/'

function resolveAvatarUrl(avatarUrl: string | null): string | null {
  if (!avatarUrl) return null
  if (avatarUrl.startsWith('http')) return avatarUrl
  return `${SUPABASE_AVATAR_BASE}${avatarUrl}`
}

function getInitials(name: string | null): string {
  if (!name) return '?'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Simple deterministic confetti particles — no extra package needed
const CONFETTI = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  left: (i * 5) % 100,
  delay: (i * 0.3) % 4,
  size: 6 + (i % 4) * 3,
  duration: 4 + (i % 3) * 2,
  color: [
    '#7A2E4A',
    '#C4973B',
    '#2ECC71',
    '#A0526B',
    '#E8C4D0',
    '#C4899E',
  ][i % 6],
}))

function AvatarCircle({
  avatarUrl,
  name,
  testId,
}: {
  avatarUrl: string | null
  name: string | null
  testId: string
}) {
  const resolved = resolveAvatarUrl(avatarUrl)
  return (
    <div
      className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg flex-shrink-0"
      data-testid={testId}
    >
      {resolved ? (
        <Image
          src={resolved}
          alt={name ?? 'Avatar'}
          fill

          className="object-cover"
        />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center"
          style={{
            background:
              'linear-gradient(135deg, var(--color-accent) 0%, var(--color-primary) 100%)',
          }}
        >
          <span className="text-white font-heading text-2xl font-bold select-none">
            {getInitials(name)}
          </span>
        </div>
      )}
    </div>
  )
}

export default function MatchPopup({ profile, onClose, matchId }: MatchPopupProps) {
  const router = useRouter()
  const [myProfile, setMyProfile] = useState<{ avatar_url: string | null; display_name: string | null } | null>(null)

  // Fetch own profile for avatar display
  useEffect(() => {
    if (!profile) return
    import('@/lib/supabase/client').then(({ createClient }) => {
      const supabase = createClient()
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (!user) return
        supabase
          .from('profiles')
          .select('avatar_url, display_name')
          .eq('id', user.id)
          .single()
          .then(({ data }) => {
            if (data) setMyProfile(data)
          })
      })
    })
  }, [profile])

  return (
    <AnimatePresence>
      {profile && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          data-testid="match-popup"
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-primary/70 backdrop-blur-sm"
            onClick={onClose}
            data-testid="match-popup-backdrop"
          />

          {/* Confetti particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {CONFETTI.map((p) => (
              <div
                key={p.id}
                className="absolute -bottom-4 rounded-sm"
                style={{
                  left: `${p.left}%`,
                  width: p.size,
                  height: p.size,
                  backgroundColor: p.color,
                  animation: `floatUp ${p.duration}s ease-in-out ${p.delay}s infinite`,
                  opacity: 0.9,
                }}
              />
            ))}
          </div>

          {/* Modal card */}
          <motion.div
            className="relative z-10 w-full max-w-sm bg-cream rounded-3xl shadow-2xl overflow-hidden"
            initial={{ scale: 0.7, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            data-testid="match-popup-card"
          >
            {/* Top decorative gradient band */}
            <div
              className="h-2 w-full"
              style={{
                background:
                  'linear-gradient(90deg, var(--color-accent), var(--color-gold), var(--color-accent))',
              }}
            />

            <div className="px-6 py-8 flex flex-col items-center text-center">
              {/* Avatars */}
              <div className="flex items-center justify-center gap-4 mb-6" data-testid="match-avatars">
                {/* My avatar slides in from left */}
                <motion.div
                  initial={{ x: -60, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.15, type: 'spring', stiffness: 260, damping: 20 }}
                >
                  <AvatarCircle
                    avatarUrl={myProfile?.avatar_url ?? null}
                    name={myProfile?.display_name ?? null}
                    testId="match-my-avatar"
                  />
                </motion.div>

                {/* Heart in the middle */}
                <motion.span
                  className="text-3xl"
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.4, 1] }}
                  transition={{ delay: 0.35, duration: 0.5 }}
                  data-testid="match-heart"
                >
                  💞
                </motion.span>

                {/* Match avatar slides in from right */}
                <motion.div
                  initial={{ x: 60, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.15, type: 'spring', stiffness: 260, damping: 20 }}
                >
                  <AvatarCircle
                    avatarUrl={profile.avatar_url}
                    name={profile.display_name}
                    testId="match-their-avatar"
                  />
                </motion.div>
              </div>

              {/* Heading */}
              <motion.h2
                className="font-heading text-3xl font-bold text-primary mb-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                data-testid="match-heading"
              >
                Het is een match! 💞
              </motion.h2>

              {/* Subtext */}
              <motion.p
                className="text-primary/60 text-sm font-sans mb-8"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                data-testid="match-subtext"
              >
                Jij en{' '}
                <span className="font-semibold text-primary">
                  {profile.display_name ?? 'iemand'}
                </span>{' '}
                hebben elkaar geliket
              </motion.p>

              {/* Action buttons */}
              <motion.div
                className="flex flex-col gap-3 w-full"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <button
                  data-testid="match-btn-chat"
                  onClick={() => router.push(`/chat/${matchId}`)}
                  className="w-full rounded-xl bg-accent py-3.5 text-sm font-semibold text-white hover:bg-accent-light transition-colors"
                >
                  Stuur een bericht →
                </button>
                <button
                  data-testid="match-btn-continue"
                  onClick={onClose}
                  className="w-full rounded-xl border-2 border-primary/15 py-3.5 text-sm font-semibold text-primary hover:border-primary/30 transition-colors"
                >
                  Verder swipen
                </button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
