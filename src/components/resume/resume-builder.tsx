"use client";

import { Printer } from "lucide-react";
import type { Achievement } from "@/types/achievements";
import type { PortfolioItem, UserProfile } from "@/types/models";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";

type ResumeBuilderProps = {
  profile: UserProfile;
  achievements: Achievement[];
  projects: PortfolioItem[];
};

export function ResumeBuilder({ profile, achievements, projects }: ResumeBuilderProps) {
  function printResume() {
    window.print();
  }

  return (
    <>
      <div className="flex flex-wrap gap-2 print:hidden">
        <Button type="button" className="btn-3d gap-2" onClick={printResume}>
          <Printer className="h-4 w-4" />
          Print / Save as PDF
        </Button>
        <p className="text-sm text-muted-foreground self-center">
          Use your browser&apos;s print dialog and choose &quot;Save as PDF&quot;.
        </p>
      </div>

      <GlassPanel depth="md" id="resume-document" className="resume-print mx-auto max-w-3xl bg-white p-10 text-slate-900 print:shadow-none">
        <header className="border-b border-slate-200 pb-6">
          <h1 className="text-3xl font-bold text-slate-900">{profile.full_name}</h1>
          <p className="mt-1 text-slate-600">
            Class {profile.grade} · {profile.school_name}
            {profile.city ? ` · ${profile.city}` : ""}
          </p>
          {profile.username && (
            <p className="text-sm text-indigo-600">scholarnet.in/@{profile.username}</p>
          )}
          {profile.bio && <p className="mt-4 text-sm leading-relaxed text-slate-700">{profile.bio}</p>}
        </header>

        {profile.skills && profile.skills.length > 0 && (
          <section className="mt-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Skills</h2>
            <p className="mt-2 text-sm text-slate-800">{profile.skills.join(" · ")}</p>
          </section>
        )}

        {achievements.length > 0 && (
          <section className="mt-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Achievements</h2>
            <ul className="mt-3 space-y-3">
              {achievements.map((a) => (
                <li key={a.id}>
                  <p className="font-semibold text-slate-900">{a.title}</p>
                  <p className="text-sm text-slate-600">
                    {a.organization} · {a.level} · {new Date(a.date_achieved).getFullYear()}
                    {a.rank ? ` · ${a.rank}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {projects.length > 0 && (
          <section className="mt-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Projects</h2>
            <ul className="mt-3 space-y-3">
              {projects.map((p) => (
                <li key={p.id}>
                  <p className="font-semibold text-slate-900">{p.title}</p>
                  <p className="text-sm text-slate-600">{p.description}</p>
                  {p.link_url && <p className="text-xs text-indigo-600">{p.link_url}</p>}
                </li>
              ))}
            </ul>
          </section>
        )}

        {profile.career_goals && (
          <section className="mt-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Career goals</h2>
            <p className="mt-2 text-sm text-slate-700">{profile.career_goals}</p>
          </section>
        )}

        <footer className="mt-10 border-t border-slate-200 pt-4 text-xs text-slate-400">
          Generated from ScholarNet · {new Date().toLocaleDateString()}
        </footer>
      </GlassPanel>

      <style dangerouslySetInnerHTML={{ __html: `@media print { body * { visibility: hidden; } #resume-document, #resume-document * { visibility: visible; } #resume-document { position: absolute; left: 0; top: 0; width: 100%; } }` }} />
    </>
  );
}
