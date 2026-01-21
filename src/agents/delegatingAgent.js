import { StateGraph, END } from '@langchain/langgraph';
import { BaseMessage, HumanMessage, AIMessage } from '@langchain/core/messages';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { createChartJsTool } from '../tools/chartjsTool.js';
import { createRAGAgent } from './ragAgent.js';
import { config } from '../config/config.js';

/**
 * State interface for the agent graph
 */
class AgentState {
  constructor() {
    this.messages = [];
    this.userQuery = '';
    this.decision = null;
    this.chartConfig = null;
    this.ragResult = null;
    this.finalResponse = null;
  }
}

/**
 * Delegating Agent using LangGraph
 * Routes queries to appropriate tools/agents
 */
export class DelegatingAgent {
  constructor() {
    this.llm = new ChatGoogleGenerativeAI({
      apiKey: config.llm.apiKey,
      model: config.llm.model,
      temperature: config.llm.temperature,
    });
    
    this.chartTool = createChartJsTool();
    this.ragAgent = createRAGAgent();
    this.graph = this.createGraph();
  }

  /**
   * Analyze user query and decide which tools/agents to use
   */
  async analyzeQuery(state) {
    console.log('\n[Delegating Agent] Analyzing query...');
    
    const query = state.userQuery;
    
    const analysisPrompt = `You are a routing agent. Analyze the user's query and determine which actions to take.

User Query: "${query}"

Available Actions:
1. CHART - Create a chart/graph/visualization (requires chart type, labels, and data)
2. RAG - Search knowledge base for information
3. DIRECT - Answer directly without tools

Instructions:
- If the query asks to create/generate a chart, graph, or visualization: choose CHART
- If the query asks a question that requires looking up information: choose RAG
- If the query asks to both create a chart AND search for information: choose BOTH
- Otherwise: choose DIRECT

Response format (JSON only):
{
  "actions": ["CHART", "RAG", "DIRECT", or "BOTH"],
  "reasoning": "brief explanation"
}`;

    try {
      const response = await this.llm.invoke(analysisPrompt);
      const content = typeof response.content === 'string' ? response.content : response.content[0].text;
      
      // Parse JSON response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const decision = JSON.parse(jsonMatch[0]);
        state.decision = decision;
        console.log(`[Delegating Agent] Decision: ${decision.actions.join(', ')} - ${decision.reasoning}`);
      } else {
        // Fallback decision
        state.decision = { actions: ['DIRECT'], reasoning: 'Unable to parse decision, defaulting to direct answer' };
      }
    } catch (error) {
      console.error('Error analyzing query:', error.message);
      state.decision = { actions: ['DIRECT'], reasoning: 'Error in analysis, defaulting to direct answer' };
    }
    
    return state;
  }

  /**
   * Execute the chart tool
   */
  async executeChartTool(state) {
    const actions = state.decision?.actions || [];
    
    if (!actions.includes('CHART') && !actions.includes('BOTH')) {
      return state;
    }

    console.log('\n[Delegating Agent] Executing Chart Tool...');

    try {
      // Extract chart parameters from query using LLM
      const extractionPrompt = `Extract chart parameters from this query: "${state.userQuery}"

Provide JSON response with:
{
  "chartType": "bar|line|pie|doughnut|radar|polarArea",
  "labels": ["label1", "label2", ...],
  "data": [number1, number2, ...],
  "title": "chart title"
}

If the query doesn't provide specific data, create sample data that makes sense.`;

      const response = await this.llm.invoke(extractionPrompt);
      const content = typeof response.content === 'string' ? response.content : response.content[0].text;
      
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const params = JSON.parse(jsonMatch[0]);
        const chartConfig = await this.chartTool.func(params);
        state.chartConfig = chartConfig;
        console.log('[Delegating Agent] Chart configuration generated');
      }
    } catch (error) {
      console.error('Error executing chart tool:', error.message);
      state.chartConfig = null;
    }

    return state;
  }

  /**
   * Execute the RAG agent
   */
  async executeRAGAgent(state) {
    const actions = state.decision?.actions || [];
    
    if (!actions.includes('RAG') && !actions.includes('BOTH')) {
      return state;
    }

    console.log('\n[Delegating Agent] Executing RAG Agent...');

    try {
      const result = await this.ragAgent.query(state.userQuery);
      state.ragResult = result;
      console.log('[Delegating Agent] RAG query completed');
    } catch (error) {
      console.error('Error executing RAG agent:', error.message);
      state.ragResult = null;
    }

    return state;
  }

  /**
   * Generate direct answer without tools
   */
  async generateDirectAnswer(state) {
    const actions = state.decision?.actions || [];
    
    if (!actions.includes('DIRECT')) {
      return state;
    }

    console.log('\n[Delegating Agent] Generating direct answer...');

    try {
      const response = await this.llm.invoke(state.userQuery);
      const answer = typeof response.content === 'string' ? response.content : response.content[0].text;
      
      state.finalResponse = {
        answer: answer.trim(),
        references: {},
      };
      
      console.log('[Delegating Agent] Direct answer generated');
    } catch (error) {
      console.error('Error generating direct answer:', error.message);
    }

    return state;
  }

  /**
   * Synthesize final response from all sources
   */
  async synthesizeResponse(state) {
    console.log('\n[Delegating Agent] Synthesizing final response...');

    const response = {
      answer: '',
      references: {},
    };

    // Combine results from different sources
    if (state.ragResult) {
      response.answer = state.ragResult.answer;
      response.references.fileIds = state.ragResult.fileIds;
      response.references.documents = state.ragResult.references;
    }

    if (state.chartConfig) {
      if (response.answer) {
        response.answer += '\n\nI\'ve also generated a chart configuration for your visualization.';
      } else {
        response.answer = 'I\'ve generated a chart configuration based on your request.';
      }
      response.references.chartConfig = JSON.parse(state.chartConfig);
    }

    if (state.finalResponse && !response.answer) {
      response.answer = state.finalResponse.answer;
    }

    state.finalResponse = response;
    console.log('[Delegating Agent] Final response ready');
    
    return state;
  }

  /**
   * Create the LangGraph workflow
   */
  createGraph() {
    const workflow = new StateGraph({
      channels: {
        messages: null,
        userQuery: null,
        decision: null,
        chartConfig: null,
        ragResult: null,
        finalResponse: null,
      },
    });

    // Add nodes
    workflow.addNode('analyze', (state) => this.analyzeQuery(state));
    workflow.addNode('process', async (state) => {
      // Execute tools based on decision
      await this.executeChartTool(state);
      await this.executeRAGAgent(state);
      await this.generateDirectAnswer(state);
      return state;
    });
    workflow.addNode('synthesize', (state) => this.synthesizeResponse(state));

    // Define edges
    workflow.setEntryPoint('analyze');
    workflow.addEdge('analyze', 'process');
    workflow.addEdge('process', 'synthesize');
    workflow.addEdge('synthesize', END);

    return workflow.compile();
  }

  /**
   * Process a user query
   */
  async processQuery(query, tenant = 'tenant1') {
    console.log('\n========================================');
    console.log('DELEGATING AGENT - PROCESSING QUERY');
    console.log('========================================');
    console.log(`Query: "${query}"`);
    console.log(`Tenant: ${tenant}`);

    const initialState = {
      messages: [new HumanMessage(query)],
      userQuery: query,
      decision: null,
      chartConfig: null,
      ragResult: null,
      finalResponse: null,
    };

    try {
      const result = await this.graph.invoke(initialState);
      
      console.log('\n========================================');
      console.log('FINAL RESPONSE');
      console.log('========================================');
      console.log(JSON.stringify(result.finalResponse, null, 2));
      
      return result.finalResponse;
    } catch (error) {
      console.error('Error processing query:', error);
      throw error;
    }
  }
}

/**
 * Create an instance of the Delegating Agent
 */
export function createDelegatingAgent() {
  return new DelegatingAgent();
}
