const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard.module.css', 'utf8');

if (!code.includes('.skeletonBox')) {
  code += `
.skeletonBox {
  width: 100%;
  height: 200px;
  border-radius: 8px;
  background: linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%);
  background-size: 200% 100%;
  animation: shimmerPulse 2s infinite linear;
  margin: 0.5rem 0 1rem 0;
}
`;
  fs.writeFileSync('src/components/PromptCard.module.css', code);
  console.log("Added skeletonBox");
}
