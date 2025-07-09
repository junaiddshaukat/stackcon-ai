import { NextRequest, NextResponse } from 'next/server'

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
  npm?: {
    name: string
    version: string
    downloads: number
    description: string
  }
}

async function fetchGitHubInfo(owner: string, repo: string): Promise<UrlPreview['github']> {
  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'StackCon-Templates-AI'
      }
    })
    
    if (!response.ok) return undefined
    
    const data = await response.json()
    
    return {
      owner: data.owner.login,
      repo: data.name,
      stars: data.stargazers_count,
      forks: data.forks_count,
      language: data.language,
      description: data.description,
      lastUpdate: data.updated_at,
      license: data.license?.name
    }
  } catch (error) {
    console.error('Error fetching GitHub info:', error)
    return undefined
  }
}

async function fetchWebsiteMetadata(url: string): Promise<Partial<UrlPreview>> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; StackCon-Templates-AI/1.0)'
      }
    })
    
    if (!response.ok) return {}
    
    const html = await response.text()
    
    // Extract meta tags
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    const descMatch = html.match(/<meta[^>]*name=['"](description|og:description)['"'][^>]*content=['"]([^'"]+)['"]/i)
    const imageMatch = html.match(/<meta[^>]*property=['"](og:image|twitter:image)['"'][^>]*content=['"]([^'"]+)['"]/i)
    const faviconMatch = html.match(/<link[^>]*rel=['"](?:icon|shortcut icon)['"'][^>]*href=['"]([^'"]+)['"]/i)
    
    return {
      title: titleMatch?.[1]?.trim(),
      description: descMatch?.[2]?.trim(),
      image: imageMatch?.[2]?.trim(),
      favicon: faviconMatch?.[1]?.trim()
    }
  } catch (error) {
    console.error('Error fetching website metadata:', error)
    return {}
  }
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()
    
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }
    
    const urlObj = new URL(url)
    let preview: UrlPreview = {
      url,
      type: 'website'
    }
    
    // Check if it's a GitHub URL
    if (urlObj.hostname === 'github.com') {
      const pathParts = urlObj.pathname.split('/').filter(Boolean)
      if (pathParts.length >= 2) {
        const [owner, repo] = pathParts
        preview.type = 'github'
        preview.github = await fetchGitHubInfo(owner, repo)
        preview.title = `${owner}/${repo}`
        preview.description = preview.github?.description
      }
    }
    // Check if it's an NPM URL
    else if (urlObj.hostname === 'www.npmjs.com' || urlObj.hostname === 'npmjs.com') {
      preview.type = 'npm'
      // Could add NPM API integration here
    }
    // Regular website
    else {
      const metadata = await fetchWebsiteMetadata(url)
      preview = { ...preview, ...metadata }
    }
    
    return NextResponse.json(preview)
  } catch (error) {
    console.error('Preview API error:', error)
    return NextResponse.json({ error: 'Failed to fetch preview' }, { status: 500 })
  }
} 