const fs = require('fs');
const file = 'src/pages/ProfilePage.tsx';
let content = fs.readFileSync(file, 'utf8');

// Remove toast.error(null); and toast.success(null);
content = content.replace(/toast\.error\(null\);\r?\n?\s*/g, '');
content = content.replace(/toast\.success\(null\);\r?\n?\s*/g, '');

// Remove errorMsg and successMsg state variables
content = content.replace(/const \[errorMsg, setErrorMsg\] = useState<string \| null>\(null\);\r?\n?\s*/g, '');
content = content.replace(/const \[successMsg, setSuccessMsg\] = useState<string \| null>\(null\);\r?\n?\s*/g, '');

// Remove the JSX for the inline messages
const jsxToRemove = `          {errorMsg && (
            <div style={{ padding: '0.75rem 1rem', backgroundColor: 'rgba(244, 63, 94, 0.1)', color: '#f43f5e', borderRadius: '8px', fontSize: '0.88rem', border: '1px solid #f43f5e' }}>
              <strong>Error:</strong> {errorMsg}
            </div>
          )}

          {successMsg && (
            <div style={{ padding: '0.75rem 1rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '8px', fontSize: '0.88rem', border: '1px solid #10b981', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={18} />
              <span>{successMsg}</span>
            </div>
          )}`;
          
// also try with \r\n just in case
const jsxToRemoveCrLf = jsxToRemove.replace(/\n/g, '\r\n');
content = content.replace(jsxToRemove, '');
content = content.replace(jsxToRemoveCrLf, '');

fs.writeFileSync(file, content);
