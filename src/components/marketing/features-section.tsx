"use client";

import {
  FolderKanban,
  GraduationCap,
  Medal,
  MessageSquare,
  Orbit,
  Sparkles,
  Trophy,
  User,
  Users,
  type LucideIcon,
} from "lucide-react";
import { PLATFORM_FEATURES } from "@/lib/marketing/landing-content";
import { Reveal } from "@/components/marketing/motion-primitives";
import { SectionHeader } from "@/components/marketing/section-header";

const ICONS: Record<string, LucideIcon> = {
  User,
  FolderKanban,
  Orbit,
  Trophy,
  Medal,
  MessageSquare,
  Users,
  Sparkles,
  GraduationCap,
};

export function FeaturesSection() {
  return (
    <section id="features" className="section-glow relative py-24 sm:py-32">
      <div className="section-divider absolute inset-x-0 top-0" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <SectionHeader
            eyebrow="Platform"
            title="Everything a student needs to stand out"
            description="One premium platform for portfolios, clubs, achievements, messaging, AI tools, and opportunities."
            accent="indigo"
          />
        </Reveal>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PLATFORM_FEATURES.map((feature, i) => {
            const Icon = ICONS[feature.icon];
            return (
              <Reveal key={feature.title} delay={i * 0.05}>
                <div className="group h-full rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl transition-all duration-300 hover:border-indigo-400/30 hover:bg-white/[0.07] hover:shadow-[0_20px_50px_rgba(99,102,241,0.15)]">
                  <div
                    className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} text-white shadow-lg transition-transform group-hover:scale-110`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-foreground">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
