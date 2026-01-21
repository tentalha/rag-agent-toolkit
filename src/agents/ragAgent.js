import { getWeaviateClient } from '../utils/weaviateClient.js';
import { config } from '../config/config.js';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

/**
 * RAG Agent for retrieval-augmented generation
 * Queries Weaviate database and generates answers with references
 */
export class RAGAgent {
  constructor(llm) {
    this.llm = llm;
    this.client = getWeaviateClient();
    this.className = config.weaviateSchema.className;
  }

  /**
   * Query the vector database and retrieve relevant documents
   */
  async retrieveDocuments(query, tenant = 'tenant1', limit = 3) {
    try {
      // Use BM25 search to find relevant documents
      const result = await this.client.graphql
        .get()
        .withClassName(this.className)
        .withTenant(tenant)
        .withBm25({
          query: query,
        })
        .withFields('fileId question answer')
        .withLimit(limit)
        .do();

      const documents = result?.data?.Get?.[this.className] || [];
      
      console.log(`Retrieved ${documents.length} documents for query: "${query}"`);
      
      return documents;
    } catch (error) {
      console.error('Error retrieving documents:', error.message);
      
      // Fallback: fetch all objects if BM25 fails
      return await this.fetchAllDocuments(tenant, limit);
    }
  }

  /**
   * Fallback method to fetch documents without vector search
   */
  async fetchAllDocuments(tenant = 'tenant1', limit = 10) {
    try {
      const result = await this.client.graphql
        .get()
        .withClassName(this.className)
        .withTenant(tenant)
        .withFields('fileId question answer')
        .withLimit(limit)
        .do();

      const documents = result?.data?.Get?.[this.className] || [];
      console.log(`Fetched ${documents.length} documents (fallback mode)`);
      
      return documents;
    } catch (error) {
      console.error('Error fetching documents:', error.message);
      return [];
    }
  }

  /**
   * Generate an answer based on retrieved documents
   */
  async generateAnswer(query, documents) {
    if (documents.length === 0) {
      return {
        answer: "I couldn't find any relevant information to answer your question.",
        fileIds: [],
        references: [],
      };
    }

    // Prepare context from retrieved documents
    const context = documents
      .map((doc, idx) => `[${idx + 1}] File: ${doc.fileId}\nQ: ${doc.question}\nA: ${doc.answer}`)
      .join('\n\n');

    const prompt = `You are a helpful assistant. Use the following retrieved information to answer the user's question.

Retrieved Information:
${context}

User Question: ${query}

Instructions:
1. Answer the question based on the retrieved information
2. If the retrieved information doesn't contain the answer, say so clearly
3. Be concise and accurate
4. Reference the file IDs when using information from them

Answer:`;

    try {
      const response = await this.llm.invoke(prompt);
      const answer = typeof response.content === 'string' ? response.content : response.content[0].text;

      return {
        answer: answer.trim(),
        fileIds: documents.map((doc) => doc.fileId),
        references: documents.map((doc) => ({
          fileId: doc.fileId,
          question: doc.question,
          answer: doc.answer,
        })),
      };
    } catch (error) {
      console.error('Error generating answer:', error.message);
      throw error;
    }
  }

  /**
   * Main query method that retrieves and generates answer
   */
  async query(userQuery, tenant = 'tenant1') {
    console.log(`\n[RAG Agent] Processing query: "${userQuery}"`);
    
    // Retrieve relevant documents
    const documents = await this.retrieveDocuments(userQuery, tenant);
    
    // Generate answer based on documents
    const result = await this.generateAnswer(userQuery, documents);
    
    console.log(`[RAG Agent] Generated answer with ${result.fileIds.length} references`);
    
    return result;
  }
}

/**
 * Create an instance of the RAG Agent
 */
export function createRAGAgent() {
  const llm = new ChatGoogleGenerativeAI({
    apiKey: config.llm.apiKey,
    model: config.llm.model,
    temperature: config.llm.temperature,
  });

  return new RAGAgent(llm);
}
