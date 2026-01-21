import { getWeaviateClient, checkWeaviateHealth } from '../utils/weaviateClient.js';
import { config } from '../config/config.js';

/**
 * Create Weaviate schema with multi-tenancy support
 */
async function createSchema() {
  const client = getWeaviateClient();
  const className = config.weaviateSchema.className;

  try {
    // Check if class already exists
    const existingSchema = await client.schema.getter().do();
    const classExists = existingSchema.classes?.some((c) => c.class === className);

    if (classExists) {
      console.log(`Class "${className}" already exists. Deleting...`);
      await client.schema.classDeleter().withClassName(className).do();
    }

    // Create class with multi-tenancy enabled
    const classObj = {
      class: className,
      description: 'Knowledge base with questions and answers',
      multiTenancyConfig: {
        enabled: true,
      },
      properties: [
        {
          name: 'fileId',
          dataType: ['text'],
          description: 'The identifier for each file',
          indexFilterable: false,
          indexSearchable: false,
          tokenization: 'field',
        },
        {
          name: 'question',
          dataType: ['text'],
          description: 'The question being asked',
          indexFilterable: true,
          indexSearchable: true,
        },
        {
          name: 'answer',
          dataType: ['text'],
          description: 'The answer to the question',
          indexFilterable: true,
          indexSearchable: true,
        },
      ],
      vectorizer: 'none', // We're not using a vectorizer
    };

    await client.schema.classCreator().withClass(classObj).do();
    console.log(`✓ Created class "${className}" with multi-tenancy enabled`);

    // Create tenants
    const tenants = config.weaviateSchema.tenants.map((name) => ({ name }));
    await client.schema.tenantsCreator(className, tenants).do();
    console.log(`✓ Created tenants: ${config.weaviateSchema.tenants.join(', ')}`);

    return true;
  } catch (error) {
    console.error('Error creating schema:', error.message);
    throw error;
  }
}

/**
 * Insert fictional data into Weaviate
 */
async function seedData() {
  const client = getWeaviateClient();
  const className = config.weaviateSchema.className;

  const entries = [
    {
      tenant: 'tenant1',
      data: [
        {
          fileId: 'file_001',
          question: 'What is the capital of France?',
          answer: 'The capital of France is Paris. Paris is not only the capital but also the largest city in France.',
        },
        {
          fileId: 'file_002',
          question: 'How does photosynthesis work?',
          answer: 'Photosynthesis is the process by which plants use sunlight, water, and carbon dioxide to produce oxygen and energy in the form of sugar.',
        },
      ],
    },
    {
      tenant: 'tenant2',
      data: [
        {
          fileId: 'file_003',
          question: 'What is quantum computing?',
          answer: 'Quantum computing is a type of computation that uses quantum-mechanical phenomena, such as superposition and entanglement, to perform operations on data.',
        },
        {
          fileId: 'file_004',
          question: 'Who wrote Romeo and Juliet?',
          answer: 'Romeo and Juliet was written by William Shakespeare, the famous English playwright and poet.',
        },
      ],
    },
    {
      tenant: 'tenant3',
      data: [
        {
          fileId: 'file_005',
          question: 'What is the speed of light?',
          answer: 'The speed of light in a vacuum is approximately 299,792,458 meters per second (or about 186,282 miles per second).',
        },
        {
          fileId: 'file_006',
          question: 'What causes the seasons?',
          answer: 'Seasons are caused by the tilt of Earth\'s axis relative to its orbital plane around the Sun. This tilt causes different parts of Earth to receive varying amounts of sunlight throughout the year.',
        },
      ],
    },
  ];

  try {
    let totalInserted = 0;

    for (const entry of entries) {
      for (const item of entry.data) {
        await client.data
          .creator()
          .withClassName(className)
          .withProperties(item)
          .withTenant(entry.tenant)
          .do();
        
        totalInserted++;
        console.log(`✓ Inserted: ${item.question.substring(0, 50)}... (Tenant: ${entry.tenant})`);
      }
    }

    console.log(`\n✓ Successfully inserted ${totalInserted} entries across ${entries.length} tenants`);
    return true;
  } catch (error) {
    console.error('Error seeding data:', error.message);
    throw error;
  }
}

/**
 * Main setup function
 */
async function setup() {
  console.log('=== Setting up Weaviate ===\n');

  // Check health
  const isHealthy = await checkWeaviateHealth();
  if (!isHealthy) {
    console.error('\nPlease start Weaviate with: npm run docker:up');
    process.exit(1);
  }

  // Create schema
  console.log('\n--- Creating Schema ---');
  await createSchema();

  // Seed data
  console.log('\n--- Seeding Data ---');
  await seedData();

  console.log('\n=== Setup Complete ===');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setup().catch((error) => {
    console.error('Setup failed:', error);
    process.exit(1);
  });
}

export { createSchema, seedData };
