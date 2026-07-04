import { serverFetchOptional } from "@/lib/api/server-client";
import type { Achievement, AchievementSort, Certificate, CertificateSort } from "@/types/achievements";

function buildQuery(params: Record<string, string | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

export async function getMyAchievements(filters?: {
  category?: string;
  level?: string;
  q?: string;
  sort?: AchievementSort;
}): Promise<Achievement[]> {
  const data = await serverFetchOptional<Achievement[]>(
    `/api/v1/achievements${buildQuery({
      category: filters?.category,
      level: filters?.level,
      q: filters?.q,
      sort: filters?.sort,
    })}`
  );
  return data ?? [];
}

export async function getUserAchievements(userId: string): Promise<Achievement[]> {
  const data = await serverFetchOptional<Achievement[]>(`/api/v1/achievements/user/${userId}`);
  return data ?? [];
}

export async function getMyCertificates(filters?: {
  q?: string;
  sort?: CertificateSort;
}): Promise<Certificate[]> {
  const data = await serverFetchOptional<Certificate[]>(
    `/api/v1/certificates${buildQuery({
      q: filters?.q,
      sort: filters?.sort,
    })}`
  );
  return data ?? [];
}
