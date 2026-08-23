const fs = require('fs');
const lines = fs.readFileSync('C:\\Users\\ACER\\.gemini\\antigravity\\brain\\ee7b1da3-3645-4699-8777-9ef747901d26\\.system_generated\\logs\\transcript.jsonl', 'utf8').split('\n');

let latestCode = null;

for(let i=lines.length-1; i>=0; i--) {
    if (!lines[i]) continue;
    try {
        const step = JSON.parse(lines[i]);
        if (step.tool_calls) {
            for (const call of step.tool_calls) {
                if (call.name === 'write_to_file' || call.name === 'replace_file_content' || call.name === 'run_command') {
                    if (call.name === 'write_to_file' && call.args && call.args.TargetFile && call.args.TargetFile.includes('PromptCard.tsx') && call.args.CodeContent) {
                        latestCode = call.args.CodeContent;
                        break;
                    }
                }
            }
            if (latestCode) break;
        }
    } catch(e) {}
}

if (latestCode) {
    fs.writeFileSync('restored_PromptCard.tsx', latestCode);
    console.log('Restored PromptCard.tsx from transcript');
} else {
    console.log('Could not find full code in transcript');
}
