const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');

// 1. Remove e.stopPropagation() from modalCard
code = code.replace(/<div className=\{styles\.modalCard\} onClick=\{e => e\.stopPropagation\(\)\}>/g, '<div className={styles.modalCard}>');

// 2. Update modalBackdrop to check e.target === e.currentTarget
const backdropRegex = /<div className=\{styles\.modalBackdrop\} onClick=\{\(\) => \{ if\(onCloseOverride\) onCloseOverride\(\); else setIsModalOpen\(false\); \}\}>/g;
const newBackdrop = `<div className={styles.modalBackdrop} onClick={(e) => { if (e.target === e.currentTarget) { if(onCloseOverride) onCloseOverride(); else setIsModalOpen(false); } }}>`;
code = code.replace(backdropRegex, newBackdrop);

// 3. Update handleWatchAdToUnlock to remove e.stopPropagation()
const handlerRegex = /const handleWatchAdToUnlock = \(e: React\.MouseEvent\) => \{\r?\n\s*e\.stopPropagation\(\);/;
const newHandler = `const handleWatchAdToUnlock = (e: React.MouseEvent) => {
    // We intentionally allow this click to bubble up to the document so Monetag's listener can detect it!`;
code = code.replace(handlerRegex, newHandler);

fs.writeFileSync('src/components/PromptCard.tsx', code);
console.log("Fixed click propagation for Monetag!");
