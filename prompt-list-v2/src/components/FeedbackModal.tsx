import React, { useState } from 'react';
import GoogleSignInButton from '@/components/GoogleSignInButton';
import styles from './FeedbackModal.module.css';
import { useAuth } from '@/context/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MessageSquarePlus, X, Send, Loader2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface FeedbackModalProps {
  onClose: () => void;
}

export default function FeedbackModal({ onClose }: FeedbackModalProps) {
  const { user, profile } = useAuth();
  const [subject, setSubject] = useState('Bug Report');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please sign in to submit support requests.");
      return;
    }
    if (!description.trim()) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'support_tickets'), {
        uid: user.uid,
        authorName: profile?.displayName || user.displayName || 'User',
        authorEmail: profile?.email || user.email || 'No email',
        subject,
        description: description.trim(),
        status: 'open',
        adminResponse: null,
        createdAt: serverTimestamp()
      });
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      toast.error(`Error submitting feedback: ${err.message}`);
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <header className={styles.header}>
          <h3>
            <MessageSquarePlus size={20} style={{ color: 'var(--accent-color)' }} />
            <span>Submit Feedback &amp; Support</span>
          </h3>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </header>

        {!user ? (
          <div className={styles.formBody} style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>You must be signed in with Google to file support tickets and bug reports.</p>
            <GoogleSignInButton />
          </div>
        ) : isSuccess ? (
          <div className={styles.formBody} style={{ textAlign: 'center', padding: '2.5rem 1.5rem', color: '#10b981' }}>
            <CheckCircle2 size={40} style={{ margin: '0 auto 0.5rem' }} />
            <strong style={{ fontSize: '1.1rem' }}>Ticket Created Successfully!</strong>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Our admin team will review your ticket and reply directly to your Notification Bell.</p>
          </div>
        ) : (
          <form className={styles.formBody} onSubmit={handleSubmit}>
            <div className={styles.fieldGroup}>
              <label>Ticket Type / Subject</label>
              <select value={subject} onChange={e => setSubject(e.target.value)}>
                <option value="Bug Report">Bug Report</option>
                <option value="Feature Suggestion">Feature Suggestion</option>
                <option value="Monetization Question">Monetization &amp; Subscriptions Question</option>
                <option value="Flagged Appeal">Appeal Flagged Artwork</option>
                <option value="Other Support">Other Support</option>
              </select>
            </div>

            <div className={styles.fieldGroup}>
              <label>Detailed Description</label>
              <textarea 
                rows={4} 
                placeholder="Please describe the issue or suggestion in detail..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                maxLength={1000}
                required
              />
              {description.length >= 1000 && (
                <span style={{ fontSize: '0.75rem', color: '#f43f5e', marginTop: '0.25rem', display: 'block' }}>Character limit reached (1000/1000)</span>
              )}
            </div>

            <button type="submit" className={`btn-solid ${styles.submitBtn}`} disabled={isSubmitting || !description.trim()}>
              {isSubmitting ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={18} />}
              <span>Submit Ticket to Admin</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
