export type PostCategory =
  | "achievement"
  | "sports"
  | "science"
  | "arts"
  | "academics"
  | "music"
  | "community"
  | "project"
  | "other";

export interface UserProfile {
  id: string;
  email: string;
  username?: string | null;
  full_name: string;
  grade: number;
  school_name: string;
  bio: string;
  profile_picture_url: string | null;
  city?: string | null;
  skills?: string[];
  interests?: string[];
  career_goals?: string;
  social_links?: Record<string, string> | null;
  is_verified?: boolean;
  email_verified?: boolean;
  is_admin?: boolean;
  onboarding_completed?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  author_id: string;
  content: string;
  image_urls: string[];
  category: PostCategory;
  link_url?: string | null;
  hashtags?: string[];
  is_moderated: boolean;
  moderation_notes: string | null;
  created_at: string;
  updated_at: string;
  like_count?: number;
  comment_count?: number;
  liked_by_me?: boolean;
  share_count?: number;
  author?: Pick<UserProfile, "full_name" | "grade" | "school_name" | "profile_picture_url">;
}

export interface PortfolioItem {
  id: string;
  user_id: string;
  item_type: string;
  title: string;
  description: string;
  image_url: string | null;
  link_url: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  type: string;
  message: string;
  is_read: boolean;
  reference_id: string | null;
  actor_id?: string | null;
  actor_name?: string | null;
  created_at: string;
}

export interface DashboardStats {
  posts_count: number;
  projects_count: number;
  followers_count: number;
  following_count: number;
  unread_notifications: number;
  achievements_count: number;
  skills_count: number;
}
