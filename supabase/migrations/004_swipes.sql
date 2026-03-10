-- Swipes: stem van een deelnemer op een kaart
CREATE TABLE swipes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id     UUID REFERENCES cards(id) ON DELETE CASCADE NOT NULL,
  deck_id     UUID REFERENCES decks(id) ON DELETE CASCADE NOT NULL,
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id  TEXT,  -- voor anonieme swipes
  direction   TEXT NOT NULL CHECK (direction IN ('left', 'right', 'up')),
  created_at  TIMESTAMPTZ DEFAULT now(),
  -- Een persoon kan maar 1x per kaart swipen
  UNIQUE(card_id, user_id),
  UNIQUE(card_id, session_id)
);

CREATE INDEX idx_swipes_deck ON swipes(deck_id);
CREATE INDEX idx_swipes_card ON swipes(card_id);

-- RLS
ALTER TABLE swipes ENABLE ROW LEVEL SECURITY;

-- Iedereen mag swipen op actieve decks (insert-only)
CREATE POLICY "Anyone can swipe on active decks"
  ON swipes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM decks
      WHERE decks.id = swipes.deck_id
      AND decks.status = 'active'
    )
  );

-- Deck-eigenaar kan swipes lezen
CREATE POLICY "Deck owner reads swipes"
  ON swipes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM decks
      WHERE decks.id = swipes.deck_id
      AND decks.created_by = auth.uid()
    )
  );

-- AI samenvatting tabel
CREATE TABLE deck_summaries (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id     UUID REFERENCES decks(id) ON DELETE CASCADE NOT NULL,
  content     JSONB NOT NULL,
  model       TEXT DEFAULT 'claude-sonnet-4-6',
  created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE deck_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Deck owner manages summaries"
  ON deck_summaries FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM decks
      WHERE decks.id = deck_summaries.deck_id
      AND decks.created_by = auth.uid()
    )
  );
