import { GoogleGenAI } from '@google/genai';

export const getAIClient = (): GoogleGenAI | null => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('[Gemini Service] GEMINI_API_KEY is not set in environment.');
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

/**
 * Basic Cosine Similarity
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (!a || !b || a.length !== b.length || a.length === 0) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Fallback lightweight deterministic text embedding generator (TF-IDF bag-of-words hash)
 * Ensures offline/instant fallback resilience.
 */
export function generateLocalFallbackEmbedding(text: string, dimensions = 64): number[] {
  const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
  const vector = new Array(dimensions).fill(0);
  for (const word of words) {
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      hash = (hash << 5) - hash + word.charCodeAt(i);
      hash |= 0;
    }
    const index = Math.abs(hash) % dimensions;
    vector[index] += 1;
  }
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  if (magnitude === 0) return vector;
  return vector.map((v) => v / magnitude);
}

/**
 * Generate embedding vector using gemini-embedding-2-preview with fallback
 */
export async function getEmbedding(text: string): Promise<number[]> {
  const ai = getAIClient();
  if (ai) {
    try {
      const response: any = await ai.models.embedContent({
        model: 'gemini-embedding-2-preview',
        contents: text,
      });
      if (response?.embedding?.values) {
        return response.embedding.values;
      } else if (response?.embeddings?.[0]?.values) {
        return response.embeddings[0].values;
      }
    } catch (err) {
      console.warn('[Gemini Embedding] Failed to generate embedding from Gemini, using fallback:', err);
    }
  }
  return generateLocalFallbackEmbedding(text);
}

/**
 * Generate content with gemini-3.8-flash
 */
export async function generateContent(prompt: string, systemInstruction?: string): Promise<string> {
  const ai = getAIClient();
  if (!ai) {
    throw new Error('GEMINI_API_KEY is not configured on the server.');
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: prompt,
    config: systemInstruction
      ? {
          systemInstruction,
          temperature: 0.7,
        }
      : {
          temperature: 0.7,
        },
  });

  return response.text || '';
}

/**
 * Search the live web with Google Search grounding
 */
export async function searchWithGoogle(query: string): Promise<{ text: string; sources: Array<{ title: string; url: string; snippet?: string }> }> {
  const ai = getAIClient();
  if (!ai) {
    throw new Error('GEMINI_API_KEY is not configured on the server.');
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: query,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  const text = response.text || '';
  const sources: Array<{ title: string; url: string; snippet?: string }> = [];

  const candidate = response.candidates?.[0];
  const groundingChunks = (candidate as any)?.groundingMetadata?.groundingChunks;
  if (Array.isArray(groundingChunks)) {
    for (const chunk of groundingChunks) {
      if (chunk.web?.uri) {
        sources.push({
          title: chunk.web.title || chunk.web.uri,
          url: chunk.web.uri,
          snippet: chunk.web.snippet || '',
        });
      }
    }
  }

  return { text, sources };
}
