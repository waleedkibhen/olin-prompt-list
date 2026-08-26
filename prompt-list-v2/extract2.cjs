const fs = require('fs');
const temp = fs.readFileSync('src/components/PromptCard.tsx.temp', 'utf8');

const startIdx = temp.indexOf('{showComments && (');
if (startIdx === -1) {
    console.error("Not found");
    process.exit(1);
}

// Find matching parentheses for the `showComments && (` expression
let openCount = 0;
let endIdx = -1;
for (let i = startIdx + 17; i < temp.length; i++) {
    if (temp[i] === '(') openCount++;
    else if (temp[i] === ')') {
        openCount--;
        if (openCount === 0) {
            endIdx = i;
            break;
        }
    }
}

// The JSX is inside the parenthesis.
const jsxStr = temp.substring(startIdx + 18, endIdx).trim();

const componentCode = `import React from 'react';
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
    user, profile, comments, newComment, setNewComment, isSubmitting, commentError,
    handleSubmitComment, handleLikeComment, handleReportComment, handleDeleteComment,
    activeReplyId, activeReplyName, setActiveReplyId, setActiveReplyName,
    expandedReplies, toggleReplies, onClose
  } = props;

  return (
    ${jsxStr.replace(/setShowComments\(false\)/g, 'onClose()')}
  );
}
`;

fs.writeFileSync('src/components/PromptCard/CommentsSection.tsx', componentCode);
console.log('Done CommentsSection');
