const fs = require('fs');
const temp = fs.readFileSync('src/components/PromptCard.tsx.temp', 'utf8');

const modalStartIdx = temp.indexOf('{isModalOpen && (');
let openCount = 0;
let modalEndIdx = -1;
for (let i = modalStartIdx + 16; i < temp.length; i++) {
    if (temp[i] === '(') openCount++;
    else if (temp[i] === ')') {
        openCount--;
        if (openCount === 0) {
            modalEndIdx = i;
            break;
        }
    }
}
let modalJsx = temp.substring(modalStartIdx + 17, modalEndIdx).trim();

// Now find the comments section inside the modalJsx
const commentsStart = modalJsx.indexOf('{showComments && (');
if (commentsStart !== -1) {
    let cOpen = 0;
    let cEnd = -1;
    for (let i = commentsStart + 17; i < modalJsx.length; i++) {
        if (modalJsx[i] === '(') cOpen++;
        else if (modalJsx[i] === ')') {
            cOpen--;
            if (cOpen === 0) {
                cEnd = i;
                break;
            }
        }
    }
    const commentsBlock = modalJsx.substring(commentsStart, cEnd + 1);
    
    const commentsTag = `{showComments && (
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
      )}`;
      
    modalJsx = modalJsx.replace(commentsBlock, commentsTag);
}

// Remove the default `const [isModalOpen, ...]` from the component body
// We will replace the whole top half.

const topHalfStart = temp.indexOf('const [isModalOpen, setIsModalOpen] = useState(defaultOpen);');
const topHalfEnd = temp.indexOf('return (');

let topHalf = temp.substring(topHalfStart, topHalfEnd);

// Strip out what we moved to PromptCard or useComments
topHalf = topHalf.replace(/const \[isModalOpen, setIsModalOpen\] = useState.*?;\n?/, '');
topHalf = topHalf.replace(/const \[isReportModalOpen, setIsReportModalOpen\].*?;\n?/, 'const [isReportModalOpen, setIsReportModalOpen] = useState(false);\n');
// We need to keep other state variables.
topHalf = topHalf.replace(/const \[isLiked, setIsLiked\].*?;\n?/, '');
topHalf = topHalf.replace(/const \[isSaved, setIsSaved\].*?;\n?/, '');
topHalf = topHalf.replace(/const \[likesCount, setLikesCount\].*?;\n?/, '');
topHalf = topHalf.replace(/const \[savesCount, setSavesCount\].*?;\n?/, '');
topHalf = topHalf.replace(/const toggleLike = async.*?await Promise\.all\(\[postUpdate, userUpdate\]\)\.catch\(\(\) => \{\}\);\n  \};\n/s, '');
topHalf = topHalf.replace(/const toggleSave = async.*?await Promise\.all\(\[postUpdate, userUpdate\]\)\.catch\(\(\) => \{\}\);\n  \};\n/s, '');

topHalf = topHalf.replace(
  /const \[comments, setComments\].*?const \[commentToReport, setCommentToReport\] = useState<string \| null>\(null\);/s,
  "const { comments, isSubmitting: isSubmittingComment, error: commentError, submitComment, likeComment: handleLikeComment, deleteComment: handleDeleteComment, setError: setCommentError } = useComments(post.id, isModalOpen);\n  const [newComment, setNewComment] = useState('');\n  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);\n  const [activeReplyName, setActiveReplyName] = useState<string | null>(null);\n  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});\n  const [commentToReport, setCommentToReport] = useState<string | null>(null);"
);

topHalf = topHalf.replace(/useEffect\(\(\) => \{\n    if \(\!isModalOpen\).*?return \(\) => unsubscribe\(\);\n  \}, \[isModalOpen, post\.id\]\);\n/s, '');

topHalf = topHalf.replace(/const handleSubmitComment = async.*?\}\n  \};\n/s, 
  "const handleSubmitComment = async (e: any) => {\n    e.preventDefault();\n    const success = await submitComment(newComment, user, profile, activeReplyId);\n    if (success) {\n      setNewComment('');\n      setActiveReplyId(null);\n      setActiveReplyName(null);\n    }\n  };\n"
);
topHalf = topHalf.replace(/const handleLikeComment = async.*?\}\n  \};\n/s, 
  ""
);
topHalf = topHalf.replace(/const handleDeleteComment = async.*?\}\n  \};\n/s, 
  ""
);

const importsAndHooks = `import React, { useState, useEffect, useRef, useMemo } from 'react';
import styles from './PromptCard.module.css';
import { PromptPost } from '@/lib/mockData';
import { useAuth } from '@/context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { getOptimizedImageUrl } from '@/lib/imageOptimization';
import { Bookmark, Heart, Eye, Download, Copy, Check, PlayCircle, Loader2, ArrowLeft, ArrowRight, MessageCircle, MoreHorizontal, Flag, Trash2, X, Send } from 'lucide-react';
import { doc, updateDoc, increment, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import ReportModal from '@/components/ReportModal';
import RichTextRenderer from '@/components/RichTextRenderer';
import DiscoverMore from '@/components/DiscoveryFeed'; 
import toast from 'react-hot-toast';
import { copyRichPrompt } from '@/lib/copyUtils';
import WhopCheckoutModal from '@/components/WhopCheckoutModal';
import { AdsterraSocialBar } from '@/components/AdsterraSocialBar';
import CommentsSection from './CommentsSection';
import { useComments } from '@/hooks/useComments';

const ENABLE_MONETIZATION = import.meta.env.VITE_ENABLE_MONETIZATION === 'true';

export default function PromptModal({ post, isModalOpen, setIsModalOpen, isLiked, isSaved, likesCount, savesCount, toggleLike, toggleSave, onCloseOverride, defaultOpen }: any) {
  const { user, profile, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

`;

const finalCode = importsAndHooks + topHalf + `
  return (
    <>
      ${modalJsx}
      
      {showCheckout && post.whopPlanId && (
        <WhopCheckoutModal 
          planId={post.whopPlanId}
          onSuccess={handlePaymentSuccess}
          onClose={() => setShowCheckout(false)}
        />
      )}

      {isReportModalOpen && <ReportModal post={post} onClose={() => setIsReportModalOpen(false)} />}
    </>
  );
}
`;

fs.writeFileSync('src/components/PromptCard/PromptModal.tsx', finalCode);
console.log('Done PromptModal');
