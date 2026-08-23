const fs = require('fs');
let code = fs.readFileSync('src/lib/mockData.ts', 'utf8');

if (!code.includes('monetizationType?: string;')) {
    code = code.replace(/isPaid: boolean;/g, 'isPaid: boolean;\n    monetizationType?: string;');
    code = code.replace(/price\?: number;/g, 'price?: number;\n    monetizationType?: string;');
    
    // Fallback if the above doesn't work well
    if (!code.includes('monetizationType?: string;')) {
       code = code.replace(/viewsCount: number;/g, 'viewsCount: number;\n    monetizationType?: string;');
    }

    fs.writeFileSync('src/lib/mockData.ts', code);
    console.log('Added monetizationType to PromptPost interface');
} else {
    console.log('Already added');
}
