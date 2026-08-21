export interface Env {
  WHOP_API_KEY?: string;
  WHOP_COMPANY_ID?: string;
}

const DEFAULT_WHOP_API_KEY = "apik_ehGz6NoKEOfQv_C5388822_C_4ef6b481f1f55c864cab889eeada81dda783fa0f1257ac1654cd863031830c";

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { title, price, promptId } = await context.request.json<any>();
    
    if (!title || typeof price !== "number" || !promptId) {
      return new Response(JSON.stringify({ success: false, reason: "Invalid payload" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const apiKey = context.env.WHOP_API_KEY || DEFAULT_WHOP_API_KEY;
    const companyId = context.env.WHOP_COMPANY_ID || "biz_YOUR_COMPANY_ID";

    const whopRes = await fetch("https://api.whop.com/api/v2/checkout_configurations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        company_id: companyId,
        mode: "payment",
        currency: "usd",
        plan: {
          initial_price: price,
          plan_type: "one_time"
        },
        metadata: {
          prompt_id: promptId,
          title: title
        }
      })
    });

    const whopData = await whopRes.json() as any;

    if (!whopRes.ok) {
      console.error("Whop API error:", whopData);
      throw new Error(whopData?.error?.message || "Failed to create checkout configuration");
    }

    // Usually whopData has id which we can pass to the embedded checkout.
    return new Response(JSON.stringify({ 
      success: true, 
      checkoutId: whopData.id || (whopData.data && whopData.data.id)
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    console.error("Error creating whop checkout:", err);
    return new Response(JSON.stringify({ success: false, error: err.message || "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
