const fs = require('fs');
let css = fs.readFileSync('src/components/PromptCard.module.css', 'utf8');

css = css.replace(
  /\.skeletonContainer \{\s*padding: 1\.25rem;\s*background-color: var\(--bg-secondary\);\s*border: 1px solid var\(--border-color\);\s*border-radius: 10px;\s*display: flex;\s*flex-direction: column;\s*gap: 0\.85rem;\s*margin: 0\.5rem 0 1rem 0;\s*\}/,
  `.skeletonContainer {
    display: flex;
    flex-direction: column;
    margin: 0.5rem 0 1rem 0;
  }`
);

css = css.replace(
  /\.skeletonBigBox \{\s*width: 100%;\s*height: 120px;\s*border-radius: 8px;\s*background: repeating-linear-gradient\([\s\S]*?\);\s*background-size: 200% 200%;\s*animation: stripeMove 2s linear infinite;\s*\}/,
  `.skeletonBigBox {
    width: 100%;
    height: 140px;
    border-radius: 10px;
    background: linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%);
    background-size: 200% 100%;
    animation: shimmerPulse 1.8s infinite linear;
  }`
);

fs.writeFileSync('src/components/PromptCard.module.css', css);
console.log('Fixed CSS replacement properly');
