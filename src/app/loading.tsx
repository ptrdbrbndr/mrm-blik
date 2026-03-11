export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-3" data-testid="loading-spinner">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/20 border-t-accent" />
        <p className="text-sm text-primary/40">Laden...</p>
      </div>
    </main>
  )
}
