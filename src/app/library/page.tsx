use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  ExternalLink, 
  Github, 
  Star,
  Grid3X3,
  List,
  SlidersHorizontal,
  ChevronDown,
  X,
  Heart
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth-provider';

interface Resource {
  id: string;
  name: string;
  description: string;
  repo_url: string;
  demo_url: string;
  resource_type: string;
  framework: string[];
  styling: string[];
  tags: string[];
  difficulty_level?: string;
  tech_stack_role?: string;
}

function LibraryContent() {
  const searchParams = useSearchParams();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams?.get('search') || '');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedFramework, setSelectedFramework] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'type' | 'recent'>('name');
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const ITEMS_PER_PAGE = 24;

  // Filter options
  const resourceTypes = ['template', 'component', 'repository', 'ui_library'];
  const frameworks = ['react', 'vue', 'angular', 'svelte', 'nextjs'];
  const difficulties = ['beginner', 'intermediate', 'advanced'];

  useEffect(() => {
    fetchResources();
    if (user) {
      loadFavorites();
    }
  }, [searchQuery, selectedType, selectedFramework, selectedDifficulty, sortBy, currentPage, user]);

  const fetchResources = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('resources')
        .select('*', { count: 'exact' })
        .order(sortBy === 'recent' ? 'created_at' : 'name', { 
          ascending: sortBy !== 'recent' 
        });

      // Apply filters
      if (selectedType !== 'all') {
        query = query.eq('resource_type', selectedType);
      }

      if (selectedFramework !== 'all') {
        query = query.contains('framework', [selectedFramework]);
      }

      if (selectedDifficulty !== 'all') {
        query = query.eq('difficulty_level', selectedDifficulty);
      }

      // Apply search
      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      // Apply pagination
      const offset = (currentPage - 1) * ITEMS_PER_PAGE;
      const { data, error, count } = await query
        .range(offset, offset + ITEMS_PER_PAGE - 1);

      if (error) {
        console.error('Error fetching resources:', error);
        return;
      }

      setResources(data || []);
      setTotalCount(count || 0);
      setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE));
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    if (!user) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;
      const response = await fetch('/api/favorites', {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      if (response.ok) {
        const data = await response.json();
        const favoriteIds: Set<string> = new Set<string>(data.favorites.map((f: any) => f.resource_id));
        setFavorites(favoriteIds);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const toggleFavorite = async (resourceId: string) => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    const isFavorited = favorites.has(resourceId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;
      if (isFavorited) {
        const response = await fetch(`/api/favorites?resource_id=${resourceId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        });
        if (response.ok) {
          setFavorites(prev => {
            const newFavorites = new Set(prev);
            newFavorites.delete(resourceId);
            return newFavorites;
          });
        }
      } else {
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({ resource_id: resourceId })
        });
        if (response.ok) {
          setFavorites(prev => new Set(prev).add(resourceId));
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const clearFilters = () => {
    setSelectedType('all');
    setSelectedFramework('all');
    setSelectedDifficulty('all');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPaginationRange = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (selectedType !== 'all') count++;
    if (selectedFramework !== 'all') count++;
    if (selectedDifficulty !== 'all') count++;
    if (searchQuery) count++;
    return count;
  };

  return (
    <div className="min-h-screen mt-10 bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 leading-tight tracking-tight">
            Resource Library
          </h1>
          <p className="text-2xl text-gray-400 max-w-2xl mx-auto font-light">
            Discover and explore our curated collection of development resources
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-gray-900/80 border border-gray-700/50 rounded-3xl p-8 mb-12 shadow-2xl backdrop-blur-xl">
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search resources, frameworks, libraries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-4 bg-gray-800/60 border-0 text-white placeholder-gray-500 rounded-2xl focus:ring-0 focus:outline-none"
            />
          </div>

          {/* Filter Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* Filters Toggle */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 bg-gray-800/60 border-gray-700/50 text-gray-200 hover:bg-gray-700/50"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {getActiveFilterCount() > 0 && (
                  <Badge variant="secondary" className="ml-1 bg-blue-500/20 text-blue-300">
                    {getActiveFilterCount()}
                  </Badge>
                )}
                <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </Button>

              {/* Quick Filters */}
              <div className="flex flex-wrap gap-2">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-3 py-2 border border-gray-700 bg-gray-800 text-gray-200 rounded-md text-sm"
                >
                  <option value="all">All Types</option>
                  {resourceTypes.map(type => (
                    <option key={type} value={type}>
                      {type.replace('_', ' ').toUpperCase()}
                    </option>
                  ))}
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 border border-gray-700 bg-gray-800 text-gray-200 rounded-md text-sm"
                >
                  <option value="name">Sort by Name</option>
                  <option value="type">Sort by Type</option>
                  <option value="recent">Sort by Recent</option>
                </select>
              </div>

              {/* Clear Filters */}
              {getActiveFilterCount() > 0 && (
                <Button
                  variant="ghost"
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-sm text-gray-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                  Clear
                </Button>
              )}
            </div>

            {/* View Mode and Results Count */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">
                {totalCount} resources total • Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of {totalCount}
              </span>
              <div className="flex border border-gray-700 rounded-md bg-gray-800/60">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none text-gray-200"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none text-gray-200"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Extended Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Framework
                  </label>
                  <select
                    value={selectedFramework}
                    onChange={(e) => {
                      setSelectedFramework(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-3 py-2 border border-gray-700 bg-gray-800 text-gray-200 rounded-md text-sm"
                  >
                    <option value="all">All Frameworks</option>
                    {frameworks.map(framework => (
                      <option key={framework} value={framework}>
                        {framework.charAt(0).toUpperCase() + framework.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Difficulty
                  </label>
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => {
                      setSelectedDifficulty(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-3 py-2 border border-gray-700 bg-gray-800 text-gray-200 rounded-md text-sm"
                  >
                    <option value="all">All Levels</option>
                    {difficulties.map(difficulty => (
                      <option key={difficulty} value={difficulty}>
                        {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Resource Type
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => {
                      setSelectedType(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-3 py-2 border border-gray-700 bg-gray-800 text-gray-200 rounded-md text-sm"
                  >
                    <option value="all">All Types</option>
                    {resourceTypes.map(type => (
                      <option key={type} value={type}>
                        {type.replace('_', ' ').toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Resource Cards/List */}
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8' : 'space-y-6'}>
          {loading ? (
            <div className="col-span-full text-center text-gray-400 py-20 text-xl">Loading resources...</div>
          ) : resources.length === 0 ? (
            <div className="col-span-full text-center text-gray-400 py-20 text-xl">No resources found.</div>
          ) : (
            resources.map(resource => {
              const isFavorited = favorites.has(resource.id);
              return (
                <Card
                  key={resource.id}
                  className={`relative overflow-hidden bg-gradient-to-br from-gray-900/70 to-gray-800/80 border border-gray-700/70 rounded-3xl shadow-2xl transition-all duration-300 hover:scale-[1.025] hover:shadow-blue-900/40 group ${viewMode === 'list' ? 'flex flex-row items-center gap-6 p-6' : 'p-8'}`}
                >
                  {/* Glow effect */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  <CardHeader className="p-0 mb-4 flex flex-row items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                        <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-pink-500 mr-2" />
                        {resource.name}
                      </CardTitle>
                      <CardDescription className="text-gray-400 text-base">
                        {resource.description}
                      </CardDescription>
                    </div>
                    <button
                      aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                      onClick={() => toggleFavorite(resource.id)}
                      className={`ml-2 p-2 rounded-full bg-gray-800 hover:bg-pink-600 transition-colors shadow-lg group/heart ${isFavorited ? 'scale-110' : ''}`}
                    >
                      <Heart className={`h-6 w-6 ${isFavorited ? 'fill-pink-400 text-pink-400' : 'text-gray-400 hover:text-pink-400'}`} fill={isFavorited ? 'currentColor' : 'none'} />
                    </button>
                  </CardHeader>
                  <CardContent className="p-0 flex flex-col gap-4">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {resource.tags.map(tag => (
                        <Badge key={tag} className="bg-blue-500/20 text-blue-300 rounded-full px-3 py-1 text-xs font-medium">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      {resource.repo_url && (
                        <a href={resource.repo_url} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-lg hover:from-blue-700 hover:to-purple-700 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.49.5.09.66-.22.66-.48 0-.24-.01-.87-.01-1.7-2.78.6-3.37-1.34-3.37-1.34-.45-1.15-1.1-1.46-1.1-1.46-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.56-1.11-4.56-4.95 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02A9.56 9.56 0 0112 6.8c.85.004 1.71.115 2.51.337 1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.85-2.34 4.7-4.57 4.95.36.31.68.92.68 1.85 0 1.33-.01 2.4-.01 2.73 0 .27.16.58.67.48A10.01 10.01 0 0022 12c0-5.52-4.48-10-10-10z"></path></svg>
                          Repo
                        </a>
                      )}
                      {resource.demo_url && (
                        <a href={resource.demo_url} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-blue-500 text-white font-semibold shadow-lg hover:from-pink-600 hover:to-blue-600 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pink-500"
                        >
                          <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 3v2a1 1 0 001 1h3.59l-7.3 7.29a1 1 0 001.42 1.42L20 7.41V11a1 1 0 102 0V3a1 1 0 00-1-1h-8a1 1 0 100 2h3.59l-7.3 7.29a1 1 0 001.42 1.42L20 7.41V11a1 1 0 102 0V3a1 1 0 00-1-1h-8a1 1 0 100 2z"></path></svg>
                          Demo
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-12">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="bg-gray-800/60 border-gray-700/50 text-gray-200 hover:bg-gray-700/50 disabled:opacity-50"
            >
              Previous
            </Button>
            
            {getPaginationRange().map((page, index) => (
              <React.Fragment key={index}>
                {page === '...' ? (
                  <span className="px-3 py-2 text-gray-400">...</span>
                ) : (
                  <Button
                    variant={currentPage === page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handlePageChange(page as number)}
                    className={`${
                      currentPage === page
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-800/60 border-gray-700/50 text-gray-200 hover:bg-gray-700/50'
                    }`}
                  >
                    {page}
                  </Button>
                )}
              </React.Fragment>
            ))}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="bg-gray-800/60 border-gray-700/50 text-gray-200 hover:bg-gray-700/50 disabled:opacity-50"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LibraryPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LibraryContent />
    </Suspense>
  );
} 