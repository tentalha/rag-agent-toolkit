import { checkWeaviateHealth } from '../utils/weaviateClient.js';
import { createDelegatingAgent } from '../agents/delegatingAgent.js';

/**
 * Example usage of the Agent Orchestration system
 * Demonstrates different types of queries
 */
async function runExamples() {
  console.log('🔍 Agent Orchestration - Example Usage\n');

  // Check Weaviate connection
  const isHealthy = await checkWeaviateHealth();
  if (!isHealthy) {
    console.error('\n❌ Please ensure Weaviate is running and setup is complete.');
    console.error('Run: npm run docker:up && npm run setup');
    process.exit(1);
  }

  // Create the delegating agent
  const agent = createDelegatingAgent();

  console.log('\n' + '='.repeat(60));
  console.log('EXAMPLE 1: Knowledge Base Query (RAG)');
  console.log('='.repeat(60));
  
  let response = await agent.processQuery(
    'How does photosynthesis work?',
    'tenant1'
  );
  displayResponse(response);

  await sleep(2000);

  console.log('\n' + '='.repeat(60));
  console.log('EXAMPLE 2: Chart Generation');
  console.log('='.repeat(60));
  
  response = await agent.processQuery(
    'Create a line chart showing temperature data: Monday=20, Tuesday=22, Wednesday=19, Thursday=23, Friday=21',
    'tenant1'
  );
  displayResponse(response);

  await sleep(2000);

  console.log('\n' + '='.repeat(60));
  console.log('EXAMPLE 3: Combined Query (RAG + Chart)');
  console.log('='.repeat(60));
  
  response = await agent.processQuery(
    'What is the speed of light? Also create a pie chart comparing light speed vs sound speed: Light=299792, Sound=343',
    'tenant3'
  );
  displayResponse(response);

  await sleep(2000);

  console.log('\n' + '='.repeat(60));
  console.log('EXAMPLE 4: Direct Answer (No tools needed)');
  console.log('='.repeat(60));
  
  response = await agent.processQuery(
    'What is 2 + 2?',
    'tenant1'
  );
  displayResponse(response);

  console.log('\n' + '='.repeat(60));
  console.log('All examples completed successfully! ✨');
  console.log('='.repeat(60) + '\n');
}

/**
 * Display response in a formatted way
 */
function displayResponse(response) {
  console.log('\n📤 RESPONSE:');
  console.log('\n📝 Answer:');
  console.log(response.answer);

  if (response.references?.fileIds?.length > 0) {
    console.log('\n📚 File References:');
    console.log(response.references.fileIds.join(', '));
  }

  if (response.references?.documents?.length > 0) {
    console.log('\n📄 Retrieved Documents:');
    response.references.documents.forEach((doc, idx) => {
      console.log(`\n  [${idx + 1}] ${doc.fileId}`);
      console.log(`      Q: ${doc.question}`);
    });
  }

  if (response.references?.chartConfig) {
    console.log('\n📊 Chart Configuration:');
    console.log(`   Type: ${response.references.chartConfig.type}`);
    console.log(`   Labels: ${response.references.chartConfig.data.labels.join(', ')}`);
    console.log(`   Data Points: ${response.references.chartConfig.data.datasets[0].data.length}`);
  }

  console.log();
}

/**
 * Sleep helper
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Run examples
runExamples().catch((error) => {
  console.error('Error running examples:', error);
  process.exit(1);
});
