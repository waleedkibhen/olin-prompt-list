const fs = require('fs');
let css = fs.readFileSync('src/components/PromptCard.module.css', 'utf8');

const skeletonStyles = `

/* Skeleton Loader for Ad Posts */
@keyframes shimmerPulse {
  0% {
    opacity: 0.4;
    background-position: -200% 0;
  }
  50% {
    opacity: 0.85;
  }
  100% {
    opacity: 0.4;
    background-position: 200% 0;
  }
}

.skeletonContainer {
  padding: 1.25rem;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  margin: 0.5rem 0 1rem 0;
}

.skeletonHeader {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.skeletonDot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #3b82f6;
  animation: shimmerPulse 1.5s infinite ease-in-out;
}

.skeletonLabel {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-weight: 500;
  letter-spacing: 0.02em;
}

.skeletonBar {
  height: 14px;
  border-radius: 4px;
  background: linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.05) 75%);
  background-size: 200% 100%;
  animation: shimmerPulse 1.8s infinite linear;
}
`;

if (!css.includes('.skeletonContainer')) {
  css += skeletonStyles;
  fs.writeFileSync('src/components/PromptCard.module.css', css);
  console.log('Added skeleton styles to PromptCard.module.css');
} else {
  console.log('Skeleton styles already exist in PromptCard.module.css');
}
