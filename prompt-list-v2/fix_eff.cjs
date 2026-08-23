const fs = require('fs');
const p = 'src/components/PromptCard.tsx';
let code = fs.readFileSync(p, 'utf8');

const t = `  const effectivePrompts = useMemo(() => {
    if (post.prompts && post.prompts.length > 1) {
      return post.prompts;
    }
    
    if (post.promptText) {`;

const r = `  const effectivePrompts = useMemo(() => {
    const rawPrompts = securePromptData ? securePromptData.prompts : post.prompts;
    const rawPromptText = securePromptData ? securePromptData.promptText : post.promptText;

    if (rawPrompts && rawPrompts.length > 1) {
      return rawPrompts;
    }
    
    if (rawPromptText) {`;
code = code.replace(t, r);

const t2 = `      if (/(?:V|Variant)\\s*1\\s*-/i.test(post.promptText) && /(?:V|Variant)\\s*2\\s*-/i.test(post.promptText)) {
        const matches = [...post.promptText.matchAll(/(?:^|<p>|<br>|\n)(?:<[^>]+>)*(?:V|Variant)\\s*\\d+\\s*-/gi)];
        if (matches.length > 1 && matches[0].index !== undefined) {
          const result = [];
          for (let i = 0; i < matches.length; i++) {
            const start = matches[i].index;
            const end = i < matches.length - 1 ? matches[i + 1].index : post.promptText.length;
            result.push(post.promptText.substring(start, end).trim());
          }
          return result;
        }
      }
      
      return [post.promptText];
    }
    
    return [''];
  }, [post.prompts, post.promptText, post.model, post.models]);`;
  
const r2 = `      if (/(?:V|Variant)\\s*1\\s*-/i.test(rawPromptText) && /(?:V|Variant)\\s*2\\s*-/i.test(rawPromptText)) {
        const matches = [...rawPromptText.matchAll(/(?:^|<p>|<br>|\\n)(?:<[^>]+>)*(?:V|Variant)\\s*\\d+\\s*-/gi)];
        if (matches.length > 1 && matches[0].index !== undefined) {
          const result = [];
          for (let i = 0; i < matches.length; i++) {
            const start = matches[i].index;
            const end = i < matches.length - 1 ? matches[i + 1].index : rawPromptText.length;
            result.push(rawPromptText.substring(start, end).trim());
          }
          return result;
        }
      }
      
      return [rawPromptText];
    }
    
    return [''];
  }, [securePromptData, post.prompts, post.promptText, post.model, post.models]);`;
code = code.replace(t2, r2);

fs.writeFileSync(p, code);
console.log('fixed effectivePrompts');
