# Agent Orchestration System

A sophisticated LLM-powered agent orchestration system built with **Node.js**, **LangGraph**, **Weaviate**, and **Google Gemini API**. This system demonstrates hierarchical agent architecture with a delegating agent that routes queries to specialized tools and a RAG (Retrieval-Augmented Generation) agent.

## 🏗️ Architecture

### Components

1. **Delegating Agent** (LangGraph)
   - Analyzes user queries and determines the appropriate action
   - Routes to Chart.js tool, RAG agent, or provides direct answers
   - Can call multiple tools simultaneously or sequentially
   - Built using LangGraph state machines

2. **RAG Agent**
   - Queries the Weaviate vector database
   - Retrieves relevant documents using BM25 search
   - Generates contextual answers with file references
   - Returns both answers and source fileIds

3. **Chart.js Tool**
   - Generates Chart.js configurations for data visualization
   - Supports multiple chart types (bar, line, pie, doughnut, radar, polarArea)
   - Returns ready-to-use Chart.js config objects

4. **Weaviate Vector Database**
   - Multi-tenant vector database for knowledge storage
   - Schema includes: fileId, question, and answer fields
   - Runs in Docker for easy deployment

## 📋 Requirements

- **Node.js** 18+ 
- **Docker** and Docker Compose
- **Google Gemini API Key** (Free tier)

## 🚀 Setup Instructions

### 1. Clone and Install

```bash
cd /Users/tentalha/Desktop/Assesements/Agent-orchestration
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and add your Google Gemini API key:

```env
GOOGLE_API_KEY=your_actual_api_key_here
WEAVIATE_URL=http://localhost:8080
LLM_MODEL=gemini-1.5-flash
LLM_TEMPERATURE=0.7
```

### 3. Start Weaviate Database

```bash
npm run docker:up
```

Wait ~10 seconds for Weaviate to fully start, then verify it's running:
```bash
curl http://localhost:8080/v1/meta
```

### 4. Setup Database Schema and Seed Data

```bash
npm run setup
```

This will:
- Create the `KnowledgeBase` schema with multi-tenancy
- Create three tenants: `tenant1`, `tenant2`, `tenant3`
- Insert 6 fictional Q&A entries across the tenants

## 📖 Usage

### Run Example Queries

```bash
npm run example
```

This runs four different example queries demonstrating:
1. **RAG Query**: Searches knowledge base and returns answer with fileIds
2. **Chart Generation**: Creates Chart.js configuration
3. **Combined Query**: Both RAG search and chart generation
4. **Direct Answer**: Simple query without tools

### Run Main Application

```bash
npm start
```

### Custom Usage

```javascript
import { createDelegatingAgent } from './src/agents/delegatingAgent.js';

const agent = createDelegatingAgent();

// RAG query
const response1 = await agent.processQuery(
  'What is quantum computing?',
  'tenant2'
);

// Chart query
const response2 = await agent.processQuery(
  'Create a bar chart: Jan=100, Feb=150, Mar=200',
  'tenant1'
);

// Combined query
const response3 = await agent.processQuery(
  'What is photosynthesis? Show a pie chart of oxygen production',
  'tenant1'
);
```

## 🗄️ Database Schema

### Class: KnowledgeBase

**Multi-Tenancy**: Enabled

**Properties**:
- `fileId` (text) - File identifier, not vectorized or searchable
- `question` (text) - Question text, indexed and searchable
- `answer` (text) - Answer text, indexed and searchable

### Sample Data

The system includes 6 fictional entries across 3 tenants covering topics like:
- Geography (Capital of France)
- Science (Photosynthesis, Speed of Light, Seasons)
- Technology (Quantum Computing)
- Literature (Romeo and Juliet)

## 🔄 Response Format

The delegating agent returns responses in a structured format:

```json
{
  "answer": "The generated answer text",
  "references": {
    "fileIds": ["file_001", "file_002"],
    "documents": [
      {
        "fileId": "file_001",
        "question": "Original question",
        "answer": "Original answer"
      }
    ],
    "chartConfig": {
      "type": "bar",
      "data": { ... },
      "options": { ... }
    }
  }
}
```

### Response Fields

- **answer**: The main response text
- **references.fileIds**: Array of file IDs used (if RAG was used)
- **references.documents**: Full document objects retrieved (if RAG was used)
- **references.chartConfig**: Chart.js configuration object (if chart tool was used)

## 🧪 Agent Flow

```
User Query
    ↓
Delegating Agent (Analyze)
    ↓
Decision: CHART | RAG | DIRECT | BOTH
    ↓
┌─────────────┬──────────────┬──────────────┐
│   Chart     │   RAG Agent  │   Direct     │
│   Tool      │              │   Answer     │
└─────────────┴──────────────┴──────────────┘
    ↓
Synthesize Results
    ↓
Final Response
```

## 🛠️ Development

### Project Structure

```
Agent-orchestration/
├── src/
│   ├── agents/
│   │   ├── delegatingAgent.js   # Main LangGraph agent
│   │   └── ragAgent.js           # RAG agent implementation
│   ├── tools/
│   │   └── chartjsTool.js        # Chart.js tool
│   ├── config/
│   │   └── config.js             # Configuration management
│   ├── utils/
│   │   └── weaviateClient.js    # Weaviate client utilities
│   ├── setup/
│   │   └── setupWeaviate.js     # Database setup script
│   ├── examples/
│   │   └── usage.js              # Example usage
│   └── index.js                  # Main entry point
├── docker-compose.yml            # Weaviate Docker config
├── package.json
└── README.md
```

### Available Scripts

- `npm start` - Run the main application
- `npm run setup` - Initialize Weaviate schema and data
- `npm run example` - Run example queries
- `npm run docker:up` - Start Weaviate container
- `npm run docker:down` - Stop Weaviate container

## 🔍 Features Implemented

✅ **Part 1: Weaviate Setup**
- Multi-tenant vector database with Docker
- Schema with fileId (not indexed), question, and answer
- 6+ fictional entries inserted using Weaviate JS client

✅ **Part 2: LangGraph Agent Hierarchy**
- Delegating agent with routing logic
- Chart.js mocked tool for visualization
- RAG agent with Weaviate integration
- Simultaneous and sequential tool execution
- Structured responses with answers, fileIds, and chart configs

## 🤝 Multi-Tool Handling

The delegating agent can handle:

1. **Sequential Execution**: One tool after another
2. **Parallel Execution**: Multiple tools can be prepared simultaneously
3. **Conditional Execution**: Tools only execute when needed based on query analysis

The LangGraph state machine manages the flow and ensures all results are properly synthesized into the final response.

## 🐛 Troubleshooting

### Weaviate Connection Issues

```bash
# Check if Weaviate is running
docker ps | grep weaviate

# View Weaviate logs
docker logs weaviate-agent-orchestration

# Restart Weaviate
npm run docker:down && npm run docker:up
```

### API Key Issues

Ensure your `.env` file has a valid Google Gemini API key:
```bash
cat .env | grep GOOGLE_API_KEY
```

Get your API key at: https://makersuite.google.com/app/apikey

### Database Not Initialized

If you get errors about missing schema:
```bash
npm run setup
```

## 📚 Technology Stack

- **Node.js** - Runtime environment
- **LangChain** - LLM abstraction and tooling
- **LangGraph** - Agent workflow orchestration
- **Google Gemini** - LLM (Free tier API)
- **Weaviate** - Vector database with multi-tenancy
- **Docker** - Container platform for Weaviate

## 📄 License

ISC

## 🎯 Future Enhancements

- Add more specialized tools (web search, calculator, etc.)
- Implement streaming responses
- Add conversation memory
- Support for custom vectorization models
- Web UI for interactive queries
- Rate limiting and caching

---

**Built with ❤️ using Node.js and LangGraph**
