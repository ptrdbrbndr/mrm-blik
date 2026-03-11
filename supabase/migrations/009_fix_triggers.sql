-- Verwijder de workspace-trigger die user-aanmaak blokkeert
-- (workspace-functionaliteit is legacy, niet nodig voor de dating app)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS create_default_workspace();
