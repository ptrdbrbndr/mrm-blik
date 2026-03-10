'use client'

import { motion, useMotionValue, useTransform, type PanInfo } from 'framer-motion'
import type { Card, SwipeDirection } from '@/types/database'

interface SwipeCardProps {
  card: Card
  onSwipe: (direction: SwipeDirection) => void
  isTop: boolean
}

const SWIPE_THRESHOLD = 100
const SWIPE_UP_THRESHOLD = -80

export default function SwipeCard({ card, onSwipe, isTop }: SwipeCardProps) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const rotate = useTransform(x, [-200, 200], [-15, 15])
  const opacity = useTransform(
    x,
    [-200, -100, 0, 100, 200],
    [0.5, 0.8, 1, 0.8, 0.5]
  )

  // Overlay opacities
  const rightOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1])
  const leftOpacity = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0])
  const upOpacity = useTransform(y, [SWIPE_UP_THRESHOLD, 0], [1, 0])

  function handleDragEnd(_: unknown, info: PanInfo) {
    const { offset } = info

    if (offset.y < SWIPE_UP_THRESHOLD && Math.abs(offset.x) < SWIPE_THRESHOLD) {
      onSwipe('up')
    } else if (offset.x > SWIPE_THRESHOLD) {
      onSwipe('right')
    } else if (offset.x < -SWIPE_THRESHOLD) {
      onSwipe('left')
    }
  }

  const categoryColors: Record<string, string> = {
    epic: 'bg-purple-100 text-purple-700',
    feature: 'bg-accent/10 text-accent',
    bug: 'bg-danger/10 text-danger',
    'tech-debt': 'bg-primary/10 text-primary/60',
  }

  return (
    <motion.div
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
      style={{
        x,
        y,
        rotate,
        opacity,
        zIndex: isTop ? 10 : 0,
        pointerEvents: isTop ? 'auto' : 'none',
      }}
      drag={isTop}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={1}
      onDragEnd={handleDragEnd}
      data-testid="swipe-card"
    >
      <div className="relative h-full w-full rounded-3xl border border-primary/10 bg-white shadow-xl p-8 flex flex-col">
        {/* Swipe overlays */}
        <motion.div
          className="absolute inset-0 rounded-3xl border-4 border-success bg-success/5 flex items-center justify-center"
          style={{ opacity: rightOpacity }}
          data-testid="overlay-right"
        >
          <span className="text-6xl font-bold text-success rotate-[-15deg]">JA</span>
        </motion.div>

        <motion.div
          className="absolute inset-0 rounded-3xl border-4 border-danger bg-danger/5 flex items-center justify-center"
          style={{ opacity: leftOpacity }}
          data-testid="overlay-left"
        >
          <span className="text-6xl font-bold text-danger rotate-[15deg]">NEE</span>
        </motion.div>

        <motion.div
          className="absolute inset-0 rounded-3xl border-4 border-mustard bg-mustard/5 flex items-center justify-center"
          style={{ opacity: upOpacity }}
          data-testid="overlay-up"
        >
          <span className="text-5xl font-bold text-mustard">MUST-HAVE</span>
        </motion.div>

        {/* Card content */}
        <div className="relative z-10 flex flex-col flex-1">
          <div className="flex items-center gap-2">
            {card.category && (
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${categoryColors[card.category] || 'bg-primary/5 text-primary/50'}`}
                data-testid="card-category"
              >
                {card.category}
              </span>
            )}
            {card.effort && (
              <span
                className="rounded-full bg-primary/5 px-3 py-1 text-xs font-medium text-primary/50"
                data-testid="card-effort"
              >
                {card.effort}
              </span>
            )}
          </div>

          <h2
            className="mt-6 font-heading text-2xl font-bold text-primary leading-tight"
            data-testid="card-title"
          >
            {card.title}
          </h2>

          {card.description && (
            <p
              className="mt-4 text-base text-primary/60 leading-relaxed flex-1"
              data-testid="card-description"
            >
              {card.description}
            </p>
          )}

          <div className="mt-auto pt-6 flex justify-center gap-8 text-xs text-primary/30">
            <span>&larr; Nee</span>
            <span>&uarr; Must-have</span>
            <span>Ja &rarr;</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
