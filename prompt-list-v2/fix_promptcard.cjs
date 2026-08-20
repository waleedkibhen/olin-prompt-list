const fs = require('fs');

let content = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');

// Wrap left and right column
content = content.replace(/<div className={styles\.modalLeftColumn}>/, '<div className={styles.modalTopRow}>\n            <div className={styles.modalLeftColumn}>');

// After modalRightColumn ends
content = content.replace(/<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*\)\}\s*\{isReportModalOpen/g, 
  `</div>\n            </div>\n            </div>\n            <div className={styles.discoverMoreArea}>\n              <DiscoverMore currentPostId={post.id} />\n            </div>\n          </div>\n        </div>\n      )}\n\n      {isReportModalOpen`);

// Extract the comments area
const commentStartMarker = `<div ref={commentsRef} className={styles.mobileCommentsArea}`;
const startIndex = content.indexOf(commentStartMarker);
if (startIndex !== -1) {
  let openDivs = 0;
  let endIndex = -1;
  for (let i = startIndex; i < content.length; i++) {
    if (content.substr(i, 4) === '<div') openDivs++;
    if (content.substr(i, 5) === '</div') {
      openDivs--;
      if (openDivs === 0) {
        endIndex = i + 6;
        break;
      }
    }
  }
  
  if (endIndex !== -1) {
    const commentsJSX = content.substring(startIndex, endIndex);
    content = content.substring(0, startIndex) + content.substring(endIndex);
    
    let modifiedCommentsJSX = commentsJSX.replace(/ref=\{commentsRef\}\s*/, '');
    modifiedCommentsJSX = modifiedCommentsJSX.replace(/className=\{styles\.mobileCommentsArea\}\s*/, '');
    modifiedCommentsJSX = modifiedCommentsJSX.replace(/style=\{\{.*?\}\}/, '');
    
    const modalJSX = `
      {showComments && (
        <div className={styles.commentsModalOverlay} onClick={() => setShowComments(false)}>
          <div className={styles.commentsModalContainer} onClick={e => e.stopPropagation()}>
            <div className={styles.commentsModalHeader}>
              <h3>Comments</h3>
              <button onClick={() => setShowComments(false)}><X size={20} /></button>
            </div>
            <div className={styles.commentsModalBody}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
              ${modifiedCommentsJSX}
              </div>
            </div>
          </div>
        </div>
      )}
    `;
    
    content = content.replace(/\{isReportModalOpen/, modalJSX + '\n      {isReportModalOpen');
  }
} else {
  console.log("Could not find comments start marker");
}

fs.writeFileSync('src/components/PromptCard.tsx', content);
