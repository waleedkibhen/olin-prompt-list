const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');

code = code.replace(/<\/div>\r?\n\s*<\/>\r?\n\s*\)\}\r?\n\s*<\/>\r?\n\s*\)\}\r?\n\s*<\/div>/, 
`</div>
                          </>
                      </>
                    )}
                  </div>`);

fs.writeFileSync('src/components/PromptCard.tsx', code);
console.log("Fixed stray closing bracket");
