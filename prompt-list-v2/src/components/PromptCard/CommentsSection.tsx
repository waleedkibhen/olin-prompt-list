import React, { useRef, useEffect } from 'react';
import { X, Heart, MessageCircle, Flag, Trash2, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CommentItem } from '@/hooks/useComments';
import styles from './CommentsSection.module.css';

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

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeReplyId && inputRef.current) {
      inputRef.current.focus();
    }
  }, [activeReplyId]);

  const currentUserAvatar = profile?.avatarUrl || user?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContainer} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Comments</h3>
          <button 
            type="button" 
            onClick={onClose} 
            className={styles.closeButton}
            aria-label="Close comments"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Comments List */}
        <div className={styles.modalBody}>
          {comments.length === 0 ? (
            <div className={styles.emptyComments}>
              <span>No comments yet.</span>
              <span style={{ fontSize: '0.78rem', color: '#52525b' }}>Start the conversation!</span>
            </div>
          ) : (
            comments.filter(c => !c.parentId).map(c => {
              const replies = comments.filter(r => r.parentId === c.id);
              const isExpanded = expandedReplies[c.id];
              const isCommentOwner = Boolean(user && (user.uid === c.userId));
              const isLiked = Boolean(user && c.likedBy?.includes(user.uid));
              const avatarSrc = (c.userId === user?.uid || c.authorName === profile?.username || c.authorName === profile?.displayName)
                ? currentUserAvatar
                : c.authorAvatar;

              return (
                <div key={c.id} className={styles.commentThread}>
                  <div className={styles.commentItem}>
                    <img 
                      src={avatarSrc} 
                      alt={c.authorName} 
                      className={styles.avatar} 
                    />
                    <div className={styles.commentContent}>
                      <div className={styles.commentMeta}>
                        <Link to={`/creator/${c.authorName}`} className={styles.authorLink}>
                          <span className={styles.authorName}>{c.authorName}</span>
                        </Link>
                        <span className={styles.timestamp}>{c.createdAt}</span>
                      </div>
                      
                      <div className={styles.commentText}>{c.text}</div>
                      
                      <div className={styles.commentActions}>
                        <button 
                          type="button"
                          onClick={() => handleLikeComment(c.id)} 
                          className={`${styles.actionBtn} ${isLiked ? styles.likedBtn : ''}`}
                          title="Like comment"
                        >
                          <Heart size={13} fill={isLiked ? "#ef4444" : "none"} />
                          {c.likesCount > 0 && <span>{c.likesCount}</span>}
                        </button>
                        <button 
                          type="button"
                          onClick={() => { setActiveReplyId(c.id); setActiveReplyName(c.authorName); }} 
                          className={styles.actionBtn}
                          title="Reply to comment"
                        >
                          <MessageCircle size={13} />
                          <span>Reply</span>
                        </button>
                        <button 
                          type="button"
                          onClick={() => handleReportComment(c.id)} 
                          className={styles.actionBtn}
                          title="Report comment"
                        >
                          <Flag size={12} />
                        </button>
                        {isCommentOwner && (
                          <button 
                            type="button"
                            onClick={() => handleDeleteComment(c.id)} 
                            className={styles.actionBtn}
                            title="Delete comment"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Replies Trigger */}
                  {replies.length > 0 && (
                    <button 
                      type="button"
                      onClick={() => toggleReplies(c.id)} 
                      className={styles.viewRepliesBtn}
                    >
                      <div className={styles.replyLine} />
                      <span>{isExpanded ? 'Hide replies' : `View ${replies.length} ${replies.length === 1 ? 'reply' : 'replies'}`}</span>
                    </button>
                  )}

                  {/* Expanded Nested Replies */}
                  {isExpanded && replies.length > 0 && (
                    <div className={styles.repliesContainer}>
                      {replies.map(reply => {
                        const isReplyOwner = Boolean(user && (user.uid === reply.userId));
                        const isReplyLiked = Boolean(user && reply.likedBy?.includes(user.uid));
                        const replyAvatarSrc = (reply.userId === user?.uid || reply.authorName === profile?.username || reply.authorName === profile?.displayName)
                          ? currentUserAvatar
                          : reply.authorAvatar;

                        return (
                          <div key={reply.id} className={styles.commentItem}>
                            <img 
                              src={replyAvatarSrc} 
                              alt={reply.authorName} 
                              className={styles.replyAvatar} 
                            />
                            <div className={styles.commentContent}>
                              <div className={styles.commentMeta}>
                                <Link to={`/creator/${reply.authorName}`} className={styles.authorLink}>
                                  <span className={styles.authorName}>{reply.authorName}</span>
                                </Link>
                                <span className={styles.timestamp}>{reply.createdAt}</span>
                              </div>

                              <div className={styles.commentText}>{reply.text}</div>

                              <div className={styles.commentActions}>
                                <button 
                                  type="button"
                                  onClick={() => handleLikeComment(reply.id)} 
                                  className={`${styles.actionBtn} ${isReplyLiked ? styles.likedBtn : ''}`}
                                  title="Like reply"
                                >
                                  <Heart size={12} fill={isReplyLiked ? "#ef4444" : "none"} />
                                  {reply.likesCount > 0 && <span>{reply.likesCount}</span>}
                                </button>
                                <button 
                                  type="button"
                                  onClick={() => { setActiveReplyId(c.id); setActiveReplyName(reply.authorName); }} 
                                  className={styles.actionBtn}
                                  title="Reply"
                                >
                                  <MessageCircle size={12} />
                                  <span>Reply</span>
                                </button>
                                <button 
                                  type="button"
                                  onClick={() => handleReportComment(reply.id)} 
                                  className={styles.actionBtn}
                                  title="Report"
                                >
                                  <Flag size={11} />
                                </button>
                                {isReplyOwner && (
                                  <button 
                                    type="button"
                                    onClick={() => handleDeleteComment(reply.id)} 
                                    className={styles.actionBtn}
                                    title="Delete"
                                  >
                                    <Trash2 size={11} />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer Fixed Input Bar */}
        <form onSubmit={handleSubmitComment} className={styles.modalFooter}>
          {commentError && (
            <div className={styles.errorBanner}>
              {commentError}
            </div>
          )}

          {activeReplyId && (
            <div className={styles.replyBanner}>
              <span>Replying to <strong>@{activeReplyName}</strong></span>
              <button 
                type="button" 
                onClick={() => { setActiveReplyId(null); setActiveReplyName(null); }} 
                className={styles.dismissReplyBtn}
                title="Cancel reply"
              >
                <X size={13} />
              </button>
            </div>
          )}

          <div className={styles.inputRow}>
            {user && (
              <img 
                src={currentUserAvatar} 
                alt="My avatar" 
                className={styles.footerAvatar} 
              />
            )}
            <div className={styles.inputWrapper}>
              <input 
                ref={inputRef}
                type="text" 
                placeholder={user ? (activeReplyId ? `Reply to @${activeReplyName}...` : "Add a comment...") : "Sign in to comment..."} 
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                disabled={isSubmittingComment}
                maxLength={280}
                className={styles.commentInput}
              />
              <button 
                type="submit" 
                className={styles.postBtn}
                disabled={isSubmittingComment || !newComment.trim()}
              >
                {isSubmittingComment ? (
                  <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                ) : (
                  'Post'
                )}
              </button>
            </div>
          </div>
          {newComment.length >= 280 && (
            <span style={{ fontSize: '0.72rem', color: '#f43f5e', textAlign: 'right' }}>Character limit reached (280/280)</span>
          )}
        </form>
      </div>
    </div>
  );
}
