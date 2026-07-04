"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SHOWCASE_CLUBS } from "@/lib/marketing/landing-content";
import { Reveal } from "@/components/marketing/motion-primitives";
import { SectionHeader } from "@/components/marketing/section-header";
import { Button } from "@/components/ui/button";

export function ClubShowcaseSection() {
  return (
    <section id="clubs" className="section-glow relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <SectionHeader
            eyebrow="Clubs"
            title="Find your community"
            description="Join thousands of students in clubs built around shared passions and ambitions."
            accent="emerald"
          />
        </Reveal>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {SHOWCASE_CLUBS.map((club, i) => (
            <Reveal key={club.name} delay={i * 0.07}>
              <div className="group flex h-full flex-col items-center rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-center backdrop-blur-xl transition-all hover:border-emerald-400/30 hover:shadow-[0_16px_40px_rgba(16,185,129,0.15)]">
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-2xl text-3xl ring-2 ring-white/10 transition group-hover:scale-110"
                  style={{
                    background: `linear-gradient(135deg, ${club.color}44, ${club.color}18)`,
                    boxShadow: `0 8px 24px ${club.color}33`,
                  }}
                >
                  {club.emoji}
                </div>
                <h3 className="mt-4 font-semibold text-foreground">{club.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{club.category}</p>
                <p className="mt-2 text-sm font-medium text-emerald-400/90">
                  {club.members.toLocaleString()} members
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.3}>
          <div className="mt-10 text-center">
            <Button asChild variant="outline" className="border-white/15 bg-white/[0.04]">
              <Link href="/signup">
                Start or join a club
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
