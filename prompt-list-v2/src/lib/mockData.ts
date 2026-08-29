import { ColorProfile } from './colorAnalyzer';

export interface Creator {
  uid: string;
  displayName: string;
  username: string;
  avatarUrl: string;
  followerCount: number;
}

export interface PromptPost {
  id: string;
  title: string;
  description?: string;
  promptText: string;
  prompts?: string[];
  variantCount?: number;
  accessTier?: 'free' | 'subscriber' | 'paid' | string;
  creatorId?: string;
  imageUrls: string[];
  model: 'Midjourney V6' | 'Flux.1' | 'DALL-E 3' | 'Stable Diffusion XL' | string;
  styleTag: string;
  categories: string[];
  creator: Creator;
  likesCount: number;
  savesCount: number;
  viewsCount: number;
  copiesCount?: number;
  commentCount?: number;
  createdAt: string;
  rawTimestamp?: number;
  aspectRatio?: string;
  embedding?: number[];
  isPaid?: boolean;
  price?: number;
  whopPlanId?: string;
  monetizationType?: 'free' | 'ad_supported' | 'subscribers_only' | 'charge';
  isFlagged?: boolean;
  flaggedReason?: string;
  colorProfile?: ColorProfile;
}

export const MOCK_POSTS: PromptPost[] = [];

export const STYLE_CATEGORIES = [
  "All Styles",
  "Cyberpunk",
  "Minimalist",
  "Fantasy",
  "Isometric",
  "Steampunk",
  "Sci-Fi",
  "Photorealistic",
  "Anime & Manga",
  "Architecture",
  "Surrealist"
];
