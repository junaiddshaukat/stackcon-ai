'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth-provider'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Heart, 
  History, 
  Search,
  Calendar,
  Trash2
} from 'lucide-react'

interface Resource {
  id: string
  name: string
  description: string
  resource_type: string
  framework: string[]
  styling: string[]
  repo_url: string
  demo_url: string
  tags: string[]
  is_active: boolean
  created_at: string
}

interface UserFavorite {
  resource_id: string
  created_at: string
  resource: Resource
}

interface SearchHistoryItem {
  id: string
  query: string
  filters: any
  results_count: number
  created_at: string
}

export default function ProfilePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('favorites')
  const [favorites, setFavorites] = useState<UserFavorite[]>([])
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([])
  const [loadingFavorites, setLoadingFavorites] = useState(true)
  const [loadingHistory, setLoadingHistory] = useState(true)

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  // Load user data
  useEffect(() => {
    if (user) {
      loadFavorites()
      loadSearchHistory()
    }
  }, [user])

  const loadFavorites = async () => {
    if (!user) return
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return

      const response = await fetch('/api/favorites', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setFavorites(data.favorites || [])
      }
    } catch (error) {
      console.error('Error loading favorites:', error)
    } finally {
      setLoadingFavorites(false)
    }
  }

  const loadSearchHistory = async () => {
    if (!user) return
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return

      const response = await fetch('/api/search-history', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setSearchHistory(data.history || [])
      }
    } catch (error) {
      console.error('Error loading search history:', error)
    } finally {
      setLoadingHistory(false)
    }
  }

  const removeFavorite = async (resourceId: string) => {
    if (!user) return

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return

      const response = await fetch(`/api/favorites?resource_id=${resourceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (response.ok) {
        setFavorites(prev => prev.filter(f => f.resource_id !== resourceId))
      }
    } catch (error) {
      console.error('Error removing favorite:', error)
    }
  }

  const clearSearchHistory = async () => {
    if (!user) return

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return

      const response = await fetch('/api/search-history', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (response.ok) {
        setSearchHistory([])
      }
    } catch (error) {
      console.error('Error clearing search history:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // THEME COLORS
  // Main background: bg-[#18181b]
  // Card: bg-[#232336] border-[#2d2d44]
  // Accent: bg-gradient-to-r from-[#7f5af0] to-[#2cb67d]
  // Text: text-[#fffffe]
  // Subtle text: text-[#a7a9be]
  // Badge: bg-[#2cb67d]/20 text-[#2cb67d]
  // Button: bg-[#7f5af0] hover:bg-[#6246ea]
  // Tabs: bg-[#232336] active:bg-[#2d2d44] active:text-[#7f5af0]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#18181b]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7f5af0]"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen  bg-[#18181b] text-[#fffffe] px-2 sm:px-4 py-12 max-w-5xl mx-auto mt-15  ">
      {/* Profile Header */}
      <div className="mb-8">
        <Card className="bg-[#232336] border border-[#2d2d44] rounded-3xl shadow-2xl">
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
              <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-4 border-[#7f5af0]/40 shadow-lg">
                <AvatarImage src={`https://avatar.vercel.sh/${user.email}`} />
                <AvatarFallback>
                  {user.email.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 w-full">
                <CardTitle className="text-2xl sm:text-3xl font-bold mb-1 bg-gradient-to-r from-[#7f5af0] to-[#2cb67d] bg-clip-text text-transparent break-all">
                  {user.email}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1 text-[#a7a9be]">
                  <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="bg-[#2cb67d]/20 text-[#2cb67d]">
                    {user.role}
                  </Badge>
                </CardDescription>
              </div>
              <div className="text-center sm:text-right w-full sm:w-auto">
                <p className="text-xs text-[#a7a9be]">Member since</p>
                <p className="font-medium text-[#fffffe] text-sm">{formatDate(user.created_at)}</p>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-[#232336] p-1 rounded-2xl mb-2">
          <TabsTrigger value="favorites" className="flex items-center gap-2 rounded-xl py-2 px-3 sm:py-3 sm:px-6 data-[state=active]:bg-[#2d2d44] data-[state=active]:shadow-lg data-[state=active]:text-[#7f5af0] font-semibold transition-all duration-300 text-sm sm:text-base">
            <Heart className="h-4 w-4" />
            Favorites ({favorites.length})
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2 rounded-xl py-2 px-3 sm:py-3 sm:px-6 data-[state=active]:bg-[#2d2d44] data-[state=active]:shadow-lg data-[state=active]:text-[#2cb67d] font-semibold transition-all duration-300 text-sm sm:text-base">
            <History className="h-4 w-4" />
            Search History ({searchHistory.length})
          </TabsTrigger>
        </TabsList>

        {/* Favorites Tab */}
        <TabsContent value="favorites">
          <div className="grid grid-cols-1 mb-5 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {loadingFavorites ? (
              <div className="col-span-full text-center text-[#a7a9be] py-16 text-lg">Loading favorites...</div>
            ) : favorites.length === 0 ? (
              <div className="col-span-full text-center text-[#a7a9be] py-16 text-lg">No favorites yet.</div>
            ) : (
              favorites.map(fav => (
                <Card
                  key={fav.resource_id}
                  className="relative overflow-hidden bg-[#232336] border border-[#2d2d44] rounded-2xl shadow-lg transition-all duration-200 hover:scale-[1.015] hover:shadow-[#7f5af0]/30 group p-4 flex flex-col min-h-[180px]"
                >
                  {/* Glow effect */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-[#7f5af0]/20 via-[#2cb67d]/20 to-[#7f5af0]/20 rounded-2xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  <CardHeader className="p-0 mb-2 flex flex-row items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-bold text-[#fffffe] mb-1 flex items-center gap-2 truncate">
                        <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-r from-[#7f5af0] to-[#2cb67d] mr-1" />
                        <span className="truncate">{fav.resource.name}</span>
                      </CardTitle>
                      <CardDescription className="text-[#a7a9be] text-xs line-clamp-2">
                        {fav.resource.description}
                      </CardDescription>
                    </div>
                    <button
                      aria-label="Remove from favorites"
                      onClick={() => removeFavorite(fav.resource_id)}
                      className="ml-2 p-1 rounded-full bg-[#232336] hover:bg-[#7f5af0] transition-colors shadow group/heart"
                    >
                      <Heart className="h-5 w-5 text-[#7f5af0] fill-[#7f5af0] group-hover/heart:scale-110 transition-transform" fill="currentColor" />
                    </button>
                  </CardHeader>
                  <CardContent className="p-0 flex flex-col gap-2 flex-1">
                    <div className="flex flex-wrap gap-1 mb-1">
                      {fav.resource.tags.map(tag => (
                        <Badge key={tag} className="bg-[#2cb67d]/20 text-[#2cb67d] rounded-full px-2 py-0.5 text-[11px] font-medium">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 mt-auto">
                      {fav.resource.repo_url && (
                        <a href={fav.resource.repo_url} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-1 rounded bg-gradient-to-r from-[#7f5af0] to-[#2cb67d] text-[#fffffe] font-semibold shadow hover:from-[#6246ea] hover:to-[#2cb67d] hover:scale-105 transition-all duration-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#7f5af0]"
                        >
                          <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.49.5.09.66-.22.66-.48 0-.24-.01-.87-.01-1.7-2.78.6-3.37-1.34-3.37-1.34-.45-1.15-1.1-1.46-1.1-1.46-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.56-1.11-4.56-4.95 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02A9.56 9.56 0 0112 6.8c.85.004 1.71.115 2.51.337 1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.85-2.34 4.7-4.57 4.95.36.31.68.92.68 1.85 0 1.33-.01 2.4-.01 2.73 0 .27.16.58.67.48A10.01 10.01 0 0022 12c0-5.52-4.48-10-10-10z"></path></svg>
                          Repo
                        </a>
                      )}
                      {fav.resource.demo_url && (
                        <a href={fav.resource.demo_url} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-1 rounded bg-gradient-to-r from-[#2cb67d] to-[#7f5af0] text-[#fffffe] font-semibold shadow hover:from-[#2cb67d] hover:to-[#6246ea] hover:scale-105 transition-all duration-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#2cb67d]"
                        >
                          <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 3v2a1 1 0 001 1h3.59l-7.3 7.29a1 1 0 001.42 1.42L20 7.41V11a1 1 0 102 0V3a1 1 0 00-1-1h-8a1 1 0 100 2h3.59l-7.3 7.29a1 1 0 001.42 1.42L20 7.41V11a1 1 0 102 0V3a1 1 0 00-1-1h-8a1 1 0 100 2z"></path></svg>
                          Demo
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Search History Tab */}
        <TabsContent value="history">
          <Card className="bg-[#232336] border border-[#2d2d44] rounded-2xl">
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                <div className="w-full sm:w-auto">
                  <CardTitle className="flex items-center gap-2 text-[#fffffe] text-base sm:text-lg">
                    <History className="h-5 w-5" />
                    Search History
                  </CardTitle>
                  <CardDescription className="text-[#a7a9be] text-xs sm:text-sm">
                    Your recent searches and their results
                  </CardDescription>
                </div>
                {searchHistory.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearSearchHistory}
                    className="text-[#ff5470] border-[#ff5470] hover:bg-[#ff5470]/10 mt-2 sm:mt-0"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear History
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {loadingHistory ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#7f5af0]"></div>
                </div>
              ) : searchHistory.length === 0 ? (
                <div className="text-center py-8 text-[#a7a9be]">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No search history yet</p>
                  <p className="text-sm">Your searches will appear here</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {searchHistory.map((item) => (
                    <Card key={item.id} className="bg-[#232336] border border-[#2d2d44] hover:shadow-lg transition-shadow rounded-xl">
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Search className="h-4 w-4 text-[#a7a9be]" />
                              <span className="font-medium text-[#fffffe] truncate">{item.query}</span>
                              <Badge variant="secondary" className="text-xs bg-[#2cb67d]/20 text-[#2cb67d]">
                                {item.results_count} results
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-[#a7a9be]">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(item.created_at)}</span>
                              {item.filters && Object.keys(item.filters).length > 0 && (
                                <span className="ml-2">• Filters applied</span>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-[#7f5af0] hover:bg-[#7f5af0]/10 mt-2 sm:mt-0"
                            onClick={() => {
                              // Navigate to search with this query
                              router.push(`/?query=${encodeURIComponent(item.query)}`)
                            }}
                          >
                            Search Again
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
                         