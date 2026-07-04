import { serverFetchOptional } from "@/lib/api/server-client";

export type LeaderboardEntry = {
  user_id: string;
  full_name: string;
  grade: number;
  school_name: string;
  is_verified: boolean;
  achievement_count: number;
  score: number;
};

export async function getAchievementLeaderboard(): Promise<LeaderboardEntry[]> {
  const data = await serverFetchOptional<LeaderboardEntry[]>("/api/v1/achievements/leaderboard");
  return data ?? [];
}
