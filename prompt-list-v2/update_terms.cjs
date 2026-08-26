const fs = require('fs');
let code = fs.readFileSync('src/pages/TermsPage.tsx', 'utf8');

// Insert new section before Section 8
const newSection = `<section>
          <h2>8. Monetization & Payouts</h2>
          
          <h3>8.1 No Guaranteed Earnings</h3>
          <p>The Platform makes no guarantees regarding potential earnings or ad revenue. User monetization is subject to change at our sole discretion.</p>
          
          <h3>8.2 Ad Revenue Pool Contingency</h3>
          <p>Ad-supported payouts (requiring a minimum of 1,000 views) are strictly contingent upon the Platform receiving successful disbursements from our advertising partners. If a partner defaults or withholds revenue, we reserve the right to void corresponding creator payouts.</p>
          
          <h3>8.3 Paid Prompts & Fees</h3>
          <p>Creators retain 100% of their set price for Paid Prompts, less mandatory payment processing fees levied by our merchant of record (Whop). A minimum threshold of $5.00 must be met before withdrawal.</p>
          
          <h3>8.4 Tax Liability</h3>
          <p>Creators act as independent contractors and are solely responsible for reporting and remitting any applicable taxes on their earnings.</p>
          
          <h3>8.5 Anti-Fraud & Clawbacks</h3>
          <p>Any attempt to manipulate views or engagement using bots or coordinated inauthentic behavior will result in an immediate, permanent ban and the total forfeiture of all pending earnings.</p>
        </section>

        <section>
          <h2>9. AI Generation Disclaimer</h2>`;

code = code.replace(/<section>\r?\n\s*<h2>8\. AI Generation Disclaimer<\/h2>/, newSection);

// Re-number subsequent sections (9 through 19)
const numbersToShift = [
  { old: '9. Disclaimer of Warranties', new: '10. Disclaimer of Warranties' },
  { old: '10. Limitation of Liability', new: '11. Limitation of Liability' },
  { old: '11. Indemnification', new: '12. Indemnification' },
  { old: '12. Third-Party Links & Services', new: '13. Third-Party Links & Services' },
  { old: '13. Modifications to the Platform', new: '14. Modifications to the Platform' },
  { old: '14. Changes to These Terms', new: '15. Changes to These Terms' },
  { old: '15. Termination', new: '16. Termination' },
  { old: '16. Governing Law & Dispute Resolution', new: '17. Governing Law & Dispute Resolution' },
  { old: '17. General Provisions', new: '18. General Provisions' },
  { old: '18. Contact Us', new: '19. Contact Us' },
];

for (const pair of numbersToShift) {
  code = code.replace(`<h2>${pair.old}</h2>`, `<h2>${pair.new}</h2>`);
}

fs.writeFileSync('src/pages/TermsPage.tsx', code);
console.log("Updated Terms of Service");
