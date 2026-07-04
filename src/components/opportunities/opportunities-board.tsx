"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink, Search, Sparkles, Bookmark, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Input } from "@/components/ui/input";
import { OpportunitiesSkillsBanner } from "@/components/opportunities/opportunities-skills-banner";
import { apiDelete, apiPost } from "@/lib/api/client";
import type { Opportunity } from "@/types/opportunity";

const OPP_TYPES = [
  { value: "", label: "All types" },
  { value: "scholarship", label: "Scholarships" },
  { value: "hackathon", label: "Hackathons" },
  { value: "olympiad", label: "Olympiads" },
  { value: "competition", label: "Competitions" },
  { value: "workshop", label: "Workshops" },
  { value: "internship", label: "Internships" },
  { value: "funding", label: "Grants" },
  { value: "volunteer", label: "Volunteer" },
];

type OpportunitiesBoardProps = {
  initialOpportunities: Opportunity[];
  myApplications?: Opportunity[];
  userSkills?: string[];
  isAdmin?: boolean;
};

function updateItem(items: Opportunity[], id: string, patch: Partial<Opportunity>) {
  return items.map((o) => (o.id === id ? { ...o, ...patch } : o));
}

export function OpportunitiesBoard({
  initialOpportunities,
  myApplications = [],
  userSkills = [],
  isAdmin = false,
}: OpportunitiesBoardProps) {
  const [items, setItems] = useState(initialOpportunities);
  const [appliedList, setAppliedList] = useState(myApplications);
  const [applyNotice, setApplyNotice] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [savedOnly, setSavedOnly] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const recommended = useMemo(() => {
    const withMatch = [...items].filter((o) => o.match_score > 0).sort((a, b) => b.match_score - a.match_score);
    if (withMatch.length > 0) return withMatch.slice(0, 2);
    return [...items].sort((a, b) => b.match_score - a.match_score).slice(0, 2);
  }, [items]);

  const filtered = items.filter((o) => {
    if (savedOnly && !o.is_saved) return false;
    if (typeFilter && o.opportunity_type !== typeFilter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      o.title.toLowerCase().includes(q) ||
      o.organization.toLowerCase().includes(q) ||
      o.description.toLowerCase().includes(q) ||
      o.skills_required.some((s) => s.toLowerCase().includes(q))
    );
  });

  function markApplied(opp: Opportunity) {
    setItems((prev) => updateItem(prev, opp.id, { has_applied: true }));
    setAppliedList((prev) => {
      if (prev.some((a) => a.id === opp.id)) return prev;
      return [{ ...opp, has_applied: true }, ...prev];
    });
  }

  async function recordApplication(opp: Opportunity) {
    if (opp.has_applied) return;
    setLoadingId(opp.id);
    setError(null);
    setApplyNotice(null);
    try {
      await apiPost(`/opportunities/${opp.id}/apply`);
      markApplied(opp);
      setApplyNotice(`Applied to "${opp.title}". Complete the application in the new tab.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Apply failed");
    } finally {
      setLoadingId(null);
    }
  }

  async function handleApplyNoLink(opp: Opportunity) {
    setLoadingId(opp.id);
    setError(null);
    setApplyNotice(null);
    try {
      await apiPost(`/opportunities/${opp.id}/apply`);
      markApplied(opp);
      setApplyNotice(`Applied to "${opp.title}". The organizer will follow up using your ScholarNet profile.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Apply failed");
    } finally {
      setLoadingId(null);
    }
  }

  async function toggleSave(id: string, currentlySaved: boolean) {
    setLoadingId(id);
    setError(null);
    try {
      if (currentlySaved) {
        await apiDelete(`/opportunities/${id}/save`);
        setItems((prev) => updateItem(prev, id, { is_saved: false }));
      } else {
        await apiPost(`/opportunities/${id}/save`);
        setItems((prev) => updateItem(prev, id, { is_saved: true }));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setLoadingId(null);
    }
  }

  function MatchHint({ opp }: { opp: Opportunity }) {
    if (opp.match_score > 0 && opp.matched_skills?.length) {
      return (
        <p className="mt-1 text-xs text-emerald-400/90">
          Matches your profile: {opp.matched_skills.join(", ")}
        </p>
      );
    }
    if (opp.skills_required.length > 0 && opp.match_score === 0) {
      return (
        <p className="mt-1 text-xs text-muted-foreground">
          Needs: {opp.skills_required.join(", ")} — add these on your{" "}
          <Link href="/profile" className="text-indigo-400 hover:underline">
            Profile
          </Link>
        </p>
      );
    }
    return null;
  }

  function OpportunityCard({ opp, compact = false }: { opp: Opportunity; compact?: boolean }) {
    return (
      <GlassPanel
        depth="sm"
        tilt={!compact}
        className={compact ? "p-4" : "flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"}
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium capitalize text-amber-400">{opp.opportunity_type}</span>
            {opp.has_applied && (
              <span className="rounded-full bg-indigo-500/15 px-2 py-0.5 text-xs font-medium text-indigo-300">
                Applied
              </span>
            )}
            {opp.is_saved && (
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-400">Saved</span>
            )}
            <span
              className={`rounded-full px-2 py-0.5 text-xs ${
                opp.match_score >= 50
                  ? "bg-emerald-500/10 text-emerald-400"
                  : opp.match_score > 0
                    ? "bg-amber-500/10 text-amber-400"
                    : "bg-white/5 text-muted-foreground"
              }`}
            >
              {opp.match_score}% skill match
            </span>
          </div>
          <h3 className={`font-semibold ${compact ? "" : "mt-0.5"}`}>
            <Link href={`/opportunities/${opp.id}`} className="hover:text-indigo-300">
              {opp.title}
            </Link>
          </h3>
          <p className="text-sm text-muted-foreground">{opp.organization}</p>
          {!compact && opp.description && (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{opp.description}</p>
          )}
          {!compact && opp.skills_required.length > 0 && (
            <p className="mt-2 text-xs text-muted-foreground">Skills: {opp.skills_required.join(", ")}</p>
          )}
          <MatchHint opp={opp} />
          {!compact && opp.deadline && (
            <p className="mt-1 text-xs text-muted-foreground">
              Deadline: {new Date(opp.deadline).toLocaleDateString()}
            </p>
          )}
          {opp.link_url && (
            <p className="mt-2 truncate text-xs text-indigo-400/80" title={opp.link_url}>
              Application site: {opp.link_url.replace(/^https?:\/\//, "")}
            </p>
          )}
        </div>
        <div className={`flex shrink-0 flex-col gap-2 ${compact ? "mt-3" : ""}`}>
          {opp.has_applied ? (
            <>
              <Button size="sm" variant="secondary" disabled className="opacity-80">
                Applied ✓
              </Button>
              {opp.link_url && (
                <Button size="sm" className="btn-3d gap-1" asChild>
                  <a href={opp.link_url} target="_blank" rel="noopener noreferrer">
                    Open application
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </Button>
              )}
            </>
          ) : opp.link_url ? (
            <Button size="sm" className="btn-3d gap-1" asChild>
              <a
                href={opp.link_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => void recordApplication(opp)}
              >
                Apply & open site
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </Button>
          ) : (
            <Button
              size="sm"
              className="btn-3d"
              disabled={loadingId === opp.id}
              onClick={() => void handleApplyNoLink(opp)}
            >
              {loadingId === opp.id ? "Applying…" : "Apply"}
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            disabled={loadingId === opp.id}
            onClick={() => toggleSave(opp.id, opp.is_saved)}
            className="gap-1 border-white/15 bg-white/5"
          >
            {opp.is_saved ? (
              <>
                <BookmarkCheck className="h-3.5 w-3.5 text-emerald-400" />
                Saved
              </>
            ) : (
              <>
                <Bookmark className="h-3.5 w-3.5" />
                Save
              </>
            )}
          </Button>
          <Button size="sm" variant="ghost" asChild className="text-indigo-400">
            <Link href={`/opportunities/${opp.id}`}>View details</Link>
          </Button>
          {opp.link_url && (
            <a
              href={opp.link_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1 text-xs text-indigo-400 hover:underline"
            >
              View website <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </GlassPanel>
    );
  }

  return (
    <div className="space-y-8">
      <OpportunitiesSkillsBanner userSkills={userSkills} isAdmin={isAdmin} />

      {recommended.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-400" />
            <h2 className="text-lg font-semibold">Recommended for you</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {recommended.map((o) => (
              <OpportunityCard key={`rec-${o.id}`} opp={o} compact />
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
            placeholder="Search opportunities…"
            className="pl-9"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="h-10 rounded-xl border border-white/15 bg-white/[0.04] px-3.5 text-sm transition focus:border-indigo-400/40 focus:outline-none focus:ring-2 focus:ring-indigo-400/25"
        >
          {OPP_TYPES.map((t) => (
            <option key={t.value || "all"} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <Button
          type="button"
          size="sm"
          variant={savedOnly ? "default" : "outline"}
          onClick={() => setSavedOnly((v) => !v)}
          className={`gap-1.5 shrink-0 ${savedOnly ? "btn-3d" : "border-white/15 bg-white/5"}`}
        >
          <Bookmark className="h-3.5 w-3.5" />
          Saved
        </Button>
      </div>

      <div className="space-y-4">
        {filtered.length === 0 && (
          <GlassPanel depth="sm" className="p-6 text-sm text-muted-foreground">
            No opportunities match your filters.
          </GlassPanel>
        )}
        {filtered.map((o) => (
          <OpportunityCard key={o.id} opp={o} />
        ))}
      </div>

      {applyNotice && (
        <GlassPanel depth="sm" className="border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">
          {applyNotice}
        </GlassPanel>
      )}

      {appliedList.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">My applications</h2>
          <p className="text-sm text-muted-foreground">
            Opportunities you&apos;ve applied to on ScholarNet.
          </p>
          <ul className="space-y-2">
            {appliedList.map((o) => (
              <li key={`applied-${o.id}`}>
                <GlassPanel depth="sm" className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div>
                    <p className="font-medium">{o.title}</p>
                    <p className="text-sm text-muted-foreground">{o.organization}</p>
                  </div>
                  {o.link_url && (
                    <Link
                      href={o.link_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-indigo-400 hover:underline"
                    >
                      Open application <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </GlassPanel>
              </li>
            ))}
          </ul>
        </section>
      )}

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
