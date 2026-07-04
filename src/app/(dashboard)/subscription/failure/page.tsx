import Link from "next/link";
import { Suspense } from "react";
import { SubscriptionFailureActions } from "@/components/subscription/subscription-failure-actions";
import { getCurrentProfile } from "@/lib/data/profile";

export const metadata = { title: "Payment Failed" };

export default async function SubscriptionFailurePage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  return (
    <div className="mx-auto max-w-lg space-y-6 py-8">
      <Suspense fallback={null}>
        <SubscriptionFailureActions
          userName={profile.full_name}
          userEmail={profile.email}
        />
      </Suspense>
      <p className="text-center text-sm text-muted-foreground">
        <Link href="/upgrade" className="text-indigo-300 hover:text-indigo-200">
          Back to upgrade page
        </Link>
      </p>
    </div>
  );
}
