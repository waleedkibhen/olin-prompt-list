interface Env {
  OPENAI_API_KEY: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { text } = await context.request.json<any>();
    const openAiKey = context.env.OPENAI_API_KEY;

    if (openAiKey && text) {
      const res = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openAiKey}`,
        },
        body: JSON.stringify({
          model: "text-embedding-3-small",
          input: text,
          dimensions: 768,
        }),
      });

      if (res.ok) {
        const data: any = await res.json();
        const vector = data.data?.[0]?.embedding;
        if (Array.isArray(vector) && vector.length === 768) {
          return new Response(JSON.stringify({ vector }), { status: 200, headers: { "Content-Type": "application/json" } });
        }
      } else {
        console.error("OpenAI embeddings returned status:", res.status);
      }
    }

    return new Response(JSON.stringify({ vector: null, fallback: true }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Exception during embedding calculation:", error);
    return new Response(JSON.stringify({ vector: null, error: true }), { status: 200, headers: { "Content-Type": "application/json" } });
  }
};
