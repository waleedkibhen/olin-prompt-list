interface Env {
  GEMINI_API_KEY: string;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function resolveVisionModels(apiKey: string): Promise<string[]> {
  // Verified high-quota workhorse models from live diagnostic reports (avoids 20 req/day caps on preview models)
  return [
    "models/gemini-2.0-flash",
    "models/gemini-2.0-flash-lite",
    "models/gemini-2.0-flash-001",
    "models/gemini-2.5-flash-lite",
    "models/gemini-3.1-flash-lite",
    "models/gemini-3.5-flash-lite",
    "models/gemini-2.5-flash"
  ];
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const errorLogs: string[] = [];
  try {
    const { imageUrl, base64 } = await context.request.json<any>();
    const apiKey = context.env.GEMINI_API_KEY;
    if (!apiKey) {
      errorLogs.push("GEMINI_API_KEY is missing in Cloudflare environment secrets.");
      console.warn("GEMINI_API_KEY is missing in Cloudflare environment. Skipping Gemini vision indexing.");
      return new Response(JSON.stringify({ tags: [], colorProfile: null, error: errorLogs.join(" | ") }), { status: 200, headers: { "Content-Type": "application/json" } });
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
        const b64Data = arrayBufferToBase64(buffer);
        const contentType = imgRes.headers.get('content-type') || "image/jpeg";
        inlineData = { mime_type: contentType.split(';')[0], data: b64Data };
      } else {
        errorLogs.push(`Failed to fetch imageUrl: HTTP ${imgRes.status}`);
      }
    }

    if (!inlineData) {
      errorLogs.push("No valid inline image data could be extracted from input.");
      return new Response(JSON.stringify({ tags: [], colorProfile: null, error: errorLogs.join(" | ") }), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    const promptText = `You are an expert art director, lighting designer, and human color perception analyzer. Analyze this artwork and return a JSON object containing two properties:
1) "tags": An exhaustive array of 30 to 45 concise descriptive search keywords in lowercase. Include exact subjects, objects, structures, vegetation, clothing, lighting, textures, colors, setting descriptors, art style, and mood (e.g., ["grass", "rolling hills", "eiffel tower", "tower of pisa", "pisa", "tower", "streetlights", "woman", "human", "black robe", "black dress", "surreal", "night sky", "glowing", "minimalist", "solid color", "red background"]). Never leave out obvious objects or concepts present in the scene.
2) "colorProfile": A precise analysis of human visual color dominance containing:
 - "colorNames": An array of up to 2 dominant human-perceived color palettes ordered from most dominant (#1) to secondary (#2), strictly chosen from this exact list: ["Red & Crimson", "Orange & Sunset", "Yellow & Gold", "Green & Emerald", "Cyan & Teal", "Blue & Azure", "Purple & Violet", "Pink & Rose", "Brown & Earth", "Monochrome & Gray", "Dark & Noir", "Clean White & Light"]. CRITICAL DOMINANCE RULES: ONLY include colors that represent at least 25% of the visible artwork! Never include trace accents (<20%) like a tiny red flag on a building or a small reflection. Never classify sunlit green grass or white stone as yellow. Never classify pink or magenta scenes as red or purple. Never classify a glowing red structure in the night sky as blue.
 - "colorPercentages": An object mapping the names selected in colorNames to their integer visual dominance percentage (adding up to ~100, e.g. {"Pink & Rose": 60, "Green & Emerald": 40}). If an image is 100% solid color, assign 100 to that single color.
 - "dominantHex": The most representative 6-digit hex code string for the dominant color (e.g. "#dc2626").
 - "paletteHexes": An array of 4 complementary hex color strings representing the visual palette.
 - "isDark": boolean indicating if the overall mood is dark/night.
 - "isLight": boolean indicating if the scene is bright/high-key.
 - "isMonochrome": boolean indicating if the image is black & white or grayscale.`;

    const modelCandidates = await resolveVisionModels(apiKey);
    const bodyPayload = JSON.stringify({
      generationConfig: {
        responseMimeType: "application/json"
      },
      contents: [{
        parts: [
          { inline_data: inlineData },
          { text: promptText }
        ]
      }]
    });

    for (const modelName of modelCandidates) {
      const formattedModel = modelName.startsWith('models/') ? modelName : `models/${modelName}`;
      const apiVer = "v1beta";
      const endpoint = `https://generativelanguage.googleapis.com/${apiVer}/${formattedModel}:generateContent?key=${apiKey}`;
      
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: bodyPayload
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
              return new Response(JSON.stringify({ tags: Array.from(new Set(tags)), colorProfile, modelUsed: formattedModel, apiVersion: apiVer }), { status: 200, headers: { "Content-Type": "application/json" } });
            } catch (e: any) {
              errorLogs.push(`[${apiVer}/${formattedModel}] JSON Parse Error: ${e.message}`);
              break; // Don't retry on parse error, jump to next model
            }
            const status = res.status;
            const errText = await res.text();
            errorLogs.push(`[${apiVer}/${formattedModel} (Att ${attempt})] HTTP ${status}: ${errText}`);
            
            // If Free Tier daily quota is exhausted (GenerateRequestsPerDayPerProjectPerModel-FreeTier), do NOT retry! Immediately switch to next model!
            if (errText.includes('GenerateRequestsPerDay') || errText.includes('quotaId')) {
              console.warn(`Daily quota exhausted for model ${formattedModel}. Skipping immediately to next failover model.`);
              break;
            }

            // If Free Tier encounters temporary per-minute burst rate limits (429/503), wait 2,500ms before retrying
            if ((status === 429 || status === 503) && attempt < 2) {
              await new Promise(r => setTimeout(r, 2500));
              continue;
            }
            break; // For 404 or other errors, immediately failover to next verified model
          }
        } catch (err: any) {
          errorLogs.push(`[${apiVer}/${formattedModel}] Network Error: ${err.message}`);
          break;
        }
      }
    }
  } catch (error: any) {
    errorLogs.push(`Fatal Pipeline Error: ${error.message || error}`);
  }
  return new Response(JSON.stringify({ tags: [], colorProfile: null, error: errorLogs.slice(0, 10).join(" || ") }), { status: 200, headers: { "Content-Type": "application/json" } });
};


