interface Env {
  WHOP_API_KEY?: string;
}

const DEFAULT_WHOP_API_KEY = "apik_ehGz6NoKEOfQv_C5388822_C_4ef6b481f1f55c864cab889eeada81dda783fa0f1257ac1654cd863031830c";

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { email } = await context.request.json<any>();
    if (!email || typeof email !== "string") {
      return new Response(JSON.stringify({ success: false, isPremium: false, reason: "Invalid email" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const apiKey = context.env.WHOP_API_KEY || DEFAULT_WHOP_API_KEY;
    const targetEmail = email.toLowerCase().trim();

    // 1. Query Whop API v2 for valid memberships associated with this email
    const memRes = await fetch(`https://api.whop.com/api/v2/memberships?email=${encodeURIComponent(targetEmail)}&valid=true`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Accept": "application/json"
      }
    });

    let isPremium = false;
    let planTier: "monthly" | "yearly" = "monthly";

    if (memRes.ok) {
      const memData: any = await memRes.json();
      const memberships = memData.data || [];
      
      for (const m of memberships) {
        if (m.valid === true || m.status === "active" || m.status === "valid" || m.status === "trialing") {
          isPremium = true;
          // Check if plan matches yearly ID or pricing
          const planId = m.plan_id || m.plan?.id || "";
          if (planId === "plan_8r7fZPEtKV1Cs" || JSON.stringify(m).toLowerCase().includes("year") || JSON.stringify(m).includes("50")) {
            planTier = "yearly";
          }
          break;
        }
      }
    } else {
      console.warn("Whop memberships query returned status:", memRes.status);
    }

    // 2. If no membership found via memberships endpoint, fallback to orders/payments check (for recently processed checkout receipts)
    if (!isPremium) {
      const ordRes = await fetch(`https://api.whop.com/api/v2/orders?email=${encodeURIComponent(targetEmail)}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Accept": "application/json"
        }
      });

      if (ordRes.ok) {
        const ordData: any = await ordRes.json();
        const orders = ordData.data || [];
        for (const ord of orders) {
          // Check for paid or completed orders within the product
          if (ord.status === "paid" || ord.status === "completed" || ord.status === "succeeded" || ord.paid === true) {
            isPremium = true;
            const planId = ord.plan_id || ord.line_items?.[0]?.plan_id || "";
            if (planId === "plan_8r7fZPEtKV1Cs" || JSON.stringify(ord).toLowerCase().includes("year") || JSON.stringify(ord).includes("50")) {
              planTier = "yearly";
            }
            break;
          }
        }
      }
    }

    return new Response(JSON.stringify({
      success: true,
      email: targetEmail,
      isPremium,
      planTier: isPremium ? planTier : undefined
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    console.error("Error communicating with Whop API during verify-subscription:", err);
    return new Response(JSON.stringify({ success: false, error: err.message || "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
