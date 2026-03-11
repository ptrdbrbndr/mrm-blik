export default function DashboardLoading() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <div className="flex items-center justify-between">
        <div className="h-9 w-40 animate-pulse rounded-lg bg-primary/10" />
        <div className="h-10 w-32 animate-pulse rounded-xl bg-accent/20" />
      </div>
      <div className="mt-8 grid gap-4" data-testid="dashboard-skeleton">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-primary/10 bg-white p-6"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="h-5 w-48 animate-pulse rounded bg-primary/10" />
                <div className="h-4 w-72 animate-pulse rounded bg-primary/5" />
              </div>
              <div className="h-6 w-16 animate-pulse rounded-full bg-primary/10" />
            </div>
            <div className="mt-3 h-3 w-24 animate-pulse rounded bg-primary/5" />
          </div>
        ))}
      </div>
    </main>
  )
}
