"use client";

import { TRUSTED_SCHOOLS } from "@/lib/marketing/landing-content";
import { Reveal } from "@/components/marketing/motion-primitives";

export function TrustedBySection() {
  return (
    <section className="border-y border-white/5 bg-white/[0.02] py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <p className="mb-8 text-center text-sm font-medium text-muted-foreground">
            Trusted by students from leading schools
          </p>
        </Reveal>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {TRUSTED_SCHOOLS.map((school, i) => (
            <Reveal key={school} delay={i * 0.05}>
              <span className="text-sm font-semibold tracking-wide text-muted-foreground/60 transition hover:text-muted-foreground">
                {school}
              </span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
