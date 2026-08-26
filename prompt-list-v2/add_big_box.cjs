const fs = require('fs');
let css = fs.readFileSync('src/components/PromptCard.module.css', 'utf8');

css += `

.skeletonBigBox {
  width: 100%;
  height: 120px;
  border-radius: 8px;
  background: repeating-linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.03),
    rgba(255, 255, 255, 0.03) 15px,
    rgba(255, 255, 255, 0.08) 15px,
    rgba(255, 255, 255, 0.08) 30px
  );
  background-size: 200% 200%;
  animation: stripeMove 2s linear infinite;
}

@keyframes stripeMove {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 100% 100%;
  }
}
`;

fs.writeFileSync('src/components/PromptCard.module.css', css);
console.log('Added skeletonBigBox to CSS');
