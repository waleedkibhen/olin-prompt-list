interface Env {
  VITE_FIREBASE_PROJECT_ID?: string;
  VITE_FIREBASE_API_KEY?: string;
}

const DEFAULT_FIREBASE_PROJECT_ID = "promptlist-15659";
const DEFAULT_FIREBASE_API_KEY = "AIzaSyDft0f0YPzPhS3PP4ASiVcAakzZK4nY590";

// Known automated search crawlers & preview scrapers (Exclude real human in-app browsers like Pinterest, Instagram, TikTok, etc.)
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
  return handleViewIncrement(context);
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  return handleViewIncrement(context);
};

async function handleViewIncrement(context: EventContext<Env, any, any>): Promise<Response> {
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
          } catch {
            // Check for url-encoded string
            const formParams = new URLSearchParams(rawText);
            postId = formParams.get("postId") || formParams.get("id") || "";
          }
        }
      } catch (e) {
        console.warn("Could not parse request body for view tracking:", e);
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

    // 3. Atomically increment viewsCount in Firestore via REST API commit with Firebase API key
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:commit?key=${apiKey}`;
    
    const commitBody = {
      writes: [
        {
          transform: {
            document: `projects/${projectId}/databases/(default)/documents/posts/${postId}`,
            fieldTransforms: [
              {
                fieldPath: "viewsCount",
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
      console.error(`Firestore view increment failed [${firestoreRes.status}]:`, errText);
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
    console.error("Exception in track-view API route:", err);
    return new Response(JSON.stringify({ success: false, error: err.message || "Internal server error" }), {
      status: 500,
      headers: CORS_HEADERS
    });
  }
}
