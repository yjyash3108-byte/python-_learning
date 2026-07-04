import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, Building2, Calendar, Trophy, Users } from "lucide-react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { getSchool } from "@/lib/data/schools";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const school = await getSchool(slug);
  return { title: school?.name ?? "School" };
}

export default async function SchoolDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const school = await getSchool(slug);
  if (!school) notFound();

  return (
    <div className="space-y-8">
      <GlassPanel depth="lg" className="p-6">
        <div className="flex items-start gap-4">
          <Building2 className="h-10 w-10 text-indigo-400" />
          <div>
            <h1 className="text-2xl font-bold">{school.name}</h1>
            {school.city && <p className="text-muted-foreground">{school.city}</p>}
            <p className="mt-1 text-sm text-muted-foreground">{school.student_count} students on ScholarNet</p>
            {school.is_verified && (
              <p className="mt-2 flex items-center gap-1 text-sm text-cyan-400">
                <BadgeCheck className="h-4 w-4" /> Verified school
              </p>
            )}
          </div>
        </div>
      </GlassPanel>

      <section>
        <h2 className="mb-4 flex items-center gap-2 font-semibold"><Users className="h-5 w-5" /> Students</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {school.students.map((s) => (
            <Link key={s.id} href={s.username ? `/profile/${s.id}` : `/profile/${s.id}`} className="rounded-xl border border-white/10 p-3 hover:bg-white/[0.03]">
              <p className="font-medium">{s.full_name}</p>
              <p className="text-xs text-muted-foreground">Class {s.grade}</p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-semibold">Clubs</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {school.clubs.map((c) => (
            <Link key={c.id} href={`/clubs/${c.id}`}>
              <GlassPanel depth="sm" className="p-4">
                <span className="text-2xl">{c.emoji}</span>
                <p className="mt-1 font-medium">{c.name}</p>
                <p className="text-xs text-muted-foreground">{c.member_count} members</p>
              </GlassPanel>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 flex items-center gap-2 font-semibold"><Calendar className="h-5 w-5" /> Events</h2>
        <ul className="space-y-2">
          {school.events.map((e) => (
            <li key={e.id} className="rounded-lg border border-white/10 px-4 py-3 text-sm">
              <p className="font-medium">{e.title}</p>
              <p className="text-muted-foreground">{new Date(e.starts_at).toLocaleString()}{e.location ? ` · ${e.location}` : ""}</p>
            </li>
          ))}
          {school.events.length === 0 && <p className="text-sm text-muted-foreground">No upcoming events.</p>}
        </ul>
      </section>

      <section>
        <h2 className="mb-4 flex items-center gap-2 font-semibold"><Trophy className="h-5 w-5" /> Achievements</h2>
        <ul className="space-y-2">
          {school.achievements.map((a) => (
            <li key={a.id} className="rounded-lg border border-white/10 px-4 py-3 text-sm">
              <p className="font-medium">{a.title}</p>
              <p className="text-muted-foreground capitalize">{a.level}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
