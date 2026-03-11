'use client'

export default function BackButton() {
  return (
    <button
      data-testid="profiel-ander-terug"
      onClick={() => window.history.back()}
      className="flex items-center gap-1.5 text-sm font-medium text-primary/60 hover:text-primary transition-colors"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
      </svg>
      Terug
    </button>
  )
}
