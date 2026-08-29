export interface Env {
  WHOP_API_KEY?: string;
  WHOP_COMPANY_ID?: string;
}

const FALLBACK_API_KEY = "apik_2CfsbKSmO9GOL_C5388822_C_82def646b456fafa4713cc95b5871e3cac59be30a306b469ac8d6c87f494cc";
const FALLBACK_COMPANY_ID = "biz_Cl76q9At9iiox0";
const MEMBERSHIP_PRODUCT_TITLE = "Creator Memberships";
// Whop v2 expects billing_period as an integer number of days
const BILLING_PERIOD_DAYS: Record<'monthly' | 'yearly', number> = {
  monthly: 30,
  yearly: 365
};

function whopHeaders(apiKey: string) {
  return {
    "Authorization": `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    "Accept": "application/json"
  };
}

// Renewal plans must live under a product. Resolve the shared "Creator Memberships"
// container at runtime (no hardcoded product id): read it if it exists, create it
// if the key has product permissions, and surface an actionable error otherwise.
async function ensureMembershipProduct(apiKey: string, companyId: string): Promise<string> {
  const listRes = await fetch(`https://api.whop.com/api/v2/products?company_id=${encodeURIComponent(companyId)}&per=20`, {
    headers: whopHeaders(apiKey)
  });
  if (listRes.ok) {
    const listData = await listRes.json<any>();
    const items = listData.data || [];
    const existing = items.find((p: any) => p.title === MEMBERSHIP_PRODUCT_TITLE) || items[0];
    if (existing?.id) return existing.id;
  }

  const createRes = await fetch("https://api.whop.com/api/v2/products", {
    method: "POST",
    headers: whopHeaders(apiKey),
    body: JSON.stringify({
      title: MEMBERSHIP_PRODUCT_TITLE,
      metadata: { kind: "creator_memberships_container", company_id: companyId }
    })
  });
  if (!createRes.ok) {
    const errText = await createRes.text();
    if (createRes.status === 401 || createRes.status === 403) {
      throw Object.assign(new Error(
        "Whop API key lacks the 'products' permission required to auto-create the membership container. Enable 'products' (read + write) for this key in Whop Developer Settings, then save again."
      ), { code: "products_permission_missing" });
    }
    throw new Error(`Product creation failed: ${errText.slice(0, 200)}`);
  }
  const created = await createRes.json<any>();
  const productId = created.id || (created.data && created.data.id);
  if (!productId) throw new Error("Product created but Whop returned no id");
  return productId;
}

async function createMembershipPlan(
  apiKey: string,
  productId: string,
  interval: 'monthly' | 'yearly',
  price: number,
  creatorName: string,
  creatorUid: string
): Promise<string> {
  const billingPeriod = BILLING_PERIOD_DAYS[interval];
  const planRes = await fetch("https://api.whop.com/api/v2/plans", {
    method: "POST",
    headers: whopHeaders(apiKey),
    body: JSON.stringify({
      product_id: productId,
      billing_period: billingPeriod,
      plan_type: "renewal",
      currency: "usd",
      initial_price: price,
      renewal_price: price,
      title: `Olin Membership: ${creatorName} (${interval === 'monthly' ? 'Monthly' : 'Yearly'})`,
      metadata: {
        kind: "creator_membership",
        creator_user_id: creatorUid,
        billing_interval: interval,
        creator_name: creatorName
      }
    })
  });

  const planText = await planRes.text();
  let planData: any = {};
  try { planData = JSON.parse(planText); } catch { throw new Error('Whop API returned non-JSON response'); }
  if (!planRes.ok) {
    console.error(`Whop plan create error (${interval}):`, planData);
    throw new Error(planData?.error?.message || planData?.message || `Failed to create ${interval} membership plan`);
  }
  const id = planData.id || (planData.data && planData.data.id);
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
    const name = typeof creatorName === "string" && creatorName.trim() ? creatorName.trim().slice(0, 60) : (userId.slice(0, 12));

    const productId = await ensureMembershipProduct(apiKey, companyId);
    const whopMonthlyPlanId = await createMembershipPlan(apiKey, productId, 'monthly', monthlyPrice, name, userId);

    let whopYearlyPlanId: string | null = null;
    if (typeof yearlyPrice === "number" && yearlyPrice > 0) {
      whopYearlyPlanId = await createMembershipPlan(apiKey, productId, 'yearly', yearlyPrice, name, userId);
    }

    return new Response(JSON.stringify({ success: true, productId, whopMonthlyPlanId, whopYearlyPlanId }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    console.error("Error provisioning membership:", err);
    return new Response(JSON.stringify({
      success: false,
      code: err.code || "provision_failed",
      error: err.message || "Internal server error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
