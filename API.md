# API Documentation

## Core Classes and Methods

### DelegatingAgent

The main orchestrator that routes queries to appropriate tools and agents.

#### Constructor

```javascript
import { createDelegatingAgent } from './src/agents/delegatingAgent.js';

const agent = createDelegatingAgent();
```

#### Methods

##### `processQuery(query, tenant)`

Process a user query and return a structured response.

**Parameters:**
- `query` (string): The user's natural language query
- `tenant` (string, optional): The tenant ID for multi-tenant database queries. Default: 'tenant1'

**Returns:** Promise<Response>

```javascript
const response = await agent.processQuery(
  'What is quantum computing?',
  'tenant2'
);
```

**Response Object:**
```typescript
{
  answer: string,              // The main answer text
  references: {
    fileIds?: string[],        // Array of file IDs (if RAG was used)
    documents?: Array<{        // Full document objects (if RAG was used)
      fileId: string,
      question: string,
      answer: string
    }>,
    chartConfig?: object       // Chart.js config (if chart tool was used)
  }
}
```

---

### RAGAgent

Retrieval-Augmented Generation agent for querying the knowledge base.

#### Constructor

```javascript
import { createRAGAgent } from './src/agents/ragAgent.js';

const ragAgent = createRAGAgent();
```

#### Methods

##### `query(userQuery, tenant)`

Query the knowledge base and generate an answer.

**Parameters:**
- `userQuery` (string): The question to answer
- `tenant` (string, optional): The tenant ID. Default: 'tenant1'

**Returns:** Promise<RAGResult>

```javascript
const result = await ragAgent.query(
  'How does photosynthesis work?',
  'tenant1'
);
```

**RAGResult Object:**
```typescript
{
  answer: string,              // Generated answer
  fileIds: string[],           // File IDs of retrieved documents
  references: Array<{          // Full retrieved documents
    fileId: string,
    question: string,
    answer: string
  }>
}
```

##### `retrieveDocuments(query, tenant, limit)`

Retrieve relevant documents from Weaviate.

**Parameters:**
- `query` (string): Search query
- `tenant` (string, optional): Tenant ID. Default: 'tenant1'
- `limit` (number, optional): Max documents to return. Default: 3

**Returns:** Promise<Document[]>

```javascript
const docs = await ragAgent.retrieveDocuments(
  'quantum computing',
  'tenant2',
  5
);
```

##### `generateAnswer(query, documents)`

Generate an answer based on retrieved documents.

**Parameters:**
- `query` (string): User's question
- `documents` (Document[]): Retrieved documents for context

**Returns:** Promise<RAGResult>

---

### ChartJsTool

Tool for generating Chart.js configurations.

#### Constructor

```javascript
import { createChartJsTool } from './src/tools/chartjsTool.js';

const chartTool = createChartJsTool();
```

#### Methods

##### `func(params)`

Generate a Chart.js configuration.

**Parameters:**
```typescript
{
  chartType: 'bar' | 'line' | 'pie' | 'doughnut' | 'radar' | 'polarArea',
  labels: string[],          // Data point labels
  data: number[],            // Data values
  title?: string             // Optional chart title
}
```

**Returns:** Promise<string> (JSON string of Chart.js config)

**Example:**
```javascript
const config = await chartTool.func({
  chartType: 'bar',
  labels: ['Q1', 'Q2', 'Q3', 'Q4'],
  data: [100, 150, 200, 175],
  title: 'Quarterly Sales'
});

const chartConfig = JSON.parse(config);
```

**Generated Config Structure:**
```javascript
{
  type: "bar",
  data: {
    labels: ["Q1", "Q2", "Q3", "Q4"],
    datasets: [{
      label: "Quarterly Sales",
      data: [100, 150, 200, 175],
      backgroundColor: [...],
      borderColor: [...],
      borderWidth: 2
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: { display: true, position: "top" },
      title: { display: true, text: "Quarterly Sales" }
    },
    scales: {
      y: { beginAtZero: true }
    }
  }
}
```

---

## Utility Functions

### Weaviate Client

#### `getWeaviateClient()`

Get or create a singleton Weaviate client instance.

```javascript
import { getWeaviateClient } from './src/utils/weaviateClient.js';

const client = getWeaviateClient();
```

#### `checkWeaviateHealth()`

Check if Weaviate is accessible and ready.

**Returns:** Promise<boolean>

```javascript
import { checkWeaviateHealth } from './src/utils/weaviateClient.js';

const isHealthy = await checkWeaviateHealth();
if (!isHealthy) {
  console.error('Weaviate is not available');
}
```

---

## Setup Functions

### `createSchema()`

Create the Weaviate schema with multi-tenancy.

```javascript
import { createSchema } from './src/setup/setupWeaviate.js';

await createSchema();
```

### `seedData()`

Insert fictional data into the database.

```javascript
import { seedData } from './src/setup/setupWeaviate.js';

await seedData();
```

---

## Configuration

### Environment Variables

Configure via `.env` file:

```bash
# Required
GOOGLE_API_KEY=your_api_key_here

# Optional
WEAVIATE_URL=http://localhost:8080
WEAVIATE_API_KEY=
LLM_MODEL=gemini-1.5-flash
LLM_TEMPERATURE=0.7
```

### Config Object

```javascript
import { config } from './src/config/config.js';

// Access configuration
console.log(config.weaviate.url);        // Weaviate URL
console.log(config.llm.apiKey);          // Google API key
console.log(config.llm.model);           // LLM model name
console.log(config.llm.temperature);     // Temperature setting
console.log(config.weaviateSchema.className);  // Schema class name
console.log(config.weaviateSchema.tenants);    // Available tenants
```

---

## Usage Examples

### Example 1: Simple RAG Query

```javascript
import { createDelegatingAgent } from './src/agents/delegatingAgent.js';

const agent = createDelegatingAgent();

const response = await agent.processQuery(
  'What is the capital of France?',
  'tenant1'
);

console.log(response.answer);
console.log(response.references.fileIds);
```

### Example 2: Chart Generation

```javascript
import { createDelegatingAgent } from './src/agents/delegatingAgent.js';

const agent = createDelegatingAgent();

const response = await agent.processQuery(
  'Create a pie chart: Chrome=65, Firefox=15, Safari=12, Other=8'
);

const chartConfig = response.references.chartConfig;
// Use chartConfig with Chart.js library in frontend
```

### Example 3: Combined Query

```javascript
import { createDelegatingAgent } from './src/agents/delegatingAgent.js';

const agent = createDelegatingAgent();

const response = await agent.processQuery(
  'What is quantum computing? Show a bar chart of quantum computer types: Gate-based=40, Annealing=30, Topological=20, Other=10',
  'tenant2'
);

console.log('Answer:', response.answer);
console.log('Sources:', response.references.fileIds);
console.log('Chart:', response.references.chartConfig.type);
```

### Example 4: Direct RAG Agent Usage

```javascript
import { createRAGAgent } from './src/agents/ragAgent.js';

const ragAgent = createRAGAgent();

const result = await ragAgent.query(
  'How does photosynthesis work?',
  'tenant1'
);

console.log('Answer:', result.answer);
console.log('File IDs:', result.fileIds);
console.log('References:', result.references);
```

### Example 5: Direct Chart Tool Usage

```javascript
import { createChartJsTool } from './src/tools/chartjsTool.js';

const chartTool = createChartJsTool();

const configJson = await chartTool.func({
  chartType: 'line',
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  data: [12, 19, 3, 5, 2],
  title: 'Weekly Activity'
});

const config = JSON.parse(configJson);
```

### Example 6: Custom Weaviate Query

```javascript
import { getWeaviateClient } from './src/utils/weaviateClient.js';
import { config } from './src/config/config.js';

const client = getWeaviateClient();

const result = await client.graphql
  .get()
  .withClassName(config.weaviateSchema.className)
  .withTenant('tenant1')
  .withFields('fileId question answer')
  .withLimit(5)
  .do();

const documents = result.data.Get[config.weaviateSchema.className];
```

---

## Error Handling

All async methods may throw errors. Always use try-catch:

```javascript
try {
  const response = await agent.processQuery(query);
  console.log(response);
} catch (error) {
  console.error('Error:', error.message);
  
  // Check specific error types
  if (error.message.includes('API key')) {
    console.error('Please check your GOOGLE_API_KEY');
  } else if (error.message.includes('Weaviate')) {
    console.error('Please check Weaviate connection');
  }
}
```

---

## Type Definitions

### Response

```typescript
interface Response {
  answer: string;
  references: {
    fileIds?: string[];
    documents?: Document[];
    chartConfig?: ChartConfig;
  };
}
```

### Document

```typescript
interface Document {
  fileId: string;
  question: string;
  answer: string;
}
```

### ChartConfig

```typescript
interface ChartConfig {
  type: 'bar' | 'line' | 'pie' | 'doughnut' | 'radar' | 'polarArea';
  data: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor: string[];
      borderColor: string[];
      borderWidth: number;
    }>;
  };
  options: {
    responsive: boolean;
    plugins: {
      legend: {
        display: boolean;
        position: string;
      };
      title: {
        display: boolean;
        text: string;
      };
    };
    scales?: {
      y: {
        beginAtZero: boolean;
      };
    };
  };
}
```

---

## Advanced Usage

### Custom Tenants

Add new tenants in `src/config/config.js`:

```javascript
export const config = {
  weaviateSchema: {
    className: 'KnowledgeBase',
    tenants: ['tenant1', 'tenant2', 'tenant3', 'tenant4'], // Add more
  },
};
```

Then run setup again:
```bash
npm run setup
```

### Custom LLM Settings

Modify LLM parameters in `.env`:

```bash
LLM_MODEL=gemini-pro  # Use a different model
LLM_TEMPERATURE=0.3   # Lower temperature for more deterministic responses
```

### Adding Custom Data

```javascript
import { getWeaviateClient } from './src/utils/weaviateClient.js';
import { config } from './src/config/config.js';

const client = getWeaviateClient();

await client.data
  .creator()
  .withClassName(config.weaviateSchema.className)
  .withProperties({
    fileId: 'file_custom_001',
    question: 'Your question here',
    answer: 'Your answer here'
  })
  .withTenant('tenant1')
  .do();
```

---

## Performance Tips

1. **Batch Queries**: If making multiple queries, reuse the agent instance
2. **Limit Results**: Use smaller limits for faster retrieval
3. **Tenant Selection**: Query specific tenants for faster searches
4. **Cache Responses**: Cache common queries in your application
5. **Connection Pooling**: The Weaviate client is a singleton

---

## Debugging

Enable verbose logging:

```javascript
// In your code
console.log('Processing query:', query);
console.log('Decision:', state.decision);
console.log('RAG result:', state.ragResult);
console.log('Chart config:', state.chartConfig);
```

Check Weaviate directly:

```bash
# Get all objects
curl http://localhost:8080/v1/objects

# Get schema
curl http://localhost:8080/v1/schema

# Health check
curl http://localhost:8080/v1/meta
```

---

## Rate Limits

Google Gemini Free Tier:
- 60 requests per minute
- Consider adding delays between requests in production

```javascript
// Add delay helper
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Use between requests
await agent.processQuery(query1);
await sleep(1000); // Wait 1 second
await agent.processQuery(query2);
```

