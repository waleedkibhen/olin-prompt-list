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
          <span>Last Updated: August 12, 2026</span>
        </div>
      </header>

      <div className={styles.content}>
        <section>
          <h2>1. Introduction & Acceptance</h2>
          <p>
            Welcome to Olin's Prompt List ("the Platform," "we," "us," or "our"), accessible at getolin.xyz. Olin's Prompt List is a discovery engine and marketplace for AI-generated art and prompts where users can upload AI-generated images, share prompts and configurations, and engage with a creative community.
          </p>
          <p>
            By creating an account, accessing, or using the Platform, you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use the Platform.
          </p>
          <p>
            These Terms constitute a legally binding agreement between you ("you," "your," or "User") and Olin's Prompt List. Please read them carefully.
          </p>
        </section>

        <section>
          <h2>2. Eligibility</h2>
          <p>To use Olin's Prompt List, you must:</p>
          <ul>
            <li>Be at least 13 years old (or at least 16 years old if you are located in the European Economic Area).</li>
            <li>Have a valid Google account, as we use Google OAuth as our sole authentication method.</li>
            <li>Have the legal capacity to enter into a binding agreement.</li>
            <li>Not have been previously banned or removed from the Platform.</li>
          </ul>
          <p>If you are using the Platform on behalf of an organization, you represent that you have the authority to bind that organization to these Terms.</p>
        </section>

        <section>
          <h2>3. Account Registration & Security</h2>
          
          <h3>3.1 Google Authentication</h3>
          <p>All accounts on Olin's Prompt List are created and accessed exclusively through Google Authentication (OAuth). By signing in, you authorize us to access the limited Google profile information described in our Privacy Policy (email address, display name, profile picture, and Google Account ID).</p>
          
          <h3>3.2 Account Responsibility</h3>
          <ul>
            <li>You are responsible for all activity that occurs under your account.</li>
            <li>You must maintain the security of your Google account. We are not liable for any loss or damage resulting from unauthorized access to your account caused by your failure to secure your Google credentials.</li>
            <li>You may not share, transfer, or sell your account to another person.</li>
            <li>You agree to provide accurate information and to update your profile if your information changes.</li>
          </ul>

          <h3>3.3 One Account Per User</h3>
          <p>Each individual may maintain only one account. Creating multiple accounts to evade bans, manipulate engagement metrics, or circumvent these Terms is prohibited and grounds for immediate termination.</p>
        </section>

        <section>
          <h2>4. User Conduct & Community Guidelines</h2>
          <p>Olin's Prompt List is a community built around creative sharing and discovery. To keep it safe and enjoyable for everyone, you agree to the following rules of conduct:</p>
          
          <h3>4.1 Prohibited Content</h3>
          <p>You may not upload, post, share, or otherwise distribute content that:</p>
          <ul>
            <li>Is illegal under applicable law, including but not limited to content that violates intellectual property rights, export controls, or sanctions.</li>
            <li>Depicts, promotes, or facilitates child sexual abuse material (CSAM) or the exploitation of minors in any form. This is a zero-tolerance policy resulting in immediate permanent ban and reporting to relevant authorities.</li>
            <li>Contains non-consensual intimate imagery (sometimes called "revenge porn"), including AI-generated intimate depictions of real people without their consent.</li>
            <li>Promotes violence, terrorism, or physical harm against any individual or group.</li>
            <li>Constitutes hate speech — content that attacks, demeans, or incites violence against individuals or groups based on race, ethnicity, nationality, religion, gender, gender identity, sexual orientation, disability, or other protected characteristics.</li>
            <li>Is fraudulent, deceptive, or misleading, including scams, phishing attempts, or impersonation of others.</li>
            <li>Contains malware, viruses, or harmful code.</li>
            <li>Is spam or unsolicited promotional material.</li>
            <li>Violates OpenAI's Usage Policies or the usage policies of other AI model providers whose outputs are shared on the Platform.</li>
            <li>Is otherwise harmful, abusive, harassing, threatening, or objectionable as determined by us in our sole discretion.</li>
          </ul>

          <h3>4.2 Prohibited Behavior</h3>
          <p>You may not:</p>
          <ul>
            <li>Harass, bully, stalk, intimidate, or threaten other users.</li>
            <li>Manipulate engagement metrics through bots, scripts, fake accounts, or coordinated inauthentic behavior.</li>
            <li>Scrape, crawl, or automatically collect data from the Platform without our prior written consent.</li>
            <li>Reverse-engineer, decompile, or attempt to extract the source code of the Platform.</li>
            <li>Interfere with or disrupt the Platform's infrastructure, servers, or networks.</li>
            <li>Circumvent or disable any content moderation, security, or access control features.</li>
            <li>Use the Platform for any commercial purpose not expressly authorized by us (e.g., unauthorized advertising, selling access to scraped data).</li>
            <li>Impersonate any person or entity, or falsely claim an affiliation with any person or entity.</li>
          </ul>

          <h3>4.3 Community Interactions (Comments, Likes, Saves, Shares)</h3>
          <p>When engaging with other users' content through comments, likes, saves, shares, and follows:</p>
          <ul>
            <li><strong>Be respectful.</strong> Disagreement is fine; personal attacks are not.</li>
            <li><strong>Stay on topic.</strong> Comments should be relevant to the content they are posted on.</li>
            <li><strong>No spam.</strong> Do not post repetitive, irrelevant, or promotional comments.</li>
            <li><strong>No harassment in comments.</strong> Targeting a user with hostile, derogatory, or threatening comments across multiple posts constitutes harassment and will result in enforcement action.</li>
            <li><strong>Engagement must be genuine.</strong> Artificially inflating likes, saves, or follows through coordinated schemes or automated tools is prohibited.</li>
          </ul>

          <h3>4.4 Reporting</h3>
          <p>We provide an active reporting feature that allows any user to report content or other users that violate these Terms. We take reports seriously and will review them promptly. To file a report:</p>
          <ul>
            <li>Use the report button available on posts, comments, and user profiles.</li>
            <li>Provide as much detail as possible about the violation.</li>
          </ul>
          <p>We will not disclose the identity of the reporting user to the reported party. Filing false or malicious reports repeatedly is itself a violation of these Terms.</p>
        </section>

        <section>
          <h2>5. Content Moderation & Enforcement</h2>
          
          <h3>5.1 Automated Moderation</h3>
          <p>We use OpenAI's moderation API to automatically scan uploaded images, prompts, and text content for potentially harmful or policy-violating material. Content flagged by the moderation system may be:</p>
          <ul>
            <li>Automatically blocked from being published.</li>
            <li>Queued for manual review by our team.</li>
            <li>Removed after review.</li>
          </ul>
          <p>No automated system is perfect. If you believe your content was wrongly flagged or removed, you may contact us at contact@getolin.xyz to request a review.</p>

          <h3>5.2 Our Enforcement Rights</h3>
          <p>We reserve the right, at our sole discretion and without prior notice, to:</p>
          <ul>
            <li>Remove or disable access to any content that violates these Terms.</li>
            <li>Issue warnings to users who violate these Terms.</li>
            <li>Temporarily suspend accounts that engage in violations.</li>
            <li>Permanently ban accounts that engage in severe or repeated violations.</li>
            <li>Report illegal activity to law enforcement authorities.</li>
          </ul>
          <p>We are not obligated to provide advance notice or a detailed explanation before taking enforcement action, although we will make reasonable efforts to inform affected users when appropriate.</p>

          <h3>5.3 Appeals</h3>
          <p>If you believe enforcement action was taken against your account or content in error, you may submit an appeal by contacting us at contact@getolin.xyz within 14 days of the action. We will review appeals in good faith but are not obligated to reverse any decision.</p>
        </section>

        <section>
          <h2>6. Content Ownership & Licensing</h2>
          
          <h3>6.1 Your Ownership</h3>
          <p>You retain ownership of the original prompts, AI-generated images, configurations, and other content you upload to Olin's Prompt List, subject to:</p>
          <ul>
            <li>Any rights held by the AI model providers whose tools generated the content (e.g., rights under the terms of service of Midjourney, Stable Diffusion, DALL·E, or other tools you used).</li>
            <li>The license you grant to us below.</li>
          </ul>
          <p>You are solely responsible for ensuring you have the right to upload and share any content you post. If a third-party AI model provider's terms restrict how you can use or share generated outputs, it is your responsibility to comply with those terms.</p>

          <h3>6.2 License You Grant to Olin's Prompt List</h3>
          <p>By uploading content to the Platform, you grant Olin's Prompt List a worldwide, non-exclusive, royalty-free, sublicensable, and transferable license to use, reproduce, display, distribute, modify (for formatting and display purposes), and promote your content in connection with operating, developing, and marketing the Platform.</p>
          <p>This license allows us to:</p>
          <ul>
            <li>Display your content on the Platform, including in search results, feeds, and curated collections.</li>
            <li>Feature your content in promotional materials for the Platform (e.g., social media posts, newsletters, advertisements showcasing the Platform).</li>
            <li>Create thumbnails, previews, and format adaptations of your content for display across different devices and interfaces.</li>
            <li>Cache and distribute your content through our content delivery networks (CDNs).</li>
          </ul>
          <p>This license continues for as long as your content remains on the Platform. If you delete specific content, the license for that content terminates within a commercially reasonable time, except where it has been shared by other users, cached by third-party services, or is required for legal compliance.</p>

          <h3>6.3 Public Nature of Shared Content</h3>
          <p>By uploading prompts and images to Olin's Prompt List, you understand and agree that:</p>
          <ul>
            <li>Your prompts are publicly visible and copyable by other users. This is a fundamental feature of the Platform.</li>
            <li>Other users may use, adapt, and build upon your prompts to generate their own AI art. We do not control or take responsibility for how others use prompts they discover on the Platform.</li>
            <li>Your content may appear in search engine results and be accessible to non-registered visitors.</li>
          </ul>
          <p>If you do not want a prompt or image to be publicly accessible, do not upload it to the Platform.</p>

          <h3>6.4 Feedback</h3>
          <p>Any feedback, suggestions, or ideas you provide to us about the Platform may be used by us without any obligation to you. You assign to us all rights in such feedback.</p>
        </section>

        <section>
          <h2>7. Intellectual Property</h2>
          
          <h3>7.1 Platform Intellectual Property</h3>
          <p>The Platform itself — including its design, layout, logos, branding ("Olin's Prompt List"), code, features, and documentation — is owned by us and protected by intellectual property laws. These Terms do not grant you any right to use our trademarks, logos, or branding without our prior written consent.</p>

          <h3>7.2 Copyright Complaints (DMCA)</h3>
          <p>We respect intellectual property rights. If you believe content on the Platform infringes your copyright, you may submit a takedown notice to: <strong>contact@getolin.xyz</strong></p>
          <p>Your notice must include:</p>
          <ul>
            <li>Identification of the copyrighted work you claim is infringed.</li>
            <li>Identification of the material on the Platform that you claim is infringing, with sufficient information to locate it.</li>
            <li>Your contact information (name, address, email, phone number).</li>
            <li>A statement that you have a good faith belief that the use is not authorized by the copyright owner, its agent, or the law.</li>
            <li>A statement under penalty of perjury that the information in your notice is accurate and that you are the copyright owner or authorized to act on their behalf.</li>
            <li>Your physical or electronic signature.</li>
          </ul>
          <p>We will respond to valid DMCA notices in accordance with applicable law, which may include removing or disabling access to the allegedly infringing content and notifying the uploader.</p>
        </section>

        <section>
          <h2>8. AI Generation Disclaimer</h2>
          <p>Olin's Prompt List is a platform for discovering, sharing, and curating AI-generated content. We do not generate AI art ourselves.</p>
          <p>Please understand:</p>
          <ul>
            <li><strong>We are not responsible for AI outputs.</strong> The prompts shared on our Platform are created by users and intended for use with third-party AI models (such as Midjourney, Stable Diffusion, DALL·E, Flux, and others). We have no control over and accept no responsibility for the images, text, or other outputs generated by these third-party AI models when users apply prompts found on our Platform.</li>
            <li><strong>Results will vary.</strong> The same prompt may produce different results depending on the AI model, version, settings, and random seed used. We do not guarantee that any prompt will produce a specific output.</li>
            <li><strong>Third-party AI terms apply.</strong> Your use of any third-party AI tool is governed by that tool's own terms of service and usage policies. It is your responsibility to comply with those terms.</li>
            <li><strong>No endorsement.</strong> The presence of a prompt on our Platform does not constitute an endorsement of the prompt's content or the outputs it may generate. Users upload and share prompts at their own discretion.</li>
            <li><strong>Accuracy not guaranteed.</strong> We do not verify the accuracy, completeness, or effectiveness of prompts or configurations shared by users. Use them at your own risk.</li>
          </ul>
        </section>

        <section>
          <h2>9. Disclaimer of Warranties</h2>
          <p>THE PLATFORM IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED, OR STATUTORY.</p>
          <p>To the fullest extent permitted by applicable law, we disclaim all warranties, including but not limited to:</p>
          <ul>
            <li>Implied warranties of merchantability, fitness for a particular purpose, and non-infringement.</li>
            <li>Any warranty that the Platform will be uninterrupted, error-free, secure, or free of viruses or harmful components.</li>
            <li>Any warranty regarding the accuracy, reliability, or completeness of content on the Platform, including user-generated prompts, images, configurations, and engagement metrics.</li>
            <li>Any warranty that the Platform will meet your specific requirements or expectations.</li>
          </ul>
          <p>Some jurisdictions do not allow the exclusion of certain warranties. In such jurisdictions, the above exclusions apply only to the extent permitted by law.</p>
        </section>

        <section>
          <h2>10. Limitation of Liability</h2>
          <p>TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, OLIN'S PROMPT LIST, ITS OWNERS, OPERATORS, AFFILIATES, OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, AND LICENSORS SHALL NOT BE LIABLE FOR:</p>
          <ul>
            <li>Any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, goodwill, or other intangible losses.</li>
            <li>Damages arising from:
              <ul>
                <li>Your use of or inability to use the Platform.</li>
                <li>Any unauthorized access to or alteration of your data or content.</li>
                <li>Content or conduct of any third party on the Platform.</li>
                <li>Any content you upload, share, or make available through the Platform.</li>
                <li>Platform downtime, outages, or technical failures.</li>
                <li>Disputes between users.</li>
                <li>Actions taken by third-party AI models using prompts found on the Platform.</li>
              </ul>
            </li>
          </ul>
          <p>IN NO EVENT SHALL OUR TOTAL AGGREGATE LIABILITY TO YOU FOR ALL CLAIMS ARISING OUT OF OR RELATED TO THESE TERMS OR THE PLATFORM EXCEED THE GREATER OF (A) THE AMOUNT YOU PAID US, IF ANY, IN THE 12 MONTHS PRECEDING THE CLAIM, OR (B) ONE HUNDRED U.S. DOLLARS ($100.00).</p>
          <p>Some jurisdictions do not allow the limitation or exclusion of liability for certain types of damages. In such jurisdictions, our liability is limited to the fullest extent permitted by law.</p>
        </section>

        <section>
          <h2>11. Indemnification</h2>
          <p>You agree to indemnify, defend, and hold harmless Olin's Prompt List, its owners, operators, affiliates, officers, directors, employees, agents, and licensors from and against any and all claims, damages, losses, liabilities, costs, and expenses (including reasonable attorneys' fees) arising out of or related to:</p>
          <ul>
            <li>Your use of the Platform.</li>
            <li>Your violation of these Terms.</li>
            <li>Content you upload, post, or share on the Platform.</li>
            <li>Your violation of any third party's rights, including intellectual property rights.</li>
            <li>Your violation of any applicable law or regulation.</li>
          </ul>
        </section>

        <section>
          <h2>12. Third-Party Links & Services</h2>
          <p>The Platform may contain links to third-party websites, tools, or services (including AI model providers). We do not control, endorse, or assume responsibility for any third-party content, products, or services. Your use of third-party services is at your own risk and subject to those third parties' terms and policies.</p>
        </section>

        <section>
          <h2>13. Modifications to the Platform</h2>
          <p>We reserve the right to modify, suspend, or discontinue the Platform (or any feature or part thereof) at any time, with or without notice. We will not be liable to you or any third party for any modification, suspension, or discontinuation of the Platform.</p>
        </section>

        <section>
          <h2>14. Changes to These Terms</h2>
          <p>We may update these Terms from time to time. When we make material changes:</p>
          <ul>
            <li>We will update the "Last Updated" date at the top of this page.</li>
            <li>We will provide a prominent notice on the Platform (e.g., a banner or pop-up notification).</li>
            <li>For significant changes, we may send a notification to the email address associated with your account.</li>
          </ul>
          <p>Your continued use of the Platform after updated Terms take effect constitutes your acceptance of the revised Terms. If you do not agree to the updated Terms, you must stop using the Platform and may request account deletion.</p>
        </section>

        <section>
          <h2>15. Termination</h2>
          <h3>15.1 Termination by You</h3>
          <p>You may stop using the Platform at any time. You may request account deletion by contacting us at contact@getolin.xyz or through your account settings.</p>
          
          <h3>15.2 Termination by Us</h3>
          <p>We may suspend or terminate your account at any time, for any reason, including but not limited to:</p>
          <ul>
            <li>Violation of these Terms or our community guidelines.</li>
            <li>Conduct that we believe is harmful to other users, the Platform, or third parties.</li>
            <li>Extended periods of inactivity.</li>
            <li>Legal or regulatory requirements.</li>
          </ul>

          <h3>15.3 Effect of Termination</h3>
          <p>Upon termination:</p>
          <ul>
            <li>Your right to access and use the Platform ceases immediately.</li>
            <li>We may delete your account data in accordance with our Privacy Policy.</li>
            <li>Sections of these Terms that by their nature should survive termination will survive.</li>
          </ul>
        </section>

        <section>
          <h2>16. Governing Law & Dispute Resolution</h2>
          <h3>16.1 Governing Law</h3>
          <p>These Terms are governed by and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.</p>
          
          <h3>16.2 Dispute Resolution</h3>
          <p>We encourage you to contact us first at contact@getolin.xyz to resolve any dispute informally. If a dispute cannot be resolved informally within 30 days, the following applies:</p>
          <ul>
            <li><strong>For users in the United States:</strong> Any dispute arising out of or relating to these Terms or the Platform shall be resolved through binding arbitration administered by the American Arbitration Association (AAA) under its applicable rules, rather than in court. You agree to waive your right to a jury trial and to participate in a class action.</li>
            <li><strong>For users outside the United States:</strong> Disputes shall be submitted to the exclusive jurisdiction of the competent courts, unless applicable local law requires a different forum.</li>
          </ul>

          <h3>16.3 Class Action Waiver</h3>
          <p>To the fullest extent permitted by law, you agree that any dispute resolution proceedings will be conducted only on an individual basis and not in a class, consolidated, or representative action. If this class action waiver is found to be unenforceable, then the entirety of the arbitration provision shall be null and void.</p>
        </section>

        <section>
          <h2>17. General Provisions</h2>
          <ul>
            <li><strong>Entire Agreement:</strong> These Terms, together with our Privacy Policy, constitute the entire agreement between you and Olin's Prompt List regarding your use of the Platform.</li>
            <li><strong>Severability:</strong> If any provision of these Terms is found to be invalid or unenforceable, that provision will be enforced to the maximum extent permissible, and the remaining provisions will remain in full force and effect.</li>
            <li><strong>Waiver:</strong> Our failure to enforce any right or provision of these Terms does not constitute a waiver of that right or provision.</li>
            <li><strong>Assignment:</strong> You may not assign or transfer your rights or obligations under these Terms without our prior written consent. We may assign our rights and obligations without restriction.</li>
            <li><strong>No Agency:</strong> Nothing in these Terms creates a partnership, joint venture, employment, or agency relationship between you and Olin's Prompt List.</li>
            <li><strong>Force Majeure:</strong> We will not be liable for any failure or delay in performing our obligations under these Terms due to events beyond our reasonable control, including natural disasters, war, terrorism, pandemics, government actions, or internet or infrastructure failures.</li>
            <li><strong>Headings:</strong> Section headings are for convenience only and do not affect the interpretation of these Terms.</li>
          </ul>
        </section>

        <section>
          <h2>18. Contact Us</h2>
          <p>If you have any questions about these Terms of Service, please contact us at:</p>
          <p>
            📧 <strong>contact@getolin.xyz</strong><br/>
            🌐 <strong>getolin.xyz</strong>
          </p>
          <p>By using Olin's Prompt List, you acknowledge that you have read, understood, and agree to be bound by both this Terms of Service and our <a href="/privacy">Privacy Policy</a>.</p>
        </section>
      </div>
    </div>
  );
}
