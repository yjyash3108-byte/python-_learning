"use client";

import { Check, X } from "lucide-react";
import { COMPARISON_ROWS } from "@/lib/marketing/landing-content";
import { Reveal } from "@/components/marketing/motion-primitives";
import { SectionHeader } from "@/components/marketing/section-header";

function CellValue({ value }: { value: boolean | string }) {
  if (value === true) {
    return <Check className="mx-auto h-5 w-5 text-emerald-400" aria-label="Yes" />;
  }
  if (value === false) {
    return <X className="mx-auto h-5 w-5 text-muted-foreground/40" aria-label="No" />;
  }
  return <span className="text-sm text-foreground">{value}</span>;
}

export function WhyScholarNetSection() {
  return (
    <section id="why" className="section-glow relative py-24 sm:py-32">
      <div className="section-divider absolute inset-x-0 top-0" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <SectionHeader
            eyebrow="Why ScholarNet?"
            title="More than a school group chat"
            description="Traditional school communities weren't built for portfolios, global networking, or career discovery. ScholarNet was."
            accent="indigo"
          />
        </Reveal>

        <Reveal delay={0.1}>
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl">
            <div className="grid grid-cols-3 border-b border-white/10 bg-white/[0.04] px-4 py-4 text-sm font-semibold sm:px-6">
              <span className="text-muted-foreground">Feature</span>
              <span className="text-center text-muted-foreground">Traditional</span>
              <span className="bg-gradient-to-r from-indigo-300 to-cyan-300 bg-clip-text text-center text-transparent">
                ScholarNet
              </span>
            </div>
            {COMPARISON_ROWS.map((row, i) => (
              <div
                key={row.feature}
                className={`grid grid-cols-3 items-center px-4 py-4 text-sm sm:px-6 ${
                  i % 2 === 0 ? "bg-white/[0.02]" : ""
                }`}
              >
                <span className="font-medium text-foreground">{row.feature}</span>
                <div className="text-center">
                  <CellValue value={row.traditional} />
                </div>
                <div className="text-center">
                  <CellValue value={row.scholarnet} />
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
