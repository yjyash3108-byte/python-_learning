"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Crown, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";
import {
  FREE_VS_PRO,
  PAYMENT_METHODS,
  PRO_BENEFITS,
  PRO_PLAN_PRICE,
  UPGRADE_FAQ,
} from "@/lib/subscription/constants";
import { startProCheckout } from "@/lib/razorpay/checkout";
import type { SubscriptionStatus } from "@/types/subscription";

type UpgradeContentProps = {
  status: SubscriptionStatus | null;
  userName: string;
  userEmail: string;
};

export function UpgradeContent({ status, userName, userEmail }: UpgradeContentProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpgrade() {
    setLoading(true);
    setError(null);
    try {
      await startProCheckout({
        userName,
        userEmail,
        onSuccess: () => router.push("/subscription/success"),
        onFailure: (message) => router.push(`/subscription/failure?reason=${encodeURIComponent(message)}`),
        onDismiss: () => setLoading(false),
      });
    } catch (e) {
      if (e instanceof Error && e.message !== "Payment cancelled") {
        setError(e.message);
      }
    } finally {
      setLoading(false);
    }
  }

  if (status?.is_pro) {
    return (
      <GlassPanel depth="lg" className="p-8 text-center">
        <Crown className="mx-auto h-12 w-12 text-amber-300" />
        <h2 className="mt-4 text-2xl font-bold text-foreground">You&apos;re on ScholarNet Pro</h2>
        <p className="mt-2 text-muted-foreground">
          Renewal date:{" "}
          {status.renewal_date
            ? new Date(status.renewal_date).toLocaleDateString()
            : "Active"}
        </p>
        <Button asChild className="btn-3d mt-6">
          <Link href="/feed">Go to Dashboard</Link>
        </Button>
      </GlassPanel>
    );
  }

  return (
    <div className="space-y-10">
      <GlassPanel depth="lg" tilt className="overflow-hidden p-0">
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 px-6 py-12 text-center sm:px-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
            <Crown className="h-8 w-8 text-amber-200" />
          </div>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.35em] text-indigo-100/80">
            ScholarNet Pro
          </p>
          <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl text-3d-glow">
            Upgrade your campus experience
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-indigo-50/90 sm:text-base">
            Unlock unlimited clubs, verified badges, advanced analytics, and priority support —
            built for student leaders who want more.
          </p>
        </div>
      </GlassPanel>

      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <GlassPanel depth="md" tilt className="flex flex-col p-8 text-center lg:sticky lg:top-6 lg:self-start">
          <Sparkles className="mx-auto h-8 w-8 text-cyan-300" />
          <h2 className="mt-4 text-xl font-bold">{PRO_PLAN_PRICE ? "ScholarNet Pro" : "Pro"}</h2>
          <p className="mt-4 text-4xl font-bold text-foreground">
            ₹{PRO_PLAN_PRICE}
            <span className="text-base font-normal text-muted-foreground">/month</span>
          </p>
          <p className="mt-2 text-sm text-muted-foreground">Billed monthly · Cancel anytime</p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {PAYMENT_METHODS.map((method) => (
              <span
                key={method}
                className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-muted-foreground"
              >
                {method}
              </span>
            ))}
          </div>
          {error && (
            <p className="mt-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          <Button
            type="button"
            className="btn-3d mt-6 w-full bg-gradient-to-r from-indigo-500 to-cyan-500"
            disabled={loading}
            onClick={handleUpgrade}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Opening checkout…
              </>
            ) : (
              "Upgrade Now"
            )}
          </Button>
          <p className="mt-4 text-xs text-muted-foreground">
            Secure payments powered by Razorpay. UPI, cards, net banking & wallets supported.
          </p>
        </GlassPanel>

        <div className="space-y-6">
          <GlassPanel depth="sm" className="p-6">
            <h3 className="font-semibold">Everything in Pro</h3>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {PRO_BENEFITS.map((benefit) => (
                <li key={benefit} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  {benefit}
                </li>
              ))}
            </ul>
          </GlassPanel>

          <GlassPanel depth="sm" className="overflow-x-auto p-6">
            <h3 className="font-semibold">Free vs Pro</h3>
            <table className="mt-4 w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-muted-foreground">
                  <th className="py-2 pr-4 font-medium">Feature</th>
                  <th className="py-2 pr-4 font-medium">Free</th>
                  <th className="py-2 font-medium">Pro</th>
                </tr>
              </thead>
              <tbody>
                {FREE_VS_PRO.map((row) => (
                  <tr key={row.feature} className="border-b border-white/5">
                    <td className="py-3 pr-4 text-foreground">{row.feature}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{row.free}</td>
                    <td className="py-3 font-medium text-indigo-200">{row.pro}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </GlassPanel>
        </div>
      </div>

      <GlassPanel depth="sm" className="space-y-4 p-6">
        <h3 className="font-semibold">FAQ</h3>
        {UPGRADE_FAQ.map((item) => (
          <div key={item.q}>
            <p className="font-medium text-foreground">{item.q}</p>
            <p className="mt-1 text-sm text-muted-foreground">{item.a}</p>
          </div>
        ))}
      </GlassPanel>

      <GlassPanel depth="sm" className="p-6 text-sm text-muted-foreground">
        <h3 className="font-semibold text-foreground">Terms & Conditions</h3>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>ScholarNet Pro is a monthly subscription billed at ₹{PRO_PLAN_PRICE} per month.</li>
          <li>Access continues until the end of the paid period after cancellation.</li>
          <li>Payments are processed by Razorpay; refunds follow Razorpay and ScholarNet policies.</li>
          <li>Pro features require an active subscription verified on ScholarNet servers.</li>
          <li>ScholarNet may update Pro benefits with reasonable notice to subscribers.</li>
        </ul>
      </GlassPanel>
    </div>
  );
}
