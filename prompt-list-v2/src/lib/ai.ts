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
