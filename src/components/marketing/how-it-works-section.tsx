"use client";

import { HOW_IT_WORKS } from "@/lib/marketing/landing-content";
import { Reveal } from "@/components/marketing/motion-primitives";
import { SectionHeader } from "@/components/marketing/section-header";

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <SectionHeader
            eyebrow="How it works"
            title="From sign-up to standout in five steps"
            description="Getting started takes minutes. Growing your reputation takes a lifetime — ScholarNet helps every step."
            accent="cyan"
          />
        </Reveal>

        <div className="relative">
          <div className="absolute left-6 top-8 hidden h-[calc(100%-4rem)] w-px bg-gradient-to-b from-indigo-500/50 via-violet-500/30 to-transparent lg:left-1/2 lg:block lg:-translate-x-px" />

          <div className="space-y-8 lg:space-y-12">
            {HOW_IT_WORKS.map((step, i) => (
              <Reveal key={step.step} delay={i * 0.08}>
                <div
                  className={`relative flex flex-col gap-6 lg:flex-row lg:items-center ${
                    i % 2 === 1 ? "lg:flex-row-reverse" : ""
                  }`}
                >
                  <div className="flex-1 lg:text-right" style={i % 2 === 1 ? { textAlign: "left" } : undefined}>
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                      Step {step.step}
                    </span>
                    <h3 className="mt-1 text-xl font-semibold text-foreground">{step.title}</h3>
                    <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground lg:ml-auto" style={i % 2 === 1 ? { marginLeft: 0 } : undefined}>
                      {step.description}
                    </p>
                  </div>

                  <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 text-lg font-bold text-white shadow-[0_0_32px_rgba(99,102,241,0.45)] lg:absolute lg:left-1/2 lg:-translate-x-1/2">
                    {step.step}
                  </div>

                  <div className="hidden flex-1 lg:block" />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
