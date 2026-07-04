"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Crown, Loader2 } from "lucide-react";
import { apiPost } from "@/lib/api/client";
import { startProCheckout } from "@/lib/razorpay/checkout";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";
import type { SubscriptionHistory, SubscriptionStatus } from "@/types/subscription";

type SubscriptionPanelProps = {
  status: SubscriptionStatus | null;
  history: SubscriptionHistory | null;
  userName: string;
  userEmail: string;
};

export function SubscriptionPanel({
  status,
  history,
  userName,
  userEmail,
}: SubscriptionPanelProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleUpgrade() {
    setLoading(true);
    setError(null);
    try {
      await startProCheckout({
        userName,
        userEmail,
        onSuccess: () => router.push("/subscription/success"),
        onFailure: (reason) => router.push(`/subscription/failure?reason=${encodeURIComponent(reason)}`),
        onDismiss: () => setLoading(false),
      });
    } catch (e) {
      if (e instanceof Error && e.message !== "Payment cancelled") setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel() {
    if (!window.confirm("Cancel Pro? You'll keep access until your renewal date.")) return;
    setCancelling(true);
    setError(null);
    try {
      await apiPost("/subscription/cancel");
      setMessage("Subscription cancelled. Pro access remains until renewal date.");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not cancel subscription");
    } finally {
      setCancelling(false);
    }
  }

  return (
    <GlassPanel depth="sm" className="space-y-5 p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/20 text-amber-200">
          <Crown className="h-6 w-6" />
        </div>
        <div>
          <h2 className="font-semibold">Subscription</h2>
          <p className="text-sm text-muted-foreground">Manage your ScholarNet Pro plan</p>
        </div>
      </div>

      {message && <p className="text-sm text-emerald-400">{message}</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Current plan</p>
          <p className="mt-1 text-lg font-semibold">
            {status?.is_pro ? status.plan_name ?? "ScholarNet Pro" : "Free"}
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Status</p>
          <p className="mt-1 text-lg font-semibold capitalize">
            {status?.is_pro ? status.status ?? "active" : "Not subscribed"}
          </p>
        </div>
        {status?.is_pro && status.renewal_date && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 sm:col-span-2">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Renewal date</p>
            <p className="mt-1 font-semibold">
              {new Date(status.renewal_date).toLocaleDateString(undefined, {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {status?.is_pro ? (
          <>
            <Button type="button" variant="outline" disabled={cancelling} onClick={handleCancel}>
              {cancelling ? "Cancelling…" : "Cancel subscription"}
            </Button>
            <Button asChild variant="outline">
              <Link href="/upgrade">View plan details</Link>
            </Button>
          </>
        ) : (
          <>
            <Button type="button" className="btn-3d" disabled={loading} onClick={handleUpgrade}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing…
                </>
              ) : (
                "Upgrade to Pro"
              )}
            </Button>
            <Button asChild variant="outline">
              <Link href="/upgrade">Compare plans</Link>
            </Button>
          </>
        )}
      </div>

      {history && history.payments.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold">Payment history</h3>
          <ul className="space-y-2">
            {history.payments.slice(0, 5).map((payment) => (
              <li
                key={payment.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white/5 px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-medium">₹{payment.amount}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(payment.created_at).toLocaleString()}
                    {payment.payment_method ? ` · ${payment.payment_method}` : ""}
                  </p>
                </div>
                <span
                  className={
                    payment.status === "captured"
                      ? "text-emerald-400"
                      : "text-muted-foreground"
                  }
                >
                  {payment.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </GlassPanel>
  );
}
