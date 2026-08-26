const fs = require('fs');
let code = fs.readFileSync('src/pages/PrivacyPolicyPage.tsx', 'utf8');

const regex = /<h3>4\.2 Content Moderation<\/h3>/;

const replacement = `<h3>4.3 Behavioral Analytics</h3>
          <p><strong>Microsoft Clarity</strong> — We partner with Microsoft Clarity to capture how you use and interact with our website through behavioral metrics, heatmaps, and session replay to improve our products. Site usage data is captured using first and third-party tracking technologies. Sensitive user input fields are masked and not recorded. Visit the Microsoft Privacy Statement for more information.</p>
          
          <h3>4.4 Payment Processing</h3>
          <p><strong>Whop</strong> — Transactions for paid content are securely processed through our third-party provider, Whop. We do not collect or store your payment details. Whop handles this information under their own Privacy Policy.</p>
          
          <h3>4.5 Advertising Networks</h3>
          <p>We use third-party advertising networks to display ads. These networks may use tracking technologies to collect non-personal data about your activities to measure engagement.</p>

          <h3>4.2 Content Moderation</h3>`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/pages/PrivacyPolicyPage.tsx', code);
console.log("Updated Privacy Policy");
