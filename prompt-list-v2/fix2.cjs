const fs = require('fs');
const p = 'src/components/PromptCard.tsx';
let code = fs.readFileSync(p, 'utf8');

const target = `  const effectivePrompts = useMemo(() => {
    if (post.prompts && post.prompts.length > 1) {
      return post.prompts;
    }
    
    if (post.promptText) {
      // Legacy compatibility: Parse manually typed variants like "V1 -" or "Variant 2 -"
      if (/(?:V|Variant)\\s*1\\s*-/i.test(post.promptText) && /(?:V|Variant)\\s*2\\s*-/i.test(post.promptText)) {
        const matches = [...post.promptText.matchAll(/(?:^|<p>|<br>|\\n)(?:<[^>]+>)*(?:V|Variant)\\s*\\d+\\s*-/gi)];
        if (matches.length > 1 && matches[0].index !== undefined) {
          const result = [];
          for (let i = 0; i < matches.length; i++) {
            const start = matches[i].index as number;
            const end = i + 1 < matches.length ? (matches[i + 1].index as number) : post.promptText.length;
            
            // Clean up the prefix tag if it accidentally grabbed the starting paragraph tag
            let chunk = post.promptText.substring(start, end);
            if (i > 0 && chunk.startsWith('<p>')) {
               // keep the formatting intact but we're splitting it cleanly
            }
            result.push(chunk);
          }
          return result;
        }
      }
    }
    
    return [post.promptText || ''];
  }, [post.promptText, post.prompts]);`;

const replacement = `  const effectivePrompts = useMemo(() => {
    const rawPrompts = securePromptData ? securePromptData.prompts : post.prompts;
    const rawPromptText = securePromptData ? securePromptData.promptText : post.promptText;

    if (rawPrompts && rawPrompts.length > 1) {
      return rawPrompts;
    }
    
    if (rawPromptText) {
      // Legacy compatibility: Parse manually typed variants like "V1 -" or "Variant 2 -"
      if (/(?:V|Variant)\\s*1\\s*-/i.test(rawPromptText) && /(?:V|Variant)\\s*2\\s*-/i.test(rawPromptText)) {
        const matches = [...rawPromptText.matchAll(/(?:^|<p>|<br>|\\n)(?:<[^>]+>)*(?:V|Variant)\\s*\\d+\\s*-/gi)];
        if (matches.length > 1 && matches[0].index !== undefined) {
          const result = [];
          for (let i = 0; i < matches.length; i++) {
            const start = matches[i].index as number;
            const end = i + 1 < matches.length ? (matches[i + 1].index as number) : rawPromptText.length;
            
            // Clean up the prefix tag if it accidentally grabbed the starting paragraph tag
            let chunk = rawPromptText.substring(start, end);
            if (i > 0 && chunk.startsWith('<p>')) {
               // keep the formatting intact but we're splitting it cleanly
            }
            result.push(chunk);
          }
          return result;
        }
      }
    }
    
    return [rawPromptText || ''];
  }, [securePromptData, post.promptText, post.prompts]);`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync(p, code);
  console.log("Success");
} else {
  console.log("Target not found!");
}
