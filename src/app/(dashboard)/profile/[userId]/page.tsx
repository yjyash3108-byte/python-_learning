import { notFound, redirect } from "next/navigation";
import { ProfileShowcase } from "@/components/profile/profile-showcase";
import { StudentProfileView } from "@/components/profile/student-profile-view";
import { getUserAchievements } from "@/lib/data/achievements";
import { getUserProjects } from "@/lib/data/portfolio";
import { getCurrentProfile, getFollowStatus, getUserProfile } from "@/lib/data/profile";
import { canMessageUser } from "@/lib/data/messages";
export async function generateMetadata({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const profile = await getUserProfile(userId);
  return { title: profile?.full_name ?? "Student profile" };
}

export default async function StudentProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const [profile, followStatus, currentUser, canMessage, projects, achievements] = await Promise.all([
    getUserProfile(userId),
    getFollowStatus(userId),
    getCurrentProfile(),
    canMessageUser(userId),
    getUserProjects(userId),
    getUserAchievements(userId),
  ]);

  if (!profile || !followStatus) {
    notFound();
  }

  if (currentUser?.id === userId) {
    redirect("/profile");
  }

  return (
    <div className="space-y-6">
      <StudentProfileView
        profile={profile}
        followStatus={followStatus}
        canMessage={canMessage?.can_message ?? false}
      />
      <ProfileShowcase
        projects={projects}
        achievements={achievements}
        profileName={profile.full_name}
      />
    </div>
  );
}
