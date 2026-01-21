import weaviate from 'weaviate-ts-client';
import { config } from '../config/config.js';

let client = null;

/**
 * Get or create Weaviate client instance
 */
export function getWeaviateClient() {
  if (!client) {
    const clientConfig = {
      scheme: config.weaviate.url.startsWith('https') ? 'https' : 'http',
      host: config.weaviate.url.replace(/^https?:\/\//, ''),
    };

    if (config.weaviate.apiKey) {
      clientConfig.apiKey = new weaviate.ApiKey(config.weaviate.apiKey);
    }

    client = weaviate.client(clientConfig);
  }
  return client;
}

/**
 * Check if Weaviate is ready
 */
export async function checkWeaviateHealth() {
  try {
    const client = getWeaviateClient();
    const meta = await client.misc.metaGetter().do();
    console.log('✓ Weaviate is ready. Version:', meta.version);
    return true;
  } catch (error) {
    console.error('✗ Weaviate connection failed:', error.message);
    return false;
  }
}
