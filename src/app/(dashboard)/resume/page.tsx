import { getCurrentProfile } from "@/lib/data/profile";
import { getMyAchievements } from "@/lib/data/achievements";
import { getPortfolio } from "@/lib/data/dashboard";
import { ResumeBuilder } from "@/components/resume/resume-builder";

export const metadata = { title: "Resume Builder" };

export default async function ResumePage() {
  const [profile, achievements, projects] = await Promise.all([
    getCurrentProfile(),
    getMyAchievements(),
    getPortfolio("project"),
  ]);

  if (!profile) return null;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-400">Career tools</p>
        <h1 className="mt-2 text-3xl font-bold text-3d-glow">Resume builder</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Generate a print-ready PDF resume from your ScholarNet profile.
        </p>
      </div>
      <ResumeBuilder profile={profile} achievements={achievements} projects={projects} />
    </div>
  );
}
