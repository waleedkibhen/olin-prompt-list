const fs = require('fs');
const p = 'src/components/PromptCard.tsx';
let code = fs.readFileSync(p, 'utf8');

const target = `  const effectivePrompts = useMemo(() => {
    if (post.prompts && post.prompts.length > 1) {
      return post.prompts;
    }
    
    if (post.promptText) {`;
const replace = `  const effectivePrompts = useMemo(() => {
    const rawPrompts = securePromptData ? securePromptData.prompts : post.prompts;
    const rawPromptText = securePromptData ? securePromptData.promptText : post.promptText;

    if (rawPrompts && rawPrompts.length > 1) {
      return rawPrompts;
    }
    
    if (rawPromptText) {`;
code = code.replace(target, replace);

const target2 = `            const end = i + 1 < matches.length ? (matches[i + 1].index as number) : post.promptText.length;
            
            // Clean up the prefix tag if it accidentally grabbed the starting paragraph tag
            let chunk = post.promptText.substring(start, end);`;
const replace2 = `            const end = i + 1 < matches.length ? (matches[i + 1].index as number) : rawPromptText.length;
            
            // Clean up the prefix tag if it accidentally grabbed the starting paragraph tag
            let chunk = rawPromptText.substring(start, end);`;
code = code.replace(target2, replace2);

const target3 = `        return result;
      }
    }
    
    return [post.promptText || ''];
  }, [post.promptText, post.prompts]);`;
const replace3 = `        return result;
      }
    }
    
    return [rawPromptText || ''];
  }, [post.promptText, post.prompts, securePromptData]);`;
code = code.replace(target3, replace3);

const target4 = `      const activeIdx = parseInt(activeTab.split('-')[1] || '0');
      const promptToCopy = effectivePrompts[activeIdx] || post.promptText;`;
const replace4 = `      const activeIdx = parseInt(activeTab.split('-')[1] || '0');
      const rawPromptText = securePromptData ? securePromptData.promptText : post.promptText;
      const promptToCopy = effectivePrompts[activeIdx] || rawPromptText;`;
code = code.replace(target4, replace4);

fs.writeFileSync(p, code);
console.log('fixed effectivePrompts for securePromptData');
