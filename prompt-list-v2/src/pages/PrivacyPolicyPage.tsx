import React, { useEffect } from 'react';
import styles from './PrivacyPolicyPage.module.css';

export default function PrivacyPolicyPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <h1 className={styles.title}>Privacy Policy</h1>
        <div className={styles.meta}>
          <span><strong>Olin's Prompt List</strong> | Website: getolin.xyz</span>
          <span>Effective Date: August 12, 2026</span>
          <span>Last Updated: August 12, 2026</span>
        </div>
      </header>

      <div className={styles.content}>
        <section>
          <h2>1. Introduction</h2>
          <p>
            Welcome to Olin's Prompt List ("we," "us," "our," or the "Platform"). Olin's Prompt List is a discovery engine and marketplace for AI-generated art and prompts, accessible at getolin.xyz.
          </p>
          <p>
            This Privacy Policy explains what information we collect, why we collect it, how we use and protect it, and what rights you have over your personal data. We are committed to transparency and to complying with applicable privacy laws, including the European Union General Data Protection Regulation (GDPR), the California Consumer Privacy Act (CCPA), and the Google API Services User Data Policy.
          </p>
          <p>
            By creating an account or using our Platform, you agree to the practices described in this Privacy Policy. If you do not agree, please do not use the Platform.
          </p>
        </section>

        <section>
          <h2>2. Data We Collect</h2>
          <p>We collect the following categories of information:</p>
          
          <h3>2.1 Information from Google Authentication (OAuth)</h3>
          <p>
            We use Google OAuth as our sole authentication method. We do not maintain a native username/password or email/password login system. When you sign in with Google, we receive and store:
          </p>
          <ul>
            <li><strong>Google Account Email Address</strong> — used as your unique account identifier and for essential communications.</li>
            <li><strong>Display Name</strong> — used as your default profile name (you may edit this after account creation).</li>
            <li><strong>Profile Picture URL</strong> — used as your default avatar on the Platform (you may change this after account creation).</li>
            <li><strong>Google Account ID (unique identifier)</strong> — used internally to link your Google account to your Olin's Prompt List account.</li>
          </ul>
          <p>
            We do not request or store your Google account password. We access only the minimum scopes necessary to authenticate your identity. Our use and transfer of information received from Google APIs adheres to the <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer">Google API Services User Data Policy</a>, including the Limited Use requirements.
          </p>

          <h3>2.2 User-Generated Content</h3>
          <p>When you use the Platform, you may voluntarily provide:</p>
          <ul>
            <li>AI-generated images you upload.</li>
            <li>Prompts (text descriptions used to generate AI art) attached to your uploads.</li>
            <li>Configuration details (model name, settings, parameters) associated with your uploads.</li>
            <li>Comments you post on other users' content.</li>
            <li>Reports you file against other users or posts.</li>
            <li>Profile information you choose to edit or add beyond what Google provides (e.g., a custom bio, display name changes, updated avatar).</li>
          </ul>

          <h3>2.3 Engagement & Analytics Data (Creator Dashboard)</h3>
          <p>We automatically collect and aggregate engagement metrics associated with your account and content, including:</p>
          <ul>
            <li>Total impressions (how often your content appears in feeds)</li>
            <li>Prompt copies (how often other users copy your prompts)</li>
            <li>Saved bookmarks (how often users bookmark your content)</li>
            <li>Community likes (how often users like your content)</li>
            <li>Views (how often your content is viewed)</li>
            <li>Follower count (how many users follow your profile)</li>
          </ul>
          <p>These metrics are displayed to you through your Creator Dashboard and certain metrics (such as likes and views) may be publicly visible on your content.</p>

          <h3>2.4 Automatically Collected Technical Data</h3>
          <p>When you access the Platform, we may automatically collect:</p>
          <ul>
            <li>IP address</li>
            <li>Browser type and version</li>
            <li>Device type and operating system</li>
            <li>Referring URL</li>
            <li>Pages visited and time spent on the Platform</li>
            <li>Cookies and similar tracking identifiers</li>
          </ul>
          <p>This data is collected through standard web technologies and through our infrastructure partners (see Section 4).</p>
        </section>

        <section>
          <h2>3. Why We Collect Your Data (Purposes of Processing)</h2>
          <p>We use the information described above for the following purposes:</p>
          <ul>
            <li><strong>Account creation and authentication:</strong> Google OAuth data (email, name, photo, Google ID)</li>
            <li><strong>Providing core Platform features:</strong> User-generated content, engagement metrics</li>
            <li><strong>Displaying and curating personalized feeds:</strong> Engagement data, browsing activity, content interactions</li>
            <li><strong>Powering your Creator Dashboard:</strong> Impressions, copies, bookmarks, likes, views, followers</li>
            <li><strong>Content moderation and safety:</strong> Uploaded images, prompts, comments, reports</li>
            <li><strong>Communicating with you:</strong> Email address</li>
            <li><strong>Enforcing our Terms of Service:</strong> All categories as necessary</li>
            <li><strong>Improving the Platform:</strong> Technical data, aggregated engagement data</li>
            <li><strong>Legal compliance:</strong> All categories as required by applicable law</li>
          </ul>
          <p>We do not sell your personal data. We do not use your data for purposes unrelated to operating and improving the Platform without your consent.</p>
        </section>

        <section>
          <h2>4. Third-Party Services & Data Sharing</h2>
          <p>We share data with third parties only to the extent necessary to operate, secure, and improve the Platform. We do not sell, rent, or trade your personal information.</p>
          
          <h3>4.1 Infrastructure & Hosting Partners</h3>
          <p><strong>Google Cloud Platform / Firebase</strong> — We use Google Cloud and Firebase for hosting, database storage, authentication processing, and cloud functions. Your data is processed and stored on Google's infrastructure in accordance with <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google's Privacy Policy</a> and their data processing agreements.</p>
          <p><strong>Cloudflare</strong> — We use Cloudflare for content delivery, DDoS protection, and web security. Cloudflare may process your IP address and certain technical data in accordance with <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer">Cloudflare's Privacy Policy</a>.</p>
          
          

          <h3>4.2 Content Moderation</h3>
          <p><strong>OpenAI Moderation API</strong> � When you upload images or prompts, this content may be sent to OpenAI's moderation systems for automated review to detect and block harmful, illegal, or inappropriate content. This processing is governed by <a href="https://openai.com/policies/usage-policies" target="_blank" rel="noopener noreferrer">OpenAI's Usage Policies</a> and data processing terms. We send only the content being evaluated; we do not send your email address or Google account credentials to OpenAI for moderation purposes.</p>

          <h3>4.3 Behavioral Analytics</h3>
          <p><strong>Microsoft Clarity</strong> � We partner with Microsoft Clarity to capture how you use and interact with our website through behavioral metrics, heatmaps, and session replay to improve our products. Site usage data is captured using first and third-party tracking technologies. Sensitive user input fields are masked and not recorded. Visit the Microsoft Privacy Statement for more information.</p>
          
          <h3>4.4 Payment Processing</h3>
          <p><strong>Whop</strong> � Transactions for paid content are securely processed through our third-party provider, Whop. We do not collect or store your payment details. Whop handles this information under their own Privacy Policy.</p>
          
          <h3>4.5 Advertising Networks</h3>
          <p>We use third-party advertising networks to display ads. These networks may use tracking technologies to collect non-personal data about your activities to measure engagement.</p>

          <h3>4.6 Legal Requirements</h3>
          <p>We may disclose your information if required to do so by law, in response to a valid legal process (such as a court order or subpoena), or to protect the rights, safety, or property of Olin's Prompt List, our users, or the public.</p>

          <h3>4.7 Business Transfers</h3>
          <p>In the event of a merger, acquisition, reorganization, or sale of assets, your data may be transferred as part of that transaction. We will notify you via email or a prominent notice on the Platform before your data becomes subject to a different privacy policy.</p>
        </section>

        <section>
          <h2>5. How Prompts, Images, and Content Are Stored & Shared</h2>
          <p>This section is particularly important because of the public nature of our Platform:</p>
          <ul>
            <li><strong>Public by Default:</strong> When you upload an image and attach a prompt, that content is publicly visible to all Platform users and visitors. Your display name, avatar, and associated engagement metrics (likes, views) are also publicly displayed alongside your content.</li>
            <li><strong>Prompts Are Copyable:</strong> Other users can copy and use prompts you share on the Platform. This is a core feature of the service. By uploading a prompt, you acknowledge and agree that it will be publicly accessible and copyable.</li>
            <li><strong>Storage:</strong> Your images, prompts, configuration details, and associated metadata are stored securely on our cloud infrastructure (Google Cloud / Firebase). We retain this content for as long as your account is active or until you delete the specific content or your account.</li>
            <li><strong>No Expectation of Secrecy:</strong> Because the Platform is designed for sharing and discovery, you should not upload any prompt, image, or configuration that you wish to keep confidential or private.</li>
          </ul>
        </section>

        <section>
          <h2>6. Cookies and Tracking Technologies</h2>
          <p>We use cookies and similar technologies for:</p>
          <ul>
            <li><strong>Essential functionality</strong> — maintaining your login session, remembering preferences.</li>
            <li><strong>Analytics</strong> — understanding how users interact with the Platform to improve performance and features.</li>
            <li><strong>Security</strong> — detecting abuse, fraud, and unauthorized access (including via Cloudflare).</li>
          </ul>
          <p>You can control cookies through your browser settings. Disabling essential cookies may prevent you from using the Platform.</p>
        </section>

        <section>
          <h2>7. Data Retention</h2>
          <p>We retain your personal data for as long as:</p>
          <ul>
            <li>Your account remains active, or</li>
            <li>It is necessary to provide you the services, or</li>
            <li>We are required to retain it by law (e.g., for tax, legal, or regulatory purposes).</li>
          </ul>
          <p>When you delete your account, we will delete or anonymize your personal data within 30 days, except where retention is required by law or necessary for legitimate business purposes (such as resolving disputes or enforcing our Terms). Publicly shared content that has been copied, bookmarked, or otherwise interacted with by other users may persist in those users' records in anonymized form.</p>
        </section>

        <section>
          <h2>8. Data Security</h2>
          <p>We take the security of your data seriously and implement industry-standard measures, including:</p>
          <ul>
            <li>Encryption in transit (TLS/HTTPS) for all data transmitted between your browser and our servers.</li>
            <li>Encryption at rest for sensitive data stored on our infrastructure.</li>
            <li>Access controls limiting internal access to your data to personnel who need it to operate the service.</li>
            <li>Infrastructure-level protections provided by Google Cloud, Firebase, and Cloudflare.</li>
          </ul>
          <p>No system is perfectly secure. While we strive to protect your data, we cannot guarantee absolute security. You are responsible for maintaining the security of your Google account, which controls access to Olin's Prompt List.</p>
        </section>

        <section>
          <h2>9. Your Rights</h2>
          <p>Depending on your location, you may have the following rights regarding your personal data:</p>
          
          <h3>9.1 All Users</h3>
          <ul>
            <li><strong>Edit your profile:</strong> You can update your display name, avatar, and bio at any time through your account settings.</li>
            <li><strong>Delete your content:</strong> You can delete individual uploads, prompts, and comments at any time.</li>
            <li><strong>Delete your account:</strong> You can request full account deletion through your account settings. Account deletion will remove your profile, uploads, and associated data within 30 days.</li>
          </ul>

          <h3>9.2 Rights for Users in the European Economic Area (EEA) / UK (GDPR)</h3>
          <p>If you are located in the EEA or UK, you have the following additional rights:</p>
          <ul>
            <li><strong>Right of Access</strong> — Request a copy of the personal data we hold about you.</li>
            <li><strong>Right to Rectification</strong> — Request correction of inaccurate data.</li>
            <li><strong>Right to Erasure</strong> — Request deletion of your data, subject to legal exceptions.</li>
            <li><strong>Right to Restrict Processing</strong> — Request that we limit how we use your data.</li>
            <li><strong>Right to Data Portability</strong> — Request your data in a structured, commonly used, machine-readable format.</li>
            <li><strong>Right to Object</strong> — Object to our processing of your data for certain purposes.</li>
            <li><strong>Right to Withdraw Consent</strong> — Where processing is based on consent, you may withdraw it at any time.</li>
          </ul>

          <h3>9.3 Rights for California Residents (CCPA)</h3>
          <p>If you are a California resident, you have the right to:</p>
          <ul>
            <li>Know what personal information we collect and how it is used.</li>
            <li>Request deletion of your personal information.</li>
            <li><strong>Non-discrimination</strong> — We will not discriminate against you for exercising your privacy rights.</li>
          </ul>

          <h3>9.4 How to Exercise Your Rights</h3>
          <p>To exercise any of the above rights, please contact us at: <strong>contact@getolin.xyz</strong></p>
          <p>We will respond to all verified requests within 30 days (or within the timeframe required by applicable law). We may need to verify your identity before fulfilling your request.</p>
        </section>

        <section>
          <h2>10. Children's Privacy</h2>
          <p>Olin's Prompt List is not intended for users under the age of 13 (or under the age of 16 in the EEA). We do not knowingly collect personal data from children. If we learn that we have collected data from a child below the applicable age, we will take steps to delete that information promptly. If you believe a child has provided us with personal data, please contact us immediately at contact@getolin.xyz.</p>
        </section>

        <section>
          <h2>11. International Data Transfers</h2>
          <p>Your data may be processed and stored in countries outside your country of residence, including the United States. When we transfer data internationally, we implement appropriate safeguards such as Standard Contractual Clauses (SCCs) approved by the European Commission, or rely on other legally recognized transfer mechanisms to ensure your data is protected.</p>
        </section>

        <section>
          <h2>12. Changes to This Privacy Policy</h2>
          <p>We may update this Privacy Policy from time to time to reflect changes in our practices, technology, or legal requirements. When we make material changes, we will:</p>
          <ul>
            <li>Update the "Last Updated" date at the top of this page.</li>
            <li>Provide a prominent notice on the Platform (e.g., a banner notification).</li>
            <li>For significant changes, send a notification to the email address associated with your account.</li>
          </ul>
          <p>Your continued use of the Platform after changes take effect constitutes acceptance of the revised Privacy Policy.</p>
        </section>

        <section>
          <h2>13. Contact Us</h2>
          <p>If you have questions, concerns, or complaints about this Privacy Policy or our data practices, please contact us at:</p>
          <p>
            📧 <strong>contact@getolin.xyz</strong><br/>
            🌐 <strong>getolin.xyz</strong>
          </p>
        </section>
      </div>
    </div>
  );
}
