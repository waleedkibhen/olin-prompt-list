const fs = require('fs');
let lines = fs.readFileSync('src/components/PromptCard.tsx', 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(') : isProtected ? (')) {
        lines.splice(i + 1, 0, '                      <>');
        break;
    }
}

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('<Lock size={14} /> Secure Checkout Powered by Whop')) {
        // The structure is:
        // {effectiveMonetization === 'charge' && (
        //   <div ...>
        //     <Lock size={14} /> Secure Checkout Powered by Whop
        //   </div>
        // )}
        // ) : (
        lines.splice(i + 3, 0, '                      </>');
        break;
    }
}

fs.writeFileSync('src/components/PromptCard.tsx', lines.join('\n'));
console.log('Fixed fragments by line number');
