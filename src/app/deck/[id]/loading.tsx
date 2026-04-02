export default function DeckDetailLoading() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <div className="h-3 w-32 animate-pulse rounded bg-primary/10" />
      <div className="mt-4 space-y-3">
        <div className="h-7 w-64 animate-pulse rounded-lg bg-primary/10" />
        <div className="h-4 w-96 animate-pulse rounded bg-primary/5" />
      </div>
      <div className="mt-6 flex gap-3">
        <div className="h-7 w-16 animate-pulse rounded-full bg-primary/10" />
        <div className="h-7 w-20 animate-pulse rounded-full bg-primary/5" />
      </div>
      <div className="mt-8 space-y-3" data-testid="deck-detail-skeleton">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border border-primary/10 bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="h-6 w-6 animate-pulse rounded-full bg-primary/10" />
              <div className="h-4 w-48 animate-pulse rounded bg-primary/10" />
              <div className="h-5 w-14 animate-pulse rounded-full bg-accent/10" />
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
