import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkAdminAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) return false

  const token = authHeader.replace('Bearer ', '')
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  )

  const { data: { user } } = await supabase.auth.getUser(token)
  if (!user) return false

  const { data: dbUser } = await supabase.from('users').select('role').eq('id', user.id).single()
  return dbUser?.role === 'admin'
}


export async function GET(request: NextRequest) {
  const isAdmin = await checkAdminAuth(request)
  if (!isAdmin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  try {
    const { count: totalResources } = await supabaseAdmin
      .from('resources')
      .select('*', { count: 'exact', head: true })

    const { count: totalUsers } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true })

    const { count: totalSearches } = await supabaseAdmin
      .from('search_history')
      .select('*', { count: 'exact', head: true })
    
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const { count: recentSearches } = await supabaseAdmin
      .from('search_history')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo.toISOString())

    return NextResponse.json({
      totalResources: totalResources || 0,
      totalUsers: totalUsers || 0,
      totalSearches: totalSearches || 0,
      recentSearches: recentSearches || 0
    })

  } catch (error: any) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json({ error: 'Failed to fetch admin statistics', details: error.message }, { status: 500 })
  }
} 