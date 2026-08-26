const fs = require('fs');

const context = `# Olin's Prompt List - Project Context

## Overview
Olin's Prompt List is a modern, Pinterest-style web application for discovering, sharing, and monetizing AI prompts. It is built with React, TypeScript, and Vite, and uses Firebase (Firestore & Auth) for its backend. 

The application serves two primary user types:
1. **Consumers**: Users who browse the masonry feed, search for prompts, like/save them, and leave comments.
2. **Creators**: Users who publish prompts, lock them behind paywalls (paid/subscribers-only), and earn revenue via direct sales or a global ad revenue pool.

## Tech Stack
- **Frontend Framework**: React 18, React Router v6
- **Build Tool**: Vite (with Rolldown/esbuild)
- **Language**: TypeScript
- **Styling**: CSS Modules + Global CSS (custom CSS variables, dark mode first theme)
- **Backend/BaaS**: Firebase (Authentication, Firestore Database, Storage)
- **Ads/Monetization**: Third-party integrations (Monetag for ads) + Custom logic for payouts (PayPal, Crypto, Local Bank)

## Key Architecture & Directories
- \`src/components/\`: Reusable UI components. Key files include:
  - \`Navbar.tsx\`: Main navigation and search logic.
  - \`DiscoveryFeed.tsx\`: The masonry layout feed used on the home page.
  - \`PromptCard.tsx\`: The individual item card, which historically also contained the massive detail modal.
  - \`GlobalAdManager.tsx\`: Logic to securely sandbox and inject third-party ad scripts.
- \`src/pages/\`: Route-level components. Key files include:
  - \`HomePage.tsx\`: The landing page with the main feed.
  - \`CreatorDashboardPage.tsx\`: The central hub for creators to track analytics, manage posts, and request payouts.
  - \`CreatePostPage.tsx\`: The form for publishing new prompts.
- \`src/context/\`: React Context providers.
  - \`AuthContext.tsx\`: Manages Firebase authentication state, user profiles, and Google Sign-In logic.
- \`src/hooks/\`: Reusable custom React hooks (e.g., \`useRecentSearches.ts\`).
- \`src/lib/\`: Utility functions and Firebase configuration.
  - \`firebase.ts\`: Firebase initialization.
  - \`ai.ts\`: External AI service integrations (if any).
  - \`mockData.ts\`: Originally used for mock types; still houses critical TypeScript interfaces (e.g., \`PromptPost\`).

## Core Data Models (Firestore)
- **users (collection)**: Stores \`CreatorProfile\` data (displayName, avatarUrl, totalViews, followers, etc.).
- **posts (collection)**: Stores \`PromptPost\` data (title, description, imageUrls, prompt string, monetization type, price, etc.).
- **comments (collection)**: Stores comments tied to specific post IDs.
- **payout_requests (collection)**: Stores payout requests made by creators.

## Current State & Maintenance Strategy
As the application has scaled, several files have grown into "god components" (e.g., \`PromptCard.tsx\` at 1000+ lines and \`CreatorDashboardPage.tsx\` at 800+ lines). 

**The ongoing strategy for maintaining this codebase is:**
1. **Component Modularization**: Break down massive files into smaller, strictly scoped sub-components (e.g., separating modals and tabs into their own files).
2. **Hook Extraction**: Move inline Firebase query logic and complex local state into custom hooks (e.g., \`useComments\`, \`useMonetizationStats\`).
3. **Dead Code Elimination**: Continually remove unused imports, legacy mock data dependencies, and obsolete commented-out code.
4. **CSS Consolidation**: Ensure CSS Modules are strictly scoped and prevent inline-style bloat where possible.
`;

fs.writeFileSync('PROJECT_CONTEXT.md', context);
console.log("PROJECT_CONTEXT.md updated.");
