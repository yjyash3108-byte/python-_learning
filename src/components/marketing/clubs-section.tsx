"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Orbit } from "lucide-react";
import { CLUBS } from "@/lib/marketing/content";
import { Reveal } from "@/components/marketing/motion-primitives";
import { SectionHeader } from "@/components/marketing/section-header";

export function ClubsSection() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <section id="clubs" className="section-glow relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <SectionHeader
            eyebrow="Clubs & Communities"
            title="Orbit into communities that match your passion"
            description="From coding to debate to robotics — find your tribe and grow together."
            accent="emerald"
          />
        </Reveal>

        <div className="relative mx-auto flex h-[460px] max-w-3xl items-center justify-center">
          {/* Orbit ring */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-[280px] w-[280px] rounded-full border border-dashed border-white/10 animate-orbit-spin" />
            <div className="absolute h-[200px] w-[200px] rounded-full border border-white/5" />
          </div>

          {/* Center hub */}
          <div className="absolute left-1/2 top-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/30 to-cyan-500/20 shadow-[0_0_40px_rgba(16,185,129,0.25)] ring-1 ring-white/10 backdrop-blur-md">
              <Orbit className="h-8 w-8 text-emerald-300" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">ScholarNet</span>
          </div>

          {CLUBS.map((club, i) => {
            const angle = (i / CLUBS.length) * Math.PI * 2 - Math.PI / 2;
            const x = Math.cos(angle) * 150;
            const y = Math.sin(angle) * 110;
            const isActive = active === club.name;

            return (
              <motion.button
                key={club.name}
                type="button"
                onClick={() => setActive(isActive ? null : club.name)}
                className="absolute z-20 flex flex-col items-center gap-2 outline-none"
                style={{ left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)` }}
                animate={{ scale: isActive ? 1.15 : 1 }}
                whileHover={{ scale: 1.08 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <motion.div
                  className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-2xl text-2xl ring-2 ring-white/10"
                  style={{
                    background: `linear-gradient(135deg, ${club.color}cc, ${club.color}55)`,
                    boxShadow: isActive
                      ? `0 0 48px ${club.color}88`
                      : `0 8px 32px ${club.color}44`,
                  }}
                  animate={isActive ? { rotate: [0, -5, 5, 0] } : {}}
                  transition={{ duration: 0.4 }}
                >
                  {club.emoji}
                </motion.div>
                <span className="max-w-[90px] truncate text-xs font-medium text-muted-foreground">
                  {club.name}
                </span>
              </motion.button>
            );
          })}

          <AnimatePresence>
            {active && (
              <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: 0.95 }}
                className="absolute inset-x-6 bottom-0 rounded-2xl border border-white/10 bg-white/[0.08] p-6 backdrop-blur-xl"
              >
                <h3 className="text-lg font-semibold text-foreground">{active}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {CLUBS.find((c) => c.name === active)?.members.toLocaleString()} members
                  worldwide · Join on ScholarNet
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
