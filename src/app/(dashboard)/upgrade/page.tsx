import { UpgradeContent } from "@/components/subscription/upgrade-content";
import { getCurrentProfile } from "@/lib/data/profile";
import { getSubscriptionStatus } from "@/lib/data/subscription";

export const metadata = { title: "Upgrade to Pro" };

export default async function UpgradePage() {
  const [profile, status] = await Promise.all([getCurrentProfile(), getSubscriptionStatus()]);
  if (!profile) return null;

  return (
    <div className="space-y-8">
      <UpgradeContent
        status={status}
        userName={profile.full_name}
        userEmail={profile.email}
      />
    </div>
  );
}
