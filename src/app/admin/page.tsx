'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Plus, Edit, Trash2, ExternalLink, Github, Search, Eye, Calendar, Users, Database, Link as LinkIcon, Sparkles, AlertCircle } from 'lucide-react'
import { useAuth } from '@/components/auth-provider'
import { supabase } from '@/lib/supabase'
import { TagsInput } from '@/components/ui/tags-input'

// Database resource type (matches our actual database schema)
interface DbResource {
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

interface AdminStats {
  totalResources: number
  totalUsers: number
  totalSearches: number
  recentSearches: number
}

interface ResourceFormData {
  name: string
  description: string
  demo_url: string
  resource_type: string
  framework: string[]
  styling: string[]
  repo_url: string
  tags: string[]
  is_active: boolean
}

const emptyForm: ResourceFormData = {
  name: '',
  description: '',
  demo_url: '',
  resource_type: 'template',
  framework: [],
  styling: [],
  repo_url: '',
  tags: [],
  is_active: true
}

export default function AdminPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  
  const [resources, setResources] = useState<DbResource[]>([])
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loadingResources, setLoadingResources] = useState(true)
  const [loadingStats, setLoadingStats] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Form state
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingResource, setEditingResource] = useState<DbResource | null>(null)
  const [formData, setFormData] = useState<ResourceFormData>(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [formErrors, setFormErrors] = useState<Partial<ResourceFormData>>({})
  
  // Filters and pagination
  const [searchFilter, setSearchFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [scrapeUrl, setScrapeUrl] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeError, setScrapeError] = useState<string | null>(null);

  // Form validation
  const validateForm = (data: ResourceFormData): Partial<ResourceFormData> => {
    const errors: Partial<ResourceFormData> = {}
    
    if (!data.name.trim()) {
      errors.name = 'Title is required'
    }
    if (!data.description.trim()) {
      errors.description = 'Description is required'
    }
    if (!data.demo_url.trim()) {
      errors.demo_url = 'Demo URL is required'
    } else if (!isValidUrl(data.demo_url)) {
      errors.demo_url = 'Please enter a valid URL'
    }
    if (!data.resource_type) {
      errors.resource_type = 'Resource type is required'
    }
    if (data.repo_url && !isValidUrl(data.repo_url)) {
      errors.repo_url = 'Please enter a valid URL'
    }
    
    return errors
  }

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const clearFormErrors = () => setFormErrors({})
  const clearForm = () => {
    setFormData(emptyForm)
    setFormErrors({})
    setEditingResource(null)
  }

  // Check if user is admin - simplified logic
  useEffect(() => {
    if (!loading) {
      console.log('Admin page: Auth check complete', { 
        hasUser: !!user, 
        userEmail: user?.email, 
        userRole: user?.role 
      })
      
      if (!user) {
        console.log('Admin page: No user, redirecting to login')
        router.push('/login')
      } else if (user.role !== 'admin') {
        console.log('Admin page: User is not admin, redirecting to home')
        router.push('/')
      } else {
        console.log('Admin page: User is admin, access granted')
        setError(null)
      }
    }
  }, [user, loading, router])

  // Fetch admin stats
  useEffect(() => {
    if (user?.role === 'admin') {
      fetchStats()
      fetchResources()
    }
  }, [user, currentPage, searchFilter, typeFilter])

  const getAuthHeaders = async () => {
    try {
      // First attempt to get session
      let { data: { session }, error } = await supabase.auth.getSession()
      
      // If no session or error, try to refresh
      if (!session?.access_token || error) {
        console.log('No valid session, attempting refresh...')
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()
        
        if (refreshError) {
          console.error('Session refresh failed:', refreshError)
          throw new Error('Authentication session expired. Please log in again.')
        }
        
        session = refreshData.session
      }
      
      if (!session?.access_token) {
        throw new Error('No authentication token available')
      }
      
      return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      }
    } catch (error: any) {
      console.error('Authentication error:', error)
      setError(`Authentication failed: ${error.message}`)
      throw error
    }
  }

  const fetchStats = async (retryCount = 0) => {
    try {
      setLoadingStats(true)
      setError(null)
      const headers = await getAuthHeaders()
      
      const response = await fetch('/api/admin/stats', { headers })
      
      if (!response.ok) {
        if (response.status === 401 && retryCount < 2) {
          console.log('Auth failed, retrying...')
          await new Promise(resolve => setTimeout(resolve, 1000))
          return fetchStats(retryCount + 1)
        }
        throw new Error(`HTTP ${response.status}: Failed to fetch stats`)
      }
      
      const data = await response.json()
      setStats(data)
      console.log('Stats loaded successfully')
    } catch (error: any) {
      console.error('Error fetching stats:', error)
      setError(`Failed to load statistics: ${error.message}`)
    } finally {
      setLoadingStats(false)
    }
  }

  const fetchResources = async (retryCount = 0) => {
    try {
      setLoadingResources(true)
      setError(null)
      const headers = await getAuthHeaders()
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        search: searchFilter,
        type: typeFilter
      })

      const response = await fetch(`/api/admin/resources?${params}`, {
        headers
      })

      if (!response.ok) {
        if (response.status === 401 && retryCount < 2) {
          console.log('Auth failed, retrying...')
          await new Promise(resolve => setTimeout(resolve, 1000))
          return fetchResources(retryCount + 1)
        }
        throw new Error(`HTTP ${response.status}: Failed to fetch resources`)
      }

      const data = await response.json()
      setResources(data.resources || [])
      setTotalPages(data.totalPages || 1)
      console.log('Resources loaded successfully:', data.resources?.length)
    } catch (error: any) {
      console.error('Error fetching resources:', error)
      setError(`Failed to load resources: ${error.message}`)
    } finally {
      setLoadingResources(false)
    }
  }

  const handleScrape = async () => {
    if (!scrapeUrl.trim()) {
      setScrapeError('Please enter a GitHub URL')
      return
    }
    
    // Basic URL validation
    if (!scrapeUrl.includes('github.com')) {
      setScrapeError('Please enter a valid GitHub repository URL')
      return
    }

    setIsScraping(true)
    setError(null)
    setScrapeError(null)

    try {
      const headers = await getAuthHeaders()
      const response = await fetch('/api/admin/resources', {
        method: 'POST',
        headers,
        body: JSON.stringify({ scrapeUrl: scrapeUrl.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: Failed to scrape resource`)
      }

      // Successfully scraped - populate form
      if (data.preview) {
        setFormData(data.preview)
        setEditingResource(null)
        clearFormErrors()
        setIsDialogOpen(true)
        setScrapeUrl('')
        setScrapeError(null)
        console.log('✅ Successfully scraped GitHub repository')
      } else {
        throw new Error('No preview data received from scraper')
      }
    } catch (err: any) {
      console.error('Scrape error:', err)
      const errorMessage = err.message || 'Failed to scrape repository'
      setScrapeError(errorMessage)
      setError(`GitHub scrape failed: ${errorMessage}`)
    } finally {
      setIsScraping(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      console.log('Form data being validated:', formData)
      
      // Validate form
      const errors = validateForm(formData)
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors)
        console.log('Form validation errors:', errors)
        throw new Error('Please fix the form errors before submitting')
      }
      
      clearFormErrors()
      
      const headers = await getAuthHeaders()
      const url = editingResource 
        ? `/api/admin/resources/${editingResource.id}`
        : '/api/admin/resources'
      const method = editingResource ? 'PUT' : 'POST'
      
      // Clean the form data
      const cleanedFormData = {
        ...formData,
        name: formData.name.trim(),
        description: formData.description.trim(),
        repo_url: formData.repo_url.trim(),
        demo_url: formData.demo_url.trim(),
        tags: Array.isArray(formData.tags) ? formData.tags.filter(Boolean) : [],
        framework: Array.isArray(formData.framework) ? formData.framework.filter(Boolean) : [],
        styling: Array.isArray(formData.styling) ? formData.styling.filter(Boolean) : []
      }
      
      console.log('Sending request:', { method, url, body: cleanedFormData })
      
      const response = await fetch(url, { 
        method, 
        headers, 
        body: JSON.stringify(cleanedFormData) 
      })
      
      const responseData = await response.json()
      
      if (!response.ok) {
        console.error('API response error:', responseData)
        throw new Error(responseData.error || `Failed to ${editingResource ? 'update' : 'create'} resource`)
      }
      
      console.log(`✅ Resource ${editingResource ? 'updated' : 'created'} successfully`)
      
      // Close dialog and refresh data
      setIsDialogOpen(false)
      clearForm()
      await fetchResources()
      await fetchStats()
      
    } catch (error: any) {
      console.error('Form submission error:', error)
      setError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (resource: DbResource) => {
    setEditingResource(resource)
    setFormData({
      name: resource.name,
      description: resource.description,
      demo_url: resource.demo_url,
      resource_type: resource.resource_type,
      framework: resource.framework || [],
      styling: resource.styling || [],
      repo_url: resource.repo_url || '',
      tags: resource.tags || [],
      is_active: resource.is_active
    })
    clearFormErrors()
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resource? This action cannot be undone.')) {
      return
    }

    try {
      setError(null)
      const headers = await getAuthHeaders()
      
      console.log('Deleting resource:', id)
      
      const response = await fetch(`/api/admin/resources/${id}`, {
        method: 'DELETE',
        headers
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Delete error response:', errorData)
        throw new Error(errorData.error || 'Failed to delete resource')
      }

      console.log('Resource deleted successfully')
      
      // Refresh data
      await fetchResources()
      await fetchStats()
      
    } catch (error: any) {
      console.error('Error deleting resource:', error)
      setError(`Failed to delete resource: ${error.message}`)
    }
  }

  const handleNewResource = () => {
    clearForm()
    setIsDialogOpen(true)
  }

  // Show loading while auth is being determined
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p>Loading authentication...</p>
          </div>  
        </div>
      </div>
    )
  }

  // Show loading while checking admin permissions
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p>Redirecting...</p>
          </div>  
        </div>
      </div>
    )
  }

  // Show access denied for non-admin users
  if (user.role !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
            <p>You need admin privileges to access this page.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Current role: {user.role}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage resources, users, and site settings.</p>
      </header>

      {/* Toolbar with Filters and Actions */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex flex-col md:flex-row w-full gap-4">
          <Input
            placeholder="Search resources..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="max-w-xs"
          />
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="max-w-xs">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="template">Template</SelectItem>
              <SelectItem value="component">Component</SelectItem>
              <SelectItem value="ui_library">UI Library</SelectItem>
              <SelectItem value="repository">Repository</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Scraper and Manual Add Actions */}
        <div className="flex w-full md:w-auto md:justify-end gap-4">
          <div className="relative flex-grow md:flex-grow-0">
              <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                  placeholder="Paste GitHub URL..."
                  value={scrapeUrl}
                  onChange={(e) => {
                    setScrapeUrl(e.target.value)
                    if (scrapeError) setScrapeError(null)
                  }}
                  className={`pl-9 h-10 ${scrapeError ? 'border-red-500' : ''}`}
                  disabled={isScraping}
              />
              {scrapeError && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {scrapeError}
                </p>
              )}
          </div>
          <Button 
            onClick={handleScrape} 
            disabled={isScraping || !scrapeUrl.trim()} 
            className="w-auto min-w-[100px]"
          >
              {isScraping ? (
                  <>
                    <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                    Scraping...
                  </>
              ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Scrape
                  </>
              )}
          </Button>
          <Button onClick={handleNewResource} variant="outline" className="w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add New
          </Button>
        </div>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-destructive/20 text-destructive rounded-lg">
          <p>Error: {error}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Resources</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingStats ? '...' : stats?.totalResources || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingStats ? '...' : stats?.totalUsers || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Searches</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingStats ? '...' : stats?.totalSearches || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Searches</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingStats ? '...' : stats?.recentSearches || 0}
            </div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Resources Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Resources</CardTitle>
              <CardDescription>Manage UI templates, components, and libraries</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Resources Table */}
          {loadingResources ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Framework</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resources.map((resource) => (
                    <TableRow key={resource.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{resource.name}</div>
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {resource.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{resource.resource_type}</Badge>
                      </TableCell>
                      <TableCell>
                        {resource.framework.map((framework, index) => (
                          <Badge variant="outline" key={index}>{framework}</Badge>
                        ))}
                      </TableCell>
                      <TableCell>
                        <Badge variant={resource.is_active ? "default" : "secondary"}>
                          {resource.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" asChild>
                            <a href={resource.demo_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                          {resource.repo_url && (
                            <Button variant="ghost" size="sm" asChild>
                              <a href={resource.repo_url} target="_blank" rel="noopener noreferrer">
                                <Github className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(resource)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDelete(resource.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Resource Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open)
        if (!open) {
          clearForm()
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingResource ? 'Edit Resource' : 'Add New Resource'}
            </DialogTitle>
            <DialogDescription>
              {editingResource ? 'Update resource information' : 'Add a new template, component, or library to the database'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Title *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={formErrors.name ? 'border-red-500' : ''}
                  required
                />
                {formErrors.name && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {formErrors.name}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="resource_type">Type *</Label>
                <Select 
                  value={formData.resource_type} 
                  onValueChange={(value) => setFormData({ ...formData, resource_type: value })}
                >
                  <SelectTrigger className={formErrors.resource_type ? 'border-red-500' : ''}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="template">Template</SelectItem>
                    <SelectItem value="component">Component</SelectItem>
                    <SelectItem value="ui_library">UI Library</SelectItem>
                    <SelectItem value="repository">Repository</SelectItem>
                  </SelectContent>
                </Select>
                {formErrors.resource_type && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {formErrors.resource_type}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={formErrors.description ? 'border-red-500' : ''}
                required
                rows={3}
              />
              {formErrors.description && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {formErrors.description}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="demo_url">Demo URL *</Label>
              <Input
                id="demo_url"
                type="url"
                value={formData.demo_url}
                onChange={(e) => setFormData({ ...formData, demo_url: e.target.value })}
                className={formErrors.demo_url ? 'border-red-500' : ''}
                required
              />
              {formErrors.demo_url && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {formErrors.demo_url}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="frameworks">Frameworks</Label>
                <TagsInput
                  value={formData.framework}
                  onChange={(frameworks) => setFormData({ ...formData, framework: frameworks })}
                  placeholder="e.g., react, vue, angular..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="styling">Styling</Label>
                <TagsInput
                  value={formData.styling}
                  onChange={(styling) => setFormData({ ...formData, styling: styling })}
                  placeholder="e.g., tailwind, mui, sass..."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="repo_url">GitHub URL</Label>
                <Input
                  id="repo_url"
                  type="url"
                  value={formData.repo_url}
                  onChange={(e) => setFormData({ ...formData, repo_url: e.target.value })}
                  className={formErrors.repo_url ? 'border-red-500' : ''}
                  placeholder="https://github.com/user/repo"
                />
                {formErrors.repo_url && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {formErrors.repo_url}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <TagsInput
                  value={formData.tags}
                  onChange={(tags) => setFormData({ ...formData, tags: tags })}
                  placeholder="e.g., dashboard, charts, admin..."
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="is_active">Active</Label>
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {editingResource ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  editingResource ? 'Update Resource' : 'Create Resource'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
} 