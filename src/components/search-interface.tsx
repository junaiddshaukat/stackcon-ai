'use client'

import { useState, useCallback, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SearchResults } from '@/components/search-results'
import { SearchResponse, ResourceType } from '@/lib/types'
import { useAuth } from '@/components/auth-provider'
import { supabase } from '@/lib/supabase'

const EXAMPLE_QUERIES = [
  "dashboard with charts and analytics",
  "e-commerce product grid",
  "login form with validation",
  "landing page with pricing",
  "blog with dark mode",
  "admin panel with sidebar",
  "social media feed",
  "payment checkout flow"
]

const RESOURCE_TYPES: { value: ResourceType; label: string }[] = [
  { value: 'ui_library', label: 'UI Libraries' },
  { value: 'component', label: 'Components' },
  { value: 'template', label: 'Templates' },
  { value: 'repository', label: 'Repositories' }
]

const FRAMEWORKS = ['react', 'vue', 'angular', 'svelte', 'vanilla']
const STYLING = ['tailwind', 'css', 'styled-components', 'emotion', 'sass']

export function SearchInterface() {
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<SearchResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  // Handle URL query parameter
  useEffect(() => {
    const urlQuery = searchParams.get('query')
    if (urlQuery && urlQuery !== query) {
      setQuery(urlQuery)
      handleSearch(urlQuery)
    }
  }, [searchParams])
  
  // Filters
  const [selectedResourceTypes, setSelectedResourceTypes] = useState<ResourceType[]>([])
  const [selectedFrameworks, setSelectedFrameworks] = useState<string[]>([])
  const [selectedStyling, setSelectedStyling] = useState<string[]>([])

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      // Get auth token if user is logged in
      let authHeaders = {
        'Content-Type': 'application/json',
      } as any

      if (user) {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.access_token) {
          authHeaders['Authorization'] = `Bearer ${session.access_token}`
        }
      }

      const response = await fetch('/api/search', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          query: searchQuery.trim(),
          filters: {
            type: selectedResourceTypes.length === 1 ? selectedResourceTypes[0] : 'all',
            framework: selectedFrameworks.length === 1 ? selectedFrameworks[0] : 'all',
            styling: selectedStyling.length === 1 ? selectedStyling[0] : 'all'
          }
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Search failed')
      }

      const data: SearchResponse = await response.json()
      setResults(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setResults(null)
    } finally {
      setIsLoading(false)
    }
  }, [selectedResourceTypes, selectedFrameworks, selectedStyling, user])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSearch(query)
  }

  const handleExampleClick = (example: string) => {
    setQuery(example)
    handleSearch(example)
  }

  const toggleFilter = <T,>(
    value: T,
    selected: T[],
    setSelected: React.Dispatch<React.SetStateAction<T[]>>
  ) => {
    setSelected(prev => 
      prev.includes(value) 
        ? prev.filter(item => item !== value)
        : [...prev, value]
    )
  }

  const clearFilters = () => {
    setSelectedResourceTypes([])
    setSelectedFrameworks([])
    setSelectedStyling([])
  }

  const hasActiveFilters = selectedResourceTypes.length > 0 || 
                          selectedFrameworks.length > 0 || 
                          selectedStyling.length > 0

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Search Form */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Describe your app idea (e.g., dashboard with charts and login)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-12 pr-24 h-14 text-lg"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? 'bg-secondary' : ''}
            >
              <Filter className="h-4 w-4" />
              {hasActiveFilters && (
                <span className="ml-1 bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 text-xs">
                  {selectedResourceTypes.length + selectedFrameworks.length + selectedStyling.length}
                </span>
              )}
            </Button>
            <Button type="submit" disabled={!query.trim() || isLoading}>
              {isLoading ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 p-4 border rounded-lg bg-secondary/20">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Filters</h3>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
            
            <div className="grid md:grid-cols-3 gap-4">
              {/* Resource Types */}
              <div>
                <label className="text-sm font-medium mb-2 block">Resource Type</label>
                <div className="space-y-2">
                  {RESOURCE_TYPES.map(type => (
                    <label key={type.value} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedResourceTypes.includes(type.value)}
                        onChange={() => toggleFilter(type.value, selectedResourceTypes, setSelectedResourceTypes)}
                        className="rounded"
                      />
                      <span className="text-sm">{type.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Frameworks */}
              <div>
                <label className="text-sm font-medium mb-2 block">Framework</label>
                <div className="space-y-2">
                  {FRAMEWORKS.map(framework => (
                    <label key={framework} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedFrameworks.includes(framework)}
                        onChange={() => toggleFilter(framework, selectedFrameworks, setSelectedFrameworks)}
                        className="rounded"
                      />
                      <span className="text-sm capitalize">{framework}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Styling */}
              <div>
                <label className="text-sm font-medium mb-2 block">Styling</label>
                <div className="space-y-2">
                  {STYLING.map(style => (
                    <label key={style} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedStyling.includes(style)}
                        onChange={() => toggleFilter(style, selectedStyling, setSelectedStyling)}
                        className="rounded"
                      />
                      <span className="text-sm capitalize">{style}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </form>

      {/* Example Queries */}
      {!results && !isLoading && (
        <div className="mb-8">
          <p className="text-sm text-muted-foreground mb-3">Try these examples:</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_QUERIES.map((example) => (
              <button
                key={example}
                onClick={() => handleExampleClick(example)}
                className="text-sm bg-secondary hover:bg-secondary/80 text-secondary-foreground px-3 py-1.5 rounded-full transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Search Results */}
      <SearchResults
        results={results?.results || []}
        isLoading={isLoading}
        query={results?.query}
        searchesRemaining={results?.user_searches_remaining}
      />
    </div>
  )
} 