import { serverFetchOptional } from "@/lib/api/server-client";

export type PublicAchievement = {
  id: string;
  title: string;
  category: string;
  level: string;
  organization: string;
  date_achieved: string;
};

export type PublicProject = {
  id: string;
  title: string;
  description: string;
  item_type: string;
  tags: string[];
  link_url: string | null;
};

export type PublicPost = {
  id: string;
  content: string;
  category: string;
  created_at: string;
};

export type PublicCertificate = {
  id: string;
  title: string;
  issuer: string;
  issue_date: string;
  credential_url: string | null;
};

export type PublicProfile = {
  id: string;
  username: string | null;
  full_name: string;
  school_name: string;
  grade: number;
  city: string | null;
  bio: string;
  skills: string[];
  interests: string[];
  career_goals: string;
  profile_picture_url: string | null;
  is_verified: boolean;
  created_at: string;
  cover_primary?: string | null;
  cover_accent?: string | null;
  achievements: PublicAchievement[];
  projects: PublicProject[];
  posts: PublicPost[];
  certificates: PublicCertificate[];
};

export async function getPublicProfile(username: string): Promise<PublicProfile | null> {
  return serverFetchOptional<PublicProfile>(`/api/v1/users/public/${encodeURIComponent(username)}`, {
    auth: false,
  });
}
