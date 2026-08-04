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
  description: string;
  promptText: string;
  negativePrompt?: string | null;
  imageUrls: string[];
  model: 'Midjourney V6' | 'Flux.1' | 'DALL-E 3' | 'Stable Diffusion XL' | string;
  styleTag: string;
  categories: string[];
  creator: Creator;
  likesCount: number;
  savesCount: number;
  viewsCount: number;
  copiesCount?: number;
  createdAt: string;
  aspectRatio?: string;
  embedding?: number[];
  isPaid?: boolean;
  price?: number;
  isFlagged?: boolean;
  flaggedReason?: string;
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
