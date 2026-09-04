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
    if (result) {
      const cats = result.categories || {};
      const scores = result.category_scores || {};

      // 1. Strict Zero-Tolerance Categories (Always Blocked)
      const isCsam = !!(cats["sexual/minors"]);
      const isSelfHarm = !!(cats["self-harm"] || cats["self-harm/intent"] || cats["self-harm/instructions"]);
      const isHate = !!(cats["hate"] || cats["hate/threatening"]);
      const isGraphicGore = !!(cats["violence/graphic"] && (scores["violence/graphic"] || 0) > 0.35);
      const isExplicitNsfw = !!(cats["sexual"] && (scores["sexual"] || 0) > 0.5);

      // 2. Action / Cinematic / Fantasy Artwork Filter (Avoid false positives on elevators, dramatic lighting, fantasy battles)
      const isExtremeViolence = !!(
        cats["violence"] && 
        (scores["violence"] || 0) > 0.85 && 
        ((scores["violence/graphic"] || 0) > 0.4 || cats["illicit/violent"])
      );

      const isIllicit = !!(cats["illicit"] && (scores["illicit"] || 0) > 0.7);

      const hardViolations: string[] = [];
      if (isCsam) hardViolations.push("child exploitation / CSAM");
      if (isSelfHarm) hardViolations.push("self-harm");
      if (isHate) hardViolations.push("hate speech");
      if (isGraphicGore) hardViolations.push("graphic gore / bloodshed");
      if (isExplicitNsfw) hardViolations.push("explicit adult content");
      if (isExtremeViolence) hardViolations.push("extreme real-world violence");
      if (isIllicit) hardViolations.push("illicit activity");

      if (hardViolations.length > 0) {
        const reason =
          type === "image"
            ? `Image #${imageNumber || 1} could not be approved due to safety policy: ${hardViolations.join(", ")}`
            : `Prompt text could not be approved due to safety policy: ${hardViolations.join(", ")}`;
        return new Response(JSON.stringify({ approved: false, reason, flaggedCategories: hardViolations }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
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
