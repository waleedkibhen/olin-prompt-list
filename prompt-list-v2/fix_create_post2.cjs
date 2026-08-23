const fs = require('fs');
const p = 'src/pages/CreatePostPage.tsx';
let code = fs.readFileSync(p, 'utf8');

const target = `      const postPayload = {
        id: newPostRef.id,
        creatorId: user.uid,
        creatorDisplayName: profile.displayName || user.displayName || 'Anonymous Creator',
        creatorUsername: profile.username || 'unknown',
        creatorAvatarUrl: profile.avatarUrl || user.photoURL || '',
        
        title,
        description,
        promptText: prompts[0],
        prompts: prompts,`;

const replace = `      const isCharge = monetizationType === 'paid' && paidUnlockMethod === 'charge';
      const postPayload = {
        id: newPostRef.id,
        creatorId: user.uid,
        creatorDisplayName: profile.displayName || user.displayName || 'Anonymous Creator',
        creatorUsername: profile.username || 'unknown',
        creatorAvatarUrl: profile.avatarUrl || user.photoURL || '',
        
        title,
        description,
        promptText: isCharge ? '' : prompts[0],
        prompts: isCharge ? [] : prompts,`;

code = code.replace(target, replace);
fs.writeFileSync(p, code);
console.log('fixed create post payload again');
