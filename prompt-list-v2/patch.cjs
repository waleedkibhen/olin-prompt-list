const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard.tsx.temp', 'utf8');

// Replace the component signature
code = code.replace(
  /export default function PromptCard.*?\n/,
  import CommentsSection from './CommentsSection';\nimport { useComments } from '@/hooks/useComments';\n\nexport default function PromptModal({ post, isModalOpen, setIsModalOpen, isLiked, isSaved, likesCount, savesCount, toggleLike, toggleSave, onCloseOverride, defaultOpen }: any) {\n
);

// We don't need const [isModalOpen, setIsModalOpen] = useState(defaultOpen);
code = code.replace(/const \[isModalOpen, setIsModalOpen\] = useState\(defaultOpen\);\n?/, '');
code = code.replace(/const \[isLiked, setIsLiked\] = useState.*?;\n?/, '');
code = code.replace(/const \[isSaved, setIsSaved\] = useState.*?;\n?/, '');
code = code.replace(/const \[likesCount, setLikesCount\] = useState.*?;\n?/, '');
code = code.replace(/const \[savesCount, setSavesCount\] = useState.*?;\n?/, '');
code = code.replace(/const toggleLike = async.*?await Promise\.all\(\[postUpdate, userUpdate\]\)\.catch\(\(\) => \{\}\);\n  \};\n/s, '');
code = code.replace(/const toggleSave = async.*?await Promise\.all\(\[postUpdate, userUpdate\]\)\.catch\(\(\) => \{\}\);\n  \};\n/s, '');

// We need to replace the entire Comments State block with useComments
code = code.replace(
  /const \[comments, setComments\].*?const \[commentToReport, setCommentToReport\] = useState<string \| null>\(null\);/s,
  const { comments, isSubmitting: isSubmittingComment, error: commentError, submitComment, likeComment: handleLikeComment, deleteComment: handleDeleteComment, setError: setCommentError } = useComments(post.id, isModalOpen);
  const [newComment, setNewComment] = useState('');
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [activeReplyName, setActiveReplyName] = useState<string | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});
  const [commentToReport, setCommentToReport] = useState<string | null>(null);
);

// Remove the old comments snapshot effect
code = code.replace(/useEffect\(\(\) => \{\n    if \(\!isModalOpen\).*?return \(\) => unsubscribe\(\);\n  \}, \[isModalOpen, post\.id\]\);\n/s, '');

// Remove the old handleSubmitComment etc.
code = code.replace(/const handleSubmitComment = async.*?\}\n  \};\n/s, 
  const handleSubmitComment = async (e: any) => {\n    e.preventDefault();\n    const success = await submitComment(newComment, user, profile, activeReplyId);\n    if (success) {\n      setNewComment('');\n      setActiveReplyId(null);\n      setActiveReplyName(null);\n    }\n  };\n
);
code = code.replace(/const handleLikeComment = async.*?\}\n  \};\n/s, 
  // handleLikeComment is in useComments\n
);
code = code.replace(/const handleDeleteComment = async.*?\}\n  \};\n/s, 
  // handleDeleteComment is in useComments\n
);

// We need to replace the HUGE comments overlay with <CommentsSection />
const commentsJsxRegex = /\{showComments && \(\s*<div className=\{styles\.commentsModalOverlay\}.*?<\/div>\s*\)\}/s;
code = code.replace(commentsJsxRegex, 
  {showComments && (
    <CommentsSection 
      postId={post.id}
      user={user}
      profile={profile}
      comments={comments}
      newComment={newComment}
      setNewComment={setNewComment}
      isSubmitting={isSubmittingComment}
      commentError={commentError}
      handleSubmitComment={handleSubmitComment}
      handleLikeComment={(id) => handleLikeComment(id, user?.uid)}
      handleReportComment={handleReportComment}
      handleDeleteComment={(id) => handleDeleteComment(id, activeReplyId || undefined)}
      activeReplyId={activeReplyId}
      activeReplyName={activeReplyName}
      setActiveReplyId={setActiveReplyId}
      setActiveReplyName={setActiveReplyName}
      expandedReplies={expandedReplies}
      toggleReplies={toggleReplies}
      onClose={() => setShowComments(false)}
    />
  )}
);

// We need to remove the first <Link> return block, because PromptModal only returns the {isModalOpen && ...}
const returnRegex = /return \(\s*<>\s*<Link.*?<\/Link>/s;
code = code.replace(returnRegex, eturn (\n    <>);

// Also remove {isModalOpen && ( at the start and )} at the bottom.
// We can just find it and remove it.
code = code.replace(/\{isModalOpen && \(\n\s*<div className=\{styles\.modalBackdrop\}/, '<div className={styles.modalBackdrop}');
code = code.replace(/<\!\-\- Modal Backdrop \-\->\n\s*<div className=\{styles\.modalBackdrop\}/, '<div className={styles.modalBackdrop}');

// Let's also remove the trailing )} for isModalOpen if we stripped it, but it's tricky with regex.
// We'll just replace the last )} before {showCheckout
code = code.replace(/\)\}\n\s*\{showCheckout/, '{showCheckout');

fs.writeFileSync('src/components/PromptCard/PromptModal.tsx', code);
console.log('Success');
