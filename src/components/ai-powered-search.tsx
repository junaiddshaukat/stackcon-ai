'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Lightbulb, 
  Code, 
  Database, 
  Palette, 
  Cloud, 
  Bot,
  ExternalLink,
  Clock,
  TrendingUp,
  Zap,
  Github,
  Loader2,
  Sparkles
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface Resource {
  id: string;
  name: string;
  description: string;
  repo_url: string;
  demo_url: string;
  resource_type: string;
  tech_stack_role: string;
  difficulty_level: string;
  implementation_time: string;
  relevance_score?: number;
}

interface SearchResults {
  intent: {
    primary_intent: string;
    complexity_level: string;
    estimated_time: string;
    key_features: string[];
    keywords: string[];
  };
  recommendations: {
    curated_collections: any[];
    resources_by_category: {
      frontend: Resource[];
      backend: Resource[];
      database: Resource[];
      ai: Resource[];
      deployment: Resource[];
      design: Resource[];
      tools: Resource[];
    };
    top_recommendations: Resource[];
    implementation_guidance: string;
  };
  metadata: {
    total_resources_found: number;
    complexity_level: string;
    estimated_time: string;
  };
}

interface AIPoweredSearchProps {
  initialQuery?: string;
}

export default function AIPoweredSearch({ initialQuery = '' }: AIPoweredSearchProps) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showGuidance, setShowGuidance] = useState(false);

  useEffect(() => {
    if (initialQuery) {
      handleSearch();
    }
  }, [initialQuery]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    setResults(null);
    setError(null);

    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query, 
          includeGuidance: showGuidance 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get recommendations');
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      frontend: Palette,
      backend: Code,
      database: Database,
      ai: Bot,
      deployment: Cloud,
      design: Palette,
      tools: Zap
    };
    return icons[category as keyof typeof icons] || Code;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* Search Interface */}
      <div className="relative mb-12">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 rounded-3xl blur-3xl"></div>
        <Card className="relative backdrop-blur-sm border-0 shadow-2xl bg-gray-900/90">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-center mb-6">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg">
                <Bot className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-center text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              AI Project Assistant
            </CardTitle>
            <CardDescription className="text-center text-lg text-gray-300 max-w-2xl mx-auto">
              Describe your project vision and receive intelligent, personalized recommendations for your tech stack
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="space-y-6">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Textarea
                  placeholder="✨ Describe your dream project... \n\nExample: I want to build a real-time collaborative dashboard that displays live sales analytics with interactive charts, user authentication, real-time notifications, and team collaboration features..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="relative min-h-[120px] resize-none border-2 border-gray-800 focus:border-blue-500 rounded-xl bg-gray-950/80 text-white placeholder:text-gray-500 transition-all duration-300 focus:shadow-lg"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.ctrlKey) {
                      handleSearch();
                    }
                  }}
                />
              </div>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <label className="flex items-center space-x-3 group cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={showGuidance}
                      onChange={(e) => setShowGuidance(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-12 h-6 rounded-full transition-all duration-300 ${showGuidance ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-gray-700'}`}>
                      <div className={`w-5 h-5 bg-white rounded-full shadow-lg transform transition-transform duration-300 ${showGuidance ? 'translate-x-6' : 'translate-x-0.5'} mt-0.5`}></div>
                    </div>
                  </div>
                  <span className="text-gray-300 font-medium group-hover:text-blue-400 transition-colors">Include implementation guidance</span>
                </label>
                <Button 
                  onClick={handleSearch}
                  disabled={isLoading || !query.trim()}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:transform-none"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                      <span className="font-semibold">Analyzing Your Vision...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-3 h-5 w-5" />
                      <span className="font-semibold">Get AI Recommendations</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-2xl blur"></div>
            <Card className="relative border-red-400 bg-gray-900/90 backdrop-blur-sm shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-3 text-red-300">
                  <div className="p-2 bg-red-900/40 rounded-full">
                    <ExternalLink className="h-5 w-5 text-red-400" />
                  </div>
                  <div>
                    <span className="font-semibold">Oops! Something went wrong</span>
                    <p className="text-red-400 mt-1">{error}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="space-y-8">
          {/* Intent Summary */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10 rounded-3xl blur-2xl"></div>
            <Card className="relative backdrop-blur-sm border-0 shadow-xl bg-gray-900/90">
              <CardHeader className="text-center pb-4">
                <CardTitle className="flex items-center justify-center gap-3 text-2xl">
                  <div className="p-3 rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-500 shadow-lg">
                    <Lightbulb className="h-6 w-6 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent font-bold">
                    Project Analysis & Insights
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200 hover:shadow-lg transition-all duration-300">
                      <div className="text-sm font-medium text-blue-600 mb-2">Project Type</div>
                      <div className="text-xl font-bold text-blue-800">
                        {results.intent.primary_intent.replace('-', ' ').toUpperCase()}
                      </div>
                    </div>
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative text-center p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl border border-emerald-200 hover:shadow-lg transition-all duration-300">
                      <div className="text-sm font-medium text-emerald-600 mb-2">Complexity Level</div>
                      <div className={`text-xl font-bold ${getDifficultyColor(results.intent.complexity_level)} px-3 py-1 rounded-xl`}>
                        {results.intent.complexity_level.toUpperCase()}
                      </div>
                    </div>
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-orange-600/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl border border-orange-200 hover:shadow-lg transition-all duration-300">
                      <div className="text-sm font-medium text-orange-600 mb-2">Estimated Time</div>
                      <div className="text-xl font-bold text-orange-800">
                        {results.intent.estimated_time}
                      </div>
                    </div>
                  </div>
                </div>

                {results.intent.key_features?.length > 0 && (
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
                    <div className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      Key Features Identified:
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {results.intent.key_features.map((feature, index) => (
                        <Badge 
                          key={index} 
                          className="px-4 py-2 bg-white border-2 border-blue-200 text-blue-800 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 rounded-xl font-medium"
                        >
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recommendations Tabs */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl blur-2xl"></div>
            <div className="relative backdrop-blur-sm bg-gray-900/90 rounded-3xl border-0 shadow-2xl p-8">
              <Tabs defaultValue="recommendations" className="space-y-8">
                <TabsList className="grid w-full grid-cols-3 bg-gray-800 p-2 rounded-2xl h-auto">
                  <TabsTrigger 
                    value="recommendations" 
                    className="rounded-xl py-3 px-6 data-[state=active]:bg-gray-700 data-[state=active]:shadow-lg data-[state=active]:text-blue-400 font-semibold transition-all duration-300"
                  >
                    ⭐ Top Picks
                  </TabsTrigger>
                  <TabsTrigger 
                    value="categories" 
                    className="rounded-xl py-3 px-6 data-[state=active]:bg-gray-700 data-[state=active]:shadow-lg data-[state=active]:text-purple-400 font-semibold transition-all duration-300"
                  >
                    📂 Categories
                  </TabsTrigger>
                  <TabsTrigger 
                    value="guidance" 
                    className="rounded-xl py-3 px-6 data-[state=active]:bg-gray-700 data-[state=active]:shadow-lg data-[state=active]:text-green-400 font-semibold transition-all duration-300"
                  >
                    🚀 Implementation
                  </TabsTrigger>
                </TabsList>

            {/* Top Recommendations */}
            <TabsContent value="recommendations" className="space-y-6">
              {results.recommendations.top_recommendations.length === 0 ? (
                <div className="text-center py-16">
                  <div className="mx-auto w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mb-6">
                    <Search className="h-10 w-10 text-gray-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-500 mb-2">No specific recommendations found</h3>
                  <p className="text-gray-400">Try exploring the category view for general resources that might help.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {results.recommendations.top_recommendations.slice(0, 8).map((resource) => (
                    <div key={resource.id} className="group relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                      <Card className="relative h-full border-2 border-gray-800 hover:border-blue-200 hover:shadow-2xl transition-all duration-500 rounded-2xl bg-gray-900/90 backdrop-blur-sm group-hover:transform group-hover:scale-[1.02]">
                        <CardHeader className="pb-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <CardTitle className="text-xl font-bold text-gray-300 group-hover:text-blue-400 transition-colors duration-300 mb-2">
                                {resource.name}
                              </CardTitle>
                              <CardDescription className="text-gray-500 line-clamp-3 leading-relaxed">
                                {resource.description}
                              </CardDescription>
                            </div>
                            {resource.difficulty_level && (
                              <Badge className={`${getDifficultyColor(resource.difficulty_level)} ml-4 px-3 py-1 rounded-xl font-medium shrink-0`}>
                                {resource.difficulty_level}
                              </Badge>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <div className="flex flex-wrap gap-2">
                              <Badge className="bg-blue-100 text-blue-800 border border-blue-200 px-3 py-1 rounded-xl font-medium">
                                {resource.resource_type}
                              </Badge>
                              {resource.tech_stack_role && (
                                <Badge className="bg-purple-100 text-purple-800 border border-purple-200 px-3 py-1 rounded-xl font-medium">
                                  {resource.tech_stack_role}
                                </Badge>
                              )}
                            </div>
                            <div className="flex gap-3">
                              {resource.repo_url && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.open(resource.repo_url, '_blank')}
                                  className="rounded-xl border-2 hover:border-blue-300 hover:bg-blue-800 transition-all duration-300"
                                >
                                  <Github className="h-4 w-4" />
                                </Button>
                              )}
                              {resource.demo_url && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.open(resource.demo_url, '_blank')}
                                  className="rounded-xl border-2 hover:border-green-300 hover:bg-green-800 transition-all duration-300"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* By Category */}
            <TabsContent value="categories" className="space-y-8">
              {Object.entries(results.recommendations.resources_by_category).map(([category, resources]) => {
                if (resources.length === 0) return null;
                
                const IconComponent = getCategoryIcon(category);
                
                return (
                  <div key={category} className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <Card className="relative border-2 border-gray-800 hover:border-indigo-200 rounded-2xl bg-gray-900/90 backdrop-blur-sm transition-all duration-500 hover:shadow-xl">
                      <CardHeader className="pb-6">
                        <CardTitle className="flex items-center gap-4 text-2xl capitalize">
                          <div className="p-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg">
                            <IconComponent className="h-6 w-6 text-white" />
                          </div>
                          <span className="font-bold text-gray-300">{category}</span>
                          <Badge className="bg-gray-800 text-gray-300 px-3 py-1 rounded-xl font-semibold">
                            {resources.length} resources
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                          {resources.slice(0, 6).map((resource) => (
                            <div key={resource.id} className="group/item relative">
                              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl blur opacity-0 group-hover/item:opacity-100 transition-opacity duration-300"></div>
                              <div className="relative border-2 border-gray-800 rounded-xl p-6 hover:shadow-lg transition-all duration-300 bg-gray-900/90 backdrop-blur-sm hover:border-blue-200 group-hover/item:transform group-hover/item:scale-105">
                                <h4 className="font-bold text-lg mb-3 text-gray-300 group-hover/item:text-blue-400 transition-colors">
                                  {resource.name}
                                </h4>
                                <p className="text-gray-500 mb-4 line-clamp-3 leading-relaxed">
                                  {resource.description}
                                </p>
                                <div className="flex gap-3">
                                  {resource.repo_url && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => window.open(resource.repo_url, '_blank')}
                                      className="rounded-xl border-2 hover:border-blue-300 hover:bg-blue-800 transition-all duration-300 flex-1"
                                    >
                                      <Github className="h-4 w-4 mr-2" />
                                      Code
                                    </Button>
                                  )}
                                  {resource.demo_url && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => window.open(resource.demo_url, '_blank')}
                                      className="rounded-xl border-2 hover:border-green-300 hover:bg-green-800 transition-all duration-300 flex-1"
                                    >
                                      <ExternalLink className="h-4 w-4 mr-2" />
                                      Demo
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </TabsContent>

            {/* Implementation Guidance */}
            <TabsContent value="guidance">
              {results.recommendations.implementation_guidance ? (
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-2xl blur"></div>
                  <Card className="relative border-2 border-gray-800 rounded-2xl bg-gray-900/90 backdrop-blur-sm shadow-xl">
                    <CardHeader className="pb-6">
                      <CardTitle className="flex items-center justify-center gap-4 text-2xl">
                        <div className="p-3 rounded-2xl bg-gradient-to-r from-green-500 to-blue-600 shadow-lg">
                          <Code className="h-6 w-6 text-white" />
                        </div>
                        <span className="font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                          Implementation Roadmap
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-gradient-to-r from-gray-800 to-gray-600 rounded-2xl p-8 border border-gray-700">
                        <div 
                          className="prose prose-lg max-w-none text-gray-300 leading-relaxed"
                          dangerouslySetInnerHTML={{ 
                            __html: results.recommendations.implementation_guidance.replace(/\n/g, '<br/>') 
                          }} 
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="mx-auto w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mb-6">
                    <Code className="h-10 w-10 text-gray-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-500 mb-2">Implementation guidance not available</h3>
                  <p className="text-gray-400">Try enabling the guidance option when searching for detailed implementation steps.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}