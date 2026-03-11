export type DeckStatus = 'draft' | 'active' | 'closed'
export type SwipeDirection = 'left' | 'right' | 'up'
export type CardCategory = 'epic' | 'feature' | 'bug' | 'tech-debt'
export type CardEffort = 'S' | 'M' | 'L' | 'XL'

export interface Workspace {
  id: string
  name: string
  slug: string
  owner_id: string
  created_at: string
}

export interface Deck {
  id: string
  workspace_id: string
  title: string
  description: string | null
  status: DeckStatus
  share_token: string
  deadline: string | null
  created_by: string
  created_at: string
}

export interface Card {
  id: string
  deck_id: string
  title: string
  description: string | null
  category: CardCategory | null
  effort: CardEffort | null
  image_url: string | null
  position: number
  created_at: string
}

export interface Swipe {
  id: string
  card_id: string
  deck_id: string
  user_id: string | null
  session_id: string | null
  direction: SwipeDirection
  created_at: string
}

export interface DeckSummary {
  id: string
  deck_id: string
  content: {
    markdown: string
    priorities: string[]
    conflicts: string[]
  }
  model: string
  created_at: string
}

export interface DeckWithCards extends Deck {
  cards: Card[]
}

export interface CardWithScore extends Card {
  score: number
  swipe_count: number
  right_count: number
  left_count: number
  up_count: number
}

// ─── Dating app ───────────────────────────────────────────────────────────────

export type Intention = 'plezier' | 'casual' | 'relatie' | 'vriendschap'
export type Gender = 'man' | 'vrouw' | 'non-binair' | 'anders'
export type DiscoverDirection = 'like' | 'pass' | 'superlike'

export interface Profile {
  id: string
  display_name: string | null
  birth_year: number | null
  gender: Gender | null
  location: string | null
  hobbies: string[]
  looking_for: string | null
  intention: Intention | null
  avatar_url: string | null
  age_min: number
  age_max: number
  gender_preference: string[]
  onboarding_done: boolean
  created_at: string
  updated_at: string
}

export interface Match {
  id: string
  user_a: string
  user_b: string
  is_super: boolean
  created_at: string
}

export interface MatchWithProfile extends Match {
  profile: Profile
  last_message?: string | null
  unread_count?: number
}

export interface Conversation {
  id: string
  match_id: string
  created_at: string
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string | null
  content: string
  read_at: string | null
  created_at: string
}

export interface ConversationWithDetails extends Conversation {
  match: Match
  other_profile: Profile
  last_message: Message | null
  unread_count: number
}
