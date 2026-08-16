/**
 * Cleanly truncates a string to a specified length, ensuring it doesn't cut a word in half.
 */
export function truncateDescription(text: string, maxLength: number = 155): string {
  if (!text || text.length <= maxLength) return text;
  
  // Truncate at maxLength and find the last space
  const truncated = text.substring(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(' ');
  
  // If there's no space, just return the hard cutoff with ellipsis
  if (lastSpaceIndex === -1) {
    return truncated + '...';
  }
  
  // Otherwise, cut cleanly at the last word
  return truncated.substring(0, lastSpaceIndex) + '...';
}

const DEFAULT_TITLE = "Olin's Prompt List";
const DEFAULT_DESC = "Find inspiring AI images and their prompts.";
const DEFAULT_URL = "https://getolin.xyz/";

export function updateSEOTags(url: string, description: string, title?: string) {
  const finalTitle = title ? `${title} - ${DEFAULT_TITLE}` : DEFAULT_TITLE;
  const finalDesc = truncateDescription(description || DEFAULT_DESC);
  const finalUrl = url || DEFAULT_URL;

  // Update Title
  const titleTag = document.getElementById('meta-title');
  if (titleTag) titleTag.textContent = finalTitle;
  document.title = finalTitle; // Fallback standard way

  // Update Meta Description
  const descTag = document.getElementById('meta-description');
  if (descTag) descTag.setAttribute('content', finalDesc);

  // Update Canonical URL
  const canonicalTag = document.getElementById('canonical-url');
  if (canonicalTag) canonicalTag.setAttribute('href', finalUrl);

  // Update OpenGraph
  const ogTitle = document.getElementById('og-title');
  if (ogTitle) ogTitle.setAttribute('content', finalTitle);
  
  const ogDesc = document.getElementById('og-description');
  if (ogDesc) ogDesc.setAttribute('content', finalDesc);
  
  const ogUrl = document.getElementById('og-url');
  if (ogUrl) ogUrl.setAttribute('content', finalUrl);

  // Update Twitter Cards
  const twTitle = document.getElementById('twitter-title');
  if (twTitle) twTitle.setAttribute('content', finalTitle);
  
  const twDesc = document.getElementById('twitter-description');
  if (twDesc) twDesc.setAttribute('content', finalDesc);
  
  const twUrl = document.getElementById('twitter-url');
  if (twUrl) twUrl.setAttribute('content', finalUrl);
}

export function resetSEOTags() {
  updateSEOTags(DEFAULT_URL, DEFAULT_DESC);
}
