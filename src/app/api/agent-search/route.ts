import { NextRequest, NextResponse } from 'next/server';
import { googleSearchAgent } from '@/lib/google-search';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query } = body;

    if (!query || !query.trim()) {
      return NextResponse.json(
        { success: false, error: 'Query is required' },
        { status: 400 }
      );
    }

    console.log('Agent Search Query:', query);

    // Use Google Search Agent to find repositories
    let results;
    let searchQuery = '';
    
    try {
      // Try Google Search first
      results = await googleSearchAgent.searchGitHubRepositories(query);
      searchQuery = await googleSearchAgent.queryAgent(query);
    } catch (error) {
      console.warn('Google Search failed, using fallback:', error);
      
      // Fallback to curated search method
      results = await googleSearchAgent.searchAlternative(query);
      searchQuery = `Fallback search for: ${query}`;
    }

    console.log(`Agent Search found ${results.length} results`);

    return NextResponse.json({
      success: true,
      data: results,
      count: results.length,
      searchQuery: searchQuery,
      isGoogleSearch: searchQuery.includes('site:github.com')
    });

  } catch (error) {
    console.error('Error in agent search:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to perform agent search' 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';

    if (!query.trim()) {
      return NextResponse.json(
        { success: false, error: 'Query parameter q is required' },
        { status: 400 }
      );
    }

    console.log('Agent Search Query (GET):', query);

    // Use Google Search Agent to find repositories
    let results;
    let searchQuery = '';
    
    try {
      // Try Google Search first
      results = await googleSearchAgent.searchGitHubRepositories(query);
      searchQuery = await googleSearchAgent.queryAgent(query);
    } catch (error) {
      console.warn('Google Search failed, using fallback:', error);
      
      // Fallback to curated search method
      results = await googleSearchAgent.searchAlternative(query);
      searchQuery = `Fallback search for: ${query}`;
    }

    console.log(`Agent Search found ${results.length} results`);

    return NextResponse.json({
      success: true,
      data: results,
      count: results.length,
      searchQuery: searchQuery,
      isGoogleSearch: searchQuery.includes('site:github.com')
    });

  } catch (error) {
    console.error('Error in agent search:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to perform agent search' 
      },
      { status: 500 }
    );
  }
} 