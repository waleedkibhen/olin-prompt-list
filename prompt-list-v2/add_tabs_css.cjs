const fs = require('fs');
let css = fs.readFileSync('src/pages/dashboard.module.css', 'utf8');

if (!css.includes('.tabContainer')) {
    css += `
.tabContainer {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  border-bottom: 1px solid var(--border);
  padding-bottom: 0px;
}

.tab {
  padding: 0.75rem 1.5rem;
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
}

.tab:hover {
  color: var(--text-secondary);
}

.tabActive {
  color: var(--text-primary);
  border-bottom: 2px solid #0572F6; /* Primary blue */
}
`;
    fs.writeFileSync('src/pages/dashboard.module.css', css);
    console.log('Added tab CSS');
}
