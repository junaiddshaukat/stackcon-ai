"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Sparkles, Zap, Code, Palette, Database, ArrowRight, TrendingUp, Users, Star } from "lucide-react"

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchType, setSearchType] = useState<"simple" | "ai" | "agent">("agent")

  const handleSearch = () => {
    if (!searchQuery.trim()) return

    if (searchType === "ai") {
      window.location.href = `/ai-search?q=${encodeURIComponent(searchQuery)}`
    } else if (searchType === "agent") {
      window.location.href = `/agent-search?q=${encodeURIComponent(searchQuery)}`
    } else {
      // For simple search, use agent search as fallback
      window.location.href = `/agent-search?q=${encodeURIComponent(searchQuery)}`
    }
  }

  const features = [
    {
      icon: Sparkles,
      title: "AI-Powered Recommendations",
      description: "Describe your project in natural language and get personalized tech stack suggestions",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Zap,
      title: "Agent Search",
      description: "Find GitHub repositories using Google search with smart query processing",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Search,
      title: "Smart Discovery",
      description: "Discover curated repositories and projects that match your needs",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: Code,
      title: "Build Faster",
      description: "Accelerate your development with battle-tested solutions",
      color: "from-orange-500 to-red-500",
    },
  ]

  const popularCategories = [
    { name: "Chatbots & AI", count: 45, icon: Sparkles },
    { name: "Finance Apps", count: 32, icon: TrendingUp },
    { name: "E-commerce", count: 28, icon: Database },
    { name: "Social Platforms", count: 24, icon: Users },
  ]

  const stats = [
    { label: "GitHub Repositories", value: "1M+", icon: Code },
    { label: "Search Queries", value: "10K+", icon: Search },
    { label: "Success Rate", value: "98%", icon: Star },
  ]

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navigation */}
    

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          {/* Main Heading */}
          <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-tight tracking-tight">
            Build Your Dream Project{" "}
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Faster
            </span>
          </h1>

          <p className="text-2xl text-gray-400 mb-16 max-w-3xl mx-auto leading-relaxed font-light">
            Discover GitHub repositories with AI-powered search, agent discovery, and smart recommendations
          </p>

          {/* Main Search Interface */}
          <div className="max-w-4xl mx-auto mb-20">
            <div className="relative">
              {/* Large Search Input */}
              <div className="bg-gray-800/60 border border-gray-700/50 rounded-3xl p-2 backdrop-blur-xl shadow-2xl">
                <div className="flex flex-col md:flex-row items-center">
                  {/* Search Type Toggles - Inside the input */}
                  <div className="flex items-center space-x-1 w-full md:w-auto pl-4 pr-2 mb-2 md:mb-0">
                    <button
                      onClick={() => setSearchType("agent")}
                      className={`px-2 md:px-3 py-2 rounded-2xl text-xs md:text-sm font-medium transition-all flex items-center flex-1 md:flex-none justify-center ${
                        searchType === "agent"
                          ? "bg-purple-500 text-white shadow-lg"
                          : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                      }`}
                    >
                      <Zap className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                      Agent
                    </button>
                    <button
                      onClick={() => setSearchType("ai")}
                      className={`px-2 md:px-3 py-2 rounded-2xl text-xs md:text-sm font-medium transition-all flex items-center flex-1 md:flex-none justify-center ${
                        searchType === "ai"
                          ? "bg-blue-500 text-white shadow-lg"
                          : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                      }`}
                    >
                      <Sparkles className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                      AI
                    </button>
                    <button
                      onClick={() => setSearchType("simple")}
                      className={`px-2 md:px-3 py-2 rounded-2xl text-xs md:text-sm font-medium transition-all flex items-center flex-1 md:flex-none justify-center ${
                        searchType === "simple"
                          ? "bg-green-500 text-white shadow-lg"
                          : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                      }`}
                    >
                      <Search className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                      Search
                    </button>
                  </div>

                  {/* Separator - Hidden on mobile */}
                  <div className="hidden md:block w-px h-8 bg-gray-600 mx-2"></div>

                  {/* Main Input */}
                  <div className="flex-1 relative w-full">
                    <Input
                      type="text"
                      placeholder={
                        searchType === "agent"
                          ? "Describe your project: 'I want to build a personalized chatbot app...'"
                          : searchType === "ai"
                          ? "Describe your project: 'I want to build a real-time dashboard with React...'"
                          : "Search frameworks, libraries, tools..."
                      }
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                      className="border-0 bg-transparent text-base md:text-xl py-4 md:py-6 px-4 text-white placeholder-gray-500 focus:ring-0 focus:outline-none w-full"
                    />
                  </div>

                  {/* Search Button */}
                  <div className="w-full md:w-auto mt-2 md:mt-0 pr-0 md:pr-2">
                    <Button
                      onClick={handleSearch}
                      disabled={!searchQuery.trim()}
                      className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 md:px-8 py-3 md:py-4 rounded-2xl font-medium text-sm md:text-lg transition-all w-full md:w-auto"
                    >
                      <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Search Suggestions */}
              <div className="mt-4 md:mt-6 flex flex-wrap justify-center gap-2 md:gap-3">
                {searchType === "agent" ? (
                  <>
                    <button
                      onClick={() => setSearchQuery("I want to build a personalized chatbot app")}
                      className="px-3 md:px-4 py-2 bg-gray-800/40 border border-gray-700/50 rounded-full text-xs md:text-sm text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all"
                    >
                      Chatbot app
                    </button>
                    <button
                      onClick={() => setSearchQuery("I need a finance tracking application")}
                      className="px-3 md:px-4 py-2 bg-gray-800/40 border border-gray-700/50 rounded-full text-xs md:text-sm text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all"
                    >
                      Finance tracker
                    </button>
                    <button
                      onClick={() => setSearchQuery("I want to create a social media platform")}
                      className="px-3 md:px-4 py-2 bg-gray-800/40 border border-gray-700/50 rounded-full text-xs md:text-sm text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all"
                    >
                      Social platform
                    </button>
                  </>
                ) : searchType === "ai" ? (
                  <>
                    <button
                      onClick={() => setSearchQuery("I want to build a modern e-commerce website")}
                      className="px-3 md:px-4 py-2 bg-gray-800/40 border border-gray-700/50 rounded-full text-xs md:text-sm text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all"
                    >
                      E-commerce site
                    </button>
                    <button
                      onClick={() => setSearchQuery("I need a real-time dashboard with charts")}
                      className="px-3 md:px-4 py-2 bg-gray-800/40 border border-gray-700/50 rounded-full text-xs md:text-sm text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all"
                    >
                      Dashboard app
                    </button>
                    <button
                      onClick={() => setSearchQuery("I want to create a mobile-first social app")}
                      className="px-3 md:px-4 py-2 bg-gray-800/40 border border-gray-700/50 rounded-full text-xs md:text-sm text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all"
                    >
                      Social app
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setSearchQuery("React")}
                      className="px-3 md:px-4 py-2 bg-gray-800/40 border border-gray-700/50 rounded-full text-xs md:text-sm text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all"
                    >
                      React
                    </button>
                    <button
                      onClick={() => setSearchQuery("Next.js")}
                      className="px-3 md:px-4 py-2 bg-gray-800/40 border border-gray-700/50 rounded-full text-xs md:text-sm text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all"
                    >
                      Next.js
                    </button>
                    <button
                      onClick={() => setSearchQuery("Tailwind CSS")}
                      className="px-3 md:px-4 py-2 bg-gray-800/40 border border-gray-700/50 rounded-full text-xs md:text-sm text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all"
                    >
                      Tailwind CSS
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Search Description */}
            <p className="text-gray-500 mt-6 md:mt-8 text-base md:text-lg text-center">
              {searchType === "agent" ? (
                <>
                  <span className="text-purple-400">🤖 Agent search</span> finds GitHub repositories using Google search
                </>
              ) : searchType === "ai" ? (
                <>
                  <span className="text-blue-400">✨ AI-powered</span> recommendations based on your project description
                </>
              ) : (
                <>
                  <span className="text-green-400">🔍 Smart search</span> through GitHub repositories
                </>
              )}
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-3xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-600/10 border border-gray-700/50 rounded-2xl group-hover:from-blue-500/20 group-hover:to-purple-600/20 transition-all">
                    <stat.icon className="h-8 w-8 text-blue-400" />
                  </div>
                </div>
                <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-gray-400 text-lg">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-8">
              Everything You Need to{" "}
              <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Ship Faster
              </span>
            </h2>
            <p className="text-2xl text-gray-400 max-w-3xl mx-auto font-light">
              Stop wasting time researching. Get instant, AI-powered recommendations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-800/20 to-gray-900/20 border border-gray-700/30 rounded-3xl p-10 hover:from-gray-800/30 hover:to-gray-900/30 hover:border-gray-600/50 transition-all duration-500 group"
              >
                <div
                  className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${feature.color} mb-8 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-gray-400 text-lg leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="py-20 px-6 bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Popular Categories</h2>
            <p className="text-xl text-gray-400">Explore our most popular resource categories</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularCategories.map((category, index) => (
              <Link
                key={index}
                href={`/library?category=${encodeURIComponent(category.name.toLowerCase())}`}
                className="group"
              >
                <div className="bg-gray-800/30 border border-gray-700 rounded-2xl p-6 hover:bg-gray-800/50 hover:border-gray-600 transition-all duration-300">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-xl group-hover:from-blue-500/30 group-hover:to-purple-600/30 transition-all">
                      <category.icon className="h-6 w-6 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-400">{category.count} resources</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-600/10 border border-gray-700 rounded-3xl p-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Build Something{" "}
              <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Amazing?
              </span>
            </h2>
            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
              Join thousands of developers who use StackCon to accelerate their projects
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/ai-search">
                <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 text-lg rounded-xl">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Try AI Search
                </Button>
              </Link>
              <Link href="/library">
                <Button className="bg-gray-800 border border-gray-700 text-white hover:bg-gray-700 px-8 py-4 text-lg rounded-xl">
                  Browse Library
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Code className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">StackCon</span>
            </div>
            <div className="flex items-center space-x-8 text-gray-400">
              <Link href="/library" className="hover:text-white transition-colors">
                Library
              </Link>
              <Link href="/ai-search" className="hover:text-white transition-colors">
                AI Search
              </Link>
              <span className="text-sm">© 2025 StackCon. All rights reserved.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
