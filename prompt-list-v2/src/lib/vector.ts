/**
 * Lightweight vector generator utility for local development & UI testing.
 * Generates deterministic 768-dimensional float arrays simulating OpenAI text-embedding-3-small vectors
 * based on hash seeding from the input text, enabling predictable vector similarity search testing without live API keys.
 */

export const VECTOR_DIMENSIONS = 768;

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return hash;
}

export async function generateMockEmbedding(text: string): Promise<number[]> {
  const seed = hashString(text.toLowerCase().trim());
  const vector: number[] = [];
  let currentSeed = seed;

  for (let i = 0; i < VECTOR_DIMENSIONS; i++) {
    currentSeed = (currentSeed * 1664525 + 1013904223) % 4294967296;
    const val = (currentSeed / 2147483648) - 1.0;
    vector.push(val);
  }

  const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  if (norm === 0) return vector.map(() => 0);

  return vector.map(val => Number((val / norm).toFixed(6)));
}

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
