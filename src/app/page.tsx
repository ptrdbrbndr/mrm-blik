import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="max-w-2xl text-center">
        <h1
          className="font-heading text-5xl font-bold tracking-tight text-primary sm:text-6xl"
          data-testid="hero-title"
        >
          MRM-Blik
        </h1>
        <p className="mt-2 text-lg text-accent font-medium" data-testid="hero-subtitle">
          Miracle Roadmap Tinder
        </p>
        <p className="mt-6 text-lg text-primary/70 leading-relaxed">
          Swipe je weg naar de perfecte productroadmap.
          Verzamel in 5 minuten de prioriteiten van je hele team —
          zonder vergadering, zonder spreadsheet.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="rounded-xl bg-primary px-8 py-3 text-base font-semibold text-white shadow-sm hover:bg-primary-light transition-colors"
            data-testid="cta-dashboard"
          >
            Start een deck
          </Link>
          <Link
            href="/login"
            className="rounded-xl border-2 border-primary/20 px-8 py-3 text-base font-semibold text-primary hover:border-primary/40 transition-colors"
            data-testid="cta-login"
          >
            Inloggen
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 text-left">
          <div data-testid="feature-create">
            <h3 className="font-heading font-semibold text-lg">1. Maak een deck</h3>
            <p className="mt-2 text-sm text-primary/60">
              Voeg je roadmap-items toe als kaarten. Importeer vanuit CSV of typ ze handmatig.
            </p>
          </div>
          <div data-testid="feature-swipe">
            <h3 className="font-heading font-semibold text-lg">2. Deel &amp; swipe</h3>
            <p className="mt-2 text-sm text-primary/60">
              Stuur een link naar je team. Iedereen swipet: rechts = ja, links = nee, omhoog = must-have.
            </p>
          </div>
          <div data-testid="feature-results">
            <h3 className="font-heading font-semibold text-lg">3. Bekijk resultaten</h3>
            <p className="mt-2 text-sm text-primary/60">
              Zie direct de heatmap, ranking en AI-samenvatting van jullie collectieve prioriteiten.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
