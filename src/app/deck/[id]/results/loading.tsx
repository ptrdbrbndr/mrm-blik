export default function ResultsLoading() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <div className="h-3 w-28 animate-pulse rounded bg-primary/10" />
      <div className="mt-4 h-8 w-72 animate-pulse rounded-lg bg-primary/10" />
      <div className="mt-1 h-4 w-40 animate-pulse rounded bg-primary/5" />
      <div className="mt-8 space-y-4" data-testid="results-skeleton">
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-7 w-16 animate-pulse rounded-full bg-primary/10" />
          ))}
        </div>
        <div className="rounded-xl border border-primary/10 overflow-hidden">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex gap-4 border-t border-primary/5 px-4 py-4">
              <div className="h-4 w-6 animate-pulse rounded bg-primary/5" />
              <div className="h-4 w-40 animate-pulse rounded bg-primary/10" />
              <div className="ml-auto h-5 w-12 animate-pulse rounded-full bg-success/10" />
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
