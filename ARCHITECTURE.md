# System Architecture

## 🏛️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER QUERY                              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   DELEGATING AGENT (LangGraph)                  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  1. ANALYZE QUERY                                        │ │
│  │     - Determine intent                                   │ │
│  │     - Decide: CHART | RAG | DIRECT | BOTH              │ │
│  └──────────────────────────────────────────────────────────┘ │
│                         │                                       │
│         ┌───────────────┼───────────────┐                      │
│         ▼               ▼               ▼                      │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐                │
│  │  CHART   │    │   RAG    │    │  DIRECT  │                │
│  │  TOOL    │    │  AGENT   │    │  ANSWER  │                │
│  └──────────┘    └──────────┘    └──────────┘                │
│         │               │               │                      │
│         └───────────────┼───────────────┘                      │
│                         ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  5. SYNTHESIZE RESPONSE                                  │ │
│  │     - Combine all results                                │ │
│  │     - Format final response                              │ │
│  └──────────────────────────────────────────────────────────┘ │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FINAL RESPONSE                             │
│  {                                                              │
│    answer: "...",                                               │
│    references: {                                                │
│      fileIds: [...],                                            │
│      documents: [...],                                          │
│      chartConfig: {...}                                         │
│    }                                                            │
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 LangGraph State Machine

```
                    ┌─────────────┐
                    │   START     │
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │   ANALYZE   │
                    │   QUERY     │
                    └──────┬──────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
   ┌────────┐         ┌────────┐        ┌────────┐
   │ CHART  │         │  RAG   │        │ DIRECT │
   │ TOOL   │         │ AGENT  │        │ ANSWER │
   └───┬────┘         └───┬────┘        └───┬────┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │ SYNTHESIZE  │
                    │  RESPONSE   │
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │     END     │
                    └─────────────┘
```

## 🔌 Component Interactions

### RAG Agent Flow

```
User Query
    │
    ▼
┌──────────────────────────────────┐
│        RAG AGENT                 │
│                                  │
│  1. Query Analysis               │
│  2. Retrieve from Weaviate       │
│     ┌─────────────────────┐     │
│     │  Weaviate Database  │     │
│     │  ┌───────────────┐  │     │
│     │  │  Tenant 1     │  │     │
│     │  ├───────────────┤  │     │
│     │  │  Tenant 2     │  │     │
│     │  ├───────────────┤  │     │
│     │  │  Tenant 3     │  │     │
│     │  └───────────────┘  │     │
│     └─────────────────────┘     │
│  3. Generate Answer (LLM)        │
│  4. Return with fileIds          │
└──────────────────────────────────┘
    │
    ▼
{
  answer: "Generated answer",
  fileIds: ["file_001", "file_002"],
  references: [...]
}
```

### Chart Tool Flow

```
User Query: "Create bar chart: A=10, B=20, C=30"
    │
    ▼
┌──────────────────────────────────┐
│      CHART.JS TOOL               │
│                                  │
│  1. Parse Parameters             │
│     - chartType: "bar"           │
│     - labels: ["A","B","C"]      │
│     - data: [10, 20, 30]         │
│                                  │
│  2. Generate Config              │
│     - Chart type settings        │
│     - Colors                     │
│     - Options                    │
└──────────────────────────────────┘
    │
    ▼
{
  type: "bar",
  data: {
    labels: ["A", "B", "C"],
    datasets: [{
      data: [10, 20, 30],
      backgroundColor: [...],
      borderColor: [...]
    }]
  },
  options: {...}
}
```

## 🗄️ Weaviate Database Schema

```
Class: KnowledgeBase (Multi-Tenant Enabled)
├── Tenant: tenant1
│   ├── Object 1: { fileId: "file_001", question: "...", answer: "..." }
│   └── Object 2: { fileId: "file_002", question: "...", answer: "..." }
├── Tenant: tenant2
│   ├── Object 3: { fileId: "file_003", question: "...", answer: "..." }
│   └── Object 4: { fileId: "file_004", question: "...", answer: "..." }
└── Tenant: tenant3
    ├── Object 5: { fileId: "file_005", question: "...", answer: "..." }
    └── Object 6: { fileId: "file_006", question: "...", answer: "..." }

Properties:
├── fileId: text (not indexed, not searchable)
├── question: text (indexed, searchable)
└── answer: text (indexed, searchable)
```

## 🧠 Decision Logic

### Delegating Agent Decision Tree

```
                        User Query
                             │
                             ▼
                    ┌────────────────┐
                    │  Query Analysis│
                    │  (LLM)         │
                    └────────┬───────┘
                             │
                             ▼
                    ┌────────────────┐
                    │  Does it ask   │
                    │  to create a   │
                    │  chart/graph?  │
                    └───┬────────┬───┘
                        │        │
                    YES │        │ NO
                        │        │
        ┌───────────────┤        └─────────────────┐
        │               │                          │
        ▼               ▼                          ▼
┌──────────────┐  ┌──────────────┐        ┌──────────────┐
│ Does it also │  │              │        │ Does it need │
│ need info    │  │  CHART ONLY  │        │ info from    │
│ lookup?      │  │              │        │ database?    │
└───┬──────┬───┘  └──────────────┘        └───┬──────┬───┘
    │      │                                   │      │
YES │      │ NO                            YES │      │ NO
    │      │                                   │      │
    ▼      ▼                                   ▼      ▼
┌────────┐ ┌────────┐                    ┌────────┐ ┌────────┐
│  BOTH  │ │ CHART  │                    │  RAG   │ │ DIRECT │
└────────┘ └────────┘                    └────────┘ └────────┘
```

## 🔐 Multi-Tenancy Model

```
Application Layer
    │
    ├─── User Request (includes tenant identifier)
    │
    ▼
Weaviate Database
    │
    ├─── Tenant 1 (Isolated Data Space)
    │    └─── Objects specific to Tenant 1
    │
    ├─── Tenant 2 (Isolated Data Space)
    │    └─── Objects specific to Tenant 2
    │
    └─── Tenant 3 (Isolated Data Space)
         └─── Objects specific to Tenant 3

Benefits:
✓ Data isolation
✓ Separate search spaces
✓ Scalable architecture
✓ Multi-customer support
```

## 📦 Technology Stack Layers

```
┌─────────────────────────────────────────────────────┐
│              Application Layer                      │
│  - Delegating Agent (LangGraph)                     │
│  - RAG Agent                                        │
│  - Chart.js Tool                                    │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────┴──────────────────────────────────┐
│           Orchestration Layer                       │
│  - LangGraph (State Machine)                        │
│  - LangChain (LLM Abstraction)                      │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────┴──────────────────────────────────┐
│              Service Layer                          │
│  - Google Gemini API (LLM)                          │
│  - Weaviate (Vector Database)                       │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────┴──────────────────────────────────┐
│           Infrastructure Layer                      │
│  - Docker (Weaviate Container)                      │
│  - Node.js Runtime                                  │
└─────────────────────────────────────────────────────┘
```

## 🚦 Request Flow Example

### Example: Combined Query

**Query**: "What is quantum computing? Show a pie chart of quantum vs classical computing."

```
1. User submits query
   └─> Delegating Agent receives request

2. ANALYZE phase
   └─> LLM analyzes query
   └─> Decision: BOTH (RAG + CHART)

3. Parallel Execution:

   3a. RAG Agent Path:
       └─> Query: "What is quantum computing?"
       └─> Weaviate BM25 search in tenant
       └─> Retrieve: file_003 with quantum computing info
       └─> LLM generates contextual answer
       └─> Return: {answer, fileIds: ["file_003"], references}

   3b. Chart Tool Path:
       └─> Extract: type="pie", labels=["Quantum","Classical"], data=[20,80]
       └─> Generate Chart.js config
       └─> Return: chartConfig object

4. SYNTHESIZE phase
   └─> Combine RAG answer + Chart config
   └─> Format final response structure

5. Final Response:
   {
     answer: "Quantum computing is a type of computation that uses...",
     references: {
       fileIds: ["file_003"],
       documents: [{fileId: "file_003", ...}],
       chartConfig: {type: "pie", data: {...}}
     }
   }
```

## 🔄 State Management

LangGraph manages state through all nodes:

```javascript
State = {
  messages: [],           // Conversation history
  userQuery: "",          // Current query
  decision: null,         // Routing decision
  chartConfig: null,      // Chart.js config (if generated)
  ragResult: null,        // RAG query result (if used)
  finalResponse: null     // Synthesized response
}
```

State flows through: ANALYZE → CHART/RAG/DIRECT → SYNTHESIZE → END

---

## 📚 Key Design Patterns

1. **Delegation Pattern**: Main agent delegates to specialized agents/tools
2. **State Machine Pattern**: LangGraph manages workflow state
3. **Strategy Pattern**: Different strategies (RAG/Chart/Direct) based on query
4. **Adapter Pattern**: LangChain adapts different LLM APIs
5. **Repository Pattern**: Weaviate client abstracts database access

## 🔧 Extensibility Points

- Add new tools by implementing DynamicStructuredTool
- Add new agents by creating new node functions
- Extend routing logic in analyzeQuery method
- Add new tenants through configuration
- Customize LLM parameters in config.js

