export interface Env {
  WHOP_API_KEY?: string;
  WHOP_COMPANY_ID?: string;
}

// Provisioning uses the same proven v1 checkout_configurations endpoint as
// create-checkout.ts; renewal plans are expressed via plan_type/billing_period.
const FALLBACK_API_KEY = "apik_2CfsbKSmO9GOL_C5388822_C_82def646b456fafa4713cc95b5871e3cac59be30a306b469ac8d6c87f494cc";
const FALLBACK_COMPANY_ID = "biz_Cl76q9At9iiox0";

async function createMembershipConfig(
  apiKey: string,
  companyId: string,
  interval: 'monthly' | 'yearly',
  price: number,
  userId: string,
  creatorName: string
): Promise<string> {
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
        renewal_price: price,
        plan_type: "renewal",
        billing_period: interval
      },
      metadata: {
        kind: "creator_membership",
        creator_user_id: userId,
        billing_interval: interval,
        creator_name: creatorName
      }
    })
  });

  const whopText = await whopRes.text();
  let whopData: any = {};
  try { whopData = JSON.parse(whopText); } catch { throw new Error('Whop API returned non-JSON response'); }

  if (!whopRes.ok) {
    console.error(`Whop API error (${interval}):`, whopData);
    throw new Error(whopData?.error?.message || `Failed to create ${interval} membership plan`);
  }

  const id = whopData.id || (whopData.data && whopData.data.id);
  if (!id) throw new Error(`Whop did not return a plan id for ${interval} plan`);
  return id;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { userId, monthlyPrice, yearlyPrice, creatorName } = await context.request.json<any>();

    if (!userId || typeof monthlyPrice !== "number" || monthlyPrice <= 0) {
      return new Response(JSON.stringify({ success: false, error: "Invalid payload" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const apiKey = context.env.WHOP_API_KEY || FALLBACK_API_KEY;
    const companyId = context.env.WHOP_COMPANY_ID || FALLBACK_COMPANY_ID;
    const name = typeof creatorName === "string" ? creatorName.slice(0, 80) : "Olin Creator";

    const whopMonthlyPlanId = await createMembershipConfig(apiKey, companyId, 'monthly', monthlyPrice, userId, name);

    let whopYearlyPlanId: string | null = null;
    if (typeof yearlyPrice === "number" && yearlyPrice > 0) {
      whopYearlyPlanId = await createMembershipConfig(apiKey, companyId, 'yearly', yearlyPrice, userId, name);
    }

    return new Response(JSON.stringify({ success: true, whopMonthlyPlanId, whopYearlyPlanId }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    console.error("Error provisioning membership:", err);
    return new Response(JSON.stringify({ success: false, error: err.message || "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
