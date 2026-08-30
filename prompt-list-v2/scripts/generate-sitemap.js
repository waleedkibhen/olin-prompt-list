import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateSitemap() {
  console.log('Generating sitemap...');
  try {
    const projectId = 'promptlist-15659';
    const baseUrl = 'https://getolin.xyz';
    
    // Fetch all posts from Firestore via REST API
    const response = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/posts?pageSize=1000`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch posts: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const posts = data.documents || [];

    // Start XML structure
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Add homepage
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/</loc>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>1.0</priority>\n`;
    xml += `  </url>\n`;

    // Add individual posts
    for (const post of posts) {
      const postId = post.name.split('/').pop();
      
      // Determine last modified date from document fields or updateTime
      let lastMod = post.updateTime;
      if (post.fields && post.fields.createdAt && post.fields.createdAt.timestampValue) {
         // Optionally use createdAt if updateTime isn't representative, but updateTime is fine
         // lastMod = post.fields.createdAt.timestampValue;
      }
      
      // Format as YYYY-MM-DD
      const dateStr = new Date(lastMod).toISOString().split('T')[0];

      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/post/${postId}</loc>\n`;
      xml += `    <lastmod>${dateStr}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    }

    xml += `</urlset>`;

    // Ensure public directory exists
    const publicDir = path.resolve(__dirname, '../public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    const outputPath = path.join(publicDir, 'sitemap.xml');
    fs.writeFileSync(outputPath, xml, 'utf8');

    console.log(`Successfully generated sitemap with 1 + ${posts.length} entries at ${outputPath}`);
  } catch (error) {
    console.warn('Warning: Could not fetch dynamic posts for sitemap, ensuring base sitemap exists:', error.message || error);
    try {
      const publicDir = path.resolve(__dirname, '../public');
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }
      const outputPath = path.join(publicDir, 'sitemap.xml');
      if (!fs.existsSync(outputPath)) {
        const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>https://getolin.xyz/</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n</urlset>`;
        fs.writeFileSync(outputPath, fallbackXml, 'utf8');
      }
    } catch {}
  }
}

generateSitemap();
