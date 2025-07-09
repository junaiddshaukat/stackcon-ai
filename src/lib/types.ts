export interface User {
  id: string
  email: string
  role: 'user' | 'admin'
  created_at: string
  updated_at: string
}

export type ResourceType = 'template' | 'component' | 'repository' | 'ui_library'
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded'

export interface Resource {
  id: string
  name: string
  description: string
  tags: string[]
  resource_type: ResourceType
  source: string // 'shadcn', 'originui', 'github', etc.
  screenshot_url?: string
  demo_url?: string
  repo_url?: string
  npm_package?: string
  documentation_url?: string
  license?: string
  stars: number
  downloads: number
  framework: string[] // ['react', 'vue', 'angular', etc.]
  styling: string[] // ['tailwind', 'css', 'styled-components', etc.]
  embedding?: number[]
  is_featured: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface SearchQuery {
  id: string
  user_id?: string
  query: string
  matched_resource_ids: string[]
  search_embedding?: number[]
  results_count: number
  created_at: string
}

export interface Payment {
  id: string
  user_id: string
  amount: number // in cents
  currency: string
  status: PaymentStatus
  lemon_squeezy_id?: string
  subscription_id?: string
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  description?: string
  parent_id?: string
  created_at: string
}

export interface SearchResult {
  resource: Resource
  similarity_score: number
  categories?: Category[]
}

export interface SearchResponse {
  results: Resource[]
  total: number
  query?: string
  user_searches_remaining?: number
}

export interface UserFavorite {
  user_id: string
  resource_id: string
  created_at: string
}

// API request/response types
export interface SearchRequest {
  query: string
  resource_types?: ResourceType[]
  frameworks?: string[]
  styling?: string[]
  limit?: number
  offset?: number
}

export interface EmbeddingRequest {
  text: string
  model?: 'openai' | 'gemini'
}

export interface EmbeddingResponse {
  embedding: number[]
  model: string
  tokens_used: number
} 