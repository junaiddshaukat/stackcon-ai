import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function POST(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    let user = null
    let dbUser = null
    
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    // If auth header exists, try to authenticate
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '')
      // Create a Supabase client with the user's token
      const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      })

      // Verify the token by getting the user
      const { data: { user: authUser }, error: authError } = await supabaseAuth.auth.getUser(token)
      if (!authError && authUser) {
        user = authUser
        // Get current user from database, create if doesn't exist
        let { data: userData, error: userError } = await supabaseAuth
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()
        if (userError && userError.code === 'PGRST116') {
          // User doesn't exist, create them
          const { data: newUser, error: createError } = await supabaseAuth
            .from('users')
            .insert({
              id: user.id,
              email: user.email,
              role: 'user'
            })
            .select()
            .single()
          if (!createError) {
            dbUser = newUser
          }
        } else if (!userError) {
          dbUser = userData
        }
      }
    }

    const { query, filters } = await request.json()
    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    // Build the search query (public access)
    let searchQuery = supabase
      .from('resources')
      .select('*')
      .eq('is_active', true)

    // Apply filters
    if (filters?.type && filters.type !== 'all') {
      searchQuery = searchQuery.eq('resource_type', filters.type)
    }
    if (filters?.framework && filters.framework !== 'all') {
      searchQuery = searchQuery.contains('framework', [filters.framework])
    }
    if (filters?.styling && filters.styling !== 'all') {
      searchQuery = searchQuery.contains('styling', [filters.styling])
    }

    // Execute the query
    const { data: resources, error: searchError } = await searchQuery
    if (searchError) {
      return NextResponse.json({ error: 'Search failed' }, { status: 500 })
    }

    // Enhanced text-based search scoring with fuzzy matching and relevance
    const results = (resources || []).map((resource: any) => {
      const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 1)
      const resourceName = resource.name.toLowerCase()
      const resourceDescription = resource.description.toLowerCase()
      const resourceTags = (resource.tags || []).join(' ').toLowerCase()
      const resourceFramework = (resource.framework || []).join(' ').toLowerCase()
      const resourceStyling = (resource.styling || []).join(' ').toLowerCase()
      
      let score = 0
      let exactMatches = 0
      let partialMatches = 0
      let tagMatches = 0
      let frameworkMatches = 0
      
      searchTerms.forEach(term => {
        // Exact name match (highest priority)
        if (resourceName.includes(term)) {
          if (resourceName === term) {
            score += 10 // Perfect name match
            exactMatches += 1
          } else if (resourceName.startsWith(term) || resourceName.endsWith(term)) {
            score += 7 // Name starts/ends with term
            exactMatches += 1
          } else {
            score += 5 // Name contains term
            exactMatches += 1
          }
        }
        
        // Description match
        if (resourceDescription.includes(term)) {
          score += 3
          partialMatches += 1
        }
        
        // Tag match (high relevance)
        if (resourceTags.includes(term)) {
          score += 6
          tagMatches += 1
        }
        
        // Framework match (medium relevance)
        if (resourceFramework.includes(term)) {
          score += 4
          frameworkMatches += 1
        }
        
        // Styling match
        if (resourceStyling.includes(term)) {
          score += 2
        }
        
        // Fuzzy matching for common typos and variations
        const fuzzyMatches = [
          // React variations
          { term: 'react', variations: ['reactjs', 'react.js'] },
          { term: 'vue', variations: ['vuejs', 'vue.js'] },
          { term: 'angular', variations: ['angularjs'] },
          { term: 'next', variations: ['nextjs', 'next.js'] },
          { term: 'tailwind', variations: ['tailwindcss', 'tailwind css'] },
          { term: 'dashboard', variations: ['admin panel', 'admin dashboard'] },
          { term: 'ecommerce', variations: ['e-commerce', 'shop', 'store'] },
          { term: 'landing', variations: ['landing page', 'homepage'] },
          { term: 'auth', variations: ['authentication', 'login', 'signin'] },
          { term: 'blog', variations: ['cms', 'content management'] }
        ]
        
        fuzzyMatches.forEach(({ term: fuzzyTerm, variations }) => {
          if (term.includes(fuzzyTerm) || variations.some(v => term.includes(v))) {
            const allText = `${resourceName} ${resourceDescription} ${resourceTags} ${resourceFramework}`
            if (variations.some(v => allText.includes(v)) || allText.includes(fuzzyTerm)) {
              score += 2
            }
          }
        })
      })
      
      // Boost score based on match quality
      if (exactMatches > 0) score *= 1.5
      if (tagMatches > 0) score *= 1.3
      if (frameworkMatches > 0) score *= 1.2
      
      // Calculate final similarity
      const maxPossibleScore = searchTerms.length * 10
      const similarity = score / Math.max(maxPossibleScore, 1)
      
      return {
        ...resource,
        similarity,
        exactMatches,
        tagMatches,
        frameworkMatches
      }
    })
    .filter((resource: any) => resource.similarity > 0.1) // Lower threshold for better results
    .sort((a: any, b: any) => {
      // Multi-criteria sorting
      if (b.similarity !== a.similarity) return b.similarity - a.similarity
      if (b.exactMatches !== a.exactMatches) return b.exactMatches - a.exactMatches
      if (b.tagMatches !== a.tagMatches) return b.tagMatches - a.tagMatches
      return b.frameworkMatches - a.frameworkMatches
    })
    .slice(0, 50) // Limit to top 50 results for performance

    // Track search history for authenticated users
    if (user && dbUser && authHeader) {
      try {
        console.log('Attempting to save search history for user:', user.id, 'query:', query)
        const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
          global: {
            headers: {
              Authorization: authHeader
            }
          }
        })
        
        const { data: historyData, error: historyError } = await supabaseAuth
          .from('search_history')
          .insert({
            user_id: user.id,
            query: query,
            filters: filters || {},
            results_count: results.length
          })
          .select()
        
        if (historyError) {
          console.error('Error saving search history:', historyError)
        } else {
          console.log('Search history saved successfully:', historyData)
        }
      } catch (historyError) {
        console.error('Exception saving search history:', historyError)
        // Don't fail the search if history saving fails
      }
    } else {
      console.log('Search history not saved - user:', !!user, 'dbUser:', !!dbUser, 'authHeader:', !!authHeader)
    }

    return NextResponse.json({
      results,
      total: results.length
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 