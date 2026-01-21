# Visual Guide - Agent Orchestration System

## 🎬 Step-by-Step Visual Walkthrough

---

## 📦 Step 1: Installation

```bash
$ cd Agent-orchestration
$ npm install
```

**What Happens:**
```
📦 Installing packages...
├── @langchain/langgraph ✓
├── @langchain/google-genai ✓
├── weaviate-ts-client ✓
└── ... 186 packages installed
```

---

## 🐳 Step 2: Start Weaviate Database

```bash
$ npm run docker:up
```

**What Happens:**
```
🐳 Starting Weaviate container...
✓ Container weaviate-agent-orchestration created
✓ Weaviate running on http://localhost:8080
```

**Visual Representation:**
```
┌─────────────────────────────────────┐
│   Docker Container                  │
│   ┌───────────────────────────┐    │
│   │   Weaviate Database       │    │
│   │   Port: 8080              │    │
│   │   Status: Running         │    │
│   └───────────────────────────┘    │
└─────────────────────────────────────┘
```

---

## 🗄️ Step 3: Setup Database

```bash
$ npm run setup
```

**What Happens:**
```
=== Setting up Weaviate ===

Checking Weaviate connection...
✓ Weaviate is ready. Version: 1.25.5

--- Creating Schema ---
✓ Created class "KnowledgeBase" with multi-tenancy enabled
✓ Created tenants: tenant1, tenant2, tenant3

--- Seeding Data ---
✓ Inserted: What is the capital of France?... (Tenant: tenant1)
✓ Inserted: How does photosynthesis work?... (Tenant: tenant1)
✓ Inserted: What is quantum computing?... (Tenant: tenant2)
✓ Inserted: Who wrote Romeo and Juliet?... (Tenant: tenant2)
✓ Inserted: What is the speed of light?... (Tenant: tenant3)
✓ Inserted: What causes the seasons?... (Tenant: tenant3)

✓ Successfully inserted 6 entries across 3 tenants

=== Setup Complete ===
```

**Database Structure:**
```
Weaviate Database
└── KnowledgeBase (Class)
    ├── Tenant 1
    │   ├── [file_001] Capital of France
    │   └── [file_002] Photosynthesis
    ├── Tenant 2
    │   ├── [file_003] Quantum Computing
    │   └── [file_004] Romeo and Juliet
    └── Tenant 3
        ├── [file_005] Speed of Light
        └── [file_006] Seasons
```

---

## 🚀 Step 4: Run Examples

```bash
$ npm run example
```

---

### Example 1: Knowledge Base Query (RAG)

**Input:**
```
Query: "How does photosynthesis work?"
Tenant: tenant1
```

**Processing Flow:**
```
User Query: "How does photosynthesis work?"
    ↓
┌─────────────────────────────────────┐
│   Delegating Agent                  │
│   [ANALYZE]                         │
│   Decision: RAG                     │
└─────────────────┬───────────────────┘
                  ↓
┌─────────────────────────────────────┐
│   RAG Agent                         │
│   1. Search Weaviate (BM25)         │
│   2. Found: file_002                │
│   3. Generate answer with LLM       │
└─────────────────┬───────────────────┘
                  ↓
┌─────────────────────────────────────┐
│   Response                          │
│   ✓ Answer                          │
│   ✓ fileIds: [file_002]            │
│   ✓ Documents                       │
└─────────────────────────────────────┘
```

**Output:**
```json
{
  "answer": "Photosynthesis is the process by which plants use sunlight, water, and carbon dioxide to produce oxygen and energy in the form of sugar.",
  "references": {
    "fileIds": ["file_002"],
    "documents": [
      {
        "fileId": "file_002",
        "question": "How does photosynthesis work?",
        "answer": "Photosynthesis is the process by which plants..."
      }
    ]
  }
}
```

---

### Example 2: Chart Generation

**Input:**
```
Query: "Create a line chart showing temperature data: 
        Monday=20, Tuesday=22, Wednesday=19, 
        Thursday=23, Friday=21"
```

**Processing Flow:**
```
User Query: "Create a line chart..."
    ↓
┌─────────────────────────────────────┐
│   Delegating Agent                  │
│   [ANALYZE]                         │
│   Decision: CHART                   │
└─────────────────┬───────────────────┘
                  ↓
┌─────────────────────────────────────┐
│   Chart.js Tool                     │
│   1. Parse parameters               │
│      - Type: line                   │
│      - Labels: [Mon, Tue, ...]      │
│      - Data: [20, 22, 19, ...]      │
│   2. Generate config                │
└─────────────────┬───────────────────┘
                  ↓
┌─────────────────────────────────────┐
│   Response                          │
│   ✓ Answer                          │
│   ✓ chartConfig                     │
└─────────────────────────────────────┘
```

**Output:**
```json
{
  "answer": "I've generated a chart configuration based on your request.",
  "references": {
    "chartConfig": {
      "type": "line",
      "data": {
        "labels": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "datasets": [{
          "data": [20, 22, 19, 23, 21],
          "backgroundColor": [...],
          "borderColor": [...]
        }]
      },
      "options": {
        "responsive": true,
        "plugins": {...},
        "scales": {...}
      }
    }
  }
}
```

**Visual Chart:**
```
Temperature Over Week
│
24┤                     ●
23┤                 
22┤     ●
21┤                         ●
20┤ ●
19┤         ●
18┤
  └─────────────────────────────
   Mon  Tue  Wed  Thu  Fri
```

---

### Example 3: Combined Query (RAG + Chart)

**Input:**
```
Query: "What is the speed of light? Also create a pie chart 
        comparing light speed vs sound speed: Light=299792, Sound=343"
Tenant: tenant3
```

**Processing Flow:**
```
User Query: "What is the speed of light? Also create a pie chart..."
    ↓
┌─────────────────────────────────────┐
│   Delegating Agent                  │
│   [ANALYZE]                         │
│   Decision: BOTH (RAG + CHART)      │
└─────────────────┬───────────────────┘
                  ↓
    ┌─────────────┴─────────────┐
    ↓                           ↓
┌──────────┐              ┌──────────┐
│ RAG Agent│              │Chart Tool│
│          │              │          │
│ Search   │              │ Generate │
│ Database │              │ Config   │
└────┬─────┘              └────┬─────┘
     │                         │
     └──────────┬──────────────┘
                ↓
┌─────────────────────────────────────┐
│   Synthesize Response               │
│   ✓ Combine RAG + Chart             │
└─────────────────┬───────────────────┘
                  ↓
┌─────────────────────────────────────┐
│   Complete Response                 │
│   ✓ Answer (from RAG)               │
│   ✓ fileIds: [file_005]            │
│   ✓ Documents                       │
│   ✓ chartConfig                     │
└─────────────────────────────────────┘
```

**Output:**
```json
{
  "answer": "The speed of light in a vacuum is approximately 299,792,458 meters per second (or about 186,282 miles per second). I've also generated a chart configuration for your visualization.",
  "references": {
    "fileIds": ["file_005"],
    "documents": [
      {
        "fileId": "file_005",
        "question": "What is the speed of light?",
        "answer": "The speed of light in a vacuum is approximately..."
      }
    ],
    "chartConfig": {
      "type": "pie",
      "data": {
        "labels": ["Light", "Sound"],
        "datasets": [{
          "data": [299792, 343]
        }]
      }
    }
  }
}
```

**Visual Pie Chart:**
```
    Speed Comparison
    
    ╭─────────────╮
    │             │
    │  Light      │
    │  99.9%      │
    │             │
    │ ●Sound 0.1% │
    ╰─────────────╯
```

---

### Example 4: Direct Answer

**Input:**
```
Query: "What is 2 + 2?"
```

**Processing Flow:**
```
User Query: "What is 2 + 2?"
    ↓
┌─────────────────────────────────────┐
│   Delegating Agent                  │
│   [ANALYZE]                         │
│   Decision: DIRECT                  │
└─────────────────┬───────────────────┘
                  ↓
┌─────────────────────────────────────┐
│   Direct Answer (LLM)               │
│   Generate answer without tools     │
└─────────────────┬───────────────────┘
                  ↓
┌─────────────────────────────────────┐
│   Response                          │
│   ✓ Answer only                     │
└─────────────────────────────────────┘
```

**Output:**
```json
{
  "answer": "2 + 2 equals 4.",
  "references": {}
}
```

---

## 🎨 System Component Visualization

```
┌────────────────────────────────────────────────────────────────┐
│                         USER                                   │
└───────────────────────────┬────────────────────────────────────┘
                            │
                   [Natural Language Query]
                            │
                            ▼
┌────────────────────────────────────────────────────────────────┐
│                 DELEGATING AGENT                               │
│                 (LangGraph State Machine)                      │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  Node 1: ANALYZE                                         │ │
│  │  • Parse query intent                                    │ │
│  │  • Use LLM to understand request                         │ │
│  │  • Decide routing strategy                               │ │
│  └──────────────────────────────────────────────────────────┘ │
│                            ↓                                   │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  Node 2-4: EXECUTE                                       │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐              │ │
│  │  │  Chart   │  │   RAG    │  │  Direct  │              │ │
│  │  │  Tool    │  │  Agent   │  │  Answer  │              │ │
│  │  └──────────┘  └──────────┘  └──────────┘              │ │
│  └──────────────────────────────────────────────────────────┘ │
│                            ↓                                   │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  Node 5: SYNTHESIZE                                      │ │
│  │  • Combine all results                                   │ │
│  │  • Format response structure                             │ │
│  │  • Add references and metadata                           │ │
│  └──────────────────────────────────────────────────────────┘ │
└───────────────────────────┬────────────────────────────────────┘
                            │
                   [Structured Response]
                            │
                            ▼
┌────────────────────────────────────────────────────────────────┐
│                    RESPONSE OBJECT                             │
│  {                                                             │
│    answer: string,                                             │
│    references: {                                               │
│      fileIds?: string[],                                       │
│      documents?: Document[],                                   │
│      chartConfig?: ChartConfig                                 │
│    }                                                           │
│  }                                                             │
└────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Animation

### RAG Query Flow:

```
[1] User Query
     ↓
[2] Delegating Agent (Analyze)
     ↓
[3] Decision: "RAG"
     ↓
[4] RAG Agent activates
     ↓
[5] Query Weaviate
     ┌───────────────┐
     │   Weaviate    │
     │   🔍 Search   │
     │   ✓ Found     │
     └───────────────┘
     ↓
[6] Retrieved Documents
     ↓
[7] Google Gemini (Generate Answer)
     ┌───────────────┐
     │   Gemini API  │
     │   💭 Generate │
     │   ✓ Complete  │
     └───────────────┘
     ↓
[8] Synthesize Response
     ↓
[9] Return to User
```

---

## 📊 Response Structure Breakdown

```
Response Object
├── answer (string)
│   └── "The main answer text generated by the system"
│
└── references (object)
    ├── fileIds (array) [Optional - only if RAG used]
    │   ├── "file_001"
    │   ├── "file_002"
    │   └── ...
    │
    ├── documents (array) [Optional - only if RAG used]
    │   ├── Document 1
    │   │   ├── fileId: "file_001"
    │   │   ├── question: "..."
    │   │   └── answer: "..."
    │   └── ...
    │
    └── chartConfig (object) [Optional - only if Chart used]
        ├── type: "bar" | "line" | "pie" | ...
        ├── data
        │   ├── labels: [...]
        │   └── datasets: [...]
        └── options
            └── ...
```

---

## 🧪 Testing Your Own Query

**Edit test.js:**
```javascript
const testQuery = 'Your question here';
const tenant = 'tenant1';
```

**Run:**
```bash
$ node test.js
```

**Watch the Flow:**
```
🧪 Testing Agent Orchestration System

✓ Weaviate is ready

📝 Query: "Your question here"
🏢 Tenant: tenant1

========================================
DELEGATING AGENT - PROCESSING QUERY
========================================

[Delegating Agent] Analyzing query...
[Delegating Agent] Decision: RAG

[Delegating Agent] Executing RAG Agent...
[RAG Agent] Processing query...
[RAG Agent] Retrieved 2 documents
[RAG Agent] Generated answer with 2 references

[Delegating Agent] Synthesizing final response...
[Delegating Agent] Final response ready

========================================
FINAL RESPONSE
========================================
{
  "answer": "...",
  "references": {...}
}
```

---

## 🎯 Quick Decision Guide

**What will the system do with my query?**

| Your Query Contains | System Action | Result Includes |
|---------------------|---------------|-----------------|
| "What is..." / "How does..." | → RAG Agent | answer + fileIds + documents |
| "Create chart" / "Show graph" | → Chart Tool | answer + chartConfig |
| Both above | → RAG + Chart | answer + fileIds + documents + chartConfig |
| Simple question | → Direct LLM | answer only |

---

## 📈 Performance Indicators

During execution, watch for:

```
✓ Weaviate is ready          [Database OK]
✓ Analyzing query...          [LLM responding]
✓ Retrieved 3 documents       [Search successful]
✓ Generated answer            [RAG complete]
✓ Chart configuration generated [Chart complete]
✓ Final response ready        [Synthesis done]
```

---

## 🛠️ Troubleshooting Visual

```
Problem: "Weaviate connection failed"
    ↓
Solution Tree:
    ├─ Is Docker running?
    │  └─ No → Start Docker
    │  └─ Yes → Check container
    │         └─ docker ps | grep weaviate
    │                ├─ Running → Check URL in .env
    │                └─ Not running → npm run docker:up
    │
    └─ Port 8080 in use?
       └─ lsof -i :8080
          └─ Change port in docker-compose.yml
```

---

## 🎉 Success Indicators

When everything works, you'll see:

```
✅ Dependencies installed
✅ Weaviate running (http://localhost:8080)
✅ Schema created
✅ 6 entries inserted
✅ Queries processing correctly
✅ Responses with proper structure

Status: 🟢 All Systems Operational
```

---

## 📚 Next Steps

1. ✅ **Basic Setup** - You are here!
2. 🔜 **Try Examples** - Run `npm run example`
3. 🔜 **Custom Queries** - Edit `test.js`
4. 🔜 **Add Your Data** - Modify `setupWeaviate.js`
5. 🔜 **Build Integration** - Use in your app

---

**Visual Guide Complete** 🎊

For more details:
- Technical: See ARCHITECTURE.md
- API Usage: See API.md
- Quick Start: See QUICKSTART.md
