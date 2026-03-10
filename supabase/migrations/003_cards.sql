-- Cards: individuele roadmap-items / feature-kaarten
CREATE TABLE cards (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id     UUID REFERENCES decks(id) ON DELETE CASCADE NOT NULL,
  title       TEXT NOT NULL,
  description TEXT,
  category    TEXT CHECK (category IN ('epic', 'feature', 'bug', 'tech-debt')),
  effort      TEXT CHECK (effort IN ('S', 'M', 'L', 'XL')),
  image_url   TEXT,
  position    INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_cards_deck ON cards(deck_id);

-- RLS
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

-- Deck-eigenaar beheert kaarten
CREATE POLICY "Deck owner manages cards"
  ON cards FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM decks
      WHERE decks.id = cards.deck_id
      AND decks.created_by = auth.uid()
    )
  );

-- Iedereen kan kaarten lezen van actieve decks (voor swipe)
CREATE POLICY "Anyone can read cards of active decks"
  ON cards FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM decks
      WHERE decks.id = cards.deck_id
      AND decks.status = 'active'
    )
  );
