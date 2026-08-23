const fs = require('fs');
let code = fs.readFileSync('src/pages/CreatorDashboardPage.tsx', 'utf8');

code = code.replace(
    /import \{ BarChart2.*\} from 'lucide-react';/g,
    "import { BarChart2, Eye, Heart, Bookmark, Copy, Trash2, ExternalLink, PlusCircle, Box, AlertTriangle, Sparkles, CheckCircle, Award, Users, TrendingUp, TrendingDown, Lock, PlayCircle, X, Info, DollarSign, MonitorPlay } from 'lucide-react';"
);

fs.writeFileSync('src/pages/CreatorDashboardPage.tsx', code);
console.log('Updated imports');
