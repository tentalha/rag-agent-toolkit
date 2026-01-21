# Quick Start Guide

Get up and running with the Agent Orchestration System in 5 minutes!

## ⚡ Quick Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Add Your API Key

Edit the `.env` file and add your Google Gemini API key:

```bash
# Get your free API key from: https://makersuite.google.com/app/apikey
GOOGLE_API_KEY=your_actual_api_key_here
```

### 3. Start Weaviate Database

```bash
npm run docker:up
```

Wait ~10 seconds for Weaviate to start.

### 4. Initialize Database

```bash
npm run setup
```

This creates the schema and loads sample data.

### 5. Run Examples

```bash
npm run example
```

## 🎯 What You'll See

The system will demonstrate:

1. **Knowledge Base Query**: "How does photosynthesis work?"
   - Searches Weaviate database
   - Returns answer with file references

2. **Chart Generation**: "Create a line chart showing temperature data..."
   - Generates Chart.js configuration
   - Returns ready-to-use chart config

3. **Combined Query**: "What is the speed of light? Also create a pie chart..."
   - Executes both RAG and chart tool
   - Returns answer + references + chart config

4. **Direct Answer**: "What is 2 + 2?"
   - LLM answers directly without tools

## 🔧 Test Your Own Queries

Create a file `test.js`:

```javascript
import { createDelegatingAgent } from './src/agents/delegatingAgent.js';

const agent = createDelegatingAgent();

// Try your own query
const response = await agent.processQuery(
  'Your question here',
  'tenant1'
);

console.log(JSON.stringify(response, null, 2));
```

Run it:
```bash
node test.js
```

## 🎓 Example Queries to Try

### RAG Queries (Knowledge Base)
- "What is quantum computing?"
- "Who wrote Romeo and Juliet?"
- "What causes the seasons?"
- "What is the capital of France?"

### Chart Queries
- "Create a bar chart: Apple=30, Orange=45, Banana=25"
- "Generate a pie chart showing browser usage: Chrome=60, Firefox=20, Safari=15, Other=5"
- "Make a line chart for stock prices: Mon=100, Tue=105, Wed=103, Thu=108, Fri=110"

### Combined Queries
- "What is photosynthesis? Show me a bar chart comparing plant types."
- "Explain quantum computing and create a pie chart of quantum applications."

## 🛑 Stopping

Stop Weaviate when done:
```bash
npm run docker:down
```

## 📚 Next Steps

- Read the full [README.md](README.md) for architecture details
- Explore the code in `src/agents/` and `src/tools/`
- Customize the schema in `src/setup/setupWeaviate.js`
- Add your own data to the knowledge base

## 🆘 Need Help?

Check the **Troubleshooting** section in [README.md](README.md)

---

Happy coding! 🚀
