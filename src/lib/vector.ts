/**
 * Lightweight vector generator utility for local development & UI testing.
 * Generates deterministic 768-dimensional float arrays simulating OpenAI text-embedding-3-small vectors
 * based on hash seeding from the input text, enabling predictable vector similarity search testing without live API keys.
 */

export const VECTOR_DIMENSIONS = 768;

/**
 * Simple pseudo-random hash generator based on string seeding
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

/**
 * Generates a mock 768-dimensional normalized float embedding vector from an input text.
 */
export async function generateMockEmbedding(text: string): Promise<number[]> {
  const seed = hashString(text.toLowerCase().trim());
  const vector: number[] = [];
  let currentSeed = seed;

  for (let i = 0; i < VECTOR_DIMENSIONS; i++) {
    // Simple linear congruential generator step
    currentSeed = (currentSeed * 1664525 + 1013904223) % 4294967296;
    // Map to [-1, 1] range
    const val = (currentSeed / 2147483648) - 1.0;
    vector.push(val);
  }

  // L2 Normalize the vector (essential for cosine similarity)
  const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  if (norm === 0) return vector.map(() => 0);

  return vector.map(val => Number((val / norm).toFixed(6)));
}

/**
 * Computes cosine similarity between two 768-dimensional vectors (for local mock filtering/testing)
 */
export function calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length || vecA.length !== VECTOR_DIMENSIONS) {
    throw new Error(`Vector dimensions mismatch. Expected ${VECTOR_DIMENSIONS}.`);
  }
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < VECTOR_DIMENSIONS; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
