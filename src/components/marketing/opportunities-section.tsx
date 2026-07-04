"use client";

import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";
import { OPPORTUNITIES } from "@/lib/marketing/landing-content";
import { Reveal } from "@/components/marketing/motion-primitives";
import { SectionHeader } from "@/components/marketing/section-header";
import { Button } from "@/components/ui/button";

const TAG_COLORS: Record<string, string> = {
  scholarship: "bg-amber-500/15 text-amber-300 border-amber-400/20",
  hackathon: "bg-violet-500/15 text-violet-300 border-violet-400/20",
  competition: "bg-rose-500/15 text-rose-300 border-rose-400/20",
  event: "bg-cyan-500/15 text-cyan-300 border-cyan-400/20",
};

export function OpportunitiesSection() {
  return (
    <section id="opportunities" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <SectionHeader
            eyebrow="Opportunities"
            title="Scholarships, hackathons, and more"
            description="Discover programs matched to your skills, interests, and achievements."
            accent="amber"
          />
        </Reveal>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {OPPORTUNITIES.map((opp, i) => (
            <Reveal key={opp.title} delay={i * 0.06}>
              <div className="group flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl transition-all hover:border-indigo-400/25 hover:bg-white/[0.06]">
                <span
                  className={`inline-flex w-fit rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${TAG_COLORS[opp.tag]}`}
                >
                  {opp.type}
                </span>
                <h3 className="mt-3 font-semibold text-foreground group-hover:text-indigo-200">
                  {opp.title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">{opp.org}</p>
                <div className="mt-auto flex items-center gap-1.5 pt-4 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  Deadline: {opp.deadline}
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2}>
          <div className="mt-10 text-center">
            <Button asChild className="btn-3d bg-gradient-to-r from-indigo-500 to-cyan-500">
              <Link href="/signup">
                See all opportunities
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
