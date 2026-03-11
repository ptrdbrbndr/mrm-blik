'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, useMotionValue, useTransform, type PanInfo } from 'framer-motion'
import Image from 'next/image'
import type { Profile, DiscoverDirection } from '@/types/database'
import { recordSwipe } from '@/lib/actions/discover'
import MatchPopup from '@/components/MatchPopup'

interface DiscoverClientProps {
  profiles: Profile[]
}

const SWIPE_THRESHOLD = 100
const SWIPE_UP_THRESHOLD = -80
const SUPABASE_AVATAR_BASE =
  'https://vjwsflqtvcbvsbwabcfe.supabase.co/storage/v1/object/public/avatars/'

const intentionLabels: Record<string, { emoji: string; label: string }> = {
  relatie: { emoji: '💞', label: 'Vaste relatie' },
  casual: { emoji: '💫', label: 'Casual daten' },
  plezier: { emoji: '✨', label: 'Alleen voor plezier' },
  vriendschap: { emoji: '🤝', label: 'Vriendschap' },
}

function getAge(birthYear: number | null): number | null {
  if (!birthYear) return null
  return new Date().getFullYear() - birthYear
}

function getAvatarUrl(avatarUrl: string | null): string | null {
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

// ── ProfileCard ───────────────────────────────────────────────────────────────

interface ProfileCardProps {
  profile: Profile
  myHobbies: string[]
  onSwipe: (direction: DiscoverDirection) => void
  isTop: boolean
}

function ProfileCard({ profile, myHobbies, onSwipe, isTop }: ProfileCardProps) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const rotate = useTransform(x, [-200, 200], [-12, 12])
  const cardOpacity = useTransform(
    x,
    [-200, -100, 0, 100, 200],
    [0.6, 0.85, 1, 0.85, 0.6]
  )

  const rightOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1])
  const leftOpacity = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0])
  const upOpacity = useTransform(y, [SWIPE_UP_THRESHOLD, 0], [1, 0])

  function handleDragEnd(_: unknown, info: PanInfo) {
    const { offset } = info
    if (offset.y < SWIPE_UP_THRESHOLD && Math.abs(offset.x) < SWIPE_THRESHOLD) {
      onSwipe('superlike')
    } else if (offset.x > SWIPE_THRESHOLD) {
      onSwipe('like')
    } else if (offset.x < -SWIPE_THRESHOLD) {
      onSwipe('pass')
    }
  }

  const age = getAge(profile.birth_year)
  const avatarUrl = getAvatarUrl(profile.avatar_url)
  const sharedHobbies = profile.hobbies?.filter((h) => myHobbies.includes(h)) ?? []
  const intention = profile.intention ? intentionLabels[profile.intention] : null

  return (
    <motion.div
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
      style={{
        x,
        y,
        rotate,
        opacity: cardOpacity,
        zIndex: isTop ? 10 : 0,
        pointerEvents: isTop ? 'auto' : 'none',
      }}
      drag={isTop}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
      data-testid="profile-card"
    >
      <div className="relative h-full w-full rounded-3xl overflow-hidden shadow-2xl bg-white">
        {/* Photo area */}
        <div className="relative w-full" style={{ aspectRatio: '4/5' }}>
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={profile.display_name ?? 'Profiel foto'}
              fill

              className="object-cover"
              data-testid="profile-photo"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{
                background:
                  'linear-gradient(135deg, var(--color-accent) 0%, var(--color-burgundy) 50%, var(--color-primary) 100%)',
              }}
              data-testid="profile-photo-placeholder"
            >
              <span className="text-white font-heading text-6xl font-bold select-none">
                {getInitials(profile.display_name)}
              </span>
            </div>
          )}

          {/* Dark gradient overlay for text legibility */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to top, rgba(45,42,38,0.85) 0%, rgba(45,42,38,0.3) 40%, transparent 70%)',
            }}
          />

          {/* Name + age + location over photo */}
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <h2
              className="font-heading text-3xl font-bold text-white leading-tight"
              data-testid="profile-name"
            >
              {profile.display_name ?? 'Onbekend'}
              {age !== null && (
                <span className="font-sans font-normal text-2xl ml-2 opacity-90">
                  {age}
                </span>
              )}
            </h2>
            {profile.location && (
              <p className="text-white/75 text-sm mt-1 font-sans" data-testid="profile-location">
                📍 {profile.location}
              </p>
            )}
          </div>
        </div>

        {/* Info strip below photo */}
        <div className="px-5 py-4 flex items-center justify-between bg-white">
          {intention && (
            <span
              className="flex items-center gap-1.5 text-sm text-primary/70 font-sans"
              data-testid="profile-intention"
            >
              <span className="text-base">{intention.emoji}</span>
              {intention.label}
            </span>
          )}
          {sharedHobbies.length > 0 && (
            <span
              className="text-xs font-medium text-accent bg-accent/8 rounded-full px-3 py-1"
              data-testid="profile-shared-hobbies"
            >
              {sharedHobbies.length} gedeelde hobby&apos;s
            </span>
          )}
        </div>

        {/* Swipe overlays */}
        <motion.div
          className="absolute inset-0 rounded-3xl border-4 border-success bg-success/10 flex items-start justify-start p-6"
          style={{ opacity: rightOpacity }}
          data-testid="overlay-like"
        >
          <span className="text-4xl font-bold text-success font-heading rotate-[-15deg] border-4 border-success rounded-xl px-3 py-1">
            LIKE
          </span>
        </motion.div>

        <motion.div
          className="absolute inset-0 rounded-3xl border-4 border-danger bg-danger/10 flex items-start justify-end p-6"
          style={{ opacity: leftOpacity }}
          data-testid="overlay-pass"
        >
          <span className="text-4xl font-bold text-danger font-heading rotate-[15deg] border-4 border-danger rounded-xl px-3 py-1">
            PASS
          </span>
        </motion.div>

        <motion.div
          className="absolute inset-0 rounded-3xl border-4 border-mustard bg-mustard/10 flex items-start justify-center pt-6"
          style={{ opacity: upOpacity }}
          data-testid="overlay-superlike"
        >
          <span className="text-4xl font-bold text-mustard font-heading border-4 border-mustard rounded-xl px-3 py-1">
            SUPER
          </span>
        </motion.div>
      </div>
    </motion.div>
  )
}

// ── DiscoverClient ────────────────────────────────────────────────────────────

export default function DiscoverClient({ profiles }: DiscoverClientProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [matchedProfile, setMatchedProfile] = useState<Profile | null>(null)
  const [matchId, setMatchId] = useState<string>('')
  const [isAnimating, setIsAnimating] = useState(false)

  const currentProfile = profiles[currentIndex] ?? null
  const isDone = currentIndex >= profiles.length

  const handleSwipe = useCallback(
    async (direction: DiscoverDirection) => {
      if (isAnimating || !currentProfile) return
      setIsAnimating(true)

      const { match } = await recordSwipe(currentProfile.id, direction)

      if (match) {
        setMatchedProfile(currentProfile)
        setMatchId(match.id)
      }

      setCurrentIndex((prev) => prev + 1)
      setIsAnimating(false)
    },
    [isAnimating, currentProfile]
  )

  // Keyboard support
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (isDone || isAnimating) return
      if (e.key === 'ArrowRight') handleSwipe('like')
      else if (e.key === 'ArrowLeft') handleSwipe('pass')
      else if (e.key === 'ArrowUp') handleSwipe('superlike')
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isDone, isAnimating, handleSwipe])

  if (isDone) {
    return (
      <main
        className="min-h-screen flex items-center justify-center px-4"
        data-testid="discover-done"
      >
        <div className="text-center max-w-sm">
          <p className="text-5xl mb-6">🌿</p>
          <h2 className="font-heading text-2xl font-bold text-primary mb-3">
            Dat was het voor nu!
          </h2>
          <p className="text-primary/60 text-sm leading-relaxed">
            Je hebt alle profielen bekeken. Kom later terug voor nieuwe gezichten.
          </p>
        </div>
      </main>
    )
  }

  return (
    <>
      <main
        className="min-h-screen flex flex-col items-center justify-center px-4 py-6 bg-cream"
        data-testid="discover-page"
      >
        {/* Card stack */}
        <div
          className="relative w-full"
          style={{ maxWidth: '85vw', maxHeight: '80vh' }}
          data-testid="card-stack"
        >
          {/* Render next card behind as peek */}
          {profiles[currentIndex + 1] && (
            <ProfileCard
              key={profiles[currentIndex + 1].id + '-behind'}
              profile={profiles[currentIndex + 1]}
              myHobbies={[]}
              onSwipe={() => {}}
              isTop={false}
            />
          )}
          {/* Current card */}
          <ProfileCard
            key={currentProfile.id}
            profile={currentProfile}
            myHobbies={[]}
            onSwipe={handleSwipe}
            isTop={true}
          />
        </div>

        {/* Action buttons */}
        <div
          className="flex items-center gap-6 mt-8"
          data-testid="action-buttons"
        >
          {/* Pass */}
          <button
            data-testid="btn-pass"
            onClick={() => handleSwipe('pass')}
            disabled={isAnimating}
            aria-label="Niet interessant"
            className="w-14 h-14 rounded-full bg-white border-2 border-danger/30 text-danger text-xl shadow-md hover:border-danger hover:shadow-lg transition-all disabled:opacity-40 flex items-center justify-center"
          >
            ✕
          </button>

          {/* Super like */}
          <button
            data-testid="btn-superlike"
            onClick={() => handleSwipe('superlike')}
            disabled={isAnimating}
            aria-label="Super like"
            className="w-12 h-12 rounded-full bg-white border-2 border-mustard/30 text-mustard text-lg shadow-md hover:border-mustard hover:shadow-lg transition-all disabled:opacity-40 flex items-center justify-center"
          >
            ★
          </button>

          {/* Like */}
          <button
            data-testid="btn-like"
            onClick={() => handleSwipe('like')}
            disabled={isAnimating}
            aria-label="Like"
            className="w-14 h-14 rounded-full bg-white border-2 border-success/30 text-success text-xl shadow-md hover:border-success hover:shadow-lg transition-all disabled:opacity-40 flex items-center justify-center"
          >
            ♥
          </button>
        </div>

        {/* Keyboard hint */}
        <p className="mt-4 text-xs text-primary/30 font-sans" data-testid="keyboard-hint">
          ← Pas &nbsp;·&nbsp; ↑ Super &nbsp;·&nbsp; → Like
        </p>
      </main>

      {/* Match popup */}
      {matchedProfile && (
        <MatchPopup
          profile={matchedProfile}
          matchId={matchId}
          onClose={() => setMatchedProfile(null)}
        />
      )}
    </>
  )
}
