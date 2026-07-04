import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { requireProfile } from "@/lib/auth/require-profile";
import { getDashboardStats } from "@/lib/data/dashboard";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireProfile("/feed");

  if (!profile.onboarding_completed) {
    redirect("/onboarding");
  }

  const stats = await getDashboardStats();

  return (
    <DashboardShell
      userName={profile.full_name}
      grade={profile.grade}
      schoolName={profile.school_name}
      isAdmin={profile.is_admin}
      unreadCount={stats?.unread_notifications ?? 0}
    >
      {children}
    </DashboardShell>
  );
}
