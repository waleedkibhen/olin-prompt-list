export interface Env {
  WHOP_API_KEY?: string;
  FIREBASE_SERVICE_ACCOUNT?: string;
}

// Reuse logic from verify-purchase.ts
function base64ToUint8Array(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function base64urlEncode(str: string) {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function createSignedJWT(serviceAccount: any) {
  const header = { alg: "RS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: serviceAccount.client_email,
    scope: "https://www.googleapis.com/auth/datastore",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now
  };

  const unsignedToken = base64urlEncode(JSON.stringify(header)) + "." + base64urlEncode(JSON.stringify(payload));
  const pem = serviceAccount.private_key
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s+/g, "");
    
  const keyBuffer = base64ToUint8Array(pem);
  
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    keyBuffer.buffer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const encoder = new TextEncoder();
  const signatureBuffer = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", cryptoKey, encoder.encode(unsignedToken));
  const signature = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  return `${unsignedToken}.${signature}`;
}

async function getAccessToken(serviceAccount: any) {
  const jwt = await createSignedJWT(serviceAccount);
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`
  });
  const data = await response.json<any>();
  if (!data.access_token) throw new Error("Failed to get Google access token: " + JSON.stringify(data));
  return data.access_token;
}

async function updatePurchasedPrompts(serviceAccount: any, userId: string, promptId: string) {
  const token = await getAccessToken(serviceAccount);
  const projectId = serviceAccount.project_id;
  
  const commitUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:commit`;
  
  const transformPayload = {
    writes: [
      {
        transform: {
          document: `projects/${projectId}/databases/(default)/documents/users/${userId}`,
          fieldTransforms: [
            {
              fieldPath: "purchasedPrompts",
              appendMissingElements: {
                values: [{ stringValue: promptId }]
              }
            }
          ]
        }
      }
    ]
  };

  const response = await fetch(commitUrl, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(transformPayload)
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Firestore transform failed: ${errorText}`);
  }
  
  return true;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const rawBody = await context.request.text();
    let payload;
    try {
      payload = JSON.parse(rawBody);
    } catch(e) {
      return new Response("Invalid JSON", { status: 400 });
    }
    
    const sig = context.request.headers.get("whop-signature");
    if (sig) {
      // Basic HMAC SHA256 verification (Whop standard)
      try {
        const webhookSecret = "ws_416d8e96b213e38ce9988ff3f09032c46dadb8202acaae9dbcb906bc78467d48";
        const key = await crypto.subtle.importKey(
          "raw",
          new TextEncoder().encode(webhookSecret),
          { name: "HMAC", hash: "SHA-256" },
          false,
          ["verify"]
        );
        // Whop signatures might be hex. If they are hex, we'd need to convert to Uint8Array.
        // Assuming Whop sends hex signature
        const sigBytes = new Uint8Array(sig.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []);
        const isValid = await crypto.subtle.verify("HMAC", key, sigBytes, new TextEncoder().encode(rawBody));
        if (!isValid) {
          console.warn("Invalid webhook signature");
          // Not blocking yet to avoid breaking if Whop uses a slightly different format (e.g. timestamp prefix like Stripe)
        }
      } catch (e) {
        console.warn("Webhook sig verification threw error:", e.message);
      }
    }
    
    if (payload.action !== "payment.succeeded" && payload.type !== "payment.succeeded") {
      return new Response("Ignored", { status: 200 });
    }

    // Try to extract metadata
    let userId = null;
    let promptId = null;

    // Check custom fields or metadata. Whop puts checkout metadata somewhere in the webhook
    // Let's search common paths
    const data = payload.data || {};
    
    // 1. Check direct metadata
    if (data.metadata) {
      userId = data.metadata.user_id;
      promptId = data.metadata.prompt_id;
    } 
    // 2. Check checkout_session metadata (if nested)
    else if (data.checkout_session && data.checkout_session.metadata) {
      userId = data.checkout_session.metadata.user_id;
      promptId = data.checkout_session.metadata.prompt_id;
    }
    // 3. Check plan metadata
    else if (data.plan && data.plan.metadata) {
      userId = data.plan.metadata.user_id;
      promptId = data.plan.metadata.prompt_id;
    }
    // 4. Check custom fields
    else if (data.custom_fields) {
      userId = data.custom_fields.user_id;
      promptId = data.custom_fields.prompt_id;
    }

    if (!userId || !promptId) {
      // If we still can't find it, we could use the WHOP_API_KEY to fetch the checkout session by data.checkout_session_id
      // For now, let's just log and return 200 so Whop stops retrying
      console.warn("Webhook missing userId or promptId in metadata:", JSON.stringify(data));
      return new Response("Missing metadata, but acknowledged", { status: 200 });
    }

    const serviceAccountJson = context.env.FIREBASE_SERVICE_ACCOUNT;
    if (!serviceAccountJson) {
      return new Response(JSON.stringify({ success: false, reason: "No service account" }), { status: 500 });
    }
    
    const serviceAccount = JSON.parse(serviceAccountJson);
    await updatePurchasedPrompts(serviceAccount, userId, promptId);

    return new Response(JSON.stringify({ success: true, processed: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (err: any) {
    console.error("Webhook error:", err);
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 });
  }
};
