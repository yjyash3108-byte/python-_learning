"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { Reveal } from "@/components/marketing/motion-primitives";
import { HeroDashboardMockup } from "@/components/marketing/hero-dashboard-mockup";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden pt-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.25),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_100%_50%,rgba(34,211,238,0.08),transparent_50%)]" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:min-h-[calc(100vh-4rem)] lg:grid-cols-2 lg:gap-16 lg:py-24">
        <div className="max-w-xl space-y-8">
          <Reveal immediate>
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-medium text-indigo-200 backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Trusted by students worldwide
            </div>
          </Reveal>

          <Reveal immediate delay={0.1}>
            <h1 className="text-4xl font-bold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem] text-3d-glow">
              Where Students{" "}
              <span className="bg-gradient-to-r from-indigo-300 via-violet-300 to-cyan-300 bg-clip-text text-transparent">
                Connect, Build, and Grow.
              </span>
            </h1>
          </Reveal>

          <Reveal immediate delay={0.2}>
            <p className="text-lg leading-relaxed text-muted-foreground">
              ScholarNet is the platform where students showcase projects, earn recognition,
              join clubs, discover opportunities, and connect with ambitious peers.
            </p>
          </Reveal>

          <Reveal immediate delay={0.3}>
            <div className="flex flex-wrap gap-4">
              <Button
                asChild
                size="lg"
                className="btn-3d h-12 bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 px-8 text-base shadow-[0_8px_32px_rgba(99,102,241,0.4)]"
              >
                <Link href="/signup">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 gap-2 border-white/20 bg-white/[0.06] px-8 backdrop-blur-md hover:bg-white/10"
              >
                <a href="#how-it-works">
                  <Play className="h-4 w-4 fill-current" />
                  Watch Demo
                </a>
              </Button>
            </div>
          </Reveal>

          <Reveal immediate delay={0.4}>
            <p className="text-sm text-muted-foreground">
              Free for students · Classes 4–12 · No credit card required
            </p>
          </Reveal>
        </div>

        <HeroDashboardMockup />
      </div>
    </section>
  );
}
