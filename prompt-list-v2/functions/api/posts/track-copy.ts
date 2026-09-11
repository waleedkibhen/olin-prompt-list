export interface Env {
  VITE_FIREBASE_PROJECT_ID?: string;
  VITE_FIREBASE_API_KEY?: string;
  FIREBASE_SERVICE_ACCOUNT?: string;
}

const DEFAULT_FIREBASE_PROJECT_ID = "promptlist-15659";
const DEFAULT_FIREBASE_API_KEY = "AIzaSyDft0f0YPzPhS3PP4ASiVcAakzZK4nY590";

// Known automated search crawlers & preview scrapers
const BOT_USER_AGENTS = /Googlebot|bingbot|Slurp|DuckDuckBot|Baiduspider|YandexBot|Sogou|Exabot|facebot|facebookexternalhit|Twitterbot|LinkedInBot|Slackbot|Discordbot|TelegramBot|WhatsApp|Embedly|Quora Link Preview|Rogerbot|outbrain|W3C_Validator/i;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json"
};

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

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
  return handleCopyIncrement(context);
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  return handleCopyIncrement(context);
};

async function handleCopyIncrement(context: EventContext<Env, any, any>): Promise<Response> {
  try {
    const userAgent = context.request.headers.get("user-agent") || "";
    
    // 1. Filter out known automated web spiders / scrapers
    if (userAgent && BOT_USER_AGENTS.test(userAgent)) {
      return new Response(JSON.stringify({ success: false, reason: "Bot user-agent ignored" }), {
        status: 200,
        headers: CORS_HEADERS
      });
    }

    let postId = "";
    let userId = "";

    // 2. Extract postId from query param, JSON body, or form data
    const url = new URL(context.request.url);
    postId = url.searchParams.get("postId") || url.searchParams.get("id") || "";

    if (!postId && context.request.method === "POST") {
      try {
        const rawText = await context.request.text();
        if (rawText) {
          try {
            const body = JSON.parse(rawText);
            postId = body.postId || body.id || "";
            userId = body.userId || "";
          } catch {
            const formParams = new URLSearchParams(rawText);
            postId = formParams.get("postId") || formParams.get("id") || "";
            userId = formParams.get("userId") || "";
          }
        }
      } catch (e) {
        console.warn("Could not parse request body for copy tracking:", e);
      }
    }

    postId = (postId || "").trim();

    if (!postId || postId.length < 3 || postId.length > 120) {
      return new Response(JSON.stringify({ success: false, error: "Invalid postId" }), {
        status: 400,
        headers: CORS_HEADERS
      });
    }

    const projectId = context.env.VITE_FIREBASE_PROJECT_ID || DEFAULT_FIREBASE_PROJECT_ID;
    const apiKey = context.env.VITE_FIREBASE_API_KEY || DEFAULT_FIREBASE_API_KEY;

    // 3. Atomically increment copiesCount in Firestore
    const commitBody = {
      writes: [
        {
          transform: {
            document: `projects/${projectId}/databases/(default)/documents/posts/${postId}`,
            fieldTransforms: [
              {
                fieldPath: "copiesCount",
                increment: {
                  integerValue: "1"
                }
              }
            ]
          }
        }
      ]
    };

    let firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:commit?key=${apiKey}`;
    const headers: Record<string, string> = { "Content-Type": "application/json" };

    // If service account is available, use OAuth Bearer token for authorized write
    if (context.env.FIREBASE_SERVICE_ACCOUNT) {
      try {
        const serviceAccount = JSON.parse(context.env.FIREBASE_SERVICE_ACCOUNT);
        const token = await getAccessToken(serviceAccount);
        firestoreUrl = `https://firestore.googleapis.com/v1/projects/${serviceAccount.project_id || projectId}/databases/(default)/documents:commit`;
        headers["Authorization"] = `Bearer ${token}`;
      } catch (saErr) {
        console.warn("Service account auth failed, falling back to API key:", saErr);
      }
    }

    const firestoreRes = await fetch(firestoreUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(commitBody)
    });

    if (!firestoreRes.ok) {
      const errText = await firestoreRes.text();
      console.error(`Firestore copy increment failed [${firestoreRes.status}]:`, errText);
      return new Response(JSON.stringify({ success: false, error: "Database increment failed", status: firestoreRes.status }), {
        status: 500,
        headers: CORS_HEADERS
      });
    }

    return new Response(JSON.stringify({ success: true, postId }), {
      status: 200,
      headers: CORS_HEADERS
    });

  } catch (err: any) {
    console.error("Exception in track-copy API route:", err);
    return new Response(JSON.stringify({ success: false, error: err.message || "Internal server error" }), {
      status: 500,
      headers: CORS_HEADERS
    });
  }
}
