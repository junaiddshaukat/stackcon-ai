'use client'

import { useState, useEffect } from 'react'
import { ExternalLink, Github, Star, Download, Eye, Heart } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Resource } from '@/lib/types'
import { cn } from '@/lib/utils'
import { UrlPreview } from '@/components/url-preview'
import { useAuth } from '@/components/auth-provider'
import { LoginPrompt } from '@/components/login-prompt'
import { supabase } from '@/lib/supabase'

interface SearchResultsProps {
  results: Resource[]
  isLoading?: boolean
  query?: string
  searchesRemaining?: number
}

export function SearchResults({ results, isLoading, query, searchesRemaining }: SearchResultsProps) {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [loginPromptFeature, setLoginPromptFeature] = useState<'favorites' | 'history' | 'collections'>('favorites')

  // Load user favorites if logged in
  useEffect(() => {
    if (user) {
      loadFavorites()
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
        const favoriteIds = new Set<string>(data.favorites.map((f: any) => f.resource_id))
        setFavorites(favoriteIds)
      }
    } catch (error) {
      console.error('Error loading favorites:', error)
    }
  }

  const toggleFavorite = async (resourceId: string) => {
    if (!user) {
      setLoginPromptFeature('favorites')
      setShowLoginPrompt(true)
      return
    }

    const isFavorited = favorites.has(resourceId)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return

      if (isFavorited) {
        // Remove from favorites
        const response = await fetch(`/api/favorites?resource_id=${resourceId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        })

        if (response.ok) {
          setFavorites(prev => {
            const newFavorites = new Set(prev)
            newFavorites.delete(resourceId)
            return newFavorites
          })
        }
      } else {
        // Add to favorites
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({ resource_id: resourceId })
        })

        if (response.ok) {
          setFavorites(prev => new Set(prev).add(resourceId))
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  const handleLogin = () => {
    setShowLoginPrompt(false)
    // Redirect to login - you can implement this based on your auth flow
    window.location.href = '/auth/login'
  }

  const handleSignup = () => {
    setShowLoginPrompt(false)
    // Redirect to signup - you can implement this based on your auth flow
    window.location.href = '/auth/signup'
  }

  const getResourceTypeColor = (type: string) => {
    switch (type) {
      case 'template':
        return 'bg-purple-900/40 text-purple-300 border border-purple-700/50'
      case 'component':
        return 'bg-green-900/40 text-green-300 border border-green-700/50'
      case 'ui_library':
        return 'bg-blue-900/40 text-blue-300 border border-blue-700/50'
      case 'repository':
        return 'bg-orange-900/40 text-orange-300 border border-orange-700/50'
      default:
        return 'bg-gray-800/60 text-gray-300 border border-gray-700/50'
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse bg-gradient-to-br from-gray-900/80 to-gray-800/90 border border-gray-700/60 rounded-2xl">
            <CardHeader>
              <div className="h-4 bg-gray-700/60 rounded w-3/4"></div>
              <div className="h-3 bg-gray-700/60 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-3 bg-gray-700/60 rounded mb-2"></div>
              <div className="h-3 bg-gray-700/60 rounded w-4/5"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!results || results.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-6xl mb-4">🔍</div>
        <h3 className="text-lg font-semibold text-white mb-2">
          {query ? 'No results found' : 'Start searching'}
        </h3>
        <p className="text-gray-400 max-w-md mx-auto">
          {query 
            ? `We couldn't find any resources matching "${query}". Try different keywords or browse our categories.`
            : 'Enter your app idea above to discover relevant UI components, templates, and libraries.'
          }
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search Info */}
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-400">
            Found <span className="font-semibold text-white">{results.length}</span> results
            {query && <> for "<span className="font-semibold text-blue-400">{query}</span>"</>}
          </p>
        </div>
        {typeof searchesRemaining === 'number' && (
          <div className="text-sm text-gray-400">
            <span className="font-semibold text-white">{searchesRemaining}</span> searches remaining this month
          </div>
        )}
      </div>

      {/* Results Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {results.map((resource) => {
          const isFavorited = favorites.has(resource.id)

          return (
            <Card key={resource.id} className="group bg-gradient-to-br from-gray-900/80 to-gray-800/90 border border-gray-700/60 rounded-2xl hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 hover:border-gray-600/60">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={cn(
                        'px-3 py-1 text-xs font-medium rounded-full',
                        getResourceTypeColor(resource.resource_type)
                      )}>
                        {resource.resource_type}
                      </span>
                      {resource.framework && resource.framework.length > 0 && (
                        <span className="text-xs text-gray-400 bg-gray-800/60 px-2 py-1 rounded-full">
                          {resource.framework[0]}
                        </span>
                      )}
                    </div>
                    <CardTitle className="text-lg leading-6 truncate text-white group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                      {resource.name}
                    </CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-700/50"
                    onClick={(e) => {
                      e.preventDefault()
                      toggleFavorite(resource.id)
                    }}
                  >
                    <Heart 
                      className={cn(
                        "h-4 w-4",
                        isFavorited ? "fill-pink-500 text-pink-500" : "text-gray-400 hover:text-pink-400"
                      )} 
                    />
                  </Button>
                </div>
                <CardDescription className="text-sm line-clamp-2 text-gray-400">
                  {resource.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-0">
                {/* Tags */}
                {resource.tags && resource.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {resource.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs bg-gray-800/60 text-gray-300 rounded-lg border border-gray-700/50"
                      >
                        {tag}
                      </span>
                    ))}
                    {resource.tags.length > 3 && (
                      <span className="px-2 py-1 text-xs bg-gray-800/60 text-gray-300 rounded-lg border border-gray-700/50">
                        +{resource.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Framework & Styling */}
                <div className="flex flex-wrap gap-2 mb-4 text-xs text-gray-400">
                  {resource.framework && Array.isArray(resource.framework) && resource.framework.length > 0 && (
                    <div>
                      <span className="font-medium text-gray-300">Framework:</span> {resource.framework.join(', ')}
                    </div>
                  )}
                  {resource.styling && Array.isArray(resource.styling) && resource.styling.length > 0 && (
                    <div>
                      <span className="font-medium text-gray-300">Styling:</span> {resource.styling.join(', ')}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mb-4">
                  {resource.demo_url && (
                    <Button
                      variant="outline" 
                      size="sm"
                      className="flex-1 bg-gray-800/40 border-gray-700 text-gray-300 hover:bg-blue-600/20 hover:border-blue-500 hover:text-blue-300 transition-all duration-300"
                      onClick={() => window.open(resource.demo_url, '_blank', 'noopener,noreferrer')}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Demo
                    </Button>
                  )}
                  
                  {resource.repo_url && (
                    <Button
                      variant="outline"
                      size="sm" 
                      className="flex-1 bg-gray-800/40 border-gray-700 text-gray-300 hover:bg-purple-600/20 hover:border-purple-500 hover:text-purple-300 transition-all duration-300"
                      onClick={() => window.open(resource.repo_url, '_blank', 'noopener,noreferrer')}
                    >
                      <Github className="h-4 w-4 mr-2" />
                      GitHub
                    </Button>
                  )}
                </div>

                {/* URL Preview Embeddings */}
                <div className="space-y-3">
                  {resource.demo_url && (
                    <div className="cursor-pointer" onClick={() => window.open(resource.demo_url, '_blank', 'noopener,noreferrer')}>
                      <UrlPreview url={resource.demo_url} showFullPreview={true} />
                    </div>
                  )}
                  
                  {resource.repo_url && (
                    <div className="cursor-pointer" onClick={() => window.open(resource.repo_url, '_blank', 'noopener,noreferrer')}>
                      <UrlPreview url={resource.repo_url} showFullPreview={true} />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Load More */}
      {results.length >= 20 && (
        <div className="text-center pt-6">
          <Button 
            variant="outline" 
            size="lg"
            className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-gray-700 text-white hover:from-blue-600/30 hover:to-purple-600/30 hover:border-gray-600 transition-all duration-300"
          >
            Load More Results
          </Button>
        </div>
      )}

      <LoginPrompt
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        feature={loginPromptFeature}
        onLogin={handleLogin}
        onSignup={handleSignup}
      />
    </div>
  )
} 