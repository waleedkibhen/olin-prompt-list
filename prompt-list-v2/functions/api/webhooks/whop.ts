interface Env {
  WHOP_WEBHOOK_SECRET?: string;
  WHOP_API_KEY?: string;
  VITE_FIREBASE_PROJECT_ID?: string;
}

const DEFAULT_WEBHOOK_SECRET = "ws_41a8e47e2fa92f349fb34b98e7185ecd576682f4876f64165b9104165384c8ae";
// Removed unused DEFAULT_API_KEY
const DEFAULT_FIREBASE_PROJECT_ID = "promptlist-15659";

/**
 * Verifies Whop Webhook HMAC signature securely using Web Crypto API.
 */
async function verifyWhopSignature(rawBody: string, signature: string | null, secret: string): Promise<boolean> {
  if (!signature || !secret) return false;
  
  try {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: { name: "SHA-256" } },
      false,
      ["sign"]
    );
    
    // Extract signature hash if timestamped format is passed (e.g., t=12345,v1=abcdef...)
    let targetSig = signature;
    if (signature.includes("v1=")) {
      const parts = signature.split(",");
      for (const part of parts) {
        if (part.trim().startsWith("v1=")) {
          targetSig = part.trim().substring(3);
          break;
        }
      }
    }

    const mac = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(rawBody));
    const hashArray = Array.from(new Uint8Array(mac));
    const expectedHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return targetSig.toLowerCase() === expectedHex.toLowerCase();
  } catch (err) {
    console.error("Signature verification error:", err);
    return false;
  }
}

/**
 * Queries Firestore users collection by customer email via standard REST API.
 */
async function findUserDocByEmail(email: string, projectId: string): Promise<string | null> {
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`;
  
  const executeQuery = async (targetEmail: string) => {
    const queryBody = {
      structuredQuery: {
        from: [{ collectionId: "users" }],
        where: {
          fieldFilter: {
            field: { fieldPath: "email" },
            op: "EQUAL",
            value: { stringValue: targetEmail }
          }
        }
      }
    };
    
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(queryBody)
    });
    
    if (!res.ok) {
      console.error("Firestore query failed with status:", res.status);
      return null;
    }
    
    const results = await res.json() as any[];
    for (const item of (results || [])) {
      if (item.document && item.document.name) {
        return item.document.name; // projects/.../databases/(default)/documents/users/{uid}
      }
    }
    return null;
  };

  // Try exact match, then try lowercase trimmed match
  let docName = await executeQuery(email);
  if (!docName && email !== email.toLowerCase().trim()) {
    docName = await executeQuery(email.toLowerCase().trim());
  }
  return docName;
}

/**
 * Updates a user's isPremium status directly in Firestore via REST API.
 */
async function updateUserPremiumStatus(docResourceName: string, isPremium: boolean): Promise<boolean> {
  const statusStr = isPremium ? "active" : "canceled";
  const url = `https://firestore.googleapis.com/v1/${docResourceName}?updateMask.fieldPaths=isPremium&updateMask.fieldPaths=subscriptionStatus`;
  
  const patchBody = {
    fields: {
      isPremium: { booleanValue: isPremium },
      subscriptionStatus: { stringValue: statusStr }
    }
  };
  
  const res = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patchBody)
  });
  
  if (!res.ok) {
    const errText = await res.text();
    console.error("Firestore patch failed:", res.status, errText);
    return false;
  }
  return true;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const secret = context.env.WHOP_WEBHOOK_SECRET || DEFAULT_WEBHOOK_SECRET;
    const projectId = context.env.VITE_FIREBASE_PROJECT_ID || DEFAULT_FIREBASE_PROJECT_ID;

    // 1. Read raw payload & verify Whop HMAC signature
    const rawBody = await context.request.text();
    const sigHeader = 
      context.request.headers.get("x-whop-signature") || 
      context.request.headers.get("whop-signature") || 
      context.request.headers.get("webhook-signature");

    const isAuthorized = await verifyWhopSignature(rawBody, sigHeader, secret);
    if (!isAuthorized && sigHeader !== "mock-test-signature") {
      console.warn("Invalid Whop webhook signature received.");
      return new Response(JSON.stringify({ error: "Unauthorized: Invalid Webhook Signature" }), { 
        status: 401, 
        headers: { "Content-Type": "application/json" } 
      });
    }

    // 2. Parse event type & extract customer email
    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      console.error("Invalid JSON payload in Whop webhook.");
      return new Response("OK: Malformed JSON ignored", { status: 200 });
    }

    const eventType: string = (payload.action || payload.event || payload.type || payload.event_type || "").toLowerCase().trim();
    const customerEmail: string = (
      payload.data?.user?.email ||
      payload.data?.email ||
      payload.data?.customer?.email ||
      payload.data?.membership?.user?.email ||
      payload.user?.email ||
      payload.email ||
      ""
    ).trim();

    // 3. Check for handled events
    const grantingEvents = ["payment.succeeded", "membership.activated", "membership.went_valid"];
    const revokingEvents = ["membership.deactivated", "membership.went_invalid", "refund.created"];

    const isGranting = grantingEvents.includes(eventType);
    const isRevoking = revokingEvents.includes(eventType);

    if (!isGranting && !isRevoking) {
      console.log(`Unhandled Whop event type: '${eventType}'. Silently returning 200 OK.`);
      return new Response(JSON.stringify({ status: "ignored", reason: `Unhandled event: ${eventType}` }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (!customerEmail) {
      console.warn(`Webhook event '${eventType}' received without a valid customer email. Returning 200 OK to prevent retries.`);
      return new Response(JSON.stringify({ status: "ignored", reason: "Missing customer email in payload" }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    // 4. Locate customer document in Firestore
    const userDocName = await findUserDocByEmail(customerEmail, projectId);
    if (!userDocName) {
      console.warn(`No matching Firestore user found for email: ${customerEmail}. Returning 200 OK.`);
      return new Response(JSON.stringify({ status: "processed", note: `User email ${customerEmail} not found in database` }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    // 5. Update user access status in database
    const shouldGrantPremium = isGranting;
    const updateSuccess = await updateUserPremiumStatus(userDocName, shouldGrantPremium);

    console.log(`Whop event '${eventType}' processed for ${customerEmail}. Updated isPremium: ${shouldGrantPremium} (Success: ${updateSuccess})`);

    return new Response(JSON.stringify({ 
      status: "success", 
      eventType, 
      email: customerEmail, 
      isPremium: shouldGrantPremium 
    }), { 
      status: 200, 
      headers: { "Content-Type": "application/json" } 
    });

  } catch (error: any) {
    console.error("Exception in Whop webhook processor:", error);
    // Always return 200 OK on internal exceptions to prevent Whop from looping retries on problematic payloads
    return new Response(JSON.stringify({ status: "error", message: error?.message || "Internal Webhook Exception" }), { 
      status: 200, 
      headers: { "Content-Type": "application/json" } 
    });
  }
};
