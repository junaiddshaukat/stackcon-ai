# Agent Search Setup Guide

The Agent Search feature allows users to search for GitHub repositories using Google's search capabilities with natural language queries.

## How it Works

1. **User Input**: User describes their project in natural language (e.g., "I want to build a personalized chatbot app")
2. **Query Processing**: The `queryAgent()` function extracts keywords and constructs optimized search queries
3. **Google Search**: Searches GitHub using `site:github.com` with smart query construction
4. **Results Processing**: Filters and parses GitHub repository URLs from search results
5. **Display**: Shows relevant repositories with links and descriptions

## Setup Requirements

### 1. Google Custom Search Engine

1. Go to [Google Custom Search Engine](https://cse.google.com/cse/)
2. Click "Add" to create a new search engine
3. Configure:
   - **Sites to search**: `github.com`
   - **Name**: "GitHub Repository Search" (or any name)
   - **Language**: Your preferred language
4. Click "Create"
5. Copy the **Search Engine ID** (you'll need this for the environment variable)

### 2. Google Search API Key

1. Go to [Google Cloud Console](https://console.developers.google.com/)
2. Create a new project or select an existing one
3. Enable the "Custom Search JSON API":
   - Go to "APIs & Services" > "Library"
   - Search for "Custom Search JSON API"
   - Click "Enable"
4. Create credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the API key (you'll need this for the environment variable)

### 3. Environment Variables

Add these to your `.env.local` file:

```env
# Google Search API (For Agent Search feature)
GOOGLE_SEARCH_API_KEY=your_google_search_api_key
GOOGLE_SEARCH_ENGINE_ID=your_google_custom_search_engine_id
```

## Usage Examples

### Example Queries:
- "I want to build a personalized chatbot app"
- "I need a finance tracking application"  
- "I want to create a social media platform"
- "Build a real-time multiplayer game"
- "Create an AI-powered image editor"

### Generated Search Queries:
- `site:github.com "personalized chatbot" OR "personalized-chatbot"`
- `site:github.com "finance tracking" OR "finance-tracking"`
- `site:github.com "social media platform" OR "social-media-platform"`

## API Endpoints

### POST/GET `/api/agent-search`

**Request:**
```json
{
  "query": "I want to build a personalized chatbot app"
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "title": "Repository Title",
      "url": "https://github.com/owner/repo",
      "description": "Repository description...",
      "owner": "owner",
      "repo": "repo",
      "stars": "1.2k",
      "language": "TypeScript"
    }
  ],
  "count": 5,
  "searchQuery": "site:github.com \"personalized chatbot\" OR \"personalized-chatbot\""
}
```

## Fallback Behavior

If Google Search API is not configured or fails:
- Falls back to alternative search method
- Shows helpful error messages
- Provides direct GitHub search links
- Maintains user experience with graceful degradation

## Rate Limits

- Google Custom Search API: 100 queries per day (free tier)
- Paid plans available for higher limits
- Consider implementing caching for frequently searched terms

## Cost Considerations

- Free tier: 100 searches/day
- Paid tier: $5 per 1,000 queries
- Most apps should work fine with free tier for testing and small usage

## Troubleshooting

### Common Issues:

1. **"Google Search API credentials not configured"**
   - Check that both `GOOGLE_SEARCH_API_KEY` and `GOOGLE_SEARCH_ENGINE_ID` are set
   - Verify the API key is valid and has Custom Search API enabled

2. **"Google Search API error: 403"**
   - API key doesn't have permission for Custom Search API
   - Check if you've exceeded the daily quota

3. **No results returned**
   - Custom Search Engine might not be configured correctly
   - Verify the search engine includes `github.com` in its sites

4. **Poor search results**
   - Adjust the keyword extraction logic in `queryAgent()`
   - Fine-tune the search query construction

## Advanced Configuration

### Custom Keyword Extraction
Modify `src/lib/google-search.ts` to customize how keywords are extracted from user prompts.

### Enhanced Results
The `enhanceResults()` function can be extended to fetch additional GitHub API data (stars, languages, etc.) for better repository information.

### Alternative Search Providers
The system is designed to be extensible - you can add other search providers by implementing similar interfaces. 