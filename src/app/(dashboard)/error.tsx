"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <GlassPanel depth="md" static className="mx-auto max-w-lg p-8 text-center">
      <AlertTriangle className="mx-auto h-10 w-10 text-amber-400" />
      <h2 className="mt-4 text-xl font-semibold">Something went wrong</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        We couldn&apos;t load this page. Try again or return to your feed.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button type="button" className="btn-3d" onClick={reset}>
          Try again
        </Button>
        <Button type="button" variant="outline" asChild className="border-white/15 bg-white/5">
          <a href="/feed">Go to feed</a>
        </Button>
      </div>
    </GlassPanel>
  );
}
