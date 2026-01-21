import dotenv from 'dotenv';

dotenv.config();

export const config = {
  weaviate: {
    url: process.env.WEAVIATE_URL || 'http://localhost:8080',
    apiKey: process.env.WEAVIATE_API_KEY || undefined,
  },
  llm: {
    apiKey: process.env.GOOGLE_API_KEY,
    model: process.env.LLM_MODEL || 'gemini-pro',
    temperature: parseFloat(process.env.LLM_TEMPERATURE || '0.7'),
  },
  weaviateSchema: {
    className: 'KnowledgeBase',
    tenants: ['tenant1', 'tenant2', 'tenant3'],
  },
};
