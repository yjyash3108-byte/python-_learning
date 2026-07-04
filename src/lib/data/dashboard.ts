import { serverFetchOptional } from "@/lib/api/server-client";
import type { DashboardStats, Notification, PortfolioItem } from "@/types/models";

export async function getDashboardStats(): Promise<DashboardStats | null> {
  return serverFetchOptional<DashboardStats>("/api/v1/dashboard/stats");
}

export async function getNotifications(): Promise<Notification[]> {
  const data = await serverFetchOptional<Notification[]>("/api/v1/notifications");
  return data ?? [];
}

export async function getPortfolio(itemType?: string): Promise<PortfolioItem[]> {
  const q = itemType ? `?item_type=${itemType}` : "";
  const data = await serverFetchOptional<PortfolioItem[]>(`/api/v1/portfolio${q}`);
  return data ?? [];
}

export async function searchStudents(q: string, grade?: number) {
  const params = new URLSearchParams({ q });
  if (grade) params.set("grade", String(grade));
  return serverFetchOptional(`/api/v1/search/students?${params}`) ?? [];
}

export async function getFollowCounts(userId: string) {
  return serverFetchOptional<{ followers: number; following: number }>(
    `/api/v1/follow/status/${userId}`
  );
}
