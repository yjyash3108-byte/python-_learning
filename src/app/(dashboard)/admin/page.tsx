import { redirect } from "next/navigation";
import { AdminPanel } from "@/components/admin/admin-panel";
import { getAdminOpportunities, getAdminUsers, getSystemStatus } from "@/lib/data/admin";
import { getCurrentProfile } from "@/lib/data/profile";

export const metadata = { title: "Admin" };

export default async function AdminPage() {
  const profile = await getCurrentProfile();
  if (!profile?.is_admin) {
    redirect("/feed");
  }

  const [users, opportunities, systemStatus] = await Promise.all([
    getAdminUsers(),
    getAdminOpportunities(),
    getSystemStatus(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-400">Admin</p>
        <h1 className="mt-2 text-3xl font-bold text-foreground text-3d-glow">Dashboard</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage users and opportunities. Payment keys can be added in backend/.env later.
        </p>
      </div>
      <AdminPanel
        initialUsers={users}
        initialOpportunities={opportunities}
        systemStatus={systemStatus}
      />
    </div>
  );
}
