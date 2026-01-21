import { createDelegatingAgent } from './src/agents/delegatingAgent.js';
import { checkWeaviateHealth } from './src/utils/weaviateClient.js';

/**
 * Simple test file for manual queries
 * Usage: node test.js
 */
async function test() {
  console.log('🧪 Testing Agent Orchestration System\n');

  // Check Weaviate
  const isHealthy = await checkWeaviateHealth();
  if (!isHealthy) {
    console.error('\n❌ Please start Weaviate: npm run docker:up');
    process.exit(1);
  }

  // Create agent
  const agent = createDelegatingAgent();

  // ============================================================
  // CUSTOMIZE YOUR QUERY HERE
  // ============================================================
  
  const testQuery = 'What is the capital of France?';
  const tenant = 'tenant1';
  
  // Other queries to try:
  // - "Create a bar chart showing sales: Q1=100, Q2=150, Q3=200, Q4=175"
  // - "What is quantum computing and show me a pie chart of adoption rates"
  // - "How does photosynthesis work?"
  // - "What causes the seasons?"
  
  // ============================================================

  console.log(`📝 Query: "${testQuery}"`);
  console.log(`🏢 Tenant: ${tenant}\n`);

  try {
    const response = await agent.processQuery(testQuery, tenant);
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ SUCCESS - Final Response:');
    console.log('='.repeat(60));
    console.log(JSON.stringify(response, null, 2));
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
  }
}

test();
