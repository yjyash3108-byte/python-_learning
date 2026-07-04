import Link from "next/link";
import { FolderKanban, ExternalLink } from "lucide-react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { getPortfolio } from "@/lib/data/dashboard";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PortfolioAddDialog } from "@/components/portfolio/portfolio-add-dialog";
import { PortfolioDeleteButton } from "@/components/portfolio/portfolio-delete-button";
import { PortfolioEditDialog } from "@/components/portfolio/portfolio-edit-dialog";

export const metadata = { title: "Projects" };

export default async function ProjectsPage() {
  const items = await getPortfolio("project");

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-400">Portfolio</p>
          <h1 className="mt-2 text-3xl font-bold text-foreground text-3d-glow">Your Projects</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Showcase websites, AI builds, robotics, and more.
          </p>
        </div>
        <PortfolioAddDialog itemType="project" addLabel="Add project" />
      </div>
      {items.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description="Add your first project to showcase your work on your profile and public portfolio."
          action={<PortfolioAddDialog itemType="project" addLabel="Add project" />}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((p) => (
            <GlassPanel key={p.id} depth="sm" tilt className="overflow-hidden p-0">
              {p.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.image_url} alt={p.title} className="h-32 w-full object-cover" />
              )}
              <div className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-semibold uppercase text-cyan-400">{p.item_type}</span>
                  <div className="flex gap-1">
                    <PortfolioEditDialog item={p} />
                    <PortfolioDeleteButton itemId={p.id} />
                  </div>
                </div>
                <Link href={`/projects/${p.id}`}>
                  <h3 className="mt-1 text-lg font-semibold hover:text-indigo-300">{p.title}</h3>
                </Link>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{p.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button size="sm" variant="default" asChild className="btn-3d">
                    <Link href={`/projects/${p.id}`}>View details</Link>
                  </Button>
                  {p.link_url && (
                    <Button size="sm" variant="outline" asChild className="gap-1 border-white/15 bg-white/5">
                      <a href={p.link_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3.5 w-3.5" />
                        {p.link_url.includes("github.com") ? "GitHub" : "Link"}
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </GlassPanel>
          ))}
        </div>
      )}
    </div>
  );
}
