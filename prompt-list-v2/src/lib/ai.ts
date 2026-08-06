import type { ColorProfile } from './colorAnalyzer';

export interface ModerationResult {
  approved: boolean;
  reason?: string;
  flaggedCategories?: string[];
}

/**
 * Moderates raw prompt text via secure Cloudflare Pages Function backend
 */
export async function moderateText(promptText: string): Promise<ModerationResult> {
  try {
    const res = await fetch('/api/moderate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'text', payload: promptText }),
    });
    if (!res.ok) return { approved: false, reason: `Server moderation status: ${res.status}` };
    return await res.json();
  } catch (error: any) {
    console.error("Error calling text moderation endpoint:", error);
    return { approved: false, reason: `Network failure connecting to security service: ${error.message}` };
  }
}

/**
 * Moderates single image sequentially via secure Cloudflare Pages Function backend
 */
export async function moderateSingleImage(imageUrlOrBase64: string, imageNumber: number): Promise<ModerationResult> {
  try {
    const res = await fetch('/api/moderate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'image', payload: imageUrlOrBase64, imageNumber }),
    });
    if (!res.ok) return { approved: false, reason: `Server moderation status: ${res.status} on Image #${imageNumber}` };
    return await res.json();
  } catch (error: any) {
    console.error(`Error calling image #${imageNumber} moderation endpoint:`, error);
    return { approved: false, reason: `Network failure connecting to security service on Image #${imageNumber}: ${error.message}` };
  }
}

/**
 * Batch moderation wrapper for prompt creation
 */
export async function moderateContent(promptText: string, imageUrls: string[]): Promise<ModerationResult> {
  const textMod = await moderateText(promptText);
  if (!textMod.approved) return textMod;
  for (let i = 0; i < imageUrls.length; i++) {
    const imgMod = await moderateSingleImage(imageUrls[i], i + 1);
    if (!imgMod.approved) return imgMod;
  }
  return { approved: true };
}

/**
 * Generates semantic embedding vector via secure Cloudflare Pages Function backend, with local fallback
 */
export async function generateLiveEmbedding(text: string): Promise<number[]> {
  try {
    const res = await fetch('/api/embed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.vector) && data.vector.length === 768) {
        return data.vector;
      }
    }
  } catch (e) {
    console.error("Failed to fetch live embedding vector from serverless backend, falling back to mock:", e);
  }

  const { generateMockEmbedding } = await import('./vector');
  return generateMockEmbedding(text);
}

/**
 * Analyzes image content via Gemini Vision to generate searchable visual keywords (e.g. forest, fire, woods)
 */
export async function analyzeArtworkWithGemini(imageUrlOrBase64: string): Promise<string[]> {
  const result = await analyzeArtworkMultimodalWithGemini(imageUrlOrBase64);
  return result.tags;
}

export interface MultimodalVisionResult {
  tags: string[];
  colorProfile: ColorProfile | null;
  error?: string;
  modelUsed?: string;
}

// Global sequential execution queue for AI calls to eliminate concurrency rate limits and server crashes
let aiTaskQueue = Promise.resolve();

function executeSequentialAiTask<T>(taskFn: () => Promise<T>, pacingMs: number = 1200): Promise<T> {
  return new Promise((resolve, reject) => {
    aiTaskQueue = aiTaskQueue.then(async () => {
      try {
        const result = await taskFn();
        // Enforce time gap between sequential queries to prevent quota overload or rate-limit bursting
        await new Promise(r => setTimeout(r, pacingMs));
        resolve(result);
      } catch (err) {
        await new Promise(r => setTimeout(r, pacingMs));
        reject(err);
      }
    });
  });
}

/**
 * Analyzes artwork sequentially using Gemini Multimodal Vision to produce both comprehensive visual search tags and human-perceptive color profiles.
 * Includes automatic sequential queuing with a safety buffer between invocations.
 */
export async function analyzeArtworkMultimodalWithGemini(imageUrlOrBase64: string): Promise<MultimodalVisionResult> {
  return executeSequentialAiTask(async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 18000); // 18-second strict max timeout for sequential processing
    try {
      const isBase64 = imageUrlOrBase64.startsWith('data:');
      const res = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isBase64 ? { base64: imageUrlOrBase64 } : { imageUrl: imageUrlOrBase64 }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        if (data.error) {
          console.warn("Gemini Vision pipeline error reported by backend:", data.error);
        } else if (data.modelUsed) {
          console.log(`✨ Successfully indexed via Gemini Model: ${data.modelUsed} (${data.apiVersion})`);
        }
        return {
          tags: Array.isArray(data.tags) ? data.tags : [],
          colorProfile: data.colorProfile || null,
          error: data.error,
          modelUsed: data.modelUsed
        };
      }
    } catch (e: any) {
      clearTimeout(timeoutId);
      const msg = e.name === 'AbortError' ? 'Timeout: AI analysis took longer than 18s' : (e.message || String(e));
      console.error("Failed to extract Gemini multimodal vision & color data:", msg);
      return { tags: [], colorProfile: null, error: msg };
    }
    return { tags: [], colorProfile: null };
  }, 1200);
}


export async function diagnoseGeminiApi(): Promise<any> {
  try {
    const res = await fetch('/api/diagnose-gemini');
    if (res.ok) return await res.json();
    return { error: `HTTP ${res.status}` };
  } catch (err: any) {
    return { error: err.message || String(err) };
  }
}

