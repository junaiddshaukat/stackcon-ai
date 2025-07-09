// Test script for AI-powered search API
// Run with: node test-ai-search.js

const testQueries = [
  "I want to build a dashboard with charts and graphs",
  "I need to create a chatbot with AI",
  "Help me build an e-commerce website",
  "I want to clone UI from other websites",
  "Build a todo app with authentication"
];

async function testAISearch(query) {
  try {
    console.log(`\n🔍 Testing query: "${query}"`);
    
    const response = await fetch('http://localhost:3000/api/recommendations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        query,
        includeGuidance: true 
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    console.log('✅ Intent extracted:', data.intent.primary_intent);
    console.log('📊 Total resources found:', data.metadata.total_resources_found);
    console.log('⭐ Top recommendations:');
    
    data.recommendations.top_recommendations.slice(0, 5).forEach((resource, index) => {
      console.log(`  ${index + 1}. ${resource.name} - ${resource.description.substring(0, 80)}...`);
    });

    if (data.recommendations.implementation_guidance) {
      console.log('📝 Implementation guidance provided');
    }

  } catch (error) {
    console.error('❌ Error testing query:', error.message);
  }
}

async function runTests() {
  console.log('🚀 Starting AI Search API Tests\n');
  
  for (const query of testQueries) {
    await testAISearch(query);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between tests
  }
  
  console.log('\n✨ Tests completed!');
}

runTests(); 