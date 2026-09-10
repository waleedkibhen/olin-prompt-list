interface Env {
  VITE_FIREBASE_PROJECT_ID?: string;
  VITE_FIREBASE_API_KEY?: string;
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

    // 3. Atomically increment copiesCount in Firestore via REST API commit
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:commit?key=${apiKey}`;
    
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

    const firestoreRes = await fetch(firestoreUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
