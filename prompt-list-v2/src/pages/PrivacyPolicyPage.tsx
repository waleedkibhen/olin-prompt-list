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
          <span>Last Updated: August 30, 2026</span>
        </div>
      </header>

      <div className={styles.content}>
        <section>
          <h2>1. Introduction</h2>
          <p>
            Welcome to Olin's Prompt List ("we," "us," "our," or the "Platform"), accessible at getolin.xyz. Olin's Prompt List is a creative discovery engine and creator monetization platform for AI-generated art, prompt engineering, and creator memberships.
          </p>
          <p>
            This Privacy Policy explains how we collect, use, disclose, and protect your personal information when you visit or use our Platform. We are committed to user privacy, transparent data handling, and compliance with applicable data protection laws, including the General Data Protection Regulation (GDPR), the California Consumer Privacy Act (CCPA), and the Google API Services User Data Policy.
          </p>
          <p>
            By accessing or using the Platform, you acknowledge that you have read and understood this Privacy Policy.
          </p>
        </section>

        <section>
          <h2>2. Information We Collect</h2>
          <p>We collect information in the following ways:</p>
          
          <h3>2.1 Google Authentication (OAuth)</h3>
          <p>
            We use Google OAuth for streamlined authentication. We do not store or process passwords. When you sign in with Google, we receive and store:
          </p>
          <ul>
            <li><strong>Google Account Email Address</strong> — used as your unique identifier and for service-related communications.</li>
            <li><strong>Display Name</strong> — used as your default profile name (customizable at any time).</li>
            <li><strong>Profile Picture URL</strong> — used as your default avatar on the Platform.</li>
            <li><strong>Google Account ID</strong> — used internally to link your authentication session to your Olin account.</li>
          </ul>
          <p>
            Our use of data received from Google APIs adheres to the <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer">Google API Services User Data Policy</a>, including the Limited Use requirements.
          </p>

          <h3>2.2 User-Generated Content & Creator Vaults</h3>
          <p>When you use the Platform, you may provide:</p>
          <ul>
            <li>Images you upload.</li>
            <li>Prompts, negative prompts, seed parameters, aspect ratios, and model configurations.</li>
            <li>Paid and subscriber-only prompt content stored within our access-restricted database collections.</li>
            <li>Comments, community replies, and user reports.</li>
            <li>Creator profile details (bio, social links, custom membership tiers).</li>
          </ul>

          <h3>2.3 Payment & Transaction Metadata (Whop)</h3>
          <p>
            All monetary transactions — including one-time prompt unlocks and recurring creator memberships — are processed by our merchant of record partner, <strong>Whop</strong> (<a href="https://whop.com" target="_blank" rel="noopener noreferrer">whop.com</a>).
          </p>
          <p>
            <strong>We do not collect, process, or store credit card numbers, debit card details, or bank account credentials on Olin servers.</strong> When you make a purchase or subscribe to a creator, Whop securely processes your payment and transmits non-sensitive transaction confirmation metadata to us (such as transaction IDs, plan IDs, active subscription status, and buyer user IDs) solely to grant you digital access to the purchased prompts.
          </p>

          <h3>2.4 Platform Analytics & Whop Pixel Tracking</h3>
          <p>
            To monitor platform health, verify checkout traffic, ensure security, and improve performance, we collect technical usage data through:
          </p>
          <ul>
            <li><strong>Whop Analytics Pixel</strong> — We embed the Whop tracking script in our global header to measure conversion events, verify referrer domains, and protect against fraudulent checkout attempts.</li>
            <li><strong>Google Analytics 4 & Microsoft Clarity</strong> — We collect anonymized session metrics, device type, browser specifications, page response times, and aggregated navigation patterns to optimize user experience. Sensitive form inputs are automatically masked.</li>
            <li><strong>Technical Server Logs</strong> — IP addresses, browser user-agents, referring URLs, and request timestamps collected via our infrastructure partner, Cloudflare.</li>
          </ul>
        </section>

        <section>
          <h2>3. How We Use Your Information</h2>
          <p>We process your personal data strictly for legitimate operational purposes:</p>
          <ul>
            <li><strong>Account & Authentication:</strong> Creating, maintaining, and securing your profile.</li>
            <li><strong>Content Delivery & Access Control:</strong> Storing prompts and unlocking protected subscriber content when valid purchases or active memberships are verified.</li>
            <li><strong>Creator Monetization Facilitation:</strong> Enabling creators to configure membership tiers, display earnings performance, and connect checkout links.</li>
            <li><strong>Safety & Moderation:</strong> Automatically reviewing uploaded text and images via OpenAI Moderation APIs to filter hate speech, illegal material, and harmful content.</li>
            <li><strong>Platform Optimization:</strong> Analyzing aggregated traffic trends and fixing technical bugs.</li>
            <li><strong>Legal & Policy Enforcement:</strong> Enforcing our Terms of Service, preventing fraud, and complying with statutory obligations.</li>
          </ul>
          <p><strong>We do not sell, rent, or trade your personal data to third parties.</strong></p>
        </section>

        <section>
          <h2>4. Third-Party Service Providers & Data Sharing</h2>
          <p>We share data with third-party service providers solely to operate, secure, and deliver the Platform:</p>
          
          <h3>4.1 Merchant of Record & Payments (Whop)</h3>
          <p>
            Financial processing for all creator memberships and prompt sales is handled by <strong>Whop</strong>. When purchasing content or subscribing to a creator, you interact directly with Whop's checkout infrastructure. Whop processes your payment information in accordance with <a href="https://whop.com/privacy" target="_blank" rel="noopener noreferrer">Whop's Privacy Policy</a>.
          </p>

          <h3>4.2 Cloud Hosting & Database (Google Cloud / Firebase)</h3>
          <p>
            Our core database, user storage, authentication handlers, and cloud functions run on Google Cloud Platform and Firebase. Your account information and content are stored in accordance with <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google's Privacy Policy</a> and data protection agreements.
          </p>

          <h3>4.3 Security & CDN (Cloudflare)</h3>
          <p>
            We use Cloudflare for web security, DDoS protection, edge caching, and DNS management. Cloudflare processes network requests in accordance with <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer">Cloudflare's Privacy Policy</a>.
          </p>

          <h3>4.4 Automated Content Moderation (OpenAI)</h3>
          <p>
            To protect our community, uploaded prompts and text may be evaluated by OpenAI's Moderation API. Only the content payload is transmitted for evaluation; personal identifying credentials are never sent to OpenAI for moderation.
          </p>

          <h3>4.5 Analytics Partners (Whop, Google Analytics, Microsoft Clarity)</h3>
          <p>
            We use Whop Analytics, Google Analytics, and Microsoft Clarity to track anonymized site usage, conversion metrics, and system performance. These providers do not receive your private prompts or confidential account passwords.
          </p>

          <h3>4.6 Advertising Notice</h3>
          <p>
            <strong>Olin's Prompt List does not run third-party display ad networks or sell ad tracking data.</strong>
          </p>
        </section>

        <section>
          <h2>5. How Prompts & Creator Content Are Stored & Secured</h2>
          <ul>
            <li><strong>Public Prompts:</strong> Prompts designated by creators as free/public are visible and copyable by all Platform visitors.</li>
            <li><strong>Protected & Subscriber-Only Prompts:</strong> Prompts designated for one-time purchase or creator memberships are stored in restricted database subcollections. Access is encrypted and strictly verified by backend Firestore Security Rules to ensure only the author, verified purchasers, and active subscribers can view the prompt text.</li>
            <li><strong>No Confidential Submissions:</strong> Because Olin is a creative sharing hub, you should not submit trade secrets or confidential proprietary prompts that you do not intend to license or share.</li>
          </ul>
        </section>

        <section>
          <h2>6. Cookies & Local Storage</h2>
          <p>We use cookies and browser local storage for:</p>
          <ul>
            <li><strong>Authentication & Preferences:</strong> Keeping you logged in and remembering theme/filter settings.</li>
            <li><strong>Security & Session Verification:</strong> Preventing CSRF attacks and validating secure sessions via Cloudflare and Firebase.</li>
            <li><strong>Performance & Analytics:</strong> Measuring page load speeds, tracking anonymous checkout conversion funnels via Whop Pixel, and debugging platform errors.</li>
          </ul>
          <p>You may adjust cookie settings in your browser at any time. Disabling essential cookies may impair account login functionality.</p>
        </section>

        <section>
          <h2>7. Data Retention & Account Deletion</h2>
          <p>
            We retain your account data for as long as your account remains active. You may update your profile or delete individual prompts at any time.
          </p>
          <p>
            If you wish to permanently delete your account and associated personal data, you may submit an account deletion request to <strong>contact@getolin.xyz</strong>. We will delete or anonymize your personal records within 30 days, except where retention is required for legal compliance or dispute resolution.
          </p>
        </section>

        <section>
          <h2>8. Data Security</h2>
          <p>We maintain industry-standard safeguards to protect your information, including:</p>
          <ul>
            <li>End-to-end TLS/HTTPS encryption for all data in transit.</li>
            <li>Database encryption at rest via Google Cloud Platform.</li>
            <li>Granular access-control rules restricting access to paid creator vaults.</li>
            <li>Strict segregation of payment processing to certified PCI-DSS compliant providers (Whop / Stripe).</li>
          </ul>
          <p>While we apply rigorous security protocols, no online transmission is 100% immune from security risks. You are responsible for safeguarding access to your Google account.</p>
        </section>

        <section>
          <h2>9. Your Privacy Rights</h2>
          <p>Depending on your jurisdiction, you may have statutory rights regarding your personal data:</p>
          
          <h3>9.1 EEA & UK Residents (GDPR)</h3>
          <p>If you reside in the EEA or UK, you have the right to access, rectify, erase, restrict, or object to the processing of your personal data, as well as the right to data portability. You may also lodge a complaint with your local data protection authority.</p>

          <h3>9.2 California Residents (CCPA / CPRA)</h3>
          <p>If you are a California resident, you have the right to request disclosure of categories of personal information collected, request deletion of personal information, and be free from discrimination for exercising your rights. <strong>We do not sell personal information.</strong></p>

          <h3>9.3 Exercising Your Rights</h3>
          <p>To exercise any privacy rights, contact us at: <strong>contact@getolin.xyz</strong>. We will respond within 30 days after verifying your identity.</p>
        </section>

        <section>
          <h2>10. Children's Privacy</h2>
          <p>
            Olin's Prompt List is not directed to children under 13 (or under 16 in certain European jurisdictions). We do not knowingly collect personal data from children. If you become aware that a child has provided us with personal information, please contact us at <strong>contact@getolin.xyz</strong> so we can promptly delete it.
          </p>
        </section>

        <section>
          <h2>11. Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy periodically to reflect new features, payment integrations, or legal obligations. When updates occur, we will revise the "Last Updated" date at the top of this document and post a notification on the Platform for material modifications.
          </p>
        </section>

        <section>
          <h2>12. Contact Us</h2>
          <p>If you have any questions or feedback regarding this Privacy Policy, please reach out to us:</p>
          <p>
            📧 <strong>contact@getolin.xyz</strong><br/>
            🌐 <strong>getolin.xyz</strong>
          </p>
        </section>
      </div>
    </div>
  );
}
