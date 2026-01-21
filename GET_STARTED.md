# Get Started - Complete Guide 🚀

**Welcome!** This guide will walk you through setting up and using the Agent Orchestration System.

---

## 📖 What You'll Learn

1. How to set up the system (5 minutes)
2. How to run your first query
3. How the system works
4. How to customize for your needs

---

## ⚡ Quick Start (Copy & Paste)

**If you just want to get started fast, run these commands:**

```bash
# Step 1: Install dependencies
npm install

# Step 2: Add your Google Gemini API key to .env file
# Get your free API key from: https://makersuite.google.com/app/apikey
# Edit .env and replace "your_google_gemini_api_key_here" with your actual key

# Step 3: Start Weaviate database
npm run docker:up

# Step 4: Wait 10 seconds, then setup database
sleep 10 && npm run setup

# Step 5: Run examples
npm run example
```

That's it! 🎉

---

## 📚 Detailed Setup Guide

### Step 1: Prerequisites

**What you need:**
- Node.js 18 or higher
- Docker Desktop (or Docker Engine)
- A Google Gemini API key (free tier works!)

**Check if you have them:**
```bash
node --version   # Should be v18.x or higher
docker --version # Should show Docker version
```

**Don't have them?**
- Node.js: Download from https://nodejs.org/
- Docker: Download from https://www.docker.com/products/docker-desktop/
- API Key: Get free key at https://makersuite.google.com/app/apikey

---

### Step 2: Install Dependencies

```bash
cd /Users/tentalha/Desktop/Assesements/Agent-orchestration
npm install
```

**What happens:**
- Installs LangChain, LangGraph, Weaviate client, and other packages
- Takes about 30-60 seconds
- Downloads ~186 packages

**You'll see:**
```
added 186 packages, and audited 187 packages in 59s
found 0 vulnerabilities
```

---

### Step 3: Configure Your API Key

**Open the `.env` file:**
```bash
# On Mac/Linux
nano .env

# Or use any text editor
# On Mac: open -e .env
# On VS Code: code .env
```

**Find this line:**
```
GOOGLE_API_KEY=your_google_gemini_api_key_here
```

**Replace with your actual key:**
```
GOOGLE_API_KEY=AIzaSyA_your_actual_key_here_1234567890
```

**Save and close the file.**

**Important:** Never share or commit this key!

---

### Step 4: Start Weaviate Database

```bash
npm run docker:up
```

**What happens:**
- Starts a Docker container with Weaviate
- Weaviate runs on http://localhost:8080
- Creates a persistent volume for data storage

**You'll see:**
```
Creating weaviate-agent-orchestration ... done
```

**Wait 10 seconds for Weaviate to fully start:**
```bash
sleep 10
```

**Verify it's running:**
```bash
curl http://localhost:8080/v1/meta
```

You should see JSON with version information.

---

### Step 5: Initialize Database

```bash
npm run setup
```

**What happens:**
- Creates the `KnowledgeBase` schema
- Enables multi-tenancy
- Creates 3 tenants
- Inserts 6 sample Q&A entries

**You'll see:**
```
=== Setting up Weaviate ===

✓ Weaviate is ready. Version: 1.25.5
✓ Created class "KnowledgeBase" with multi-tenancy enabled
✓ Created tenants: tenant1, tenant2, tenant3
✓ Successfully inserted 6 entries across 3 tenants

=== Setup Complete ===
```

---

### Step 6: Run Examples

```bash
npm run example
```

**What happens:**
- Runs 4 different example queries
- Demonstrates RAG, Chart generation, Combined queries, and Direct answers
- Shows the full request/response flow

**You'll see:**
- Detailed logs of each query processing
- Final responses with answers and references
- Execution time for each example

---

## 🎯 Your First Custom Query

### Option 1: Use the test file

**Edit `test.js`:**
```javascript
const testQuery = 'What is quantum computing?';
const tenant = 'tenant2';
```

**Run it:**
```bash
node test.js
```

### Option 2: Create your own script

**Create `my-query.js`:**
```javascript
import { createDelegatingAgent } from './src/agents/delegatingAgent.js';

const agent = createDelegatingAgent();

const response = await agent.processQuery(
  'Your question here',
  'tenant1'
);

console.log('Answer:', response.answer);
console.log('References:', response.references);
```

**Run it:**
```bash
node my-query.js
```

---

## 🧠 Understanding the System

### What Can It Do?

The system can handle **4 types of queries**:

#### 1. Knowledge Base Queries (RAG)
**Example:** "What is photosynthesis?"

**What happens:**
- Searches the Weaviate database
- Finds relevant documents
- Generates answer using Google Gemini
- Returns answer with source fileIds

**Response:**
```json
{
  "answer": "Photosynthesis is the process...",
  "references": {
    "fileIds": ["file_002"],
    "documents": [...]
  }
}
```

#### 2. Chart Generation Queries
**Example:** "Create a bar chart: Q1=100, Q2=150, Q3=200"

**What happens:**
- Parses chart parameters
- Generates Chart.js configuration
- Returns ready-to-use chart config

**Response:**
```json
{
  "answer": "I've generated a chart configuration...",
  "references": {
    "chartConfig": {
      "type": "bar",
      "data": {...}
    }
  }
}
```

#### 3. Combined Queries
**Example:** "What is quantum computing? Show a pie chart of quantum applications."

**What happens:**
- Executes BOTH RAG agent AND Chart tool
- Combines results
- Returns comprehensive response

**Response:**
```json
{
  "answer": "Quantum computing is... I've also generated a chart...",
  "references": {
    "fileIds": ["file_003"],
    "documents": [...],
    "chartConfig": {...}
  }
}
```

#### 4. Direct Queries
**Example:** "What is 2 + 2?"

**What happens:**
- LLM answers directly
- No tools needed
- Quick response

**Response:**
```json
{
  "answer": "2 + 2 equals 4.",
  "references": {}
}
```

---

## 🎨 Customization Guide

### Add Your Own Data

**Edit `src/setup/setupWeaviate.js`:**

Find the `entries` array and add your data:

```javascript
{
  tenant: 'tenant1',
  data: [
    {
      fileId: 'file_your_001',
      question: 'Your question here?',
      answer: 'Your answer here.',
    },
  ],
}
```

**Re-run setup:**
```bash
npm run setup
```

### Change LLM Settings

**Edit `.env`:**
```bash
LLM_MODEL=gemini-1.5-flash  # or gemini-pro
LLM_TEMPERATURE=0.3         # Lower = more deterministic
```

### Add New Tenants

**Edit `src/config/config.js`:**
```javascript
tenants: ['tenant1', 'tenant2', 'tenant3', 'tenant4'],
```

**Re-run setup:**
```bash
npm run setup
```

---

## 📊 Real-World Use Cases

### Use Case 1: Documentation Assistant
```javascript
// Add your documentation to Weaviate
// Query: "How do I configure authentication?"
// Returns: Answer from your docs + file references
```

### Use Case 2: Data Visualization
```javascript
// Query: "Show sales data as a bar chart: Jan=100, Feb=150, Mar=200"
// Returns: Chart.js config to render in your frontend
```

### Use Case 3: Combined Analysis
```javascript
// Query: "What were our Q3 results? Show a comparison chart."
// Returns: Analysis from database + visualization config
```

---

## 🔄 Daily Workflow

### Starting Your Work Session

```bash
# 1. Start Weaviate (if not running)
npm run docker:up

# 2. Verify it's working
curl http://localhost:8080/v1/meta

# 3. Start coding!
```

### Testing Changes

```bash
# After making changes, test with:
node test.js
# or
npm run example
```

### Stopping Everything

```bash
# Stop Weaviate container
npm run docker:down

# Optionally, clean up
docker system prune
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "Weaviate connection failed"

**Solution:**
```bash
# Check if Docker is running
docker ps

# Restart Weaviate
npm run docker:down
npm run docker:up
sleep 10
```

### Issue 2: "API key not configured"

**Solution:**
```bash
# Check your .env file
cat .env | grep GOOGLE_API_KEY

# Make sure it's not the placeholder
# Should NOT be: your_google_gemini_api_key_here
```

### Issue 3: "No data found"

**Solution:**
```bash
# Re-run setup
npm run setup

# Verify data exists
curl http://localhost:8080/v1/objects | grep file_
```

### Issue 4: "Module not found"

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 Documentation Map

**Where to find what:**

| I Want To... | Read This |
|--------------|-----------|
| Get started quickly | `QUICKSTART.md` |
| Understand architecture | `ARCHITECTURE.md` |
| Learn the API | `API.md` |
| See visual examples | `VISUAL_GUIDE.md` |
| Verify setup | `CHECKLIST.md` |
| Get project overview | `PROJECT_SUMMARY.md` |
| Main documentation | `README.md` |
| This guide | `GET_STARTED.md` |

---

## 🎓 Learning Path

### Beginner
1. ✅ Follow this guide
2. Run the examples
3. Try a simple custom query
4. Read the QUICKSTART.md

### Intermediate
1. Read ARCHITECTURE.md
2. Understand the agent flow
3. Add your own data
4. Modify chart configurations
5. Read API.md

### Advanced
1. Customize the delegating agent logic
2. Add new tools
3. Implement conversation memory
4. Add custom vectorization
5. Build integration with your app

---

## 🤝 Getting Help

### Self-Help Resources

1. **Check the docs** - Start with README.md
2. **Run the checklist** - Use CHECKLIST.md to verify setup
3. **Read error messages** - They're usually helpful!
4. **Check logs** - Look at terminal output

### Debugging Tips

```bash
# Enable verbose logging in your queries
console.log('Current state:', state);

# Check Weaviate directly
curl http://localhost:8080/v1/objects

# Test components separately
node test-rag.js
node test-chart.js
```

---

## 🎯 Next Steps

Now that you're set up, here's what to do:

### Immediate (5 minutes)
- [ ] Run `npm run example`
- [ ] Edit `test.js` with your own query
- [ ] See the response structure

### Short-term (30 minutes)
- [ ] Read ARCHITECTURE.md
- [ ] Try different query types
- [ ] Add one custom data entry
- [ ] Read API.md

### Long-term (1-2 hours)
- [ ] Integrate with your application
- [ ] Add your actual data
- [ ] Customize the agents
- [ ] Build your use case

---

## 📈 Success Metrics

**You're successful when you can:**
- ✅ Start the system without errors
- ✅ Run example queries and get responses
- ✅ Understand the response structure
- ✅ Write custom queries
- ✅ Add your own data
- ✅ Explain how it works to someone else

---

## 🎉 Congratulations!

You're now ready to use the Agent Orchestration System!

**Remember:**
- Start with simple queries
- Read the error messages
- Check the documentation
- Experiment and learn
- Have fun building!

---

## 📞 Quick Reference

### Essential Commands
```bash
npm install           # Install dependencies
npm run docker:up     # Start Weaviate
npm run setup         # Initialize database
npm run example       # Run examples
node test.js          # Custom test
npm run docker:down   # Stop Weaviate
```

### Essential Files
```
src/agents/delegatingAgent.js  # Main agent
src/agents/ragAgent.js         # RAG implementation
src/tools/chartjsTool.js       # Chart generator
.env                           # Your config
test.js                        # Custom testing
```

### Essential URLs
```
http://localhost:8080/v1/meta      # Weaviate health
http://localhost:8080/v1/schema    # Database schema
http://localhost:8080/v1/objects   # Data objects
```

---

**You're all set!** 🚀

Start with `npm run example` and explore from there!

Happy coding! 💻✨
