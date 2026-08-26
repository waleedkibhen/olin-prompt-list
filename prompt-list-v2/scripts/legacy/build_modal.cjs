const fs = require('fs');
let temp = fs.readFileSync('scripts/legacy/PromptCard.tsx.temp', 'utf8');
// Normalize CRLF -> LF so all regex anchors below work reliably
temp = temp.replace(/\r\n/g, '\n');
const lines = temp.split('\n');

// ---------------------------------------------------------------------------
// 1. Extract the modal JSX (the block rendered under `{isModalOpen && (`).
//    Source line 679 (array 678)   = `<div className={styles.modalBackdrop} ...>`  ← MUST be included:
//                                    it provides the fixed full-screen overlay.
//    Source line 680 (array 679)   = `<div className={styles.modalCard} ...>`
//    Source line 1012 (array 1011) = closing `</div>` of the backdrop           ← MUST be included.
//    Source line 1013 (array 1012) = `)}` closing the conditional (excluded —
//                                    PromptCard already renders <PromptModal> conditionally).
//    We take array indices 678..1011 => source lines 679..1012.
// ---------------------------------------------------------------------------
const modalStartIdx = 678;
const modalEndIdx = 1012;
let modalBackdropJsx = lines.slice(modalStartIdx, modalEndIdx).join('\n');

// ---------------------------------------------------------------------------
// 2. Split monolith: imports+interfaces | legacy header | component body
// ---------------------------------------------------------------------------
const returnLineIdx = lines.findIndex(l => /^\s*return \(\s*$/.test(l));
if (returnLineIdx === -1) throw new Error('Could not locate component return statement');

let importsAndInterfaces = lines.slice(0, 41).join('\n'); // source 1..41

// Monolith lived in src/components/ but generated file lives in src/components/PromptCard/
// so sibling-relative imports need one extra hop.
importsAndInterfaces = importsAndInterfaces
  .replace("from './WhopCheckoutModal'", "from '../WhopCheckoutModal'")
  .replace("from './DiscoverMore'", "from '../DiscoverMore'");

let body = lines.slice(42, returnLineIdx).join('\n');       // source 43..(return-1)

// Strip like/save state syncing — isLiked/isSaved are props now (parent owns them).
// Keep only the follow-state sync which IS local to the modal.
body = body.replace(
  /if \(user && profile\) \{[\s\S]*?\} else if \(user\) \{[\s\S]*?\n    \}\n/,
  "if (user && profile) {\n      const followedArr = JSON.parse(localStorage.getItem(`following_${user.uid}`) || '[]');\n      if (post.creator?.uid) {\n        setIsFollowing(followedArr.includes(post.creator.uid));\n      }\n    }\n"
);

// Hoist monetization flags above the states that read them (isUnlocked initializer),
// and drop the later duplicates. Also restores the ad-unlock skeleton state
// (lost from the monolith in an earlier patch).
body = body.replace(/^  const effectiveMonetization = .*$\n/m, '');
body = body.replace(/^  const isAdSupported = .*$\n/m, '');
const monetizationBlock =
  "  const effectiveMonetization = !ENABLE_MONETIZATION ? 'free' : ((post.monetizationType as any) === 'ad' ? 'ad_supported' : (post.monetizationType || (post.isPaid ? 'subscribers_only' : 'free')));\n" +
  "  const isAdSupported = Boolean(effectiveMonetization === 'ad_supported' || (post.monetizationType as any) === 'ad_supported' || (post.monetizationType as any) === 'ad');\n" +
  "  const [adDelayComplete, setAdDelayComplete] = useState(true);\n";
body = monetizationBlock + body;

// Strip state/handlers now supplied via props or hooks
body = body.replace(/const \[isModalOpen, setIsModalOpen\] = useState.*?;\n/, '');
body = body.replace(/const \[isLiked, setIsLiked\].*?;\n/, '');
body = body.replace(/const \[isSaved, setIsSaved\].*?;\n/, '');
body = body.replace(/const \[likesCount, setLikesCount\].*?;\n/, '');
body = body.replace(/const \[savesCount, setSavesCount\].*?;\n/, '');
body = body.replace(/const toggleLike = async[\s\S]*?await Promise\.all\(\[postUpdate, userUpdate\]\)\.catch\(\(\) => \{\}\);\n  \};\n/, '');
body = body.replace(/const toggleSave = async[\s\S]*?await Promise\.all\(\[postUpdate, userUpdate\]\)\.catch\(\(\) => \{\}\);\n  \};\n/, '');

body = body.replace(
  /const \[comments, setComments\][\s\S]*?const \[commentToReport, setCommentToReport\] = useState<string \| null>\(null\);/,
  "const { comments, isSubmitting: isSubmittingComment, error: commentError, submitComment, likeComment: handleLikeComment, deleteComment: handleDeleteComment, setError: setCommentError } = useComments(post.id, isModalOpen);\n  const [newComment, setNewComment] = useState('');\n  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);\n  const [activeReplyName, setActiveReplyName] = useState<string | null>(null);\n  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});"
);

// Remove the legacy inline comments subscription effect (useComments handles it now).
// Anchored precisely around `onSnapshot(commentsQuery` through its deps close.
const cqIdx = body.indexOf('onSnapshot(commentsQuery');
if (cqIdx !== -1) {
  const effStart = body.lastIndexOf('useEffect(() => {', cqIdx);
  const depsMarker = '}, [isModalOpen, post.id]);';
  const depsEnd = body.indexOf(depsMarker, cqIdx);
  if (effStart !== -1 && depsEnd !== -1) {
    body = (body.slice(0, effStart) + body.slice(depsEnd + depsMarker.length)).replace(/\n{3,}/g, '\n\n');
  }
}

// Replace inline submit handler with hook-backed version
body = body.replace(/const handleSubmitComment = async[\s\S]*?\n  \};\n/,
  "const handleSubmitComment = async (e: any) => {\n    e.preventDefault();\n    const success = await submitComment(newComment, user, profile, activeReplyId);\n    if (success) {\n      setNewComment('');\n      setActiveReplyId(null);\n      setActiveReplyName(null);\n    }\n  };\n"
);

// Remove comment interaction handlers now provided by useComments
body = body.replace(/const handleLikeComment = async[\s\S]*?\n  \};\n/, '');
body = body.replace(/const handleDeleteComment = async[\s\S]*?\n  \};\n/, '');

// ---------------------------------------------------------------------------
// 3. Assemble the standalone PromptModal component
// ---------------------------------------------------------------------------
const signature = 'export default function PromptModal({ post, isModalOpen, setIsModalOpen, isLiked, isSaved, likesCount, savesCount, toggleLike, toggleSave, onCloseOverride, defaultOpen }: { post: PromptPost; [key: string]: any }) {\n';

const commentsSectionTag = `
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
          handleLikeComment={(id: string) => handleLikeComment(id, user?.uid)}
          handleReportComment={handleReportComment}
          handleDeleteComment={(id: string) => handleDeleteComment(id, activeReplyId || undefined)}
          activeReplyId={activeReplyId}
          activeReplyName={activeReplyName}
          setActiveReplyId={setActiveReplyId}
          setActiveReplyName={setActiveReplyName}
          expandedReplies={expandedReplies}
          toggleReplies={toggleReplies}
          onClose={() => setShowComments(false)}
        />
      )}
`;

const otherModals = `
      {showCheckout && post.whopPlanId && (
        <WhopCheckoutModal
          planId={post.whopPlanId}
          onSuccess={handlePaymentSuccess}
          onClose={() => setShowCheckout(false)}
        />
      )}

      {isReportModalOpen && <ReportModal post={post} onClose={() => setIsReportModalOpen(false)} />}
`;

const finalCode =
  importsAndInterfaces +
  "\nimport CommentsSection from './CommentsSection';\nimport { useComments } from '@/hooks/useComments';\n\n" +
  signature +
  '\n' + body + '\n' +
  `
  return (
    <>
      ${modalBackdropJsx}
${commentsSectionTag}
${otherModals}
    </>
  );
}
`;

fs.writeFileSync('src/components/PromptCard/PromptModal.tsx', finalCode);
console.log('Done PromptModal Build');
