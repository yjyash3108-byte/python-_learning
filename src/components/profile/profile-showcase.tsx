import Link from "next/link";
import { ExternalLink, FolderKanban, Trophy } from "lucide-react";
import { GlassPanel } from "@/components/ui/glass-panel";
import type { Achievement } from "@/types/achievements";
import type { PortfolioItem } from "@/types/models";

type ProfileShowcaseProps = {
  projects: PortfolioItem[];
  achievements: Achievement[];
  profileName: string;
};

export function ProfileShowcase({ projects, achievements, profileName }: ProfileShowcaseProps) {
  if (projects.length === 0 && achievements.length === 0) return null;

  return (
    <div className="space-y-6">
      {projects.length > 0 && (
        <GlassPanel depth="sm" tilt className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <FolderKanban className="h-5 w-5 text-cyan-400" />
            <h2 className="font-semibold">Projects</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {projects.map((p) => (
              <div
                key={p.id}
                className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]"
              >
                {p.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.image_url} alt={p.title} className="h-28 w-full object-cover" />
                )}
                <div className="p-4">
                  <Link href={`/projects/${p.id}`} className="font-medium hover:text-indigo-300">
                    {p.title}
                  </Link>
                  {p.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.description}</p>
                  )}
                  {p.link_url && (
                    <a
                      href={p.link_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-xs text-indigo-400 hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View project
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </GlassPanel>
      )}

      {achievements.length > 0 && (
        <GlassPanel depth="sm" tilt className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-400" />
            <h2 className="font-semibold">Achievements</h2>
          </div>
          <ul className="space-y-3">
            {achievements.slice(0, 8).map((a) => (
              <li
                key={a.id}
                className="flex flex-col gap-1 rounded-lg border border-white/8 bg-white/[0.03] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">{a.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {a.organization || profileName} · {a.level} · {a.category}
                  </p>
                </div>
                {a.rank && (
                  <span className="text-sm font-medium text-amber-300">{a.rank}</span>
                )}
              </li>
            ))}
          </ul>
        </GlassPanel>
      )}
    </div>
  );
}
