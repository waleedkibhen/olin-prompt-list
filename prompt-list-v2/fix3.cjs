const fs = require('fs');
const p = 'src/components/PromptCard.tsx';
let code = fs.readFileSync(p, 'utf8');

const startStr = "const effectivePrompts = useMemo(() => {";
const endStr = "  }, [post.promptText, post.prompts]);";

const startIndex = code.indexOf(startStr);
const endIndex = code.indexOf(endStr, startIndex);

if (startIndex !== -1 && endIndex !== -1) {
  const replacement = `const effectivePrompts = useMemo(() => {
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
            const start = matches[i].index;
            const end = i + 1 < matches.length ? matches[i + 1].index : rawPromptText.length;
            
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

  code = code.substring(0, startIndex) + replacement + code.substring(endIndex + endStr.length);
  fs.writeFileSync(p, code);
  console.log("Success");
} else {
  console.log("Indices not found", startIndex, endIndex);
}
