const fs = require('fs');
const p = 'src/components/PromptCard.tsx';
let code = fs.readFileSync(p, 'utf8');

code = code.replace(`import { Heart, MessageCircle, Bookmark, Copy, Check, MoreVertical, EyeOff, Eye, Image as ImageIcon, Video, Box, Trash2, Edit2, Play, Lock, ChevronDown, CheckCircle2 } from 'lucide-react';`,
`import { Heart, MessageCircle, Bookmark, Copy, Check, MoreVertical, EyeOff, Eye, Image as ImageIcon, Video, Box, Trash2, Edit2, Play, Lock, ChevronDown, CheckCircle2 } from 'lucide-react';
declare const WhopCheckoutModal: any;`);

fs.writeFileSync(p, code);
