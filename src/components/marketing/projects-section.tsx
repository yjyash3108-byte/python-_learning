"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SHOWCASE_PROJECTS } from "@/lib/marketing/content";
import { Reveal } from "@/components/marketing/motion-primitives";
import { SectionHeader } from "@/components/marketing/section-header";
import { FloatingCard3D } from "@/components/ui/floating-card-3d";

export function ProjectsSection() {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <section id="projects" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <SectionHeader
            eyebrow="Project Showcase"
            title="Cinematic galleries for what you build"
            description="Websites, AI apps, robotics — showcase your work like a pro."
            accent="fuchsia"
          />
        </Reveal>

        <div className="grid gap-6 sm:grid-cols-2">
          {SHOWCASE_PROJECTS.map((project, i) => (
            <Reveal key={project.title} delay={i * 0.1}>
              <div onClick={() => setSelected(i)} className="cursor-pointer">
                <FloatingCard3D className="p-6">
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                  {project.category}
                </span>
                <h3 className="mt-2 text-xl font-semibold text-foreground">{project.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{project.description}</p>
                <div className="mt-4 flex gap-2">
                  {project.tags.map((t) => (
                    <span key={t} className="rounded-md bg-white/5 px-2 py-0.5 text-xs">
                      {t}
                    </span>
                  ))}
                </div>
                </FloatingCard3D>
              </div>
            </Reveal>
          ))}
        </div>

        <AnimatePresence>
          {selected !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md"
              onClick={() => setSelected(null)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="max-w-lg rounded-2xl border border-white/10 bg-background/95 p-8"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-2xl font-bold">{SHOWCASE_PROJECTS[selected].title}</h3>
                <p className="mt-4 text-sm text-muted-foreground">
                  {SHOWCASE_PROJECTS[selected].description}
                </p>
                <Link
                  href="/signup"
                  className="mt-6 inline-flex rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
                >
                  Join ScholarNet to showcase your projects
                </Link>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
