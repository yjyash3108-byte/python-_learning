import { OpportunitiesBoard } from "@/components/opportunities/opportunities-board";
import { getMyApplications, getOpportunities } from "@/lib/data/opportunities";
import { getCurrentProfile } from "@/lib/data/profile";

export const metadata = { title: "Opportunities" };

export default async function OpportunitiesPage() {
  const [opportunities, myApplications, profile] = await Promise.all([
    getOpportunities().catch(() => []),
    getMyApplications().catch(() => []),
    getCurrentProfile(),
  ]);

  const userSkills = [...(profile?.skills ?? []), ...(profile?.interests ?? [])];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-400">Discover</p>
        <h1 className="mt-2 text-3xl font-bold text-foreground text-3d-glow">Opportunities</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Internships, competitions, and grants matched to your skills.
        </p>
      </div>
      <OpportunitiesBoard
        initialOpportunities={opportunities}
        myApplications={myApplications}
        userSkills={userSkills}
        isAdmin={profile?.is_admin}
      />
    </div>
  );
}
