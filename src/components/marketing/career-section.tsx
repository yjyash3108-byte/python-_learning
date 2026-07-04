"use client";

import { CAREER_PATHS } from "@/lib/marketing/content";
import { Reveal } from "@/components/marketing/motion-primitives";
import { SectionHeader } from "@/components/marketing/section-header";

const CONNECTIONS = [
  [0, 1], [0, 2], [1, 3], [2, 4], [2, 5], [3, 5], [4, 5],
];

export function CareerExplorerSection() {
  return (
    <section id="careers" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <SectionHeader
            eyebrow="Career Explorer"
            title="Navigate glowing pathways to your future"
            description="Explore careers early — from AI engineer to entrepreneur."
            accent="amber"
          />
        </Reveal>

        <Reveal>
          <div className="relative mx-auto aspect-[16/9] max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              {CONNECTIONS.map(([a, b], i) => {
                const from = CAREER_PATHS[a];
                const to = CAREER_PATHS[b];
                return (
                  <line
                    key={i}
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke="url(#careerGrad)"
                    strokeWidth="0.4"
                    className="animate-pulse"
                  />
                );
              })}
              <defs>
                <linearGradient id="careerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#22d3ee" />
                </linearGradient>
              </defs>
            </svg>

            {CAREER_PATHS.map((path) => (
              <div
                key={path.title}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${path.x}%`, top: `${path.y}%` }}
              >
                <div className="group cursor-default">
                  <div className="h-4 w-4 rounded-full bg-gradient-to-br from-indigo-400 to-cyan-400 shadow-[0_0_20px_rgba(99,102,241,0.8)] transition-transform group-hover:scale-150" />
                  <p className="absolute left-1/2 mt-2 w-max -translate-x-1/2 rounded-lg border border-white/10 bg-background/80 px-2 py-1 text-xs font-medium backdrop-blur-md">
                    {path.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
