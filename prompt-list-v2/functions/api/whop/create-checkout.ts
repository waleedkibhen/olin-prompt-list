export interface Env {
  WHOP_API_KEY?: string;
  WHOP_COMPANY_ID?: string;
}

const DEFAULT_WHOP_API_KEY = "apik_2CfsbKSmO9GOL_C5388822_C_82def646b456fafa4713cc95b5871e3cac59be30a306b469ac8d6c87f494cc";

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { title, price, promptId, userId } = await context.request.json<any>();
    
    if (!title || typeof price !== "number" || !promptId || !userId) {
      return new Response(JSON.stringify({ success: false, reason: "Invalid payload" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const apiKey = context.env.WHOP_API_KEY || DEFAULT_WHOP_API_KEY;
    const companyId = context.env.WHOP_COMPANY_ID || "biz_Cl76q9At9iiox0";

    const whopRes = await fetch("https://api.whop.com/api/v1/checkout_configurations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        mode: "payment",
        plan: {
          company_id: companyId,
          currency: "usd",
          initial_price: price,
          plan_type: "one_time"
        },
        metadata: {
          prompt_id: promptId,
          user_id: userId,
          title: title
        }
      })
    });

    const whopText = await whopRes.text(); let whopData = {}; try { whopData = JSON.parse(whopText); } catch(e) { console.error('Failed to parse whop response:', whopText); throw new Error('Whop API returned non-JSON response'); }

    if (!whopRes.ok) {
      console.error("Whop API error:", whopData);
      throw new Error(whopData?.error?.message || "Failed to create checkout configuration");
    }

    // Usually whopData has id which we can pass to the embedded checkout.
    return new Response(JSON.stringify({ 
      success: true, 
      checkoutId: whopData.id || (whopData.data && whopData.data.id),
      purchaseUrl: whopData.purchase_url || (whopData.data && whopData.data.purchase_url)
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
