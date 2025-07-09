import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create admin client using service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

async function checkAdminAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('No auth header or invalid format')
    return null
  }

  const token = authHeader.replace('Bearer ', '')
  
  try {
    // Create a supabase client with the provided token
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
    
    // Verify the user with the token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      console.log('Auth error or no user:', authError)
      return null
    }

    console.log('User authenticated:', user.email, 'ID:', user.id)

    // Check if user is admin
    const { data: dbUser, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userError || !dbUser || dbUser.role !== 'admin') {
      console.log('User error or not admin:', userError, dbUser)
      return null
    }

    console.log('User is admin, role:', dbUser.role)
    return { user, supabase }
  } catch (error) {
    console.log('Auth check error:', error)
    return null
  }
}

// GET - Get single resource
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const authResult = await checkAdminAuth(request)
  
  if (!authResult) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  const { supabase } = authResult

  try {
    const { data: resource, error } = await supabase
      .from('resources')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Resource not found' }, { status: 404 })
      }
      console.error('Error fetching resource:', error)
      return NextResponse.json({ error: 'Failed to fetch resource' }, { status: 500 })
    }

    return NextResponse.json({ resource })

  } catch (error) {
    console.error('Admin resource GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update resource
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const authResult = await checkAdminAuth(request)
  if (!authResult) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { supabase } = authResult

    const {
      name,
      description,
      demo_url,
      resource_type,
      framework,
      styling,
      repo_url,
      tags,
      is_active
    } = body

    // Validate required fields
    if (!name || !description || !resource_type) {
      return NextResponse.json({ 
        error: 'Missing required fields: name, description, resource_type' 
      }, { status: 400 })
    }

    console.log('Updating resource with data:', body)

    // Clean and validate data
    const cleanData = {
      name: name.trim(),
      description: description.trim(),
      demo_url: demo_url ? demo_url.trim() : null,
      resource_type,
      framework: Array.isArray(framework) ? framework : [],
      styling: Array.isArray(styling) ? styling : [],
      repo_url: repo_url ? repo_url.trim() : '',
      tags: Array.isArray(tags) ? tags : [],
      is_active: is_active !== undefined ? is_active : true
    }

    console.log('Clean data for update:', cleanData)

    // Update resource using admin client
    const { data: resource, error: updateError } = await supabaseAdmin
      .from('resources')
      .update(cleanData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      if (updateError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Resource not found' }, { status: 404 })
      }
      console.error('Error updating resource:', updateError)
      return NextResponse.json({ error: 'Failed to update resource', details: updateError }, { status: 500 })
    }

    console.log('Resource updated successfully:', resource)
    return NextResponse.json({ resource })

  } catch (error) {
    console.error('Admin resource PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete resource
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const authResult = await checkAdminAuth(request)
  if (!authResult) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  try {
    // NOTE: Using supabaseAdmin client to bypass RLS for deletion.
    
    // Delete associated user favorites first
    await supabaseAdmin
      .from('user_favorites')
      .delete()
      .eq('resource_id', id)

    // Delete the resource itself
    const { error: deleteError } = await supabaseAdmin
      .from('resources')
      .delete()
      .eq('id', id)

    if (deleteError) {
      // It's possible the resource was already deleted, but we check for other errors.
      if (deleteError.code !== 'PGRST116') {
        throw deleteError;
      }
    }

    return NextResponse.json({ message: 'Resource deleted successfully' })

  } catch (error: any) {
    console.error('Admin resource DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete resource', details: error.message }, { status: 500 })
  }
} 