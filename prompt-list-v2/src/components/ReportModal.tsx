import React, { useState } from 'react';
import styles from './FeedbackModal.module.css';
import { useAuth } from '@/context/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Flag, X, Loader2, CheckCircle2 } from 'lucide-react';
import { PromptPost } from '@/lib/mockData';
import toast from 'react-hot-toast';

interface ReportModalProps {
  post: PromptPost;
  onClose: () => void;
}

export default function ReportModal({ post, onClose }: ReportModalProps) {
  const { user, profile, signInWithGoogle } = useAuth();
  const [reasonCategory, setReasonCategory] = useState('Inappropriate / Sensitive Content');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please sign in to submit community reports.");
      return;
    }

    setIsSubmitting(true);
    try {
      const finalReason = description.trim() 
        ? `${reasonCategory} — ${description.trim()}` 
        : reasonCategory;

      const postRef = doc(db, 'posts', post.id);
      await updateDoc(postRef, {
        isFlagged: true,
        flagSource: 'user',
        flaggedReason: `Reported by @${profile?.username || user.displayName || 'community-user'}: ${finalReason}`
      });

      setIsSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1600);
    } catch (err: any) {
      toast.error(`Error submitting report: ${err.message}`);
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.modalBackdrop} onClick={onClose} style={{ zIndex: 9999 }}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <header className={styles.header}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 500, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', letterSpacing: 'normal', color: 'var(--text-primary)' }}>
            <Flag size={20} />
            Report Community Violation
          </h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </header>

        {!user ? (
          <div className={styles.formBody} style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>You must be signed in with Google to flag artwork and report violations.</p>
            <button type="button" className="btn-solid" onClick={signInWithGoogle}>
              Sign In with Google
            </button>
          </div>
        ) : isSuccess ? (
          <div className={styles.formBody} style={{ textAlign: 'center', padding: '2.5rem 1.5rem', color: '#10b981' }}>
            <CheckCircle2 size={40} style={{ margin: '0 auto 0.5rem' }} />
            <strong style={{ fontSize: '1.1rem', display: 'block' }}>Report Submitted Successfully!</strong>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.5rem', lineHeight: 1.5 }}>
              Thank you for helping keep our creator community safe! This artwork has been queued for immediate inspection by our Superadmin moderation team.
            </p>
          </div>
        ) : (
          <form className={styles.formBody} onSubmit={handleSubmit}>
            <div style={{ background: 'var(--bg-tertiary)', padding: '0.75rem 1rem', borderRadius: '4px', fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '1rem', border: '1px solid var(--border-color)' }}>
              Reporting artwork: <strong style={{ color: 'var(--text-primary)' }}>"{post.title}"</strong> by @{post.creator.username}
            </div>

            <div className={styles.fieldGroup}>
              <label>Violation Category</label>
              <select value={reasonCategory} onChange={e => setReasonCategory(e.target.value)}>
                <option value="Inappropriate / Sensitive Content">Inappropriate / Sensitive Content</option>
                <option value="Copyright / Intellectual Property">Copyright / Intellectual Property</option>
                <option value="Spam / Scam / Low Quality">Spam / Scam / Low Quality</option>
                <option value="Hate Speech / Harassment">Hate Speech / Harassment</option>
                <option value="Other Guidelines Violation">Other Guidelines Violation</option>
              </select>
            </div>

            <div className={styles.fieldGroup}>
              <label>Additional Details (Optional)</label>
              <textarea 
                rows={3} 
                placeholder="Please describe why this post violates community standards..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                maxLength={500}
              />
              {description.length >= 500 && (
                <span style={{ fontSize: '0.75rem', color: '#f43f5e', marginTop: '0.25rem', display: 'block' }}>Character limit reached (500/500)</span>
              )}
            </div>

            <button type="submit" className={`btn-solid ${styles.submitBtn}`} disabled={isSubmitting} style={{ background: '#dc2626', color: '#fff', border: 'none' }}>
              {isSubmitting ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : (
                <>
                  <Flag size={16} /> Submit Report to Admin
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
