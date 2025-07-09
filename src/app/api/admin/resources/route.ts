import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Octokit } from '@octokit/rest'

// Create service role client for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
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

// GET - List all resources with pagination
export async function GET(request: NextRequest) {
  const authResult = await checkAdminAuth(request)
  
  if (!authResult) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  const { supabase } = authResult

  try {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    const search = url.searchParams.get('search') || ''
    const type = url.searchParams.get('type') || ''

    console.log('Fetching resources with params:', { page, limit, search, type })

    let query = supabase
      .from('resources')
      .select('*', { count: 'exact' })

    // Apply search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // Apply type filter
    if (type && type !== 'all') {
      query = query.eq('resource_type', type)
    }

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    
    query = query.range(from, to).order('created_at', { ascending: false })

    const { data: resources, error, count } = await query

    if (error) {
      console.error('Error fetching resources:', error)
      return NextResponse.json({ error: 'Failed to fetch resources', details: error }, { status: 500 })
    }

    console.log('Fetched resources:', resources?.length, 'Total:', count)

    return NextResponse.json({
      resources: resources || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    })

  } catch (error) {
    console.error('Admin resources GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new resource or Scrape from URL
export async function POST(request: NextRequest) {
  const authResult = await checkAdminAuth(request)
  if (!authResult) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  const body = await request.json()

  // Scrape mode
  if (body.scrapeUrl) {
    return await scrapeAndPreview(body.scrapeUrl)
  }

  // Create mode
  return await createResource(authResult.supabase, body)
}

// --- HELPER FUNCTIONS ---

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN })

async function scrapeAndPreview(url: string) {
    if (!url || !url.includes('github.com')) {
      return NextResponse.json({ error: 'A valid GitHub URL is required' }, { status: 400 })
    }
  
    try {
      const pathParts = new URL(url).pathname.split('/').filter(Boolean)
      if (pathParts.length < 2) {
        return NextResponse.json({ error: 'Invalid GitHub repo URL' }, { status: 400 })
      }
      const [owner, repo] = pathParts
  
      const { data: repoData } = await octokit.repos.get({ owner, repo })
  
      let demo_url = repoData.homepage || ''
      if (!demo_url) {
        try {
          const { data: readmeData } = await octokit.repos.getReadme({ owner, repo })
          const readmeContent = Buffer.from(readmeData.content, 'base64').toString()
          // Regex to find the first http/https link in the readme
          const urlRegex = /(https?:\/\/[^\s"'`)]+)/
          const match = readmeContent.match(urlRegex)
          if (match) {
            // Clean up trailing parentheses often found in markdown links
            const foundUrl = new URL(match[0].replace(/\)$/, ''))
            if (foundUrl.hostname !== 'github.com') {
              demo_url = foundUrl.toString()
            }
          }
        } catch (e) { 
            console.warn(`Could not fetch or parse README for ${owner}/${repo}`) 
        }
      }
  
      const topics = repoData.topics || []
      const description = repoData.description?.toLowerCase() || ''
      const name = repoData.name.toLowerCase()
  
      let resource_type = 'repository'
      if (description.includes('template') || name.includes('template')) resource_type = 'template'
      if (description.includes('component') || name.includes('component')) resource_type = 'component'
      if (description.includes('library') || name.includes('library') || description.includes('ui kit')) resource_type = 'ui_library'
  
      const frameworks = ['react', 'vue', 'angular', 'svelte', 'nextjs', 'nuxt', 'astro']
      const styling_libs = ['tailwind', 'bootstrap', 'material-ui', 'chakra-ui', 'styled-components', 'emotion', 'sass']
  
      const framework = frameworks.filter(f => topics.includes(f) || description.includes(f) || name.includes(f))
      const styling = styling_libs.filter(s => topics.includes(s) || description.includes(s) || name.includes(s))
  
      const prefilledData = {
        name: repoData.name,
        description: repoData.description || '',
        repo_url: repoData.html_url,
        demo_url: demo_url,
        tags: topics,
        resource_type,
        framework,
        styling,
        is_active: true,
      }
  
      return NextResponse.json({ preview: prefilledData })
  
    } catch (error: any) {
      console.error('Error scraping GitHub resource:', error)
      if (error.status === 404) {
        return NextResponse.json({ error: 'Repository not found' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Failed to scrape resource' }, { status: 500 })
    }
}
  
async function createResource(supabase: any, body: any) {
    try {
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

        console.log('Creating resource with data:', body)
    
        if (!name || !description || !resource_type) {
          return NextResponse.json({ 
            error: 'Missing required fields: name, description, resource_type' 
          }, { status: 400 })
        }

        // Clean and validate data
        const cleanData = {
          name: name.trim(),
          description: description.trim(),
          demo_url: demo_url ? demo_url.trim() : null,
          resource_type,
          source: 'admin',
          framework: Array.isArray(framework) ? framework : [],
          styling: Array.isArray(styling) ? styling : [],
          repo_url: repo_url ? repo_url.trim() : '',
          tags: Array.isArray(tags) ? tags : [],
          is_active: is_active !== undefined ? is_active : true
        }

        console.log('Clean data for creation:', cleanData)

        // Use service role client to bypass RLS for admin operations
        const supabaseAdmin = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        )
    
        const { data: resource, error: insertError } = await supabaseAdmin
          .from('resources')
          .insert(cleanData)
          .select()
          .single()
    
        if (insertError) {
          console.error('Error creating resource:', insertError)
          return NextResponse.json({ 
            error: 'Failed to create resource', 
            details: insertError.message 
          }, { status: 500 })
        }

        console.log('Resource created successfully:', resource.id)
        return NextResponse.json({ resource }, { status: 201 })

    } catch (error: any) {
        console.error('Admin resources POST error:', error)
        return NextResponse.json({ 
          error: 'Internal server error',
          details: error.message 
        }, { status: 500 })
    }
} 