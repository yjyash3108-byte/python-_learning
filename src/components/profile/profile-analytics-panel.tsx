"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Crown, Eye } from "lucide-react";
import { apiGet, apiPost } from "@/lib/api/client";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Button } from "@/components/ui/button";

type Analytics = {
  profile_views: number;
  profile_views_7d: number;
  post_views: number;
  post_views_7d: number;
  followers: number;
  followers_7d: number;
};

type ProfileViewer = {
  viewer_id: string;
  full_name: string;
  school_name: string | null;
  viewed_at: string;
};

type ProfileAnalyticsPanelProps = {
  isPro?: boolean;
};

export function ProfileAnalyticsPanel({ isPro = false }: ProfileAnalyticsPanelProps) {
  const [data, setData] = useState<Analytics | null>(null);
  const [viewers, setViewers] = useState<ProfileViewer[] | null>(null);
  const [viewersLocked, setViewersLocked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<Analytics>("/users/analytics/me")
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!isPro) {
      setViewersLocked(true);
      return;
    }
    apiGet<ProfileViewer[]>("/users/analytics/me/viewers")
      .then(setViewers)
      .catch((e) => {
        if (e instanceof Error && e.message.toLowerCase().includes("pro")) {
          setViewersLocked(true);
        } else {
          setViewers([]);
        }
      });
  }, [isPro]);

  if (loading) {
    return <GlassPanel depth="sm" className="p-4 text-sm text-muted-foreground">Loading analytics…</GlassPanel>;
  }

  if (!data) return null;

  const stats = [
    { label: "Profile views", value: data.profile_views, delta: data.profile_views_7d, suffix: "7d" },
    { label: "Post views", value: data.post_views, delta: data.post_views_7d, suffix: "7d" },
    { label: "Followers", value: data.followers, delta: data.followers_7d, suffix: "new" },
  ];

  return (
    <div className="space-y-4">
      <GlassPanel depth="sm" className="p-6">
        <h2 className="font-semibold">Your analytics</h2>
        <p className="mt-1 text-sm text-muted-foreground">Profile and content performance</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center">
              <p className="text-2xl font-bold text-indigo-200">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="mt-1 text-xs text-emerald-400">+{s.delta} {s.suffix}</p>
            </div>
          ))}
        </div>
      </GlassPanel>

      <GlassPanel depth="sm" className="p-6">
        <div className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-cyan-400" />
          <h2 className="font-semibold">Who viewed your profile</h2>
          {isPro && <Crown className="h-4 w-4 text-amber-400" />}
        </div>
        {viewersLocked ? (
          <div className="mt-4 rounded-xl border border-indigo-400/20 bg-indigo-500/10 p-4">
            <p className="text-sm text-muted-foreground">
              See which students visited your public portfolio — a ScholarNet Pro feature.
            </p>
            <Button asChild size="sm" className="mt-3" variant="outline">
              <Link href="/upgrade">Upgrade to Pro</Link>
            </Button>
          </div>
        ) : viewers && viewers.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {viewers.map((v) => (
              <li key={`${v.viewer_id}-${v.viewed_at}`}>
                <Link
                  href={`/profile/${v.viewer_id}`}
                  className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 transition hover:border-cyan-400/30"
                >
                  <div>
                    <p className="font-medium">{v.full_name}</p>
                    {v.school_name && (
                      <p className="text-xs text-muted-foreground">{v.school_name}</p>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(v.viewed_at).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            No logged-in viewers yet. Share your @username link to grow visibility.
          </p>
        )}
      </GlassPanel>
    </div>
  );
}

export function VerifyEmailBanner({ verified }: { verified?: boolean }) {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (verified) return null;

  async function resend() {
    setError(null);
    try {
      const res = await apiPost<{ dev_verify_url?: string }>("/auth/resend-verification");
      setSent(true);
      if (res.dev_verify_url && process.env.NODE_ENV === "development") {
        window.open(res.dev_verify_url, "_blank");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send");
    }
  }

  return (
    <GlassPanel depth="sm" className="border-amber-500/30 bg-amber-500/10 p-4">
      <p className="text-sm font-medium text-amber-200">Verify your email to unlock all features</p>
      <p className="mt-1 text-xs text-muted-foreground">Check your inbox for a verification link.</p>
      <Button type="button" size="sm" className="mt-3" variant="outline" onClick={resend}>
        {sent ? "Email sent!" : "Resend verification email"}
      </Button>
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
    </GlassPanel>
  );
}
