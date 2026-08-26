const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard.tsx.temp', 'utf8');

code = code.replace(
  /export default function PromptCard.*?\n/,
  "import CommentsSection from './CommentsSection';\nimport { useComments } from '@/hooks/useComments';\n\nexport default function PromptModal({ post, isModalOpen, setIsModalOpen, isLiked, isSaved, likesCount, savesCount, toggleLike, toggleSave, onCloseOverride, defaultOpen }: any) {\n"
);

code = code.replace(/const \[isModalOpen, setIsModalOpen\] = useState\(defaultOpen\);\n?/, '');
code = code.replace(/const \[isLiked, setIsLiked\] = useState.*?;\n?/, '');
code = code.replace(/const \[isSaved, setIsSaved\] = useState.*?;\n?/, '');
code = code.replace(/const \[likesCount, setLikesCount\] = useState.*?;\n?/, '');
code = code.replace(/const \[savesCount, setSavesCount\] = useState.*?;\n?/, '');
code = code.replace(/const toggleLike = async.*?await Promise\.all\(\[postUpdate, userUpdate\]\)\.catch\(\(\) => \{\}\);\n  \};\n/s, '');
code = code.replace(/const toggleSave = async.*?await Promise\.all\(\[postUpdate, userUpdate\]\)\.catch\(\(\) => \{\}\);\n  \};\n/s, '');

code = code.replace(
  /const \[comments, setComments\].*?const \[commentToReport, setCommentToReport\] = useState<string \| null>\(null\);/s,
  "const { comments, isSubmitting: isSubmittingComment, error: commentError, submitComment, likeComment: handleLikeComment, deleteComment: handleDeleteComment, setError: setCommentError } = useComments(post.id, isModalOpen);\n  const [newComment, setNewComment] = useState('');\n  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);\n  const [activeReplyName, setActiveReplyName] = useState<string | null>(null);\n  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});\n  const [commentToReport, setCommentToReport] = useState<string | null>(null);"
);

code = code.replace(/useEffect\(\(\) => \{\n    if \(\!isModalOpen\).*?return \(\) => unsubscribe\(\);\n  \}, \[isModalOpen, post\.id\]\);\n/s, '');

code = code.replace(/const handleSubmitComment = async.*?\}\n  \};\n/s, 
  "const handleSubmitComment = async (e: any) => {\n    e.preventDefault();\n    const success = await submitComment(newComment, user, profile, activeReplyId);\n    if (success) {\n      setNewComment('');\n      setActiveReplyId(null);\n      setActiveReplyName(null);\n    }\n  };\n"
);
code = code.replace(/const handleLikeComment = async.*?\}\n  \};\n/s, 
  "// handleLikeComment is in useComments\n"
);
code = code.replace(/const handleDeleteComment = async.*?\}\n  \};\n/s, 
  "// handleDeleteComment is in useComments\n"
);

const commentsJsxRegex = /\{showComments && \(\s*<div className=\{styles\.commentsModalOverlay\}.*?<\/div>\s*\)\}/s;
code = code.replace(commentsJsxRegex, 
  "{showComments && (\n    <CommentsSection \n      postId={post.id}\n      user={user}\n      profile={profile}\n      comments={comments}\n      newComment={newComment}\n      setNewComment={setNewComment}\n      isSubmitting={isSubmittingComment}\n      commentError={commentError}\n      handleSubmitComment={handleSubmitComment}\n      handleLikeComment={(id) => handleLikeComment(id, user?.uid)}\n      handleReportComment={handleReportComment}\n      handleDeleteComment={(id) => handleDeleteComment(id, activeReplyId || undefined)}\n      activeReplyId={activeReplyId}\n      activeReplyName={activeReplyName}\n      setActiveReplyId={setActiveReplyId}\n      setActiveReplyName={setActiveReplyName}\n      expandedReplies={expandedReplies}\n      toggleReplies={toggleReplies}\n      onClose={() => setShowComments(false)}\n    />\n  )}"
);

const returnRegex = /return \(\s*<>\s*<Link.*?<\/Link>/s;
code = code.replace(returnRegex, "return (\n    <>");

code = code.replace(/\{isModalOpen && \(\n\s*<div className=\{styles\.modalBackdrop\}/, '<div className={styles.modalBackdrop}');

code = code.replace(/\)\}\n\s*\{showCheckout/, '{showCheckout');

fs.writeFileSync('src/components/PromptCard/PromptModal.tsx', code);
console.log('Success');
