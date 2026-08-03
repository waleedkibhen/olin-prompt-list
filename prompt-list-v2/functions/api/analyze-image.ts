interface Env {
  GEMINI_API_KEY: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { imageUrl, base64 } = await context.request.json<any>();
    const apiKey = context.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is missing in Cloudflare environment. Skipping Gemini vision indexing.");
      return new Response(JSON.stringify({ tags: [] }), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    let inlineData: any = null;
    if (base64 && base64.startsWith('data:')) {
      const parts = base64.split(',');
      const mimeType = parts[0].split(':')[1].split(';')[0];
      inlineData = { mime_type: mimeType, data: parts[1] };
    } else if (imageUrl && !imageUrl.startsWith('data:')) {
      const imgRes = await fetch(imageUrl);
      const buffer = await imgRes.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      inlineData = { mime_type: "image/jpeg", data: btoa(binary) };
    }

    if (!inlineData) {
      return new Response(JSON.stringify({ tags: [] }), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [
            { inline_data: inlineData },
            { text: "Analyze this AI-generated artwork and output a comma-separated list of 12 to 20 concise descriptive visual keywords, subjects, setting descriptors, atmosphere, objects, and colors present in the scene (for example: forest, woods, trees, fire, witch, cauldron, night sky, mushrooms, fantasy, dark, vibrant). Return strictly just the comma-separated words without any introductory text or explanation." }
          ]
        }]
      })
    });

    if (res.ok) {
      const data: any = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      const tags = text.split(',').map((t: string) => t.trim().toLowerCase().replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, '')).filter((t: string) => t.length >= 2);
      return new Response(JSON.stringify({ tags: Array.from(new Set(tags)) }), { status: 200, headers: { "Content-Type": "application/json" } });
    } else {
      console.error("Gemini API error:", res.status, await res.text());
    }
  } catch (error) {
    console.error("Error generating Gemini vision tags:", error);
  }
  return new Response(JSON.stringify({ tags: [] }), { status: 200, headers: { "Content-Type": "application/json" } });
};
