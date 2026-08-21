const fs = require('fs');

const filesToFix = [
  'src/components/DiscoveryFeed.tsx',
  'src/components/DiscoverMore.tsx',
  'src/pages/CreatorDashboardPage.tsx',
  'src/pages/CreatorProfilePage.tsx',
  'src/pages/ProfilePage.tsx',
  'src/pages/PostDetailPage.tsx'
];

for (const file of filesToFix) {
  if (!fs.existsSync(file)) continue;
  let code = fs.readFileSync(file, 'utf8');
  
  if (code.includes('price: data.price')) {
    code = code.replace(/price: (data|d|docData|postData)\.price \|\| (undefined|0|null),/g, "price: $1.price || $2,\n            whopPlanId: $1.whopPlanId || undefined,");
  } else if (code.includes('price: data.price') || code.includes('price: d.price')) {
      code = code.replace(/price: (data|d|docData|postData)\.price,/g, "price: $1.price,\n            whopPlanId: $1.whopPlanId || undefined,");
  } else {
      // Just try to insert after monetizationType
      code = code.replace(/monetizationType: (data|d|docData|postData)\.monetizationType(.*?),/g, "monetizationType: $1.monetizationType$2,\n            whopPlanId: $1.whopPlanId || undefined,");
  }

  fs.writeFileSync(file, code);
  console.log('Fixed', file);
}
