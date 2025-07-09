import { openai } from './ai';

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

interface ExtractedKeywords {
  primaryKeywords: string[];
  technologies: string[];
  projectType: string;
  domains: string[];
  searchTerms: string[];
}

export class GoogleSearchAgent {
  private apiKey: string;
  private searchEngineId: string;

  constructor() {
    this.apiKey = process.env.GOOGLE_SEARCH_API_KEY || '';
    this.searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID || '';
  }

  /**
   * Use AI to extract keywords and tags from user prompt
   */
  async extractKeywordsWithAI(userPrompt: string): Promise<ExtractedKeywords> {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are an expert at analyzing project descriptions and extracting relevant keywords for GitHub repository searches.

Extract keywords from the user's project description and return them in this exact JSON format:
{
  "primaryKeywords": ["main", "concepts", "from", "description"],
  "technologies": ["tech", "stack", "languages", "frameworks"],
  "projectType": "type of application",
  "domains": ["industry", "domain", "areas"],
  "searchTerms": ["optimized", "search", "terms"]
}

Rules:
- primaryKeywords: 3-5 most important words from the description
- technologies: Any tech stack, languages, frameworks mentioned or implied
- projectType: Single word describing the type of application (e.g., "chatbot", "ecommerce", "dashboard")
- domains: Industry or domain areas (e.g., "finance", "social", "healthcare")
- searchTerms: 3-5 optimized terms for GitHub search

Examples:
"I want to build a personalized chatbot app" → primaryKeywords: ["personalized", "chatbot", "app"], technologies: ["javascript", "python", "ai"], projectType: "chatbot", domains: ["ai", "conversation"], searchTerms: ["chatbot", "conversational-ai", "personal-assistant"]

"I need a finance tracking application" → primaryKeywords: ["finance", "tracking", "application"], technologies: ["react", "nodejs", "database"], projectType: "finance", domains: ["fintech", "personal-finance"], searchTerms: ["finance-tracker", "budgeting", "expense-manager"]`
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        max_tokens: 300,
        temperature: 0.3,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from AI');
      }

      const extracted = JSON.parse(content) as ExtractedKeywords;
      
      // Validate the response
      if (!extracted.primaryKeywords || !Array.isArray(extracted.primaryKeywords)) {
        throw new Error('Invalid AI response format');
      }

      return extracted;
    } catch (error) {
      console.warn('AI keyword extraction failed, using fallback:', error);
      return this.extractKeywordsFallback(userPrompt);
    }
  }

  /**
   * Fallback keyword extraction without AI
   */
  private extractKeywordsFallback(userPrompt: string): ExtractedKeywords {
    const prompt = userPrompt.toLowerCase().trim();
    
    // Remove common words
    const stopWords = ['i', 'want', 'to', 'build', 'an', 'app', 'for', 'the', 'a', 'that', 'is', 'with', 'and', 'or', 'but', 'create', 'make', 'need'];
    const words = prompt.split(' ').filter(word => 
      word.length > 2 && !stopWords.includes(word)
    );

    // Simple categorization
    const techKeywords = ['react', 'vue', 'angular', 'nodejs', 'python', 'java', 'javascript', 'typescript', 'ai', 'ml', 'database'];
    const domainKeywords = ['finance', 'social', 'ecommerce', 'health', 'education', 'gaming', 'analytics'];
    
    const technologies = words.filter(word => techKeywords.some(tech => word.includes(tech)));
    const domains = words.filter(word => domainKeywords.some(domain => word.includes(domain)));
    const primaryKeywords = words.slice(0, 4);

    // Determine project type
    let projectType = 'application';
    if (prompt.includes('chatbot') || prompt.includes('chat')) projectType = 'chatbot';
    else if (prompt.includes('dashboard') || prompt.includes('analytics')) projectType = 'dashboard';
    else if (prompt.includes('ecommerce') || prompt.includes('shop')) projectType = 'ecommerce';
    else if (prompt.includes('social') || prompt.includes('network')) projectType = 'social';
    else if (prompt.includes('finance') || prompt.includes('money')) projectType = 'finance';

    return {
      primaryKeywords,
      technologies: technologies.length > 0 ? technologies : ['javascript', 'react'],
      projectType,
      domains: domains.length > 0 ? domains : [projectType],
      searchTerms: primaryKeywords.slice(0, 3)
    };
  }

  /**
   * Process user prompt and extract search keywords using AI
   */
  async queryAgent(userPrompt: string): Promise<string> {
    try {
      const extracted = await this.extractKeywordsWithAI(userPrompt);
      
      // Combine all keywords for search
      const allKeywords = [
        ...extracted.primaryKeywords,
        ...extracted.searchTerms,
        extracted.projectType,
        ...extracted.domains.slice(0, 2), // Limit domains
        ...extracted.technologies.slice(0, 2) // Limit technologies
      ];

      // Remove duplicates and empty strings
      const uniqueKeywords = [...new Set(allKeywords)].filter(k => k && k.length > 2);
      
      // Create multiple search variations
      const searchVariations = [
        // Primary search with project type
        `"${extracted.projectType}" ${extracted.primaryKeywords.slice(0, 2).join(' ')}`,
        // Technology-focused search
        extracted.technologies.length > 0 ? `${extracted.technologies[0]} ${extracted.projectType}` : '',
        // Domain-focused search
        extracted.domains.length > 0 ? `${extracted.domains[0]} ${extracted.projectType}` : '',
        // Search terms
        extracted.searchTerms.slice(0, 2).join(' ')
      ].filter(v => v.length > 0);

      // Construct optimized GitHub search query
      const searchQuery = `site:github.com (${searchVariations.map(v => `"${v}"`).join(' OR ')}) AND (stars:>10 OR forks:>5)`;
      
      console.log('AI-extracted keywords:', extracted);
      console.log('Generated search query:', searchQuery);
      
      return searchQuery;
    } catch (error) {
      console.error('Error in queryAgent:', error);
      // Fallback to simple keyword extraction
      return this.queryAgentFallback(userPrompt);
    }
  }

  /**
   * Fallback query generation
   */
  private queryAgentFallback(userPrompt: string): string {
    const extracted = this.extractKeywordsFallback(userPrompt);
    const keyTerms = extracted.primaryKeywords.slice(0, 3).join(' ');
    
    const variations = [
      keyTerms,
      keyTerms.replace(/\s+/g, '-'),
      extracted.projectType
    ];
    
    return `site:github.com (${variations.map(v => `"${v}"`).join(' OR ')})`;
  }

  /**
   * Search GitHub repositories using Google Custom Search API
   */
  async searchGitHubRepositories(userPrompt: string): Promise<AgentSearchResult[]> {
    try {
      if (!this.apiKey || !this.searchEngineId) {
        throw new Error('Google Search API credentials not configured');
      }

      const searchQuery = await this.queryAgent(userPrompt);
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
   * Fallback search using alternative method with AI-enhanced curated repositories
   */
  async searchAlternative(userPrompt: string): Promise<AgentSearchResult[]> {
    try {
      // Use AI to better understand what the user wants
      const extracted = await this.extractKeywordsWithAI(userPrompt);
      const lowerPrompt = userPrompt.toLowerCase();
      
      // Curated repository suggestions based on AI-extracted keywords
      const curatedRepos: AgentSearchResult[] = [];

      // Chatbot/AI related (enhanced detection)
      if (extracted.projectType === 'chatbot' || 
          extracted.domains.some(d => ['ai', 'conversation', 'chat'].includes(d)) ||
          extracted.primaryKeywords.some(k => ['chatbot', 'chat', 'ai', 'bot', 'assistant'].includes(k))) {
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
          },
          {
            title: "microsoft/DialoGPT",
            url: "https://github.com/microsoft/DialoGPT",
            description: "Large-scale pretraining for dialogue generation in PyTorch.",
            owner: "microsoft",
            repo: "DialoGPT",
            stars: "11.4k",
            language: "Python"
          }
        );
      }

      // Finance/Banking related (enhanced detection)
      if (extracted.projectType === 'finance' || 
          extracted.domains.some(d => ['finance', 'fintech', 'banking', 'money'].includes(d)) ||
          extracted.primaryKeywords.some(k => ['finance', 'money', 'budget', 'expense', 'banking', 'investment'].includes(k))) {
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
          },
          {
            title: "mint-finance/mint-app",
            url: "https://github.com/mint-finance/mint-app",
            description: "Personal finance app built with React Native and Firebase.",
            owner: "mint-finance",
            repo: "mint-app",
            stars: "8.2k",
            language: "JavaScript"
          }
        );
      }

      // E-commerce related (enhanced detection)
      if (extracted.projectType === 'ecommerce' || 
          extracted.domains.some(d => ['ecommerce', 'retail', 'shopping'].includes(d)) ||
          extracted.primaryKeywords.some(k => ['shop', 'store', 'ecommerce', 'commerce', 'marketplace', 'retail'].includes(k))) {
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
          },
          {
            title: "spree/spree",
            url: "https://github.com/spree/spree",
            description: "Open Source multi-language/multi-currency/multi-store E-commerce platform.",
            owner: "spree",
            repo: "spree",
            stars: "12.6k",
            language: "Ruby"
          }
        );
      }

      // Social media/networking related (enhanced detection)
      if (extracted.projectType === 'social' || 
          extracted.domains.some(d => ['social', 'community', 'networking'].includes(d)) ||
          extracted.primaryKeywords.some(k => ['social', 'network', 'community', 'forum', 'messaging'].includes(k))) {
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
          },
          {
            title: "matrix-org/synapse",
            url: "https://github.com/matrix-org/synapse",
            description: "Synapse: Matrix homeserver written in Python/Twisted.",
            owner: "matrix-org",
            repo: "synapse",
            stars: "11.7k",
            language: "Python"
          }
        );
      }

      // Dashboard/Analytics related (enhanced detection)
      if (extracted.projectType === 'dashboard' || 
          extracted.domains.some(d => ['analytics', 'data', 'visualization'].includes(d)) ||
          extracted.primaryKeywords.some(k => ['dashboard', 'analytics', 'charts', 'visualization', 'metrics'].includes(k))) {
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
            title: "tremorlabs/tremor",
            url: "https://github.com/tremorlabs/tremor",
            description: "React components to build beautiful dashboards fast. Built on top of Tailwind CSS.",
            owner: "tremorlabs",
            repo: "tremor",
            stars: "4.2k",
            language: "TypeScript"
          },
          {
            title: "metabase/metabase",
            url: "https://github.com/metabase/metabase",
            description: "The simplest, fastest way to get business intelligence and analytics.",
            owner: "metabase",
            repo: "metabase",
            stars: "37.1k",
            language: "Clojure"
          }
        );
      }

      // Web app/general development
      if (extracted.projectType === 'webapp' || extracted.projectType === 'application' ||
          extracted.technologies.some(t => ['react', 'vue', 'angular', 'nextjs'].includes(t))) {
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

      // Also add a direct GitHub search link using AI-extracted keywords
      const searchKeywords = extracted.searchTerms.join(' ');
      curatedRepos.push({
        title: `Search GitHub for: ${searchKeywords}`,
        url: `https://github.com/search?q=${encodeURIComponent(searchKeywords)}`,
        description: `Click to search GitHub directly for repositories matching: ${searchKeywords}`,
        owner: "github",
        repo: "search"
      });

      return curatedRepos.slice(0, 8); // Return up to 8 results
    } catch (error) {
      console.error('Error in enhanced fallback search:', error);
      // Final fallback to basic search
      return this.basicFallback(userPrompt);
    }
  }

  /**
   * Basic fallback when everything else fails
   */
  private basicFallback(userPrompt: string): AgentSearchResult[] {
    const keywords = this.extractKeywords(userPrompt);
    
    return [
      {
        title: `GitHub Search Results for: ${userPrompt}`,
        url: `https://github.com/search?q=${encodeURIComponent(keywords.join(' '))}`,
        description: `Search GitHub directly for repositories matching: ${keywords.join(', ')}`,
        owner: "github",
        repo: "search"
      }
    ];
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