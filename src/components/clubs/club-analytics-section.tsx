"use client";

import Link from "next/link";
import { BarChart3, Calendar, Crown, Megaphone, Users } from "lucide-react";
import { GlassPanel } from "@/components/ui/glass-panel";
import type { ClubAnalytics } from "@/types/club-analytics";

type ClubAnalyticsSectionProps = {
  analytics: ClubAnalytics;
};

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <GlassPanel depth="sm" className="p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-bold">{value.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
    </GlassPanel>
  );
}

export function ClubAnalyticsSection({ analytics }: ClubAnalyticsSectionProps) {
  const maxJoins = Math.max(...analytics.member_growth.map((p) => p.joins), 1);

  return (
    <section className="space-y-6">
      <h2 className="text-lg font-semibold">Analytics</h2>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Members" value={analytics.member_count} icon={Users} />
        <StatCard label="Events" value={analytics.event_count} icon={Calendar} />
        <StatCard label="Announcements" value={analytics.announcement_count} icon={Megaphone} />
        <StatCard label="Upcoming events" value={analytics.upcoming_events} icon={BarChart3} />
      </div>

      {analytics.can_view_advanced ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <StatCard label="New members (7 days)" value={analytics.new_members_7d} icon={Users} />
            <StatCard label="Total event RSVPs" value={analytics.total_rsvps} icon={Calendar} />
          </div>

          <GlassPanel depth="sm" className="p-5">
            <h3 className="mb-4 text-sm font-semibold">Member joins — last 7 days</h3>
            <div className="flex items-end justify-between gap-2 h-32">
              {analytics.member_growth.map((point) => (
                <div key={point.date} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className="w-full max-w-[2rem] rounded-t bg-gradient-to-t from-indigo-600 to-cyan-400 transition-all"
                    style={{
                      height: `${Math.max(8, (point.joins / maxJoins) * 100)}%`,
                      minHeight: point.joins > 0 ? "1rem" : "0.25rem",
                    }}
                    title={`${point.joins} joins`}
                  />
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(point.date).toLocaleDateString(undefined, { weekday: "narrow" })}
                  </span>
                </div>
              ))}
            </div>
          </GlassPanel>
        </>
      ) : (
        <GlassPanel depth="sm" className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium">Advanced analytics</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Member growth charts, RSVP totals, and weekly trends require ScholarNet Pro.
            </p>
          </div>
          <Link
            href="/upgrade"
            className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-indigo-500 to-cyan-500 px-4 py-2 text-sm font-medium text-white btn-3d"
          >
            <Crown className="h-4 w-4" />
            Upgrade to Pro
          </Link>
        </GlassPanel>
      )}
    </section>
  );
}
