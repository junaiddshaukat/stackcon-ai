'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Search, Zap, ArrowLeft, Github, Globe } from 'lucide-react';
import Link from 'next/link';

interface AgentSearchResult {
  title: string;
  url: string;
  description: string;
  owner: string;
  repo: string;
  stars?: string;
  language?: string;
}

function AgentSearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<AgentSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  const performSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/agent-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: searchTerm }),
      });

      const data = await response.json();

      if (data.success) {
        setResults(data.data);
        setSearchQuery(data.searchQuery);
      } else {
        setError(data.error || 'Failed to perform agent search');
        setResults([]);
      }
    } catch (err) {
      console.error('Agent search error:', err);
      setError('Failed to connect to agent search service');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };

  return (
    <div className="min-h-screen  bg-gray-950 text-white">
      {/* Header */}
     

      <div className="max-w-7xl  mx-auto px-6 py-8">
        {/* Search Form */}
        

        {/* Search Info */}
        <div className="flex justify-center items-center min-h-[40vh] mb-8">
          <form onSubmit={handleSearch} className="w-full max-w-2xl">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Describe your project: 'I want to build a personalized chatbot app...'"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 text-lg py-3"
                />
              </div>
              <Button 
                type="submit" 
                disabled={loading || !query.trim()}
                className="bg-purple-500 hover:bg-purple-600 px-8 py-3"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </div>
          </form>
        </div>
        {searchQuery && (
          <div className="mb-6 p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <Globe className="w-4 h-4" />
              <span>Google Search Query:</span>
              <code className="bg-gray-900 px-2 py-1 rounded text-purple-400">
                {searchQuery}
              </code>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Searching GitHub repositories...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-red-400 mb-4">{error}</p>
              <p className="text-gray-500 text-sm">
                Note: Agent search requires Google Search API configuration. 
                Showing fallback results for now.
              </p>
            </div>
          </div>
        )}

        {/* Results */}
        {!loading && results.length > 0 && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">
                Found {results.length} repositories
              </h2>
              <Badge variant="outline" className="text-purple-400 border-purple-400">
                <Zap className="w-3 h-3 mr-1" />
                Agent Search
              </Badge>
            </div>

            <div className="grid gap-6">
              {results.map((result, index) => (
                <Card key={index} className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          <a 
                            href={result.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2"
                          >
                            <Github className="w-4 h-4" />
                            {result.owner}/{result.repo}
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </CardTitle>
                        <CardDescription className="mt-2 text-gray-300">
                          {result.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        {result.language && (
                          <div className="flex items-center space-x-1">
                            <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                            <span>{result.language}</span>
                          </div>
                        )}
                        {result.stars && (
                          <div className="flex items-center space-x-1">
                            <span>⭐</span>
                            <span>{result.stars}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          asChild
                          size="sm"
                          variant="outline"
                          className="border-gray-600 text-gray-300 hover:bg-gray-700"
                        >
                          <a 
                            href={result.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View on GitHub
                          </a>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* No Results */}
        {!loading && !error && results.length === 0 && query && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-300 mb-2">No repositories found</h3>
              <p className="text-gray-500 mb-6">
                Try adjusting your search terms or check if the Google Search API is configured.
              </p>
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 text-left">
                <h4 className="font-medium text-gray-300 mb-2">Search Tips:</h4>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• Be specific about your project type</li>
                  <li>• Include technology keywords</li>
                  <li>• Describe the main functionality</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Help Section */}
        {!query && (
          <div className="text-center py-12">
            <Zap className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-4">Agent Search</h2>
            <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
              Describe your project and our AI agent will search GitHub for relevant repositories using Google search.
            </p>
            
            <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto mt-8">
              <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4">
                <h3 className="font-medium text-purple-400 mb-2">Smart Query Processing</h3>
                <p className="text-sm text-gray-400">
                  Converts your natural language description into optimized search queries
                </p>
              </div>
              <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4">
                <h3 className="font-medium text-purple-400 mb-2">Google Search Power</h3>
                <p className="text-sm text-gray-400">
                  Leverages Google's search capabilities to find relevant GitHub repositories
                </p>
              </div>
              <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4">
                <h3 className="font-medium text-purple-400 mb-2">Curated Results</h3>
                <p className="text-sm text-gray-400">
                  Filters and presents the most relevant repositories for your project
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
    </div>
  );
}

export default function AgentSearchPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AgentSearchContent />
    </Suspense>
  );
} 