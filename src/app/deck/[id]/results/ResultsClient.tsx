'use client'

import { useState } from 'react'
import type { CardWithScore } from '@/types/database'
import { generateSummary } from '@/lib/actions/ai'
import RealtimeSwipeCount from '@/components/RealtimeSwipeCount'

interface ResultsClientProps {
  deckId: string
  deckTitle: string
  cards: CardWithScore[]
  participants: number
  totalSwipes: number
  existingSummary: { markdown: string; priorities: string[]; conflicts: string[] } | null
}

const categoryFilter = ['all', 'epic', 'feature', 'bug', 'tech-debt'] as const

export default function ResultsClient({
  deckId,
  deckTitle,
  cards,
  participants,
  totalSwipes,
  existingSummary,
}: ResultsClientProps) {
  const [filter, setFilter] = useState<string>('all')
  const [summary, setSummary] = useState(existingSummary)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const filteredCards = filter === 'all' ? cards : cards.filter((c) => c.category === filter)

  function scoreColor(score: number): string {
    if (score >= 0.7) return 'bg-success/20 text-success'
    if (score >= 0.4) return 'bg-mustard/20 text-mustard'
    return 'bg-danger/20 text-danger'
  }

  function heatmapBg(score: number): string {
    if (score >= 0.7) return 'bg-success/10'
    if (score >= 0.4) return 'bg-mustard/5'
    return 'bg-danger/5'
  }

  async function handleGenerate() {
    setGenerating(true)
    setError(null)
    try {
      const result = await generateSummary(deckId, deckTitle, cards, participants)
      setSummary(result.content as { markdown: string; priorities: string[]; conflicts: string[] })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fout bij genereren')
    }
    setGenerating(false)
  }

  function exportCSV() {
    const header = 'Positie,Titel,Score%,Ja,Must-have,Nee,Categorie,Effort\n'
    const rows = filteredCards
      .map((c, i) =>
        `${i + 1},"${c.title}",${Math.round(c.score * 100)},${c.right_count},${c.up_count},${c.left_count},${c.category || ''},${c.effort || ''}`
      )
      .join('\n')

    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${deckTitle.replace(/[^a-z0-9]/gi, '-')}-resultaten.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="mt-8 space-y-8">
      {/* Realtime counter */}
      <RealtimeSwipeCount
        deckId={deckId}
        initialCount={totalSwipes}
        initialParticipants={participants}
      />

      {/* Filter + Export bar */}
      <div className="flex flex-wrap items-center gap-2">
        {categoryFilter.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              filter === cat
                ? 'bg-primary text-white'
                : 'bg-primary/5 text-primary/50 hover:bg-primary/10'
            }`}
            data-testid={`filter-${cat}`}
          >
            {cat === 'all' ? 'Alles' : cat}
          </button>
        ))}
        <button
          onClick={exportCSV}
          className="ml-auto rounded-lg border border-primary/15 px-4 py-1.5 text-xs font-medium text-primary/50 hover:border-primary/30 transition-colors"
          data-testid="export-csv-button"
        >
          Exporteer CSV
        </button>
      </div>

      {/* Ranking table */}
      <div className="rounded-xl border border-primary/10 overflow-hidden" data-testid="results-table">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-primary/3 text-left text-xs text-primary/50">
              <th className="px-4 py-3 font-medium">#</th>
              <th className="px-4 py-3 font-medium">Item</th>
              <th className="px-4 py-3 font-medium text-center">Score</th>
              <th className="px-4 py-3 font-medium text-center text-success">Ja</th>
              <th className="px-4 py-3 font-medium text-center text-mustard">Must-have</th>
              <th className="px-4 py-3 font-medium text-center text-danger">Nee</th>
              <th className="px-4 py-3 font-medium text-center">Consensus</th>
            </tr>
          </thead>
          <tbody>
            {filteredCards.map((card, index) => {
              const total = card.right_count + card.left_count + card.up_count
              const yesRatio = total > 0 ? (card.right_count + card.up_count) / total : 0
              const isControversial = total >= 2 && yesRatio > 0.3 && yesRatio < 0.7

              return (
                <tr
                  key={card.id}
                  className={`border-t border-primary/5 ${heatmapBg(card.score)}`}
                  data-testid={`result-row-${index}`}
                >
                  <td className="px-4 py-3 text-primary/30 font-mono text-xs">{index + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{card.title}</span>
                      {card.category && (
                        <span className="rounded-full bg-primary/5 px-2 py-0.5 text-xs text-primary/40">
                          {card.category}
                        </span>
                      )}
                      {card.effort && (
                        <span className="text-xs text-primary/30">{card.effort}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-bold ${scoreColor(card.score)}`}>
                      {Math.round(card.score * 100)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-success font-medium">{card.right_count}</td>
                  <td className="px-4 py-3 text-center text-mustard font-medium">{card.up_count}</td>
                  <td className="px-4 py-3 text-center text-danger font-medium">{card.left_count}</td>
                  <td className="px-4 py-3 text-center">
                    {isControversial ? (
                      <span className="text-xs font-medium text-accent" data-testid="controversial-badge">
                        Verdeeld
                      </span>
                    ) : (
                      <span className="text-xs text-primary/30">OK</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* AI Summary */}
      <div className="rounded-xl border border-primary/10 bg-white p-6" data-testid="ai-summary-section">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold text-primary">
            AI Roadmap-advies
          </h2>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="rounded-lg bg-accent px-4 py-1.5 text-xs font-semibold text-white hover:bg-accent-light transition-colors disabled:opacity-40"
            data-testid="generate-summary-button"
          >
            {generating ? 'Analyseren...' : summary ? 'Opnieuw genereren' : 'Genereer advies'}
          </button>
        </div>

        {error && (
          <p className="mt-3 text-sm text-danger" data-testid="summary-error">{error}</p>
        )}

        {summary ? (
          <div
            className="mt-4 prose prose-sm max-w-none text-primary/80"
            data-testid="summary-content"
            dangerouslySetInnerHTML={{ __html: markdownToHtml(summary.markdown) }}
          />
        ) : (
          <p className="mt-4 text-sm text-primary/40" data-testid="summary-placeholder">
            Klik op &ldquo;Genereer advies&rdquo; om een AI-samenvatting te krijgen op basis van de swipe-resultaten.
          </p>
        )}
      </div>
    </div>
  )
}

// Simple markdown to HTML (bold, headers, lists)
function markdownToHtml(md: string): string {
  return md
    .replace(/^### (.+)$/gm, '<h3 class="font-heading font-semibold text-base mt-4 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="font-heading font-semibold text-lg mt-6 mb-2">$1</h2>')
    .replace(/^\*\*(.+?)\*\*/gm, '<strong>$1</strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.+)$/gm, '<li class="ml-4">$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4"><span class="font-medium">$1.</span> $2</li>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>')
}
