'use client'

import { useState, useEffect } from 'react'
import { ExternalLink, Github, Star, GitFork, Calendar, Shield } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface UrlPreview {
  url: string
  title?: string
  description?: string
  image?: string
  favicon?: string
  type: 'website' | 'github' | 'npm'
  github?: {
    owner: string
    repo: string
    stars: number
    forks: number
    language: string
    description: string
    lastUpdate: string
    license?: string
  }
}

interface UrlPreviewProps {
  url: string
  className?: string
  showFullPreview?: boolean
}

export function UrlPreview({ url, className, showFullPreview = true }: UrlPreviewProps) {
  const [preview, setPreview] = useState<UrlPreview | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!url) return

    const fetchPreview = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url })
        })

        if (!response.ok) {
          throw new Error('Failed to fetch preview')
        }

        const data = await response.json()
        setPreview(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchPreview()
  }, [url])

  if (loading) {
    return (
      <Card className={`animate-pulse bg-gray-800/40 border-gray-700/50 ${className}`}>
        <CardContent className="p-4">
          <div className="flex space-x-3">
            <div className="w-16 h-16 bg-gray-700/60 rounded"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-700/60 rounded w-3/4"></div>
              <div className="h-3 bg-gray-700/60 rounded w-1/2"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !preview) {
    return (
      <Button variant="outline" size="sm" asChild className="bg-gray-800/40 border-gray-700 text-gray-300 hover:bg-gray-700/50 hover:text-white">
        <a href={url} target="_blank" rel="noopener noreferrer">
          <ExternalLink className="h-4 w-4 mr-1" />
          Visit
        </a>
      </Button>
    )
  }

  if (!showFullPreview) {
    return (
      <Button variant="outline" size="sm" asChild className="bg-gray-800/40 border-gray-700 text-gray-300 hover:bg-gray-700/50 hover:text-white">
        <a href={url} target="_blank" rel="noopener noreferrer">
          {preview.type === 'github' ? (
            <Github className="h-4 w-4 mr-1" />
          ) : (
            <ExternalLink className="h-4 w-4 mr-1" />
          )}
          {preview.type === 'github' ? 'GitHub' : 'Visit'}
        </a>
      </Button>
    )
  }

  // GitHub Repository Preview
  if (preview.type === 'github' && preview.github) {
    const { github } = preview
    const lastUpdate = new Date(github.lastUpdate).toLocaleDateString()

    return (
      <Card className={`bg-gray-800/40 border-gray-700/50 hover:bg-gray-800/60 hover:border-gray-600/60 transition-all duration-300 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex items-center justify-center border border-gray-600/50">
                <Github className="h-6 w-6 text-white" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="font-semibold text-sm truncate text-white">
                  {github.owner}/{github.repo}
                </h3>
                <ExternalLink 
                  className="h-4 w-4 text-gray-400 hover:text-blue-400 cursor-pointer transition-colors"
                  onClick={() => window.open(url, '_blank')}
                />
              </div>
              
              {github.description && (
                <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                  {github.description}
                </p>
              )}
              
              <div className="flex items-center space-x-4 text-xs text-gray-500 mb-2">
                <div className="flex items-center space-x-1">
                  <Star className="h-3 w-3" />
                  <span>{github.stars.toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <GitFork className="h-3 w-3" />
                  <span>{github.forks.toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>{lastUpdate}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {github.language && (
                  <Badge variant="secondary" className="text-xs bg-gray-700/60 text-gray-300 border-gray-600/50">
                    {github.language}
                  </Badge>
                )}
                {github.license && (
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <Shield className="h-3 w-3" />
                    <span>{github.license}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Website Preview
  return (
    <Card className={`bg-gray-800/40 border-gray-700/50 hover:bg-gray-800/60 hover:border-gray-600/60 transition-all duration-300 ${className}`}>
      <CardContent className="p-4">
        <div className="flex space-x-3">
          {preview.image && (
            <div className="flex-shrink-0">
              <img
                src={preview.image}
                alt={preview.title}
                className="w-16 h-16 object-cover rounded border border-gray-600/50"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              {preview.favicon && (
                <img
                  src={preview.favicon}
                  alt=""
                  className="w-4 h-4"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              )}
              <h3 className="font-semibold text-sm truncate text-white">
                {preview.title || 'Website'}
              </h3>
              <ExternalLink 
                className="h-4 w-4 text-gray-400 hover:text-blue-400 cursor-pointer transition-colors"
                onClick={() => window.open(url, '_blank')}
              />
            </div>
            
            {preview.description && (
              <p className="text-sm text-gray-400 line-clamp-2">
                {preview.description}
              </p>
            )}
            
            <p className="text-xs text-gray-500 mt-1 truncate">
              {new URL(url).hostname}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 