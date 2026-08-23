const fs = require('fs');
const lines = fs.readFileSync('C:\\Users\\ACER\\.gemini\\antigravity\\brain\\ee7b1da3-3645-4699-8777-9ef747901d26\\.system_generated\\logs\\transcript.jsonl', 'utf8').split('\n');

for(let i=lines.length-1; i>=0; i--) {
    if (!lines[i]) continue;
    try {
        const step = JSON.parse(lines[i]);
        if (step.tool_calls) {
            for (const call of step.tool_calls) {
                if (JSON.stringify(call).includes('WhopCheckoutModal')) {
                    console.log('Found tool call with WhopCheckoutModal at step', i);
                    fs.writeFileSync('found_step.json', lines[i]);
                    process.exit(0);
                }
            }
        }
    } catch(e) {}
}
