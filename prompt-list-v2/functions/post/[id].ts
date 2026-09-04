interface Env {
  VITE_FIREBASE_PROJECT_ID?: string;
  VITE_FIREBASE_API_KEY?: string;
  ASSETS: Fetcher;
}

const DEFAULT_FIREBASE_PROJECT_ID = "promptlist-15659";
const DEFAULT_FIREBASE_API_KEY = "AIzaSyDft0f0YPzPhS3PP4ASiVcAakzZK4nY590";

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, params, env } = context;
  const postId = (params.id as string || "").trim();

  // 1. Fetch root HTML template from Pages Assets
  let templateResponse: Response;
  try {
    templateResponse = await env.ASSETS.fetch(new Request(new URL('/', request.url), request));
  } catch (e) {
    templateResponse = await context.next();
  }

  // If no valid postId, return default template
  if (!postId || postId.length < 3) {
    return templateResponse;
  }

  // 2. Fetch post document from Firestore REST API at the edge
  const projectId = env.VITE_FIREBASE_PROJECT_ID || DEFAULT_FIREBASE_PROJECT_ID;
  const apiKey = env.VITE_FIREBASE_API_KEY || DEFAULT_FIREBASE_API_KEY;
  const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/posts/${postId}?key=${apiKey}`;

  let postData: any = null;
  try {
    const fsRes = await fetch(firestoreUrl);
    if (fsRes.ok) {
      postData = await fsRes.json();
    }
  } catch (err) {
    console.warn("Could not fetch post from Firestore at edge:", err);
  }

  if (!postData || !postData.fields) {
    return templateResponse;
  }

  const fields = postData.fields;

  // 3. Extract and sanitize fields
  const title = fields.title?.stringValue || "AI Prompt Artwork";
  const creatorUsername = fields.creatorUsername?.stringValue || fields.creator?.mapValue?.fields?.username?.stringValue || "olin_creator";
  const creatorDisplayName = fields.creatorDisplayName?.stringValue || fields.creator?.mapValue?.fields?.displayName?.stringValue || creatorUsername;
  const styleTag = fields.styleTag?.stringValue || fields.style?.stringValue || "AI Art";
  const theme = fields.theme?.stringValue || "General";
  const aspectRatio = fields.aspectRatio?.stringValue || "Standard";

  // Extract images
  const rawImageUrls: string[] = fields.imageUrls?.arrayValue?.values?.map((v: any) => v.stringValue).filter(Boolean) || [];
  const primaryImage = rawImageUrls[0] || "https://getolin.xyz/og-banner.jpg";

  // Extract categories / tags
  const categories: string[] = fields.categories?.arrayValue?.values?.map((v: any) => v.stringValue).filter(Boolean) || [];
  const tags: string[] = fields.tags?.arrayValue?.values?.map((v: any) => v.stringValue).filter(Boolean) || [];
  const allKeywords = Array.from(new Set([...categories, ...tags, styleTag, theme])).filter(Boolean);

  // Extract prompt text excerpt (protect secret paid content if protected)
  const isPaid = fields.isPaid?.booleanValue || fields.monetizationType?.stringValue === 'charge' || fields.monetizationType?.stringValue === 'subscribers_only';
  let promptExcerpt = "";
  if (!isPaid && fields.promptText?.stringValue) {
    promptExcerpt = fields.promptText.stringValue.slice(0, 500);
  } else if (fields.caption?.stringValue) {
    promptExcerpt = fields.caption.stringValue;
  }

  const cleanDescription = promptExcerpt 
    ? `${title} by @${creatorUsername}. ${promptExcerpt.replace(/\n+/g, ' ').slice(0, 160)}...`
    : `Explore "${title}" by @${creatorUsername} with high quality AI prompts and style tags on Olin.`;

  const pageTitle = `${title} by @${creatorUsername} | Olin's Prompt List`;
  const canonicalUrl = `https://getolin.xyz/post/${postId}`;

  // 4. Build JSON-LD Structured Data Schema for Rich Google Snippets
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VisualArtwork",
    "name": title,
    "description": cleanDescription,
    "image": rawImageUrls,
    "creator": {
      "@type": "Person",
      "name": creatorDisplayName,
      "alternateName": `@${creatorUsername}`,
      "url": `https://getolin.xyz/creator/${creatorUsername}`
    },
    "artMedium": styleTag,
    "artform": "AI Generated Art",
    "url": canonicalUrl,
    "keywords": allKeywords.join(", ")
  };

  // 5. Build Prerendered HTML Content for Googlebot (Crawlers instantly read content before React hydration)
  const prerenderedHtml = `
  <div id="prerendered-seo-content" style="display:none;" aria-hidden="true">
    <article itemscope itemtype="https://schema.org/VisualArtwork">
      <h1 itemprop="name">${escapeHtml(title)}</h1>
      <p>Created by <span itemprop="creator">${escapeHtml(creatorDisplayName)} (@${escapeHtml(creatorUsername)})</span></p>
      <p>Style: <span itemprop="artMedium">${escapeHtml(styleTag)}</span> | Theme: ${escapeHtml(theme)} | Aspect Ratio: ${escapeHtml(aspectRatio)}</p>
      ${promptExcerpt ? `<blockquote>${escapeHtml(promptExcerpt)}</blockquote>` : ''}
      <div class="prerendered-images">
        ${rawImageUrls.map((url, i) => `<img src="${escapeHtml(url)}" alt="${escapeHtml(title)} - Image ${i + 1}" itemprop="image" />`).join('\n')}
      </div>
      <div class="prerendered-tags">
        ${allKeywords.map(kw => `<span class="tag">${escapeHtml(kw)}</span>`).join(' ')}
      </div>
    </article>
  </div>
  `;

  // 6. Use HTMLRewriter to dynamically transform headers and body
  const rewriter = new HTMLRewriter()
    .on('title', {
      element(e) {
        e.setInnerContent(pageTitle);
      }
    })
    .on('meta[name="description"]', {
      element(e) {
        e.setAttribute('content', cleanDescription);
      }
    })
    .on('link[rel="canonical"]', {
      element(e) {
        e.setAttribute('href', canonicalUrl);
      }
    })
    .on('meta[property="og:title"]', {
      element(e) {
        e.setAttribute('content', `${title} | Olin's Prompt List`);
      }
    })
    .on('meta[property="og:description"]', {
      element(e) {
        e.setAttribute('content', cleanDescription);
      }
    })
    .on('meta[property="og:image"]', {
      element(e) {
        e.setAttribute('content', primaryImage);
      }
    })
    .on('meta[property="og:url"]', {
      element(e) {
        e.setAttribute('content', canonicalUrl);
      }
    })
    .on('meta[name="twitter:title"]', {
      element(e) {
        e.setAttribute('content', `${title} | Olin's Prompt List`);
      }
    })
    .on('meta[property="twitter:title"]', {
      element(e) {
        e.setAttribute('content', `${title} | Olin's Prompt List`);
      }
    })
    .on('meta[name="twitter:description"]', {
      element(e) {
        e.setAttribute('content', cleanDescription);
      }
    })
    .on('meta[property="twitter:description"]', {
      element(e) {
        e.setAttribute('content', cleanDescription);
      }
    })
    .on('meta[name="twitter:image"]', {
      element(e) {
        e.setAttribute('content', primaryImage);
      }
    })
    .on('meta[property="twitter:image"]', {
      element(e) {
        e.setAttribute('content', primaryImage);
      }
    })
    .on('meta[name="twitter:url"]', {
      element(e) {
        e.setAttribute('content', canonicalUrl);
      }
    })
    .on('meta[property="twitter:url"]', {
      element(e) {
        e.setAttribute('content', canonicalUrl);
      }
    })
    .on('head', {
      element(e) {
        if (primaryImage && !primaryImage.includes('og-banner.jpg')) {
          const optimized1200 = `https://wsrv.nl/?url=${encodeURIComponent(primaryImage)}&w=1200&output=webp&n=1&q=80`;
          e.append(`<link rel="preload" as="image" href="${escapeHtml(optimized1200)}" fetchpriority="high" />`, { html: true });
        }
        e.append(`<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`, { html: true });
      }
    })
    .on('body', {
      element(e) {
        e.append(prerenderedHtml, { html: true });
      }
    });

  const modifiedResponse = rewriter.transform(templateResponse);
  const headers = new Headers(modifiedResponse.headers);
  headers.set('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=86400');
  headers.set('Content-Type', 'text/html; charset=UTF-8');

  return new Response(modifiedResponse.body, {
    status: 200,
    headers
  });
};

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
