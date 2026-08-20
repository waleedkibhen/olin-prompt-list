const fs = require('fs');

let content = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');

const creatorLinkStart = `<Link to={\`/creator/\${post.creator.username}\`} className={styles.creatorProfileModalLink}>`;
const creatorLinkEnd = `</Link>`;

let startIdx = content.indexOf(creatorLinkStart);
let endIdx = content.indexOf(creatorLinkEnd, startIdx) + creatorLinkEnd.length;

if (startIdx !== -1 && endIdx !== -1) {
  let creatorLinkHTML = content.substring(startIdx, endIdx);
  
  const followBtnRegex = /\{user\?\.uid !== post\.creator\.uid && \(\s*<button[\s\S]*?<\/button>\s*\)\}/;
  const followMatch = content.substring(endIdx).match(followBtnRegex);
  let followHTML = "";
  if (followMatch) {
    followHTML = followMatch[0];
    
    const origFollowStr = content.substring(endIdx, endIdx + followMatch.index + followMatch[0].length);
    const newFollowStr = origFollowStr.replace(followBtnRegex, "");
    content = content.substring(0, endIdx) + newFollowStr + content.substring(endIdx + followMatch.index + followMatch[0].length);
  }
  
  content = content.substring(0, startIdx) + content.substring(endIdx);
  
  const combinedCreatorHTML = `
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginTop: '2rem', marginLeft: '2.5rem', marginBottom: '0rem' }}>
                  ${creatorLinkHTML}
                  ${followHTML}
                </div>
  `;
  
  const actionBarMarker = `<div className={styles.modalActionBar}>`;
  content = content.replace(actionBarMarker, combinedCreatorHTML + "\n              " + actionBarMarker);
  
  content = content.replace(/<div className=\{styles\.modalHeader\}>\s*<div style=\{\{ display: 'flex', alignItems: 'center', gap: '1\.25rem' \}\}>\s*<\/div>\s*<\/div>/g, "");
}

content = content.replace(/borderBottom: '1px solid var\(--border-color\)'/g, "borderBottom: 'none'");

fs.writeFileSync('src/components/PromptCard.tsx', content);
