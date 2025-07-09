import OpenAI from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { EmbeddingRequest, EmbeddingResponse } from './types'

// Initialize AI clients
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!)

/**
 * Generate embeddings using OpenAI
 */
export async function generateOpenAIEmbedding(text: string): Promise<EmbeddingResponse> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text,
    })

    return {
      embedding: response.data[0].embedding,
      model: 'openai-ada-002',
      tokens_used: response.usage.total_tokens,
    }
  } catch (error) {
    console.error('OpenAI embedding error:', error)
    throw new Error('Failed to generate OpenAI embedding')
  }
}

/**
 * Generate embeddings using Gemini
 */
export async function generateGeminiEmbedding(text: string): Promise<EmbeddingResponse> {
  try {
    const model = genAI.getGenerativeModel({ model: 'embedding-001' })
    const result = await model.embedContent(text)
    
    return {
      embedding: result.embedding.values,
      model: 'gemini-embedding-001',
      tokens_used: 0, // Gemini doesn't provide token count for embeddings
    }
  } catch (error) {
    console.error('Gemini embedding error:', error)
    throw new Error('Failed to generate Gemini embedding')
  }
}

/**
 * Generate embedding with fallback between OpenAI and Gemini
 */
export async function generateEmbedding(request: EmbeddingRequest): Promise<EmbeddingResponse> {
  const { text, model = 'openai' } = request

  // Clean and prepare text
  const cleanText = text.trim().slice(0, 8000) // Limit text length

  try {
    if (model === 'openai') {
      return await generateOpenAIEmbedding(cleanText)
    } else if (model === 'gemini') {
      return await generateGeminiEmbedding(cleanText)
    } else {
      throw new Error(`Unsupported model: ${model}`)
    }
  } catch (error) {
    // Fallback to the other model if the primary fails
    console.warn(`Primary model ${model} failed, trying fallback`)
    
    if (model === 'openai') {
      return await generateGeminiEmbedding(cleanText)
    } else {
      return await generateOpenAIEmbedding(cleanText)
    }
  }
}

/**
 * Extract tags and keywords from user query using OpenAI
 */
export async function extractTagsFromQuery(query: string): Promise<string[]> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a helpful assistant that extracts relevant tags and keywords from user queries about UI components, templates, and libraries. 
          
          Return only a JSON array of lowercase strings representing tags, frameworks, use cases, and technologies mentioned or implied in the query.
          
          Examples:
          - "dashboard with charts" → ["dashboard", "charts", "analytics", "admin", "data-visualization"]
          - "e-commerce product page" → ["ecommerce", "product", "shopping", "cart", "store"]
          - "login form with validation" → ["login", "form", "validation", "auth", "authentication"]`
        },
        {
          role: 'user',
          content: query
        }
      ],
      max_tokens: 200,
      temperature: 0.3,
    })

    const content = response.choices[0]?.message?.content
    if (!content) return []

    try {
      const tags = JSON.parse(content)
      return Array.isArray(tags) ? tags.slice(0, 10) : []
    } catch {
      // If JSON parsing fails, extract words manually
      return extractKeywordsManually(query)
    }
  } catch (error) {
    console.error('Tag extraction error:', error)
    return extractKeywordsManually(query)
  }
}

/**
 * Fallback manual keyword extraction
 */
function extractKeywordsManually(query: string): string[] {
  const commonWords = new Set(['a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should'])
  
  const keywords = query
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !commonWords.has(word))
    .slice(0, 8)

  return keywords
}

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have the same length')
  }

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i]
    normA += vecA[i] * vecA[i]
    normB += vecB[i] * vecB[i]
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

/**
 * Format query for better embedding results
 */
export function formatQueryForEmbedding(query: string): string {
  // Add context to improve embedding quality
  return `UI component or template for: ${query.trim()}`
} 