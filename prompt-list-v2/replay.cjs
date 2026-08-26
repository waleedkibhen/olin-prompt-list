const fs = require('fs');
const logPath = 'C:\\\\Users\\\\ACER\\\\.gemini\\\\antigravity\\\\brain\\\\5cd045a8-ca24-4261-9b2f-d3b3b978dcf7\\\\.system_generated\\\\logs\\\\transcript_full.jsonl';
const lines = fs.readFileSync(logPath, 'utf8').split('\n').filter(Boolean);

let adminCode = fs.readFileSync('src/pages/AdminDashboardPage.tsx', 'utf8');
let creatorCode = fs.readFileSync('src/pages/CreatorDashboardPage.tsx', 'utf8');

for (const line of lines) {
  const step = JSON.parse(line);
  if (step.tool_calls) {
    for (const call of step.tool_calls) {
      if (call.name === 'default_api:replace_file_content') {
        const target = call.arguments.TargetFile;
        const targetContent = call.arguments.TargetContent;
        const replacement = call.arguments.ReplacementContent;
        
        if (target.includes('AdminDashboardPage.tsx')) {
          adminCode = adminCode.replace(targetContent, replacement);
        } else if (target.includes('CreatorDashboardPage.tsx')) {
          creatorCode = creatorCode.replace(targetContent, replacement);
        }
      }
    }
  }
}

fs.writeFileSync('src/pages/AdminDashboardPage.tsx', adminCode);
fs.writeFileSync('src/pages/CreatorDashboardPage.tsx', creatorCode);
console.log('Replay finished.');
