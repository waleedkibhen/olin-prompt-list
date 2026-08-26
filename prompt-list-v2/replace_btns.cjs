const fs = require('fs');

function replaceInFile(filepath, searchRegex, replaceStr, importStatement) {
  let content = fs.readFileSync(filepath, 'utf8');
  if (importStatement && !content.includes('GoogleSignInButton')) {
    content = content.replace(/(import .*?;)\r?\n/, `$1\n${importStatement}\n`);
  }
  content = content.replace(searchRegex, replaceStr);
  fs.writeFileSync(filepath, content);
}

const importStmt = "import GoogleSignInButton from '@/components/GoogleSignInButton';";

// CreatePostPage
replaceInFile(
  'src/pages/CreatePostPage.tsx', 
  /<button className="btn-primary" onClick=\{signInWithGoogle\}>\r?\n\s*Authenticate with Google\r?\n\s*<\/button>/g, 
  '<GoogleSignInButton text="Authenticate with Google" />',
  importStmt
);

// CreatorDashboardPage
replaceInFile(
  'src/pages/CreatorDashboardPage.tsx', 
  /<button className="btn-solid" onClick=\{signInWithGoogle\}>\r?\n\s*Sign In with Google\r?\n\s*<\/button>/g, 
  '<GoogleSignInButton />',
  importStmt
);

// FeedbackModal
replaceInFile(
  'src/components/FeedbackModal.tsx', 
  /<button type="button" className="btn-solid" onClick=\{signInWithGoogle\}>\r?\n\s*Sign In with Google\r?\n\s*<\/button>/g, 
  '<GoogleSignInButton />',
  importStmt
);

// ReportModal
replaceInFile(
  'src/components/ReportModal.tsx', 
  /<button type="button" className="btn-solid" onClick=\{signInWithGoogle\}>\r?\n\s*Sign In with Google\r?\n\s*<\/button>/g, 
  '<GoogleSignInButton />',
  importStmt
);

// DiscoveryFeed (multiple instances)
replaceInFile(
  'src/components/DiscoveryFeed.tsx',
  /<button className="btn-solid" onClick=\{signInWithGoogle\} style=\{\{ marginTop: '0\.5rem' \}\}>\r?\n\s*Sign in or sign up\r?\n\s*<\/button>/g,
  '<GoogleSignInButton text="Sign in or sign up" />',
  importStmt
);

console.log("Replaced sign-in buttons with GoogleSignInButton component");
