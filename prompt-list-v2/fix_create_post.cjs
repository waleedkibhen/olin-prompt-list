const fs = require('fs');
const p = 'src/pages/CreatePostPage.tsx';
let code = fs.readFileSync(p, 'utf8');

const target = `
        const postPayload = {
          title,
          description,
          promptText: prompts[0],
          prompts: prompts,
`;

const replace = `
        const isCharge = monetizationType === 'paid' && paidUnlockMethod === 'charge';
        
        const postPayload = {
          title,
          description,
          promptText: isCharge ? '' : prompts[0],
          prompts: isCharge ? [] : prompts,
`;

code = code.replace(target, replace);

const target2 = `      await setDoc(newPostRef, postPayload);`;
const replace2 = `      await setDoc(newPostRef, postPayload);
      
      // If charge, put the actual prompt text in the secure subcollection
      if (isCharge) {
        const secureRef = doc(collection(db, 'posts', newPostRef.id, 'secure_content'), 'data');
        await setDoc(secureRef, {
          promptText: prompts[0],
          prompts: prompts
        });
      }
`;
code = code.replace(target2, replace2);

fs.writeFileSync(p, code);
console.log('fixed create post payload');
