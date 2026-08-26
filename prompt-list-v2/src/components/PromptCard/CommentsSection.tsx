import React from 'react';
import { X, Send, Heart, MessageCircle, Flag, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CommentItem } from '@/hooks/useComments';
import styles from './PromptCard.module.css';
import { Loader2 } from 'lucide-react';

export interface CommentsSectionProps {
  postId: string;
  user: any;
  profile: any;
  comments: CommentItem[];
  newComment: string;
  setNewComment: (val: string) => void;
  isSubmitting: boolean;
  commentError: string | null;
  handleSubmitComment: (e: React.FormEvent) => void;
  handleLikeComment: (id: string) => void;
  handleReportComment: (id: string) => void;
  handleDeleteComment: (id: string) => void;
  activeReplyId: string | null;
  activeReplyName: string | null;
  setActiveReplyId: (id: string | null) => void;
  setActiveReplyName: (name: string | null) => void;
  expandedReplies: Record<string, boolean>;
  toggleReplies: (id: string) => void;
  onClose: () => void;
}

export default function CommentsSection(props: CommentsSectionProps) {
  const {
    user, profile, comments, newComment, setNewComment, isSubmitting: isSubmittingComment, commentError,
    handleSubmitComment, handleLikeComment, handleReportComment, handleDeleteComment,
    activeReplyId, activeReplyName, setActiveReplyId, setActiveReplyName,
    expandedReplies, toggleReplies, onClose
  } = props;

  return (
    <div className={styles.commentsModalOverlay} onClick={() => onClose()}>
          <div className={styles.commentsModalContainer} onClick={e => e.stopPropagation()}>
            <div className={styles.commentsModalHeader}>
              <h3>Comments</h3>
              <button onClick={() => onClose()}><X size={20} /></button>
            </div>
            <div className={styles.commentsModalBody}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
              <div >
                
                {commentError && (
                  <div style={{ padding: '0.5rem 0.75rem', backgroundColor: 'rgba(244,63,94,0.1)', color: '#f43f5e', borderRadius: '6px', fontSize: '0.8rem' }}>
                    {commentError}
                  </div>
                )}

                <form onSubmit={handleSubmitComment} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {activeReplyId && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-secondary)', padding: '0.4rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      <span>Replying to <strong style={{ color: 'var(--text-primary)' }}>{activeReplyName}</strong></span>
                      <button type="button" onClick={() => { setActiveReplyId(null); setActiveReplyName(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={14} /></button>
                    </div>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input 
                        type="text" 
                        placeholder={user ? "Write a comment..." : "Sign in to comment..."} 
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                        disabled={isSubmittingComment}
                        maxLength={280}
                        style={{ flex: 1, padding: '0.5rem 0.2rem', borderRadius: '0px', border: 'none', borderBottom: 'none', backgroundColor: 'transparent', color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none', fontWeight: 500, transition: 'border-color 0.2s' }}
                        onFocus={(e) => e.currentTarget.style.borderBottomColor = 'var(--text-primary)'}
                        onBlur={(e) => e.currentTarget.style.borderBottomColor = 'var(--border-color)'}
                      />
                      <button type="submit" className="btn-outline" disabled={isSubmittingComment || !newComment.trim()} style={{ padding: '0.5rem 1rem', borderRadius: '0px', border: 'none', color: 'var(--text-secondary)' }}>
                        {isSubmittingComment ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={14} />}
                      </button>
                    </div>
                    {newComment.length >= 280 && (
                      <span style={{ fontSize: '0.75rem', color: '#f43f5e', marginTop: '0.25rem' }}>Character limit reached (280/280)</span>
                    )}
                  </div>
                </form>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  {comments.length === 0 ? (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>No comments yet.</span>
                  ) : (
                    comments.filter(c => !c.parentId).map(c => {
                      const replies = comments.filter(r => r.parentId === c.id);
                      const isExpanded = expandedReplies[c.id];
                      return (
                        <div key={c.id} style={{ display: 'flex', flexDirection: 'column', borderBottom: 'none', paddingBottom: '0.8rem' }}>
                          <div style={{ display: 'flex', gap: '0.6rem', paddingTop: '0.8rem', backgroundColor: 'transparent' }}>
                            <img src={(c.userId === user?.uid || c.authorName === profile?.username || c.authorName === profile?.displayName) ? (profile?.avatarUrl || user?.photoURL || c.authorAvatar) : c.authorAvatar} alt={c.authorName} style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover' }} />
                            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Link to={`/creator/${c.authorName}`} className={styles.profileLink}>
                                  <strong style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 500 }}>{c.authorName}</strong>
                                </Link>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{c.createdAt}</span>
                              </div>
                              <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '0.1rem', fontWeight: 400 }}>{c.text}</span>
                              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', alignItems: 'center' }}>
                                <button onClick={() => handleLikeComment(c.id)} className={`${styles.commentActionBtn} ${styles.commentLikeBtn}`} style={{ color: c.likedBy?.includes(user?.uid || '') ? '#ef4444' : undefined }} title="Like">
                                  <Heart size={14} fill={c.likedBy?.includes(user?.uid || '') ? '#ef4444' : 'none'} />
                                  {c.likesCount > 0 && <span>{c.likesCount}</span>}
                                </button>
                                <button onClick={() => { setActiveReplyId(c.id); setActiveReplyName(c.authorName); }} className={`${styles.commentActionBtn} ${styles.commentReplyBtn}`} title="Reply">
                                  <MessageCircle size={14} />
                                </button>
                                <button onClick={() => handleReportComment(c.id)} className={`${styles.commentActionBtn} ${styles.commentReportBtn}`} title="Report">
                                  <Flag size={14} />
                                </button>
                                {c.userId && user?.uid === c.userId && (
                                  <button onClick={() => handleDeleteComment(c.id)} className={`${styles.commentActionBtn} ${styles.commentDeleteBtn}`} title="Delete">
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>

                          {replies.length > 0 && (
                            <button onClick={() => toggleReplies(c.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '0.75rem', paddingLeft: '3.1rem', marginTop: '0.5rem', alignSelf: 'flex-start' }}>
                              <div style={{ width: '16px', height: '1px', backgroundColor: 'var(--border-color)', marginRight: '0.5rem' }}></div>
                              {isExpanded ? 'Hide replies' : `View ${replies.length} replies`}
                            </button>
                          )}

                          {isExpanded && replies.length > 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', paddingLeft: '3.1rem' }}>
                              {replies.map(reply => (
                                <div key={reply.id} style={{ display: 'flex', gap: '0.6rem', paddingTop: '0.8rem', backgroundColor: 'transparent' }}>
                                  <img src={(reply.userId === user?.uid || reply.authorName === profile?.username || reply.authorName === profile?.displayName) ? (profile?.avatarUrl || user?.photoURL || reply.authorAvatar) : reply.authorAvatar} alt={reply.authorName} style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover' }} />
                                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                      <Link to={`/creator/${reply.authorName}`} className={styles.profileLink}>
                                        <strong style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 500 }}>{reply.authorName}</strong>
                                      </Link>
                                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{reply.createdAt}</span>
                                    </div>
                                    <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '0.1rem', fontWeight: 400 }}>{reply.text}</span>
                                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', alignItems: 'center' }}>
                                      <button onClick={() => handleLikeComment(reply.id)} className={`${styles.commentActionBtn} ${styles.commentLikeBtn}`} style={{ color: reply.likedBy?.includes(user?.uid || '') ? '#ef4444' : undefined }} title="Like">
                                        <Heart size={14} fill={reply.likedBy?.includes(user?.uid || '') ? '#ef4444' : 'none'} />
                                        {reply.likesCount > 0 && <span>{reply.likesCount}</span>}
                                      </button>
                                      <button onClick={() => { setActiveReplyId(c.id); setActiveReplyName(reply.authorName); }} className={`${styles.commentActionBtn} ${styles.commentReplyBtn}`} title="Reply">
                                        <MessageCircle size={14} />
                                      </button>
                                      <button onClick={() => handleReportComment(reply.id)} className={`${styles.commentActionBtn} ${styles.commentReportBtn}`} title="Report">
                                        <Flag size={14} />
                                      </button>
                                      {reply.userId && user?.uid === reply.userId && (
                                        <button onClick={() => handleDeleteComment(reply.id)} className={`${styles.commentActionBtn} ${styles.commentDeleteBtn}`} title="Delete">
                                          <Trash2 size={14} />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
              </div>
            </div>
          </div>
        </div>
  );
}
