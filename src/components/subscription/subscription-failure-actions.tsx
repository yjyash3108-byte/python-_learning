"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { AlertCircle, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { startProCheckout } from "@/lib/razorpay/checkout";

type SubscriptionFailureActionsProps = {
  userName: string;
  userEmail: string;
};

export function SubscriptionFailureActions({
  userName,
  userEmail,
}: SubscriptionFailureActionsProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reason = searchParams.get("reason") ?? "Your payment could not be completed.";
  const [loading, setLoading] = useState(false);

  async function retry() {
    setLoading(true);
    try {
      await startProCheckout({
        userName,
        userEmail,
        onSuccess: () => router.push("/subscription/success"),
        onFailure: (message) =>
          router.push(`/subscription/failure?reason=${encodeURIComponent(message)}`),
        onDismiss: () => setLoading(false),
      });
    } catch {
      setLoading(false);
    }
  }

  return (
    <GlassPanel depth="lg" className="p-8 text-center">
      <AlertCircle className="mx-auto h-14 w-14 text-destructive" />
      <h1 className="mt-6 text-3xl font-bold text-foreground">Payment failed</h1>
      <p className="mt-3 text-muted-foreground">{reason}</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button type="button" className="btn-3d" disabled={loading} onClick={retry}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Retrying…
            </>
          ) : (
            "Retry payment"
          )}
        </Button>
        <Button asChild variant="outline">
          <a href="mailto:support@scholarnet.app">
            <Mail className="h-4 w-4" />
            Contact support
          </a>
        </Button>
      </div>
    </GlassPanel>
  );
}
