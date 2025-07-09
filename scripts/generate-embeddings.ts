#!/usr/bin/env node

/**
 * Script to generate embeddings for resources
 * Run with: npx tsx scripts/generate-embeddings.ts
 */

import { supabaseAdmin } from '../src/lib/supabase'
import { generateEmbedding } from '../src/lib/ai'
import { Resource } from '../src/lib/types'

async function generateEmbeddings() {
  console.log('🤖 Starting embedding generation...')
  
  try {
    // Fetch resources without embeddings
    const { data: resources, error } = await supabaseAdmin
      .from('resources')
      .select('*')
      .is('embedding', null)
      .eq('is_active', true)
    
    if (error) {
      console.error('❌ Error fetching resources:', error)
      return
    }

    if (!resources || resources.length === 0) {
      console.log('✅ All resources already have embeddings!')
      return
    }

    console.log(`📊 Found ${resources.length} resources without embeddings`)

    // Process each resource
    for (const resource of resources) {
      console.log(`\n🔄 Processing: ${resource.name}`)
      
      try {
        // Create embedding text from name, description, and tags
        const embeddingText = `${resource.name}\n${resource.description}\nTags: ${resource.tags.join(', ')}\nFramework: ${resource.framework.join(', ')}\nStyling: ${resource.styling.join(', ')}`
        
        // Generate embedding
        const embeddingResponse = await generateEmbedding({
          text: embeddingText,
          model: 'openai' // You can change to 'gemini' if preferred
        })

        // Update resource with embedding
        const { error: updateError } = await supabaseAdmin
          .from('resources')
          .update({ 
            embedding: embeddingResponse.embedding 
          })
          .eq('id', resource.id)

        if (updateError) {
          console.error(`❌ Error updating ${resource.name}:`, updateError)
        } else {
          console.log(`✅ Generated embedding for: ${resource.name}`)
        }

        // Rate limiting - wait 100ms between requests
        await new Promise(resolve => setTimeout(resolve, 100))

      } catch (error) {
        console.error(`❌ Error processing ${resource.name}:`, error)
      }
    }

    console.log('\n🎉 Embedding generation completed!')
    
    // Verify results
    const { data: updatedResources } = await supabaseAdmin
      .from('resources')
      .select('id, name, embedding')
      .not('embedding', 'is', null)

    console.log(`✅ Total resources with embeddings: ${updatedResources?.length || 0}`)

  } catch (error) {
    console.error('❌ Script error:', error)
  }
}

// Run the script
if (require.main === module) {
  generateEmbeddings()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Script failed:', error)
      process.exit(1)
    })
}

export { generateEmbeddings } 