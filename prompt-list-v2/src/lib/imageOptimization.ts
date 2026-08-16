/**
 * Helper to generate an optimized image URL using wsrv.nl (Cloudflare-backed image resizing proxy).
 * Converts images to webp and resizes them to the specified width to drastically reduce payload size.
 */
export function getOptimizedImageUrl(url: string, width: number = 600): string {
  if (!url) return '';
  
  // Don't proxy data URIs or already optimized URLs
  if (url.startsWith('data:') || url.includes('wsrv.nl')) {
    return url;
  }

  // Use wsrv.nl to proxy and compress the image
  // n=1 avoids upscaling if the original is smaller than the requested width
  return `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=${width}&output=webp&n=1`;
}
