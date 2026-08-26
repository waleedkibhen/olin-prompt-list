const fs = require('fs');
let css = fs.readFileSync('src/components/PromptCard.module.css', 'utf8');

css = css.replace(
  /\.skeletonContainer \{[\s\S]*?margin: 0\.5rem 0 1rem 0;\n  \}/,
  `.skeletonContainer {
  /* padding: 1.25rem; */
  /* background-color: var(--bg-secondary); */
  /* border: 1px solid var(--border-color); */
  /* border-radius: 10px; */
  display: flex;
  flex-direction: column;
  margin: 0.5rem 0 1rem 0;
}`
);

css = css.replace(
  /\.skeletonBigBox \{[\s\S]*?animation: stripeMove 2s linear infinite;\n  \}/,
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
console.log('Updated skeleton container and box CSS to match user request');
