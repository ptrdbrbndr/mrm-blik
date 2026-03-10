import { createDeck } from '@/lib/actions/deck'

export default function NewDeckPage() {
  return (
    <main className="mx-auto max-w-xl px-4 py-12">
      <h1
        className="font-heading text-3xl font-bold text-primary"
        data-testid="new-deck-title"
      >
        Nieuw deck
      </h1>
      <p className="mt-2 text-primary/60 text-sm">
        Geef je deck een naam en optionele beschrijving. Kaarten voeg je hierna toe.
      </p>

      <form action={createDeck} className="mt-8 space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-primary/80">
            Titel *
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            placeholder="Sprint 12 Prioritering"
            className="mt-1 block w-full rounded-lg border border-primary/20 bg-white px-4 py-3 text-sm placeholder:text-primary/30 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            data-testid="deck-title-input"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-primary/80">
            Beschrijving
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            placeholder="Waar gaat dit deck over?"
            className="mt-1 block w-full rounded-lg border border-primary/20 bg-white px-4 py-3 text-sm placeholder:text-primary/30 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 resize-none"
            data-testid="deck-description-input"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white hover:bg-accent-light transition-colors"
          data-testid="create-deck-button"
        >
          Deck aanmaken
        </button>
      </form>
    </main>
  )
}
