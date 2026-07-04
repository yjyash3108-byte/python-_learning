"use client";

import { LANDING_STATS } from "@/lib/marketing/landing-content";
import { AnimatedCounter, Reveal } from "@/components/marketing/motion-primitives";

export function StatsSection() {
  return (
    <section className="relative py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-600/20 via-violet-600/10 to-cyan-600/20 p-8 backdrop-blur-xl sm:p-12">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {LANDING_STATS.map((stat, i) => (
              <Reveal key={stat.label} delay={i * 0.08}>
                <div className="text-center">
                  <p className="stat-value text-3xl sm:text-4xl">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </p>
                  <p className="mt-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
