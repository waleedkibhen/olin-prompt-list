import { Buffer } from 'node:buffer';

interface Env {
  GEMINI_API_KEY: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { imageUrl, base64 } = await context.request.json<any>();
    const apiKey = context.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is missing in Cloudflare environment. Skipping Gemini vision indexing.");
      return new Response(JSON.stringify({ tags: [], colorProfile: null }), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    let inlineData: any = null;
    if (base64 && base64.startsWith('data:')) {
      const parts = base64.split(',');
      const mimeType = parts[0].split(':')[1].split(';')[0];
      inlineData = { mime_type: mimeType, data: parts[1] };
    } else if (imageUrl && !imageUrl.startsWith('data:')) {
      const imgRes = await fetch(imageUrl);
      if (imgRes.ok) {
        const buffer = await imgRes.arrayBuffer();
        const b64Data = Buffer.from(buffer).toString('base64');
        const contentType = imgRes.headers.get('content-type') || "image/jpeg";
        inlineData = { mime_type: contentType.split(';')[0], data: b64Data };
      }
    }

    if (!inlineData) {
      return new Response(JSON.stringify({ tags: [], colorProfile: null }), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    const promptText = `You are an expert art director, lighting designer, and human color perception analyzer. Analyze this artwork and return a JSON object containing two properties:
1) "tags": An exhaustive array of 30 to 45 concise descriptive search keywords in lowercase. Include exact subjects, objects, structures, vegetation, clothing, lighting, textures, colors, setting descriptors, art style, and mood (e.g., ["grass", "rolling hills", "eiffel tower", "streetlights", "woman", "human", "black robe", "black dress", "surreal", "night sky", "glowing", "minimalist", "solid color", "red background"]). Never leave out obvious objects or concepts present in the scene.
2) "colorProfile": A precise analysis of human visual color dominance containing:
 - "colorNames": An array of applicable color palettes ordered from most dominant to least, strictly chosen from this exact list: ["Red & Crimson", "Orange & Amber", "Yellow & Gold", "Green & Emerald", "Cyan & Teal", "Blue & Azure", "Purple & Violet", "Pink & Rose", "Brown & Earth", "Monochrome & Gray", "Dark & Noir", "Clean White & Light"]. CRITICAL RULE: Never classify sunlit green grass as yellow, and never classify pink/rose scenes as red.
 - "colorPercentages": An object mapping the names selected in colorNames to their integer visual dominance percentage (adding up to ~100, e.g. {"Pink & Rose": 60, "Green & Emerald": 40}). If an image is 100% solid color, assign 100 to that single color.
 - "dominantHex": The most representative 6-digit hex code string for the dominant color (e.g. "#dc2626").
 - "paletteHexes": An array of 4 complementary hex color strings representing the visual palette.
 - "isDark": boolean indicating if the overall mood is dark/night.
 - "isLight": boolean indicating if the scene is bright/high-key.
 - "isMonochrome": boolean indicating if the image is black & white or grayscale.`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        generationConfig: {
          responseMimeType: "application/json"
        },
        contents: [{
          parts: [
            { inline_data: inlineData },
            { text: promptText }
          ]
        }]
      })
    });

    if (res.ok) {
      const data: any = await res.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
      try {
        const parsed = JSON.parse(rawText);
        const tags = Array.isArray(parsed.tags) 
          ? parsed.tags.map((t: string) => String(t).trim().toLowerCase().replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, '')).filter((t: string) => t.length >= 2)
          : [];
        const colorProfile = parsed.colorProfile && typeof parsed.colorProfile === 'object' ? parsed.colorProfile : null;
        return new Response(JSON.stringify({ tags: Array.from(new Set(tags)), colorProfile }), { status: 200, headers: { "Content-Type": "application/json" } });
      } catch (e) {
        console.error("Error parsing Gemini structured JSON:", e, rawText);
      }
    } else {
      console.error("Gemini API error:", res.status, await res.text());
    }
  } catch (error) {
    console.error("Error running Multimodal Gemini vision pipeline:", error);
  }
  return new Response(JSON.stringify({ tags: [], colorProfile: null }), { status: 200, headers: { "Content-Type": "application/json" } });
};

