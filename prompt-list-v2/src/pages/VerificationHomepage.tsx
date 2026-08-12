import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './VerificationHomepage.module.css';

export default function VerificationHomepage() {
  useEffect(() => {
    // Explicitly update the document title for this page just in case
    document.title = "Olin's Prompt List - Homepage";
  }, []);

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.title}>Olin's Prompt List</h1>
      <p className={styles.subtitle}>
        Olin's Prompt List is a curated marketplace and gallery for creators to discover, copy, and share AI art prompts.
      </p>

      <div className={styles.actionSection}>
        <Link to="/" className={styles.btnPrimary}>
          Enter Discovery Feed
        </Link>
      </div>

      <div className={styles.infoCard}>
        <h2 className={styles.infoTitle}>About Olin's Prompt List</h2>
        <p className={styles.infoText}>
          Welcome to Olin's Prompt List. This application serves as a dedicated platform where AI artists and enthusiasts can explore a vast, curated gallery of AI-generated art.
        </p>
        <p className={styles.infoText}>
          <strong>Our Core Purpose:</strong> We provide a curated marketplace and gallery designed specifically for creators to easily discover high-quality AI images, copy the exact prompts and parameters used to create them, and share their own AI art prompts with the community. 
        </p>
        <p className={styles.infoText}>
          To fully utilize the platform's features—such as uploading your own prompts, liking artwork, and saving items to your personal collection—users must authenticate using their Google Account.
        </p>
      </div>

      <div className={styles.infoLinks}>
        <Link to="/privacy" className={styles.link}>Privacy Policy</Link>
        <Link to="/terms" className={styles.link}>Terms of Service</Link>
        <a href="mailto:wisecrafts81@gmail.com" className={styles.link}>Contact Support</a>
      </div>
    </div>
  );
}
