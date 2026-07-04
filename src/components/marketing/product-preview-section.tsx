"use client";

import { Reveal } from "@/components/marketing/motion-primitives";
import { SectionHeader } from "@/components/marketing/section-header";
import { FloatingCard3D } from "@/components/ui/floating-card-3d";

const SCREENSHOTS = [
  { title: "Achievement feed", desc: "Share wins, projects, and milestones with classmates.", gradient: "from-indigo-600/40 to-cyan-600/20" },
  { title: "Skill-matched opportunities", desc: "Scholarships, hackathons, and olympiads tailored to you.", gradient: "from-violet-600/40 to-fuchsia-600/20" },
  { title: "Club hub", desc: "Events, announcements, and member analytics in one place.", gradient: "from-amber-600/30 to-orange-600/20" },
];

export function ScreenshotsSection() {
  return (
    <section id="screenshots" className="relative py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <SectionHeader
            eyebrow="Product preview"
            title="See ScholarNet in action"
            description="A glimpse of the dashboard students use every day."
            accent="cyan"
          />
        </Reveal>
        <div className="grid gap-6 md:grid-cols-3">
          {SCREENSHOTS.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.08}>
              <FloatingCard3D className="overflow-hidden p-0">
                <div className={`flex h-40 items-center justify-center bg-gradient-to-br ${s.gradient}`}>
                  <span className="rounded-lg border border-white/20 bg-black/30 px-4 py-2 text-sm font-medium text-white/90">
                    {s.title}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold">{s.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
                </div>
              </FloatingCard3D>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function DemoVideoSection() {
  const demoUrl = process.env.NEXT_PUBLIC_DEMO_VIDEO_URL;

  return (
    <section id="demo" className="py-24">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
        <Reveal>
          <SectionHeader
            eyebrow="Demo"
            title="Watch how ScholarNet works"
            description="From signup to your first post — under two minutes."
            accent="violet"
          />
        </Reveal>
        <Reveal delay={0.1}>
          <div className="relative mt-10 aspect-video overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-950 via-slate-900 to-cyan-950 shadow-2xl">
            {demoUrl ? (
              <iframe
                src={demoUrl}
                title="ScholarNet demo"
                className="absolute inset-0 h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 ring-2 ring-indigo-400/50">
                  <span className="ml-1 text-2xl">▶</span>
                </div>
                <p className="max-w-md text-sm text-muted-foreground">
                  Set <code className="text-indigo-300">NEXT_PUBLIC_DEMO_VIDEO_URL</code> to your YouTube/Vimeo embed URL, or{" "}
                  <a href="/signup" className="text-indigo-400 hover:underline">
                    create a free account
                  </a>{" "}
                  and explore the live product.
                </p>
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
