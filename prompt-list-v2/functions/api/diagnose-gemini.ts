interface Env {
  GEMINI_API_KEY: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const apiKey = context.env.GEMINI_API_KEY;
  const diagnosticReport: any = {
    timestamp: new Date().toISOString(),
    hasApiKey: !!apiKey,
    keyPrefix: apiKey ? `${apiKey.substring(0, 5)}...` : null,
    v1ModelsResult: null,
    v1betaModelsResult: null,
    errors: []
  };

  if (!apiKey) {
    diagnosticReport.errors.push("GEMINI_API_KEY is not configured in Cloudflare environment secrets.");
    return new Response(JSON.stringify(diagnosticReport, null, 2), { status: 200, headers: { "Content-Type": "application/json" } });
  }

  // Test GET /v1/models
  try {
    const resV1 = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`);
    const bodyV1 = await resV1.text();
    diagnosticReport.v1ModelsResult = {
      status: resV1.status,
      ok: resV1.ok,
      body: resV1.ok ? JSON.parse(bodyV1) : bodyV1
    };
  } catch (err: any) {
    diagnosticReport.errors.push(`Error calling v1/models: ${err.message}`);
  }

  // Test GET /v1beta/models
  try {
    const resV1Beta = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const bodyV1Beta = await resV1Beta.text();
    diagnosticReport.v1betaModelsResult = {
      status: resV1Beta.status,
      ok: resV1Beta.ok,
      body: resV1Beta.ok ? JSON.parse(bodyV1Beta) : bodyV1Beta
    };
  } catch (err: any) {
    diagnosticReport.errors.push(`Error calling v1beta/models: ${err.message}`);
  }

  return new Response(JSON.stringify(diagnosticReport, null, 2), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
};
