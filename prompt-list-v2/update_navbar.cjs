const fs = require('fs');
let code = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

code = code.replace(
  /<form onSubmit=\{handleSearchSubmit\} className=\{styles\.searchFormExpanded\}>/,
  "<form onSubmit={handleSearchSubmit} className={`${styles.searchFormExpanded} ${(isSearchExpanded && recentSearches.length > 0) ? styles.searchFormActive : ''}`}>"
);

fs.writeFileSync('src/components/Navbar.tsx', code);
console.log("Updated Navbar.tsx to conditionally apply searchFormActive class");
