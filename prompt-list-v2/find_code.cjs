const fs = require('fs');
const readline = require('readline');

async function searchTranscript() {
  const fileStream = fs.createReadStream('C:/Users/ACER/.gemini/antigravity/brain/5cd045a8-ca24-4261-9b2f-d3b3b978dcf7/.system_generated/logs/transcript_full.jsonl');

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    if (line.includes('Global Ad Pool Configuration') || line.includes('distributablePool')) {
      const obj = JSON.parse(line);
      // look for tool_calls that modify AdminDashboardPage.tsx
      if (obj.tool_calls) {
        for (const tc of obj.tool_calls) {
           if (tc.name === 'run_command' && tc.args.CommandLine.includes('AdminDashboardPage.tsx')) {
              console.log("FOUND COMMAND LINE:", tc.args.CommandLine.substring(0, 500));
              fs.writeFileSync('found_command.txt', tc.args.CommandLine);
           }
        }
      }
    }
  }
}

searchTranscript();
