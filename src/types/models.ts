export type PostCategory =
  | "sports"
  | "science"
  | "arts"
  | "academics"
  | "music"
  | "community"
  | "other";

export type ConnectionStatus =
  | "pending"
  | "accepted"
  | "declined"
  | "blocked";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  grade: number;
  school_name: string;
  bio: string;
  profile_picture_url: string | null;
  created_at: string;
  updated_at: string;
}

/** Internal record — password hash never sent to the client */
export interface StoredUser extends UserProfile {
  password_hash: string;
}

export interface Post {
  id: string;
  author_id: string;
  content: string;
  image_urls: string[];
  category: PostCategory;
  is_moderated: boolean;
  moderation_notes: string | null;
  created_at: string;
  updated_at: string;
  author?: Pick<UserProfile, "full_name" | "grade" | "school_name" | "profile_picture_url">;
}

export interface Connection {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: ConnectionStatus;
  created_at: string;
  updated_at: string;
}
