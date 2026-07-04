"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { JOURNEY_STAGES } from "@/lib/marketing/content";
import { Reveal } from "@/components/marketing/motion-primitives";
import { SectionHeader } from "@/components/marketing/section-header";
import { FloatingCard3D } from "@/components/ui/floating-card-3d";

export function JourneySection() {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (!trackRef.current) return;

    const ctx = gsap.context(() => {
      gsap.to(trackRef.current, {
        x: () => -(trackRef.current!.scrollWidth - window.innerWidth + 64),
        ease: "none",
        scrollTrigger: {
          trigger: trackRef.current,
          start: "top 80%",
          end: "bottom 20%",
          scrub: 1,
        },
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <section id="journey" className="relative overflow-hidden py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <SectionHeader
            eyebrow="Student Journey"
            title="Age 5 → Professional. One platform, infinite growth."
            description="ScholarNet grows with you — from first badges to college portfolios."
            accent="cyan"
            align="left"
          />
        </Reveal>
      </div>

      <div ref={trackRef} className="flex w-max gap-6 px-4 pb-8 sm:px-6">
        {JOURNEY_STAGES.map((stage, i) => (
          <FloatingCard3D key={stage.age} className="w-[280px] shrink-0 p-6 sm:w-[320px]">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 text-sm font-bold text-white">
                {i + 1}
              </span>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-indigo-400">
                  {stage.age}
                </p>
                <h3 className="font-semibold text-foreground">{stage.title}</h3>
              </div>
            </div>
            <ul className="space-y-2">
              {stage.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                  {f}
                </li>
              ))}
            </ul>
          </FloatingCard3D>
        ))}
      </div>
    </section>
  );
}
