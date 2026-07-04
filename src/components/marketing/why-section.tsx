"use client";

import Link from "next/link";
import {
  ArrowRight,
  Brain,
  Briefcase,
  Compass,
  Globe,
  Rocket,
  Users,
  type LucideIcon,
} from "lucide-react";
import { WHY_FEATURES } from "@/lib/marketing/content";
import { Reveal } from "@/components/marketing/motion-primitives";
import { SectionHeader } from "@/components/marketing/section-header";
import { FloatingCard3D } from "@/components/ui/floating-card-3d";

const ICONS: Record<string, LucideIcon> = {
  Briefcase,
  Brain,
  Users,
  Globe,
  Rocket,
  Compass,
};

export function WhySection() {
  return (
    <section id="features" className="section-glow relative py-24 sm:py-32">
      <div className="section-divider absolute inset-x-0 top-0" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <SectionHeader
            eyebrow="Why ScholarNet"
            title="Everything you need to grow from curious kid to future leader"
            description="One platform for portfolios, clubs, skills, messaging, and opportunities — built safely for students."
            accent="indigo"
          />
        </Reveal>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {WHY_FEATURES.map((feature, i) => {
            const Icon = ICONS[feature.icon];
            return (
              <Reveal key={feature.title} delay={i * 0.07}>
                <Link
                  href={feature.href}
                  className="group block h-full outline-none focus-visible:rounded-2xl focus-visible:ring-2 focus-visible:ring-indigo-400"
                >
                  <FloatingCard3D className="flex h-full flex-col p-6 transition-colors group-hover:border-indigo-400/25">
                    <div
                      className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} text-white shadow-[0_8px_24px_rgba(99,102,241,0.25)] transition-transform duration-300 group-hover:scale-110`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground transition-colors group-hover:text-indigo-200">
                      {feature.title}
                    </h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                      {feature.description}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-indigo-400 transition-all group-hover:gap-2.5">
                      {feature.cta}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </FloatingCard3D>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
