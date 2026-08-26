const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('stopPropagation')) {
    const regex = /function App\(\) \{\r?\n/;
    const replacement = `function App() {
  // Prevent leaked ad listeners on document from triggering on the Discover page
  React.useEffect(() => {
    const handleBodyClick = (e: MouseEvent) => {
      // If a post modal is not open, stop clicks from bubbling up to document
      // where Monetag's rogue global listeners are hiding.
      if (!document.body.classList.contains('post-modal-open')) {
        e.stopPropagation();
      }
    };
    // React 18 handles events at the #root level. 
    // By attaching to body, we let React process the click, but stop it before it hits document.
    document.body.addEventListener('click', handleBodyClick);
    return () => document.body.removeEventListener('click', handleBodyClick);
  }, []);\n\n`;
    code = code.replace(regex, replacement);
    fs.writeFileSync('src/App.tsx', code);
    console.log("Added isolation to App.tsx");
}
