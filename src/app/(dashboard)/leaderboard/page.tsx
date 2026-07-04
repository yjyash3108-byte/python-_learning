import Link from "next/link";
import { Medal, Trophy } from "lucide-react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { getAchievementLeaderboard } from "@/lib/data/leaderboard";

export const metadata = { title: "Leaderboard" };

export default async function LeaderboardPage() {
  const entries = await getAchievementLeaderboard();

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-300/80">
          Competitions
        </p>
        <h1 className="mt-2 flex items-center gap-3 text-3xl font-bold text-foreground text-3d-glow">
          <Medal className="h-8 w-8 text-amber-400" />
          Achievement leaderboard
        </h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Top students ranked by weighted achievement score (national &gt; state &gt; school).
        </p>
      </div>

      {entries.length === 0 ? (
        <GlassPanel depth="sm" className="flex items-center gap-3 p-6 text-sm text-muted-foreground">
          <Trophy className="h-8 w-8 text-amber-400" />
          No leaderboard entries yet. Be the first to add an achievement!
        </GlassPanel>
      ) : (
        <GlassPanel depth="md" tilt className="overflow-hidden p-0">
          <ol className="divide-y divide-white/8">
            {entries.map((entry, index) => (
              <li
                key={entry.user_id}
                className="flex items-center gap-4 px-5 py-4 transition hover:bg-white/[0.03]"
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                    index === 0
                      ? "bg-amber-500/25 text-amber-200"
                      : index === 1
                        ? "bg-slate-400/20 text-slate-200"
                        : index === 2
                          ? "bg-orange-600/20 text-orange-200"
                          : "bg-white/5 text-muted-foreground"
                  }`}
                >
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/profile/${entry.user_id}`}
                    className="font-medium hover:text-indigo-300"
                  >
                    {entry.full_name}
                    {entry.is_verified && (
                      <span className="ml-2 text-xs text-cyan-400">Verified</span>
                    )}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    Class {entry.grade} · {entry.school_name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-amber-300">{entry.score}</p>
                  <p className="text-xs text-muted-foreground">points · {entry.achievement_count} achievements</p>
                </div>
              </li>
            ))}
          </ol>
        </GlassPanel>
      )}
    </div>
  );
}
