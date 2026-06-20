import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getCurrentProfile } from "@/lib/data/profile";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  return (
    <DashboardShell
      userName={profile.full_name}
      grade={profile.grade}
      schoolName={profile.school_name}
    >
      {children}
    </DashboardShell>
  );
}
