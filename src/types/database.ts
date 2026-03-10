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
