interface Env {
  OPENAI_API_KEY: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { type, payload, imageNumber } = await context.request.json<any>();
    const openAiKey = context.env.OPENAI_API_KEY;

    if (!openAiKey) {
      console.warn("OPENAI_API_KEY is missing in Cloudflare Pages environment. Skipping moderation scan.");
      return new Response(JSON.stringify({ approved: true }), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    let bodyPayload: any = {
      model: "omni-moderation-latest",
      input: type === "image" ? [{ type: "image_url", image_url: { url: payload } }] : payload,
    };

    const res = await fetch("https://api.openai.com/v1/moderations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openAiKey}`,
      },
      body: JSON.stringify(bodyPayload),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("OpenAI moderation API error:", res.status, errText);
      return new Response(
        JSON.stringify({
          approved: false,
          reason: `OpenAI moderation API returned status ${res.status}${type === "image" && imageNumber ? ` on Image #${imageNumber}` : ""}`,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    const data: any = await res.json();
    const result = data.results?.[0];
    if (result && result.flagged) {
      const flaggedCats = Object.keys(result.categories || {}).filter((cat) => result.categories[cat]);
      const reason =
        type === "image"
          ? `Image #${imageNumber || 1} rejected due to zero-tolerance safety violation: ${flaggedCats.join(", ")}`
          : `Prompt text rejected due to safety violation: ${flaggedCats.join(", ")}`;
      return new Response(JSON.stringify({ approved: false, reason, flaggedCategories: flaggedCats }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ approved: true }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error: any) {
    console.error("Exception during Cloudflare edge moderation scan:", error);
    return new Response(JSON.stringify({ approved: false, reason: `Server communication failure during scan: ${error.message || error}` }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
};
