interface GoogleSearchResult {
  title: string;
  link: string;
  snippet: string;
  displayLink: string;
}

interface GoogleSearchResponse {
  items: GoogleSearchResult[];
  searchInformation: {
    totalResults: string;
    searchTime: number;
  };
}

interface AgentSearchResult {
  title: string;
  url: string;
  description: string;
  owner: string;
  repo: string;
  stars?: string;
  language?: string;
}

export class GoogleSearchAgent {
  private apiKey: string;
  private searchEngineId: string;

  constructor() {
    this.apiKey = process.env.GOOGLE_SEARCH_API_KEY || '';
    this.searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID || '';
  }

  /**
   * Process user prompt and extract search keywords
   */
  queryAgent(userPrompt: string): string {
    // Clean and extract keywords from user prompt
    let prompt = userPrompt.toLowerCase().trim();
    
    // Remove common words that don't add value to search
    const stopWords = ['i', 'want', 'to', 'build', 'an', 'app', 'for', 'the', 'a', 'that', 'is', 'with', 'and', 'or', 'but', 'create', 'make', 'need'];
    const words = prompt.split(' ').filter(word => 
      word.length > 2 && !stopWords.includes(word)
    );

    // Extract key terms - be more generous with keywords
    const keyTerms = words.slice(0, 4).join(' '); // Take first 4 relevant words
    
    // Construct GitHub-specific search query with multiple variations
    const variations = [
      keyTerms,
      keyTerms.replace(/\s+/g, '-'), // hyphenated version
      keyTerms.replace(/\s+/g, ''), // concatenated version
    ];
    
    const searchQuery = `site:github.com (${variations.map(v => `"${v}"`).join(' OR ')}) AND (readme OR description)`;
    
    return searchQuery;
  }

  /**
   * Search GitHub repositories using Google Custom Search API
   */
  async searchGitHubRepositories(userPrompt: string): Promise<AgentSearchResult[]> {
    try {
      if (!this.apiKey || !this.searchEngineId) {
        throw new Error('Google Search API credentials not configured');
      }

      const searchQuery = this.queryAgent(userPrompt);
      const url = `https://www.googleapis.com/customsearch/v1?key=${this.apiKey}&cx=${this.searchEngineId}&q=${encodeURIComponent(searchQuery)}&num=10`;

      console.log('Google Search Query:', searchQuery);

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Google Search API error: ${response.status}`);
      }

      const data: GoogleSearchResponse = await response.json();

      if (!data.items) {
        return [];
      }

      // Process and filter GitHub repository results
      const repositories: AgentSearchResult[] = data.items
        .filter(item => item.link.includes('github.com'))
        .map(item => this.parseGitHubResult(item))
        .filter(repo => repo !== null) as AgentSearchResult[];

      // Enhance results with additional GitHub data if possible
      return await this.enhanceResults(repositories);

    } catch (error) {
      console.error('Google Search Agent error:', error);
      throw error;
    }
  }

  /**
   * Parse GitHub repository information from search result
   */
  private parseGitHubResult(result: GoogleSearchResult): AgentSearchResult | null {
    try {
      const url = result.link;
      const urlMatch = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      
      if (!urlMatch) return null;

      const [, owner, repo] = urlMatch;
      
      // Clean repo name (remove .git, etc.)
      const cleanRepo = repo.replace(/\.git$/, '').split('/')[0];

      return {
        title: result.title,
        url: url,
        description: result.snippet,
        owner: owner,
        repo: cleanRepo
      };
    } catch (error) {
      console.error('Error parsing GitHub result:', error);
      return null;
    }
  }

  /**
   * Enhance results with additional GitHub metadata
   */
  private async enhanceResults(repositories: AgentSearchResult[]): Promise<AgentSearchResult[]> {
    // For now, return as-is. Could be enhanced with GitHub API calls
    // to get stars, language, etc. if needed
    return repositories;
  }

  /**
   * Fallback search using alternative method with curated repositories
   */
  async searchAlternative(userPrompt: string): Promise<AgentSearchResult[]> {
    const keywords = this.extractKeywords(userPrompt);
    const lowerPrompt = userPrompt.toLowerCase();
    
    // Curated repository suggestions based on common project types
    const curatedRepos: AgentSearchResult[] = [];

    // Chatbot/AI related
    if (lowerPrompt.includes('chatbot') || lowerPrompt.includes('chat') || lowerPrompt.includes('ai bot')) {
      curatedRepos.push(
        {
          title: "mckaywrigley/chatbot-ui",
          url: "https://github.com/mckaywrigley/chatbot-ui",
          description: "An open source ChatGPT UI with React and Next.js. Perfect for building chatbot interfaces.",
          owner: "mckaywrigley",
          repo: "chatbot-ui",
          stars: "24.5k",
          language: "TypeScript"
        },
        {
          title: "lobehub/lobe-chat",
          url: "https://github.com/lobehub/lobe-chat",
          description: "Modern AI chat framework with plugin system and beautiful UI for chatbot applications.",
          owner: "lobehub", 
          repo: "lobe-chat",
          stars: "18.9k",
          language: "TypeScript"
        },
        {
          title: "ChatGPTNextWeb/ChatGPT-Next-Web",
          url: "https://github.com/ChatGPTNextWeb/ChatGPT-Next-Web",
          description: "One-Click to deploy well-designed ChatGPT web UI on Vercel.",
          owner: "ChatGPTNextWeb",
          repo: "ChatGPT-Next-Web", 
          stars: "75.2k",
          language: "TypeScript"
        }
      );
    }

    // Finance/Banking related
    if (lowerPrompt.includes('finance') || lowerPrompt.includes('banking') || lowerPrompt.includes('money') || lowerPrompt.includes('budget')) {
      curatedRepos.push(
        {
          title: "maybe-finance/maybe",
          url: "https://github.com/maybe-finance/maybe",
          description: "The OS for your personal finances. Built with Next.js, Prisma, and Tailwind CSS.",
          owner: "maybe-finance",
          repo: "maybe",
          stars: "15.4k",
          language: "TypeScript"
        },
        {
          title: "actual-app/actual",
          url: "https://github.com/actual-app/actual",
          description: "A local-first personal finance system with zero-knowledge encryption.",
          owner: "actual-app",
          repo: "actual", 
          stars: "9.8k",
          language: "JavaScript"
        },
        {
          title: "firefly-iii/firefly-iii",
          url: "https://github.com/firefly-iii/firefly-iii",
          description: "Firefly III: a personal finances manager with powerful budgeting features.",
          owner: "firefly-iii",
          repo: "firefly-iii",
          stars: "12.8k",
          language: "PHP"
        }
      );
    }

    // E-commerce related
    if (lowerPrompt.includes('ecommerce') || lowerPrompt.includes('shop') || lowerPrompt.includes('store') || lowerPrompt.includes('commerce')) {
      curatedRepos.push(
        {
          title: "medusajs/medusa",
          url: "https://github.com/medusajs/medusa",
          description: "The open-source Shopify alternative. Build customizable commerce experiences.",
          owner: "medusajs",
          repo: "medusa",
          stars: "20.1k",
          language: "TypeScript"
        },
        {
          title: "saleor/saleor",
          url: "https://github.com/saleor/saleor",
          description: "A modular, high performance, headless e-commerce platform built with Python and GraphQL.",
          owner: "saleor",
          repo: "saleor",
          stars: "19.8k",
          language: "Python"
        },
        {
          title: "vercel/commerce",
          url: "https://github.com/vercel/commerce",
          description: "Next.js Commerce - High-performance ecommerce template with Shopify, BigCommerce & more.",
          owner: "vercel",
          repo: "commerce",
          stars: "8.9k",
          language: "TypeScript"
        }
      );
    }

    // Social media/networking related
    if (lowerPrompt.includes('social') || lowerPrompt.includes('network') || lowerPrompt.includes('community') || lowerPrompt.includes('forum')) {
      curatedRepos.push(
        {
          title: "discourse/discourse",
          url: "https://github.com/discourse/discourse",
          description: "A platform for community discussion. Free, open, simple. Built with Ruby on Rails.",
          owner: "discourse",
          repo: "discourse",
          stars: "40.2k",
          language: "Ruby"
        },
        {
          title: "mastodon/mastodon",
          url: "https://github.com/mastodon/mastodon",
          description: "Your self-hosted, globally interconnected microblogging community.",
          owner: "mastodon",
          repo: "mastodon",
          stars: "46.1k",
          language: "Ruby"
        },
        {
          title: "bluesky-social/atproto",
          url: "https://github.com/bluesky-social/atproto",
          description: "The AT Protocol (Authenticated Transfer Protocol) for decentralized social networking.",
          owner: "bluesky-social",
          repo: "atproto",
          stars: "5.8k",
          language: "TypeScript"
        }
      );
    }

    // Dashboard/Analytics related
    if (lowerPrompt.includes('dashboard') || lowerPrompt.includes('analytics') || lowerPrompt.includes('charts') || lowerPrompt.includes('data visualization')) {
      curatedRepos.push(
        {
          title: "grafana/grafana",
          url: "https://github.com/grafana/grafana",
          description: "The open and composable observability and data visualization platform.",
          owner: "grafana",
          repo: "grafana",
          stars: "57.8k",
          language: "TypeScript"
        },
        {
          title: "apache/superset",
          url: "https://github.com/apache/superset",
          description: "Apache Superset is a Data Visualization and Data Exploration Platform.",
          owner: "apache",
          repo: "superset",
          stars: "57.1k",
          language: "Python"
        },
        {
          title: "tremor-rs/tremor-www-docs",
          url: "https://github.com/tremorlabs/tremor",
          description: "React components to build beautiful dashboards fast. Built on top of Tailwind CSS.",
          owner: "tremorlabs",
          repo: "tremor",
          stars: "4.2k",
          language: "TypeScript"
        }
      );
    }

    // If no specific matches, provide general popular repositories
    if (curatedRepos.length === 0) {
      curatedRepos.push(
        {
          title: "supabase/supabase",
          url: "https://github.com/supabase/supabase",
          description: "The open source Firebase alternative. Build backends fast with PostgreSQL.",
          owner: "supabase",
          repo: "supabase",
          stars: "65.4k",
          language: "TypeScript"
        },
        {
          title: "vercel/next.js",
          url: "https://github.com/vercel/next.js",
          description: "The React Framework for Production. Build full-stack web applications.",
          owner: "vercel",
          repo: "next.js",
          stars: "118k",
          language: "JavaScript"
        },
        {
          title: "tailwindlabs/tailwindcss",
          url: "https://github.com/tailwindlabs/tailwindcss",
          description: "A utility-first CSS framework for rapid UI development.",
          owner: "tailwindlabs",
          repo: "tailwindcss",
          stars: "77.2k",
          language: "JavaScript"
        }
      );
    }

    // Also add a direct GitHub search link
    curatedRepos.push({
      title: `Search GitHub for: ${keywords.join(' ')}`,
      url: `https://github.com/search?q=${encodeURIComponent(keywords.join(' '))}`,
      description: `Click to search GitHub directly for repositories matching: ${keywords.join(', ')}`,
      owner: "github",
      repo: "search"
    });

    return curatedRepos.slice(0, 8); // Return up to 8 results
  }

  /**
   * Extract relevant keywords from user prompt
   */
  private extractKeywords(prompt: string): string[] {
    const cleaned = prompt.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2)
      .filter(word => !['the', 'and', 'for', 'app', 'build', 'want'].includes(word));
    
    return cleaned.slice(0, 5); // Return top 5 keywords
  }
}

export const googleSearchAgent = new GoogleSearchAgent(); 