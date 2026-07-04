export type AchievementCategory =
  | "academic"
  | "coding"
  | "hackathon"
  | "olympiad"
  | "sports"
  | "debate"
  | "music"
  | "art"
  | "entrepreneurship"
  | "leadership"
  | "volunteering"
  | "other";

export type AchievementLevel =
  | "school"
  | "district"
  | "state"
  | "national"
  | "international";

export interface Achievement {
  id: string;
  user_id: string;
  title: string;
  category: AchievementCategory;
  description: string;
  organization: string;
  level: AchievementLevel;
  rank: string | null;
  date_achieved: string;
  image_url: string | null;
  certificate_file_url: string | null;
  verification_link: string | null;
  skills_gained: string[];
  created_at: string;
  updated_at: string;
}

export interface Certificate {
  id: string;
  user_id: string;
  title: string;
  issuer: string;
  certificate_number: string | null;
  issue_date: string;
  expiry_date: string | null;
  credential_url: string | null;
  file_url: string | null;
  created_at: string;
  updated_at: string;
}

export type AchievementSort = "newest" | "oldest" | "category";
export type CertificateSort = "newest" | "oldest" | "title";
