import type { Post, PostCategory } from "@/types/models";

export type ApiPostAuthor = {
  id?: string;
  full_name: string;
  grade: number;
  school_name: string;
  profile_picture_url: string | null;
};

export type ApiPostRaw = {
  id: string;
  author_id: string;
  content: string;
  category: string;
  image_urls: string[];
  link_url?: string | null;
  hashtags?: string[];
  share_count: number;
  like_count: number;
  comment_count: number;
  liked_by_me: boolean;
  created_at: string;
  updated_at: string;
  author: ApiPostAuthor | null;
};

export function isSafeHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function mapApiPost(p: ApiPostRaw): Post {
  return {
    id: p.id,
    author_id: p.author_id,
    content: p.content,
    image_urls: p.image_urls ?? [],
    category: p.category as PostCategory,
    link_url: p.link_url ?? null,
    hashtags: p.hashtags ?? [],
    is_moderated: true,
    moderation_notes: null,
    created_at: p.created_at,
    updated_at: p.updated_at,
    like_count: p.like_count,
    comment_count: p.comment_count,
    liked_by_me: p.liked_by_me,
    share_count: p.share_count,
    author: p.author
      ? {
          full_name: p.author.full_name,
          grade: p.author.grade,
          school_name: p.author.school_name,
          profile_picture_url: p.author.profile_picture_url,
        }
      : undefined,
  };
}
