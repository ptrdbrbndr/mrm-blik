'use client'

import { useState, useRef } from 'react'
import { importCardsFromCSV } from '@/lib/actions/card'
import type { Card } from '@/types/database'

interface CSVImportProps {
  deckId: string
  onImport: (newCards: Card[]) => void
}

export default function CSVImport({ deckId, onImport }: CSVImportProps) {
  const [importing, setImporting] = useState(false)
  const [showPaste, setShowPaste] = useState(false)
  const [pasteText, setPasteText] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setImporting(true)
    try {
      const text = await file.text()
      const cards = await importCardsFromCSV(deckId, text)
      onImport(cards)
    } catch (err) {
      console.error('CSV import failed:', err)
    }
    setImporting(false)
  }

  async function handlePaste() {
    if (!pasteText.trim()) return
    setImporting(true)
    try {
      const cards = await importCardsFromCSV(deckId, pasteText)
      onImport(cards)
      setPasteText('')
      setShowPaste(false)
    } catch (err) {
      console.error('CSV import failed:', err)
    }
    setImporting(false)
  }

  return (
    <div className="rounded-xl border border-primary/10 bg-white p-5" data-testid="csv-import">
      <h3 className="text-sm font-semibold text-primary/80">CSV Importeren</h3>
      <p className="mt-1 text-xs text-primary/40">
        Format: titel, beschrijving, categorie (epic/feature/bug/tech-debt), effort (S/M/L/XL)
      </p>

      <div className="mt-3 flex gap-2">
        <input
          ref={fileRef}
          type="file"
          accept=".csv,.txt"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFile(file)
          }}
          data-testid="csv-file-input"
        />
        <button
          onClick={() => fileRef.current?.click()}
          disabled={importing}
          className="rounded-lg border border-primary/15 px-4 py-2 text-xs font-medium text-primary/60 hover:border-primary/30 transition-colors disabled:opacity-40"
          data-testid="csv-file-button"
        >
          Bestand kiezen
        </button>
        <button
          onClick={() => setShowPaste(!showPaste)}
          className="rounded-lg border border-primary/15 px-4 py-2 text-xs font-medium text-primary/60 hover:border-primary/30 transition-colors"
          data-testid="csv-paste-toggle"
        >
          Plakken
        </button>
      </div>

      {showPaste && (
        <div className="mt-3 space-y-2">
          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            rows={5}
            placeholder={"Dark mode, Gebruikers willen dark mode, feature, M\nExport PDF, Rapporten als PDF downloaden, feature, S"}
            className="block w-full rounded-lg border border-primary/15 bg-cream px-3 py-2 text-xs font-mono placeholder:text-primary/25 focus:border-accent focus:outline-none resize-none"
            data-testid="csv-paste-area"
          />
          <button
            onClick={handlePaste}
            disabled={importing || !pasteText.trim()}
            className="rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-40"
            data-testid="csv-paste-import"
          >
            {importing ? 'Importeren...' : 'Importeer'}
          </button>
        </div>
      )}
    </div>
  )
}
