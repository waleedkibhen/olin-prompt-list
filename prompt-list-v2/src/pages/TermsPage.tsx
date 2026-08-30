import React, { useEffect } from 'react';
import styles from './PrivacyPolicyPage.module.css';

export default function TermsPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <h1 className={styles.title}>Terms of Service</h1>
        <div className={styles.meta}>
          <span><strong>Olin's Prompt List</strong> | Website: getolin.xyz</span>
          <span>Effective Date: August 12, 2026</span>
          <span>Last Updated: August 30, 2026</span>
        </div>
      </header>

      <div className={styles.content}>
        <section>
          <h2>1. Introduction & Acceptance</h2>
          <p>
            Welcome to Olin's Prompt List ("the Platform," "we," "us," or "our"), accessible at getolin.xyz. Olin's Prompt List is a discovery engine, community marketplace, and creator monetization hub for AI-generated art, prompt engineering, and creator memberships.
          </p>
          <p>
            By creating an account, accessing, or using the Platform, you agree to be bound by these Terms of Service ("Terms") and our <a href="/privacy">Privacy Policy</a>. If you do not agree to these Terms, you must not access or use the Platform.
          </p>
          <p>
            These Terms constitute a legally binding agreement between you ("you," "your," or "User") and Olin's Prompt List.
          </p>
        </section>

        <section>
          <h2>2. Eligibility</h2>
          <p>To use Olin's Prompt List, you represent and warrant that you:</p>
          <ul>
            <li>Are at least 13 years old (or at least 16 years old in the European Economic Area).</li>
            <li>Have a valid Google account, as Google OAuth is our primary authentication method.</li>
            <li>Possess the legal capacity to enter into a binding contract under applicable law.</li>
            <li>Have not been previously suspended, banned, or removed from the Platform.</li>
          </ul>
        </section>

        <section>
          <h2>3. Account Registration & Security</h2>
          
          <h3>3.1 Google Authentication</h3>
          <p>
            Accounts on Olin's Prompt List are created and authenticated through Google OAuth. By signing in, you authorize us to access the basic profile information described in our Privacy Policy (email address, display name, avatar URL, and Google ID).
          </p>
          
          <h3>3.2 Account Responsibility</h3>
          <ul>
            <li>You are solely responsible for all activity that occurs under your account.</li>
            <li>You must maintain the security and confidentiality of your Google credentials. We are not liable for any loss resulting from unauthorized access caused by compromised credentials.</li>
            <li>You may not transfer, share, or sell your account to any other person or organization.</li>
            <li>You agree to provide accurate profile information and to keep your account details current.</li>
          </ul>

          <h3>3.3 One Account Per Individual</h3>
          <p>
            Users are permitted one account. Creating secondary or burner accounts to circumvent bans, manipulate analytics, or bypass security restrictions is strictly prohibited.
          </p>
        </section>

        <section>
          <h2>4. User Conduct & Community Standards</h2>
          <p>To maintain a safe, high-quality creative community, all users agree to adhere to the following rules:</p>
          
          <h3>4.1 Prohibited Content</h3>
          <p>You may not upload, publish, or share content that:</p>
          <ul>
            <li>Violates any applicable local, national, or international law, regulation, or intellectual property right.</li>
            <li>Contains Child Sexual Abuse Material (CSAM) or any form of child sexual exploitation (zero-tolerance policy resulting in immediate permanent ban and law enforcement referral).</li>
            <li>Contains non-consensual intimate imagery (NCII) or non-consensual deepfakes of real individuals.</li>
            <li>Promotes violent extremism, terrorism, illegal weapon manufacturing, or self-harm.</li>
            <li>Constitutes hate speech or incitement of violence targeting protected characteristics (race, ethnicity, religion, sexual orientation, disability, gender identity).</li>
            <li>Contains deceptive phishing links, malware, computer viruses, or unauthorized scripts.</li>
            <li>Violates the acceptable use policies of third-party AI model providers (such as OpenAI, Midjourney, Stability AI, Black Forest Labs).</li>
          </ul>

          <h3>4.2 Prohibited Behaviors</h3>
          <p>You may not:</p>
          <ul>
            <li>Harass, stalk, threaten, or impersonate other users or public figures.</li>
            <li>Use automated bots, scrapers, or scripts to systematically crawl or extract prompt data from the Platform without prior written permission.</li>
            <li>Artificially inflate likes, bookmarks, views, or metrics through coordinated inauthentic engagement.</li>
            <li>Attempt to reverse engineer, decompile, or breach the security architecture of the Platform.</li>
            <li>Circumvent or tamper with paid prompt paywalls, digital locks, or Firestore security rules.</li>
          </ul>
        </section>

        <section>
          <h2>5. Content Moderation & Safety</h2>
          <p>
            We utilize automated moderation systems (including OpenAI's Moderation API) alongside human review to filter harmful or policy-violating text and images.
          </p>
          <p>
            We reserve the right, in our sole discretion and without prior notice, to remove any content, suspend publishing capabilities, or permanently terminate accounts that violate our guidelines. Content appeals may be submitted to <strong>contact@getolin.xyz</strong> within 14 days of enforcement.
          </p>
        </section>

        <section>
          <h2>6. Content Ownership & Licensing</h2>
          
          <h3>6.1 Creator Ownership</h3>
          <p>
            You retain ownership of the original text prompts, parameters, and AI-generated image uploads you submit to Olin's Prompt List, subject to the third-party terms of the AI generator utilized and the license granted below.
          </p>

          <h3>6.2 License Granted to Olin's Prompt List</h3>
          <p>
            By uploading content, you grant Olin's Prompt List a worldwide, non-exclusive, royalty-free license to host, display, index, format, cache, and promote your content across the Platform and in marketing materials (e.g., social previews, featured showcases) for the purpose of operating and growing the service.
          </p>

          <h3>6.3 Public vs. Protected Prompts</h3>
          <p>
            Prompts published as "Free" are publicly readable and copyable by all visitors. Prompts published under "One-Time Unlock" or "Subscribers Only" are cryptographically restricted and accessible only to verified purchasers and active subscribers.
          </p>
        </section>

        <section>
          <h2>7. Intellectual Property & DMCA Takedown Notices</h2>
          <p>
            We respect intellectual property rights and respond promptly to notices of alleged copyright infringement in accordance with the Digital Millennium Copyright Act (DMCA). If you believe your copyrighted work has been infringed, send a formal notice to <strong>contact@getolin.xyz</strong> including:
          </p>
          <ul>
            <li>Identification of the copyrighted work claimed to be infringed.</li>
            <li>The specific URL or post ID of the allegedly infringing material.</li>
            <li>Your contact information (name, address, email, telephone number).</li>
            <li>A good faith statement that the use is unauthorized and that the notice is accurate under penalty of perjury.</li>
            <li>Your physical or electronic signature.</li>
          </ul>
        </section>

        <section>
          <h2>8. Monetization, Creator Memberships & Purchases</h2>
          
          <h3>8.1 Monetization Models</h3>
          <p>The Platform provides creators with direct monetization capabilities:</p>
          <ul>
            <li><strong>One-Time Prompt Unlocks:</strong> Buyers pay a fixed one-time fee to permanently unlock the prompt text, parameters, and configurations for a specific post.</li>
            <li><strong>Creator Memberships (Monthly / Yearly):</strong> Buyers subscribe on a recurring monthly or yearly billing cycle to unlock a creator's entire library of subscriber-only prompts, updates, and exclusive creator benefits.</li>
          </ul>

          <h3>8.2 0% Platform Fee Notice</h3>
          <p>
            Olin operates as a software facilitation and discovery platform. <strong>Olin currently takes a 0% platform take-rate/fee</strong> on creator transactions. 100% of the creator's set price is passed forward to the creator, subject only to direct third-party payment processing fees levied by our merchant partner (Whop / credit card networks).
          </p>

          <h3>8.3 Merchant of Record & Payment Processing (Whop)</h3>
          <p>
            All financial transactions, payment card processing, digital wallet authorizations (Apple Pay, Google Pay), ACH bank debits, currency conversions, renewals, and cancellations are processed by our third-party Merchant of Record partner, <strong>Whop</strong> (<a href="https://whop.com" target="_blank" rel="noopener noreferrer">whop.com</a>).
          </p>
          <ul>
            <li>Olin does not collect or store credit card numbers, debit cards, or banking credentials.</li>
            <li>Recurring memberships automatically renew at the end of each billing cycle (e.g., 30 days for monthly plans, 365 days for yearly plans) until canceled by the subscriber.</li>
            <li>Subscribers can cancel recurring memberships at any time through their Whop customer dashboard. Cancellation prevents future renewal charges while maintaining access through the end of the current paid billing period.</li>
          </ul>

          <h3>8.4 Digital Content Delivery & License</h3>
          <p>
            Purchasing a prompt unlock or creator membership grants the purchaser a limited, non-exclusive, non-transferable, revocable license to access, view, and utilize the prompt instructions for personal or commercial generative AI creation. Purchases do not convey intellectual property ownership of the underlying AI algorithms or platform software.
          </p>

          <h3>8.5 Refund Policy & All Sales Final</h3>
          <p>
            <strong>All sales and membership charges are final and non-refundable.</strong> Due to the instantaneous delivery and irrevocable digital nature of prompt text and creator vaults, refund requests cannot be honored once access has been unlocked, except where mandatory consumer refund rights are strictly required under applicable statutory local law or granted at the sole discretion of the creator.
          </p>

          <h3>8.6 Creator Content Disclaimer & No Output Guarantees</h3>
          <p>
            Olin's Prompt List is a user-generated platform. We do not evaluate, warrant, or guarantee:
          </p>
          <ul>
            <li>The artistic output, seed consistency, or subjective quality of images generated when applying prompts to third-party AI models.</li>
            <li>The frequency, schedule, or ongoing volume of exclusive drops provided by individual creators within their membership tiers.</li>
            <li>Continued compatibility with future versions or updates of third-party AI software (e.g., Midjourney, Stable Diffusion, DALL-E).</li>
          </ul>

          <h3>8.7 Creator Tax Obligations</h3>
          <p>
            Creators act as independent entities. Each creator is solely responsible for determining, reporting, and remitting any applicable sales taxes, income taxes, or VAT related to earnings disbursed via Whop.
          </p>
        </section>

        <section>
          <h2>9. Disclaimer of Warranties</h2>
          <p>
            THE PLATFORM AND ALL CONTENT ARE PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS, IMPLIED, OR STATUTORY, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
          </p>
          <p>
            WE DO NOT WARRANT THAT THE PLATFORM WILL BE UNINTERRUPTED, ERROR-FREE, SECURE, OR ACCURATE, NOR DO WE WARRANT THE ACCURACY OR RELIABILITY OF ANY USER-GENERATED PROMPT OR CONFIGURATION.
          </p>
        </section>

        <section>
          <h2>10. Limitation of Liability</h2>
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL OLIN'S PROMPT LIST, ITS FOUNDERS, OPERATORS, AFFILIATES, OR LICENSORS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES (INCLUDING LOSS OF PROFITS, DATA, REPUTATION, OR BUSINESS INTERRUPTION) ARISING OUT OF OR IN CONNECTION WITH YOUR ACCESS TO OR USE OF THE PLATFORM.
          </p>
          <p>
            IN NO EVENT SHALL OUR TOTAL AGGREGATE LIABILITY FOR ALL CLAIMS EXCEED THE GREATER OF (A) THE TOTAL AMOUNT PAID BY YOU TO US IN THE TWELVE (12) MONTHS PRECEDING THE EVENT, OR (B) ONE HUNDRED U.S. DOLLARS ($100.00).
          </p>
        </section>

        <section>
          <h2>11. Indemnification</h2>
          <p>
            You agree to defend, indemnify, and hold harmless Olin's Prompt List and its operators against any claims, liabilities, damages, losses, and expenses (including reasonable legal fees) arising from: (a) your use or misuse of the Platform; (b) your violation of these Terms; (c) any content you upload; or (d) your infringement of any third-party rights.
          </p>
        </section>

        <section>
          <h2>12. Dispute Resolution & Binding Arbitration</h2>
          <p>
            We encourage you to contact us at <strong>contact@getolin.xyz</strong> to resolve any disputes informally.
          </p>
          <p>
            If a dispute cannot be resolved informally within thirty (30) days, any controversy arising out of these Terms shall be resolved through binding individual arbitration administered under the commercial arbitration rules of the American Arbitration Association (AAA), rather than in court.
          </p>
          <p>
            <strong>Class Action Waiver:</strong> YOU AGREE THAT DISPUTES WILL BE RESOLVED ON AN INDIVIDUAL BASIS ONLY AND WAIVE ANY RIGHT TO INITIATE OR PARTICIPATE IN A CLASS ACTION, COLLECTIVE ACTION, OR REPRESENTATIVE PROCEEDING.
          </p>
        </section>

        <section>
          <h2>13. Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of the United States, without giving effect to any principles of conflicts of law.
          </p>
        </section>

        <section>
          <h2>14. Modifications to Terms & Platform</h2>
          <p>
            We reserve the right to modify or discontinue any feature of the Platform at any time. When we make material changes to these Terms, we will update the "Last Updated" date and provide notice on the Platform. Your continued use of the Platform after changes take effect constitutes binding acceptance of the updated Terms.
          </p>
        </section>

        <section>
          <h2>15. Contact Us</h2>
          <p>If you have any questions concerning these Terms of Service, please contact us at:</p>
          <p>
            📧 <strong>contact@getolin.xyz</strong><br/>
            🌐 <strong>getolin.xyz</strong>
          </p>
        </section>
      </div>
    </div>
  );
}
