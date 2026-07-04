import { serverFetchOptional } from "@/lib/api/server-client";
import type { PortfolioItem } from "@/types/models";

export type PortfolioDetail = PortfolioItem & {
  like_count: number;
  comment_count: number;
  liked_by_me: boolean;
  author_name: string | null;
  author_grade: number | null;
  author_school: string | null;
};

export type PortfolioComment = {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  author_name: string | null;
};

export async function getPortfolioItem(id: string): Promise<PortfolioDetail | null> {
  return serverFetchOptional<PortfolioDetail>(`/api/v1/portfolio/${id}`);
}

export async function getUserProjects(userId: string): Promise<PortfolioItem[]> {
  const data = await serverFetchOptional<PortfolioItem[]>(
    `/api/v1/portfolio/user/${userId}?item_type=project`
  );
  return data ?? [];
}
