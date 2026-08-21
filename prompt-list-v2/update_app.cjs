const fs = require('fs');
const p = 'src/App.tsx';
let code = fs.readFileSync(p, 'utf8');

code = code.replace("const AdTestPage = lazy(() => import('@/pages/AdTestPage'));", "const AdTestPage = lazy(() => import('@/pages/AdTestPage'));\nconst UnlockAdPage = lazy(() => import('@/pages/UnlockAdPage'));");

code = code.replace("<Route path=\"/ad-test\" element={<AdTestPage />} />", "<Route path=\"/ad-test\" element={<AdTestPage />} />\n              <Route path=\"/unlock/:id\" element={<UnlockAdPage />} />");

fs.writeFileSync(p, code);
console.log('App.tsx updated');
