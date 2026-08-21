const fs = require('fs');
const p = 'src/pages/CreatePostPage.tsx';
let code = fs.readFileSync(p, 'utf8');

const targetStr = "const newPostRef = doc(collection(db, 'posts'));";
const insertStr = `
      const newPostRef = doc(collection(db, 'posts'));
      
      let whopPlanId = undefined;
      if (monetizationType === 'paid' && paidUnlockMethod === 'charge') {
        const pVal = parseFloat(price) || 0;
        if (pVal > 0) {
          try {
            const whopRes = await fetch('/api/whop/create-checkout', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                title: title,
                price: pVal,
                promptId: newPostRef.id
              })
            });
            const whopData = await whopRes.json();
            if (whopData.success && whopData.checkoutId) {
              whopPlanId = whopData.checkoutId;
            } else {
              throw new Error(whopData.error || whopData.reason || 'Failed to create checkout configuration');
            }
          } catch (err: any) {
            setModerationError("Payment Gateway Error: " + err.message);
            setIsSubmitting(false);
            return;
          }
        }
      }
`;

code = code.replace(targetStr, insertStr);

const payloadTargetStr = "monetizationType: monetizationType === 'free' ? 'free' : (paidUnlockMethod === 'ad' ? 'ad_supported' : 'charge'),";
const payloadInsertStr = `monetizationType: monetizationType === 'free' ? 'free' : (paidUnlockMethod === 'ad' ? 'ad_supported' : 'charge'),
        whopPlanId: whopPlanId,`;
        
code = code.replace(payloadTargetStr, payloadInsertStr);

fs.writeFileSync(p, code);
console.log('updated createpostpage');
