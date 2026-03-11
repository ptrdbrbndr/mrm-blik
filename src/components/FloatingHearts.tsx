'use client'

const heartPath = "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"

export { heartPath }

const hearts = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  left: ((i * 37 + 13) % 100),
  delay: ((i * 2.7) % 8),
  size: 10 + ((i * 7) % 18),
  duration: 6 + ((i * 3) % 8),
  opacity: 0.06 + ((i * 0.012) % 0.1),
}))

export default function FloatingHearts() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {hearts.map((h) => (
        <svg
          key={h.id}
          viewBox="0 0 24 24"
          className="absolute -bottom-8"
          style={{
            left: `${h.left}%`,
            width: h.size,
            height: h.size,
            fill: '#A0526B',
            opacity: h.opacity,
            animation: `floatUp ${h.duration}s ease-in-out ${h.delay}s infinite`,
          }}
        >
          <path d={heartPath} />
        </svg>
      ))}
    </div>
  )
}
