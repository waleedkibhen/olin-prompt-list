const fs = require('fs');
let code = fs.readFileSync('src/pages/PrivacyPolicyPage.tsx', 'utf8');

const regex = /<h3>4\.3 Behavioral Analytics<\/h3>[\s\S]*?<h3>4\.4 Business Transfers<\/h3>/;

const replacement = `<h3>4.2 Content Moderation</h3>
          <p><strong>OpenAI Moderation API</strong> — When you upload images or prompts, this content may be sent to OpenAI's moderation systems for automated review to detect and block harmful, illegal, or inappropriate content. This processing is governed by <a href="https://openai.com/policies/usage-policies" target="_blank" rel="noopener noreferrer">OpenAI's Usage Policies</a> and data processing terms. We send only the content being evaluated; we do not send your email address or Google account credentials to OpenAI for moderation purposes.</p>

          <h3>4.3 Behavioral Analytics</h3>
          <p><strong>Microsoft Clarity</strong> — We partner with Microsoft Clarity to capture how you use and interact with our website through behavioral metrics, heatmaps, and session replay to improve our products. Site usage data is captured using first and third-party tracking technologies. Sensitive user input fields are masked and not recorded. Visit the Microsoft Privacy Statement for more information.</p>
          
          <h3>4.4 Payment Processing</h3>
          <p><strong>Whop</strong> — Transactions for paid content are securely processed through our third-party provider, Whop. We do not collect or store your payment details. Whop handles this information under their own Privacy Policy.</p>
          
          <h3>4.5 Advertising Networks</h3>
          <p>We use third-party advertising networks to display ads. These networks may use tracking technologies to collect non-personal data about your activities to measure engagement.</p>

          <h3>4.6 Legal Requirements</h3>
          <p>We may disclose your information if required to do so by law, in response to a valid legal process (such as a court order or subpoena), or to protect the rights, safety, or property of Olin's Prompt List, our users, or the public.</p>

          <h3>4.7 Business Transfers</h3>`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/pages/PrivacyPolicyPage.tsx', code);
console.log("Restored section 4");
