-- Swipes tussen gebruikers (discover)
CREATE TABLE discover_swipes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  swiper_id   UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  target_id   UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  direction   TEXT NOT NULL CHECK (direction IN ('like', 'pass', 'superlike')),
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(swiper_id, target_id)
);

CREATE INDEX idx_discover_swipes_swiper ON discover_swipes(swiper_id);
CREATE INDEX idx_discover_swipes_target ON discover_swipes(target_id);

ALTER TABLE discover_swipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own swipes"
  ON discover_swipes FOR ALL
  USING (auth.uid() = swiper_id);

-- Matches: wederzijdse likes
CREATE TABLE matches (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a      UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user_b      UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  is_super    BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_a, user_b),
  CHECK (user_a < user_b)
);

CREATE INDEX idx_matches_user_a ON matches(user_a);
CREATE INDEX idx_matches_user_b ON matches(user_b);

ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see their own matches"
  ON matches FOR SELECT
  USING (auth.uid() = user_a OR auth.uid() = user_b);

-- Trigger: bij een like checken of de ander ook geliket heeft → match aanmaken
CREATE OR REPLACE FUNCTION check_for_match()
RETURNS TRIGGER AS $$
DECLARE
  other_swipe discover_swipes%ROWTYPE;
  uid_a UUID;
  uid_b UUID;
BEGIN
  IF NEW.direction NOT IN ('like', 'superlike') THEN
    RETURN NEW;
  END IF;

  SELECT * INTO other_swipe
  FROM discover_swipes
  WHERE swiper_id = NEW.target_id
    AND target_id = NEW.swiper_id
    AND direction IN ('like', 'superlike');

  IF FOUND THEN
    -- Zorg dat user_a < user_b (voor UNIQUE constraint)
    IF NEW.swiper_id < NEW.target_id THEN
      uid_a := NEW.swiper_id;
      uid_b := NEW.target_id;
    ELSE
      uid_a := NEW.target_id;
      uid_b := NEW.swiper_id;
    END IF;

    INSERT INTO matches (user_a, user_b, is_super)
    VALUES (uid_a, uid_b, NEW.direction = 'superlike' OR other_swipe.direction = 'superlike')
    ON CONFLICT (user_a, user_b) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_discover_swipe
  AFTER INSERT ON discover_swipes
  FOR EACH ROW EXECUTE FUNCTION check_for_match();
