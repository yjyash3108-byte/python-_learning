import Link from "next/link";
import { Crown, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { getSubscriptionStatus } from "@/lib/data/subscription";

export const metadata = { title: "Payment Successful" };

export default async function SubscriptionSuccessPage() {
  const status = await getSubscriptionStatus();

  return (
    <div className="mx-auto max-w-lg space-y-6 py-8">
      <GlassPanel depth="lg" tilt className="p-8 text-center">
        <PartyPopper className="mx-auto h-14 w-14 text-amber-300" />
        <h1 className="mt-6 text-3xl font-bold text-foreground text-3d-glow">
          Welcome to ScholarNet Pro!
        </h1>
        <p className="mt-3 text-muted-foreground">Payment successful. Your subscription is active.</p>

        <div className="mt-8 space-y-3 rounded-xl border border-white/10 bg-white/5 p-5 text-left text-sm">
          <div className="flex items-center gap-2 font-medium text-foreground">
            <Crown className="h-4 w-4 text-amber-300" />
            Subscription activated
          </div>
          <p>
            <span className="text-muted-foreground">Plan: </span>
            {status?.plan_name ?? "ScholarNet Pro"}
          </p>
          <p>
            <span className="text-muted-foreground">Renewal date: </span>
            {status?.renewal_date
              ? new Date(status.renewal_date).toLocaleDateString(undefined, {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : "—"}
          </p>
        </div>

        <Button asChild className="btn-3d mt-8 w-full bg-gradient-to-r from-indigo-500 to-cyan-500">
          <Link href="/feed">Go to Dashboard</Link>
        </Button>
      </GlassPanel>
    </div>
  );
}
