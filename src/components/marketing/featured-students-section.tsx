"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FEATURED_STUDENTS } from "@/lib/marketing/content";
import { Reveal } from "@/components/marketing/motion-primitives";
import { SectionHeader } from "@/components/marketing/section-header";
import { FloatingCard3D } from "@/components/ui/floating-card-3d";

export function FeaturedStudentsSection() {
  const doubled = [...FEATURED_STUDENTS, ...FEATURED_STUDENTS];
  const [paused, setPaused] = useState(false);

  return (
    <section id="students" className="relative overflow-hidden py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <SectionHeader
            eyebrow="Featured Students"
            title="Rising stars building their future today"
            description="Real portfolios, real projects — students already standing out on ScholarNet."
            accent="purple"
          />
        </Reveal>
      </div>

      <div
        className="relative"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="marquee-fade-left pointer-events-none absolute inset-y-0 left-0 z-10 w-24 sm:w-40" />
        <div className="marquee-fade-right pointer-events-none absolute inset-y-0 right-0 z-10 w-24 sm:w-40" />

        <motion.div
          className="flex w-max gap-6 px-4"
          animate={paused ? {} : { x: ["0%", "-50%"] }}
          transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
        >
          {doubled.map((student, i) => (
            <FloatingCard3D
              key={`${student.name}-${i}`}
              glow={`${student.color}66`}
              className="w-[300px] shrink-0 p-6"
            >
              <div className="flex items-center gap-4">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl text-lg font-bold text-white shadow-lg ring-2 ring-white/10"
                  style={{
                    background: `linear-gradient(135deg, ${student.color}, ${student.color}88)`,
                  }}
                >
                  {student.avatar}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{student.name}</h3>
                  <p className="text-sm text-muted-foreground">{student.grade}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {student.skills.map((s) => (
                  <span
                    key={s}
                    className="rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-0.5 text-xs text-muted-foreground"
                  >
                    {s}
                  </span>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-center text-sm">
                <div className="rounded-xl border border-white/5 bg-white/[0.04] p-2.5">
                  <p className="font-bold text-foreground">{student.projects}</p>
                  <p className="text-xs text-muted-foreground">Projects</p>
                </div>
                <div className="rounded-xl border border-white/5 bg-white/[0.04] p-2.5">
                  <p className="font-bold text-foreground">{student.achievements}</p>
                  <p className="text-xs text-muted-foreground">Achievements</p>
                </div>
              </div>
            </FloatingCard3D>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
