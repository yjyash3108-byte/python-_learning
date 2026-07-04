import { serverFetchOptional } from "@/lib/api/server-client";

export type SuggestedUser = {
  id: string;
  full_name: string;
  school_name: string;
  grade: number;
  skills: string[];
  reason: string;
  mutual_count: number;
};

export async function getSuggestedUsers(): Promise<SuggestedUser[]> {
  const data = await serverFetchOptional<SuggestedUser[]>("/api/v1/search/suggested-users");
  return data ?? [];
}
