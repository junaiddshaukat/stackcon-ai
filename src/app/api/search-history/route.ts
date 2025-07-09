import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

async function getAuthenticatedUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.replace('Bearer ', '')
  
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }
    )
    
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      return null
    }

    return { user, supabase }
  } catch (error) {
    return null
  }
}

// GET - Get user's search history
export async function GET(request: NextRequest) {
  const authResult = await getAuthenticatedUser(request)
  
  if (!authResult) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  const { user, supabase } = authResult

  try {
    const { data: history, error } = await supabase
      .from('search_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50) // Limit to last 50 searches

    if (error) {
      console.error('Error fetching search history:', error)
      return NextResponse.json({ error: 'Failed to fetch search history' }, { status: 500 })
    }

    return NextResponse.json({ history: history || [] })
  } catch (error) {
    console.error('Search history GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Add to search history
export async function POST(request: NextRequest) {
  const authResult = await getAuthenticatedUser(request)
  
  if (!authResult) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  const { user, supabase } = authResult

  try {
    const { query, filters, results_count } = await request.json()

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    // Add to search history
    const { error } = await supabase
      .from('search_history')
      .insert({
        user_id: user.id,
        query,
        filters: filters || {},
        results_count: results_count || 0
      })

    if (error) {
      console.error('Error adding to search history:', error)
      return NextResponse.json({ error: 'Failed to add to search history' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Added to search history' })
  } catch (error) {
    console.error('Search history POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Clear search history
export async function DELETE(request: NextRequest) {
  const authResult = await getAuthenticatedUser(request)
  
  if (!authResult) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  const { user, supabase } = authResult

  try {
    const { error } = await supabase
      .from('search_history')
      .delete()
      .eq('user_id', user.id)

    if (error) {
      console.error('Error clearing search history:', error)
      return NextResponse.json({ error: 'Failed to clear search history' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Search history cleared' })
  } catch (error) {
    console.error('Search history DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 