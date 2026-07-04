"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Reveal } from "@/components/marketing/motion-primitives";
import { Button } from "@/components/ui/button";

export function FinalCtaSection() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-white/10 px-8 py-16 text-center sm:px-16 sm:py-24">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/40 via-violet-600/25 to-cyan-600/35" />
            <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-indigo-500/25 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl" />

            <div className="relative">
              <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium text-indigo-200 backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5" />
                Join 2.4M+ students
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl text-3d-glow">
                Join the Next Generation of Student Leaders.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
                Create your free account today and start building the portfolio that opens doors.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="btn-3d h-12 bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 px-10 text-base shadow-[0_8px_32px_rgba(99,102,241,0.45)]"
                >
                  <Link href="/signup">
                    Create Free Account
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-12 border-white/20 bg-white/[0.06] px-10 backdrop-blur-md"
                >
                  <Link href="/signup">Explore ScholarNet</Link>
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
