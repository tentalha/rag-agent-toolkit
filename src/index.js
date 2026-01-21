import { checkWeaviateHealth } from './utils/weaviateClient.js';
import { createDelegatingAgent } from './agents/delegatingAgent.js';

/**
 * Main entry point for the Agent Orchestration system
 */
async function main() {
  console.log('🚀 Agent Orchestration System\n');

  // Check Weaviate connection
  console.log('Checking Weaviate connection...');
  const isHealthy = await checkWeaviateHealth();
  
  if (!isHealthy) {
    console.error('\n❌ Weaviate is not available.');
    console.error('Please run: npm run docker:up');
    console.error('Then run: npm run setup');
    process.exit(1);
  }

  // Create delegating agent
  const agent = createDelegatingAgent();

  // Example queries
  const queries = [
    {
      query: 'What is the capital of France?',
      description: 'RAG query - searches knowledge base',
    },
    {
      query: 'Create a bar chart showing sales data: Q1=100, Q2=150, Q3=200, Q4=175',
      description: 'Chart generation query',
    },
    {
      query: 'What is quantum computing and show me a pie chart of quantum vs classical computing market share: Quantum=20, Classical=80',
      description: 'Combined query - RAG + Chart',
    },
  ];

  console.log('\n=== Running Example Queries ===\n');

  for (let i = 0; i < queries.length; i++) {
    const { query, description } = queries[i];
    
    console.log(`\n📝 Example ${i + 1}: ${description}`);
    console.log(`Query: "${query}"\n`);

    try {
      const response = await agent.processQuery(query, 'tenant1');
      console.log('\n✅ Query processed successfully\n');
    } catch (error) {
      console.error(`\n❌ Error processing query: ${error.message}\n`);
    }

    // Wait a bit between queries to avoid rate limiting
    if (i < queries.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log('\n=== All queries completed ===\n');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { main };
