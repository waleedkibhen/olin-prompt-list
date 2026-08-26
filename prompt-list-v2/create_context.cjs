const fs = require('fs');

const context = `# Olin's Prompt List - Project Context

## Overview
Olin's Prompt List is a modern, Pinterest-style web application for discovering, sharing, and monetizing AI prompts. It is built with React, TypeScript, and Vite, and uses Firebase (Firestore & Auth) for its backend.

## Tech Stack
- **Frontend Framework**: React 18, React Router v6
- **Build Tool**: Vite (with Rolldown/esbuild)
- **Language**: TypeScript
- **Styling**: CSS Modules + Global CSS (custom variables, dark mode first)
- **Backend/BaaS**: Firebase (Authentication, Firestore Database, Storage)
- **Monetization/Ads**: Custom integrations (Monetag for ads, Stripe/Whop concepts for payments)

## Key Directories
- \`src/components/\`: Reusable UI components (e.g., Navbar, GlobalAdManager, PromptCard).
- \`src/pages/\`: Route-level components (HomePage, CreatorDashboardPage, etc.).
- \`src/context/\`: React Context providers (AuthContext).
- \`src/hooks/\`: Custom React hooks (useRecentSearches, etc.).
- \`src/lib/\`: Utility functions and Firebase configuration (firebase.ts, ai.ts, personalization.ts).

## Core Data Models
Most core types are defined in \`src/lib/mockData.ts\` and Firebase schemas:
- **PromptPost**: Represents a single prompt post (id, title, description, prompt, imageUrls, creator, etc.).
- **User/CreatorProfile**: Represents a registered user and their monetization/profile state.
- **Comment**: Represents a comment on a post.

## Current State & Maintenance
The application has grown significantly, resulting in some "god classes/components" (e.g., \`PromptCard.tsx\` at ~1000 lines, \`CreatorDashboardPage.tsx\` at ~800 lines). These files mix UI rendering, complex state management (modals, comment sections, monetization logic), and Firebase reads/writes.

### Refactoring Goals
1. **Component Splitting**: Break down massive files into logical sub-components (e.g., extracting the Post Modal from \`PromptCard\`).
2. **Hook Extraction**: Move inline Firebase query logic and complex local state into custom hooks (e.g., \`useComments\`, \`useMonetizationStats\`).
3. **Dead Code Elimination**: Remove unused imports and legacy mock data dependencies that have been replaced by real Firebase calls.
4. **CSS Consolidation**: Ensure CSS Modules are strictly scoped and prevent inline-style bloat where possible.
`;

fs.writeFileSync('PROJECT_CONTEXT.md', context);
console.log("PROJECT_CONTEXT.md created.");
