import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Intent extraction and analysis using AI
async function extractIntent(userQuery: string) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert software architect who analyzes user project ideas and extracts technical requirements.

Given a user's project description, analyze and return a JSON object with:
{
  "primary_intent": "main goal (e.g., 'ui-cloning', 'ai-chatbot', 'dashboard', 'ecommerce', 'saas-app')",
  "secondary_intents": ["additional goals"],
  "tech_requirements": {
    "frontend": ["required frontend technologies"],
    "backend": ["required backend technologies"],
    "database": ["database needs"],
    "ai": ["AI/ML requirements"],
    "deployment": ["hosting/deployment needs"],
    "tools": ["development tools needed"]
  },
  "complexity_level": "beginner|intermediate|advanced",
  "estimated_time": "realistic time estimate",
  "key_features": ["main features to implement"],
  "keywords": ["relevant search keywords for technology matching"]
}

Focus on practical, buildable solutions using modern web technologies.`
        },
        {
          role: "user",
          content: userQuery
        }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    return JSON.parse(completion.choices[0].message.content || '{}');
  } catch (error) {
    console.error('Error extracting intent:', error);
    return {
      primary_intent: 'web-app',
      secondary_intents: [],
      tech_requirements: { frontend: ['react'], backend: [], database: [], ai: [], deployment: [], tools: [] },
      complexity_level: 'intermediate',
      estimated_time: '1-2 weeks',
      key_features: [],
      keywords: ['web', 'app', 'react']
    };
  }
}

// Get resources based on intent and requirements
async function getResourcesByIntent(intent: any) {
  try {
    let resources: any[] = [];

    // Strategy 1: Search by keywords in name and description
    if (intent.keywords && intent.keywords.length > 0) {
      const searchTerms = intent.keywords.slice(0, 3); // Use first 3 keywords
      
      for (const term of searchTerms) {
        const { data, error } = await supabaseAdmin
          .from('resources')
          .select(`
            id,
            name,
            description,
            repo_url,
            demo_url,
            resource_type,
            framework,
            styling,
            tags,
            use_cases,
            problem_domains,
            difficulty_level,
            implementation_time,
            tech_stack_role
          `)
          .or(`name.ilike.%${term}%,description.ilike.%${term}%`)
          .limit(5);

        if (data && !error) {
          resources.push(...data);
        }
      }
    }

    // Strategy 2: Get popular resources by type if no matches
    if (resources.length === 0) {
      const { data, error } = await supabaseAdmin
        .from('resources')
        .select(`
          id,
          name,
          description,
          repo_url,
          demo_url,
          resource_type,
          framework,
          styling,
          tags,
          use_cases,
          problem_domains,
          difficulty_level,
          implementation_time,
          tech_stack_role
        `)
        .in('resource_type', ['ui_library', 'template', 'repository'])
        .limit(20);

      if (data && !error) {
        resources = data;
      }
    }

    // Remove duplicates
    const uniqueResources = resources.filter((resource, index, self) =>
      index === self.findIndex((r) => r.id === resource.id)
    );

    return uniqueResources.slice(0, 20);
  } catch (error) {
    console.error('Error in getResourcesByIntent:', error);
    return [];
  }
}

// Get curated collections that match the intent
async function getCuratedCollections(intent: any) {
  try {
    // Try to find collections by use_case
    const { data: collections, error } = await supabaseAdmin
      .from('resource_collections')
      .select(`
        name,
        description,
        use_case,
        difficulty_level,
        estimated_time,
        tags,
        resource_ids
      `)
      .limit(5);

    if (error) {
      console.error('Error fetching collections:', error);
      return [];
    }

    if (!collections || collections.length === 0) {
      return [];
    }

    // Get resource details for each collection
    const collectionsWithResources = await Promise.all(
      collections.map(async (collection) => {
        if (!collection.resource_ids || collection.resource_ids.length === 0) {
          return { ...collection, resources: [] };
        }

        const { data: resources } = await supabaseAdmin
          .from('resources')
          .select('id, name, description, repo_url, demo_url, resource_type')
          .in('id', collection.resource_ids);

        return {
          ...collection,
          resources: resources || []
        };
      })
    );

    return collectionsWithResources.filter(c => c.resources.length > 0);
  } catch (error) {
    console.error('Error in getCuratedCollections:', error);
    return [];
  }
}

// Organize resources by their role in the tech stack
function organizeResourcesByRole(resources: any[], intent: any) {
  const organized = {
    frontend: [] as any[],
    backend: [] as any[],
    database: [] as any[],
    ai: [] as any[],
    deployment: [] as any[],
    design: [] as any[],
    tools: [] as any[]
  };

  resources.forEach(resource => {
    // Use tech_stack_role if available, otherwise infer from resource_type and name
    let role = resource.tech_stack_role;
    
    if (!role) {
      // Infer role from resource type and name
      const name = resource.name.toLowerCase();
      const type = resource.resource_type;
      
      if (name.includes('react') || name.includes('vue') || name.includes('angular') || name.includes('svelte') || type === 'ui_library') {
        role = 'frontend';
      } else if (name.includes('node') || name.includes('express') || name.includes('fastify')) {
        role = 'backend';
      } else if (name.includes('database') || name.includes('postgres') || name.includes('mongo')) {
        role = 'database';
      } else if (name.includes('ai') || name.includes('openai') || name.includes('llm')) {
        role = 'ai';
      } else if (name.includes('vercel') || name.includes('netlify') || name.includes('aws')) {
        role = 'deployment';
      } else if (name.includes('tailwind') || name.includes('css') || name.includes('style')) {
        role = 'design';
      } else {
        role = 'tools';
      }
    }

    if (organized[role as keyof typeof organized]) {
      organized[role as keyof typeof organized].push(resource);
    } else {
      organized.tools.push(resource);
    }
  });

  return organized;
}

// Rank resources based on relevance to intent
function rankResources(resources: any[], intent: any) {
  return resources
    .map(resource => {
      let score = 0;
      const name = resource.name.toLowerCase();
      const description = resource.description.toLowerCase();
      
      // Keyword matches in name (highest priority)
      intent.keywords?.forEach((keyword: string) => {
        const lowerKeyword = keyword.toLowerCase();
        if (name.includes(lowerKeyword)) {
          score += 10;
        }
        if (description.includes(lowerKeyword)) {
          score += 5;
        }
      });

      // Tech requirements match
      Object.values(intent.tech_requirements).flat().forEach((tech: any) => {
        if (tech && name.includes(tech.toLowerCase())) {
          score += 8;
        }
      });

      // Primary intent match (if use_cases exist)
      if (resource.use_cases?.includes(intent.primary_intent)) {
        score += 15;
      }

      // Resource type preferences
      if (resource.resource_type === 'ui_library' && intent.tech_requirements.frontend?.length > 0) {
        score += 3;
      }
      if (resource.resource_type === 'template') {
        score += 2;
      }

      return { ...resource, relevance_score: score };
    })
    .sort((a, b) => b.relevance_score - a.relevance_score);
}

// Generate AI-powered implementation guidance
async function generateImplementationGuidance(intent: any, recommendedResources: any[]) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a senior software engineer providing implementation guidance. 

Given a project intent and recommended resources, provide:
1. Step-by-step implementation plan
2. Resource usage recommendations
3. Potential challenges and solutions
4. Best practices

Keep it practical and actionable. Use simple markdown formatting.`
        },
        {
          role: "user",
          content: `Project Goal: ${intent.primary_intent}
Key Features: ${intent.key_features.join(', ')}
Complexity: ${intent.complexity_level}
Estimated Time: ${intent.estimated_time}

Top Recommended Resources:
${recommendedResources.slice(0, 8).map(r => `- ${r.name}: ${r.description}`).join('\n')}

Provide a concise implementation guide.`
        }
      ],
      temperature: 0.4,
      max_tokens: 800
    });

    return completion.choices[0].message.content || '';
  } catch (error) {
    console.error('Error generating guidance:', error);
    return 'Implementation guidance temporarily unavailable.';
  }
}

export async function POST(request: NextRequest) {
  try {
    const { query, includeGuidance = false } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // Extract intent using AI
    const intent = await extractIntent(query);
    
    // Get resources and collections
    const [resources, collections] = await Promise.all([
      getResourcesByIntent(intent),
      getCuratedCollections(intent)
    ]);

    // Rank and organize resources
    const rankedResources = rankResources(resources, intent);
    const organizedResources = organizeResourcesByRole(rankedResources, intent);

    // Generate implementation guidance if requested
    let implementationGuidance = '';
    if (includeGuidance && rankedResources.length > 0) {
      implementationGuidance = await generateImplementationGuidance(
        intent, 
        rankedResources.slice(0, 10)
      );
    }

    // Save recommendation for learning (optional - only if table exists)
    try {
      await supabaseAdmin
        .from('recommendation_history')
        .insert({
          user_query: query,
          extracted_intent: intent,
          recommended_resources: rankedResources.slice(0, 10).map(r => r.id)
        });
    } catch (error) {
      // Ignore if table doesn't exist yet
      console.log('Could not save to recommendation_history:', error);
    }

    return NextResponse.json({
      success: true,
      intent,
      recommendations: {
        curated_collections: collections,
        resources_by_category: organizedResources,
        top_recommendations: rankedResources.slice(0, 15),
        implementation_guidance: implementationGuidance
      },
      metadata: {
        total_resources_found: resources.length,
        complexity_level: intent.complexity_level,
        estimated_time: intent.estimated_time
      }
    });

  } catch (error) {
    console.error('Error in recommendations API:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
} 