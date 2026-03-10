-- Decks: een set roadmap-items om over te swipen
CREATE TABLE decks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  title         TEXT NOT NULL,
  description   TEXT,
  status        TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'closed')),
  share_token   TEXT UNIQUE NOT NULL,
  deadline      TIMESTAMPTZ,
  created_by    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_decks_workspace ON decks(workspace_id);
CREATE INDEX idx_decks_share_token ON decks(share_token);

-- RLS
ALTER TABLE decks ENABLE ROW LEVEL SECURITY;

-- Eigenaar kan alles met eigen decks
CREATE POLICY "Owners manage decks"
  ON decks FOR ALL
  USING (auth.uid() = created_by);

-- Iedereen kan actieve decks lezen via share_token (voor swipe-interface)
CREATE POLICY "Anyone can read active decks by token"
  ON decks FOR SELECT
  USING (status = 'active');
