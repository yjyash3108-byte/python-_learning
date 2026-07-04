import { AchievementsBoard } from "@/components/achievements/achievements-board";
import { getMyAchievements, getMyCertificates } from "@/lib/data/achievements";

export const metadata = { title: "Achievements" };

export default async function AchievementsPage() {
  const [achievements, certificates] = await Promise.all([
    getMyAchievements({ sort: "newest" }),
    getMyCertificates({ sort: "newest" }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-yellow-400">
          Trophy Room
        </p>
        <h1 className="mt-2 text-3xl font-bold text-foreground text-3d-glow">
          Achievements & Certificates
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Showcase academic wins, hackathons, sports medals, leadership roles, and verified
          certificates in your ScholarNet portfolio.
        </p>
      </div>

      <AchievementsBoard
        initialAchievements={achievements}
        initialCertificates={certificates}
      />
    </div>
  );
}
