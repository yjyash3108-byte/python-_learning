"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Bookmark, BookmarkCheck, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { apiDelete, apiPost } from "@/lib/api/client";
import type { Opportunity } from "@/types/opportunity";

type OpportunityDetailProps = {
  opportunity: Opportunity;
  similar: Opportunity[];
};

export function OpportunityDetail({ opportunity, similar }: OpportunityDetailProps) {
  const [opp, setOpp] = useState(opportunity);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function toggleSave() {
    setLoading(true);
    setError(null);
    try {
      if (opp.is_saved) {
        await apiDelete(`/opportunities/${opp.id}/save`);
        setOpp((o) => ({ ...o, is_saved: false }));
      } else {
        await apiPost(`/opportunities/${opp.id}/save`);
        setOpp((o) => ({ ...o, is_saved: true }));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setLoading(false);
    }
  }

  async function apply() {
    if (opp.has_applied) return;
    setLoading(true);
    setError(null);
    try {
      await apiPost(`/opportunities/${opp.id}/apply`);
      setOpp((o) => ({ ...o, has_applied: true }));
      setNotice(
        opp.link_url
          ? "Application recorded. Complete the form on the organizer's site."
          : "Applied! The organizer will follow up using your ScholarNet profile."
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Apply failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <Link
        href="/opportunities"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to opportunities
      </Link>

      <GlassPanel depth="md" className="space-y-6 p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <span className="text-xs font-medium capitalize text-amber-400">{opp.opportunity_type}</span>
            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{opp.title}</h1>
            <p className="mt-1 text-lg text-muted-foreground">{opp.organization}</p>
          </div>
          <span
            className={`shrink-0 rounded-full px-3 py-1 text-sm ${
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

        {opp.matched_skills && opp.matched_skills.length > 0 && (
          <p className="text-sm text-emerald-400/90">
            Matches your profile: {opp.matched_skills.join(", ")}
          </p>
        )}

        {opp.description && (
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              About
            </h2>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-200">
              {opp.description}
            </p>
          </div>
        )}

        {opp.skills_required.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Skills
            </h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {opp.skills_required.map((s) => (
                <span
                  key={s}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {opp.deadline && (
          <p className="text-sm text-muted-foreground">
            Deadline: {new Date(opp.deadline).toLocaleDateString(undefined, {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {opp.has_applied ? (
            <Button size="lg" variant="secondary" disabled className="opacity-80">
              Applied ✓
            </Button>
          ) : opp.link_url ? (
            <Button size="lg" className="btn-3d gap-2" asChild>
              <a
                href={opp.link_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => void apply()}
              >
                Apply & open site
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          ) : (
            <Button size="lg" className="btn-3d" disabled={loading} onClick={() => void apply()}>
              {loading ? "Applying…" : "Apply"}
            </Button>
          )}
          <Button
            size="lg"
            variant="outline"
            disabled={loading}
            onClick={() => void toggleSave()}
            className="gap-2 border-white/15 bg-white/5"
          >
            {opp.is_saved ? (
              <>
                <BookmarkCheck className="h-4 w-4 text-emerald-400" />
                Saved
              </>
            ) : (
              <>
                <Bookmark className="h-4 w-4" />
                Bookmark
              </>
            )}
          </Button>
          {opp.link_url && (
            <Button size="lg" variant="outline" asChild className="gap-2">
              <a href={opp.link_url} target="_blank" rel="noopener noreferrer">
                Visit website
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>

        {notice && (
          <p className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-100">
            {notice}
          </p>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </GlassPanel>

      {similar.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Similar opportunities</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {similar.map((s) => (
              <Link key={s.id} href={`/opportunities/${s.id}`}>
                <GlassPanel depth="sm" className="p-4 transition hover:border-indigo-500/30">
                  <span className="text-xs capitalize text-amber-400">{s.opportunity_type}</span>
                  <p className="mt-1 font-medium">{s.title}</p>
                  <p className="text-sm text-muted-foreground">{s.organization}</p>
                  <p className="mt-2 text-xs text-emerald-400">{s.match_score}% match</p>
                </GlassPanel>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
