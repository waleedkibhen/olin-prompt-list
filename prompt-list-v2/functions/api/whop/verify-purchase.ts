export interface Env {
  WHOP_API_KEY?: string;
  FIREBASE_SERVICE_ACCOUNT?: string;
}

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
    const payload = await context.request.json<any>();
    
    const { checkoutId, userId, promptId } = payload;
    
    if (!checkoutId || !userId || !promptId) {
      return new Response(JSON.stringify({ success: false, reason: "Missing params" }), { status: 400 });
    }

    const serviceAccountJson = context.env.FIREBASE_SERVICE_ACCOUNT;
    if (!serviceAccountJson) {
      return new Response(JSON.stringify({ success: false, reason: "Server misconfiguration: No service account" }), { status: 500 });
    }
    
    const serviceAccount = JSON.parse(serviceAccountJson);

    await updatePurchasedPrompts(serviceAccount, userId, promptId);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });

  } catch (err: any) {
    console.error("Webhook/Verify error:", err);
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500, headers: { "Access-Control-Allow-Origin": "*" } });
  }
};
