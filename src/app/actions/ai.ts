"use server";

/**
 * Server Actions for Automated Zero-Tolerance NSFW Moderation (OpenAI Omni-Moderation)
 * and High-Accuracy Semantic Vector Embeddings (OpenAI text-embedding-3-small & Gemini).
 */

export interface ModerationResult {
  approved: boolean;
  reason?: string;
  flaggedCategories?: string[];
}

/**
 * Moderates raw prompt text against OpenAI omni-moderation endpoint.
 */
export async function moderateText(promptText: string): Promise<ModerationResult> {
  const openAiKey = process.env.OPENAI_API_KEY;
  if (!openAiKey) {
    console.warn("OPENAI_API_KEY is missing in server environment. Skipping text moderation.");
    return { approved: true };
  }

  try {
    const textRes = await fetch('https://api.openai.com/v1/moderations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openAiKey}`,
      },
      body: JSON.stringify({
        model: 'omni-moderation-latest',
        input: promptText
      }),
    });

    if (textRes.ok) {
      const textData = await textRes.json();
      const result = textData.results?.[0];
      if (result && result.flagged) {
        const flaggedCats = Object.keys(result.categories || {}).filter(cat => result.categories[cat]);
        return {
          approved: false,
          reason: `Prompt text rejected due to NSFW/safety violation: ${flaggedCats.join(', ')}`,
          flaggedCategories: flaggedCats
        };
      }
      return { approved: true };
    } else {
      const errText = await textRes.text();
      console.warn("Text moderation endpoint error (Bypassing):", textRes.status, errText);
      return { approved: true };
    }
  } catch (error: any) {
    console.warn("Exception during text moderation scan (Bypassing):", error);
    return { approved: true };
  }
}

/**
 * Moderates a single image sequentially (transmitted as compressed Base64 data URL or HTTP URL).
 * Ensures payload stays well under Next.js 1MB Server Action HTTP body size limits.
 */
export async function moderateSingleImage(imageUrlOrBase64: string, imageNumber: number): Promise<ModerationResult> {
  const openAiKey = process.env.OPENAI_API_KEY;
  if (!openAiKey) {
    console.warn("OPENAI_API_KEY is missing in server environment. Skipping image moderation.");
    return { approved: true };
  }

  try {
    const imgRes = await fetch('https://api.openai.com/v1/moderations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openAiKey}`,
      },
      body: JSON.stringify({
        model: 'omni-moderation-latest',
        input: [
          {
            type: "image_url",
            image_url: { url: imageUrlOrBase64 }
          }
        ]
      }),
    });

    if (imgRes.ok) {
      const imgData = await imgRes.json();
      const result = imgData.results?.[0];
      if (result && result.flagged) {
        const flaggedCats = Object.keys(result.categories || {}).filter(cat => result.categories[cat]);
        return {
          approved: false,
          reason: `Image #${imageNumber} rejected due to zero-tolerance policy violation: ${flaggedCats.join(', ')}`,
          flaggedCategories: flaggedCats
        };
      }
      return { approved: true };
    } else {
      const errText = await imgRes.text();
      console.warn(`Image moderation scan error on image #${imageNumber} (Bypassing):`, imgRes.status, errText);
      return { approved: true };
    }
  } catch (error: any) {
    console.warn(`Exception during image #${imageNumber} moderation scan (Bypassing):`, error);
    return { approved: true };
  }
}

/**
 * Legacy batch wrapper for general usage
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
 * Generates high-accuracy 768-dimensional semantic embedding vectors using OpenAI API.
 * Falls back to deterministic mock embedding generator if network or API quotas fail.
 */
export async function generateLiveEmbedding(text: string): Promise<number[]> {
  const openAiKey = process.env.OPENAI_API_KEY;
  if (openAiKey) {
    try {
      const res = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openAiKey}`,
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: text,
          dimensions: 768
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const vector = data.data?.[0]?.embedding;
        if (Array.isArray(vector) && vector.length === 768) {
          return vector;
        }
      } else {
        console.error("OpenAI embeddings returned status:", res.status);
      }
    } catch (e) {
      console.error("Failed to fetch live OpenAI embedding, falling back to mock:", e);
    }
  }

  // Fallback to local deterministic mock vector if online API is unavailable
  const { generateMockEmbedding } = await import('@/lib/vector');
  return generateMockEmbedding(text);
}
