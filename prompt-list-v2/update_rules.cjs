const fs = require('fs');
const p = 'firestore.rules';
let code = fs.readFileSync(p, 'utf8');

const target = `      allow delete: if (isAuthenticated() && resource.data.creatorId == request.auth.uid) || isAdmin();`;
const replace = `      allow delete: if (isAuthenticated() && resource.data.creatorId == request.auth.uid) || isAdmin();
      
      // 2c. Secure Content Subcollection
      match /secure_content/{docId} {
        // Creator and Admin can read and write
        allow write: if (isAuthenticated() && get(/databases/$(database)/documents/posts/$(postId)).data.creatorId == request.auth.uid) || isAdmin();
        
        // Anyone who purchased it (stored in users/{auth.uid}.purchasedPrompts) can read
        allow read: if (isAuthenticated() && get(/databases/$(database)/documents/posts/$(postId)).data.creatorId == request.auth.uid) 
                    || isAdmin()
                    || (isAuthenticated() && postId in get(/databases/$(database)/documents/users/$(request.auth.uid)).data.get('purchasedPrompts', []));
      }
`;
code = code.replace(target, replace);
fs.writeFileSync(p, code);
console.log('updated firestore.rules');
