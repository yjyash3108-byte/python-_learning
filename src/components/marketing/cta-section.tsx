"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Reveal } from "@/components/marketing/motion-primitives";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <motion.div
            whileInView={{ scale: [0.98, 1] }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl border border-white/10 p-12 text-center sm:p-20"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/40 via-violet-600/25 to-cyan-600/35" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(129,140,248,0.35),transparent_50%)]" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(34,211,238,0.2),transparent_45%)]" />
            <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-cyan-500/15 blur-3xl" />

            <div className="relative">
              <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium text-indigo-200 backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5" />
                Free to start · Pro when you&apos;re ready
              </div>
              <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl text-3d-glow">
                Build Your Future Today.
              </h2>
              <p className="relative mx-auto mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
                Join students building portfolios, earning skills, and connecting globally —
                all in one safe, immersive platform.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="btn-3d h-12 bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 px-10 text-base shadow-[0_8px_32px_rgba(99,102,241,0.45)]"
                >
                  <Link href="/signup">
                    Create Your Profile
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-12 border-white/20 bg-white/[0.06] px-8 backdrop-blur-md"
                >
                  <Link href="/login">Sign in</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </Reveal>
      </div>
    </section>
  );
}
