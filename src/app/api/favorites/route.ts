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

// GET - Get user's favorites
export async function GET(request: NextRequest) {
  const authResult = await getAuthenticatedUser(request)
  
  if (!authResult) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  const { user, supabase } = authResult

  try {
    const { data: favorites, error } = await supabase
      .from('user_favorites')
      .select(`
        resource_id,
        created_at,
        resource:resources(*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching favorites:', error)
      return NextResponse.json({ error: 'Failed to fetch favorites' }, { status: 500 })
    }

    return NextResponse.json({ favorites: favorites || [] })
  } catch (error) {
    console.error('Favorites GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Add to favorites
export async function POST(request: NextRequest) {
  const authResult = await getAuthenticatedUser(request)
  
  if (!authResult) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  const { user, supabase } = authResult

  try {
    const { resource_id } = await request.json()

    if (!resource_id) {
      return NextResponse.json({ error: 'Resource ID is required' }, { status: 400 })
    }

    // Check if already favorited
    const { data: existing } = await supabase
      .from('user_favorites')
      .select('*')
      .eq('user_id', user.id)
      .eq('resource_id', resource_id)
      .single()

    if (existing) {
      return NextResponse.json({ message: 'Already favorited' })
    }

    // Add to favorites
    const { error } = await supabase
      .from('user_favorites')
      .insert({
        user_id: user.id,
        resource_id
      })

    if (error) {
      console.error('Error adding favorite:', error)
      return NextResponse.json({ error: 'Failed to add favorite' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Added to favorites' })
  } catch (error) {
    console.error('Favorites POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Remove from favorites
export async function DELETE(request: NextRequest) {
  const authResult = await getAuthenticatedUser(request)
  
  if (!authResult) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  const { user, supabase } = authResult

  try {
    const url = new URL(request.url)
    const resource_id = url.searchParams.get('resource_id')

    if (!resource_id) {
      return NextResponse.json({ error: 'Resource ID is required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('resource_id', resource_id)

    if (error) {
      console.error('Error removing favorite:', error)
      return NextResponse.json({ error: 'Failed to remove favorite' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Removed from favorites' })
  } catch (error) {
    console.error('Favorites DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 