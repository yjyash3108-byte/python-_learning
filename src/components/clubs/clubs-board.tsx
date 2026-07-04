"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Crown, Orbit, Search, TrendingUp } from "lucide-react";
import { ClubCard } from "@/components/clubs/club-card";
import { CreateClubDialog } from "@/components/clubs/create-club-dialog";
import { PageHeader } from "@/components/ui/page-header";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Input } from "@/components/ui/input";
import { CLUB_CATEGORIES } from "@/lib/clubs/constants";
import type { Club, ClubLimits } from "@/types/club";

type ClubsBoardProps = {
  initialClubs: Club[];
  myClubs: Club[];
  trendingClubs: Club[];
  limits: ClubLimits | null;
  isPro: boolean;
};

export function ClubsBoard({ initialClubs, myClubs, trendingClubs, limits, isPro }: ClubsBoardProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const myClubIds = useMemo(() => new Set(myClubs.map((c) => c.id)), [myClubs]);

  const filtered = useMemo(() => {
    let items = initialClubs.filter((c) => !myClubIds.has(c.id));
    if (category) items = items.filter((c) => c.category === category);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      items = items.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q)
      );
    }
    return items;
  }, [initialClubs, category, search, myClubIds]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Communities"
        title="Clubs"
        accent="emerald"
        description={
          limits && !isPro
            ? `${limits.clubs_created}/${limits.max_clubs_created ?? 1} club created on free plan`
            : "Discover and join student communities."
        }
        action={<CreateClubDialog limits={limits} />}
      />

      {trendingClubs.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-400" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Trending clubs
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {trendingClubs
              .filter((c) => !myClubIds.has(c.id))
              .slice(0, 3)
              .map((club) => (
                <ClubCard key={`trending-${club.id}`} club={club} />
              ))}
          </div>
        </section>
      )}

      {myClubs.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            My clubs
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {myClubs.map((club) => (
              <ClubCard key={club.id} club={club} />
            ))}
          </div>
        </section>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clubs…"
            className="pl-9"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">All categories</option>
          {CLUB_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <GlassPanel depth="sm" className="p-10 text-center">
          <Orbit className="mx-auto h-10 w-10 text-emerald-400" />
          <p className="mt-4 text-muted-foreground">
            {initialClubs.length === 0
              ? "No clubs yet. Be the first to create one!"
              : "No clubs match your search."}
          </p>
        </GlassPanel>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((club) => (
            <ClubCard key={club.id} club={club} />
          ))}
        </div>
      )}

      <GlassPanel depth="sm" className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Orbit className="h-8 w-8 shrink-0 text-emerald-400" />
          {isPro
            ? "Create and manage unlimited clubs with Pro analytics and verified badges."
            : "Free plan: 1 club, up to 50 members. Pro unlocks unlimited clubs, members, and admins."}
        </div>
        {!isPro && (
          <Link
            href="/upgrade"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-gradient-to-r from-indigo-500 to-cyan-500 px-4 py-2 text-sm font-medium text-white btn-3d"
          >
            <Crown className="h-4 w-4" />
            Upgrade to Pro
          </Link>
        )}
      </GlassPanel>
    </div>
  );
}
