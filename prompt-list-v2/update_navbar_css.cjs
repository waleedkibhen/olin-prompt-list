const fs = require('fs');
let code = fs.readFileSync('src/components/Navbar.module.css', 'utf8');

// Replace searchFormExpanded
code = code.replace(
  /\.searchFormExpanded \{[\s\S]*?position: relative;\r?\n\}/,
  `.searchFormExpanded {
  display: flex;
  align-items: center;
  background-color: var(--bg-secondary);
  border-radius: 999px; /* Fully rounded pill */
  padding: 0 1rem;
  height: 48px; /* Slightly taller to accommodate the pill look properly */
  width: 100%;
  position: relative;
  z-index: 53;
  border: 1px solid transparent;
  transition: all 0.2s;
}`
);

// Add searchFormActive after searchFormExpanded
code = code.replace(
  /\.searchInput \{/,
  `.searchFormActive {
  border-radius: 24px 24px 0 0; /* Match dropdown rounded corners */
  background-color: var(--bg-primary); /* Match the dropdown */
  border: 1px solid var(--border-color);
  border-bottom: none;
}

.searchInput {`
);

// Update recentSearchesDropdown
code = code.replace(
  /\.recentSearchesDropdown \{[\s\S]*?z-index: 52;\r?\n\}/,
  `.recentSearchesDropdown {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background-color: var(--bg-primary);
  padding: 0.5rem 1.5rem 1.5rem 1.5rem;
  border: 1px solid var(--border-color);
  border-top: none;
  border-radius: 0 0 24px 24px;
  z-index: 52;
}`
);

// Update recentSearchPill border radius just in case it was 1px
code = code.replace(
  /border-radius: 1px;/g,
  'border-radius: 8px;'
);

fs.writeFileSync('src/components/Navbar.module.css', code);
console.log("Updated Navbar.module.css");
