import { notFound } from "next/navigation";
import { ProjectDetailContent } from "@/components/portfolio/project-detail-content";
import { getCurrentProfile } from "@/lib/data/profile";
import { getPortfolioItem } from "@/lib/data/portfolio";
import { serverFetchOptional } from "@/lib/api/server-client";
import type { PortfolioComment } from "@/lib/data/portfolio";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const project = await getPortfolioItem(id);
  return { title: project ? project.title : "Project" };
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [project, user, comments] = await Promise.all([
    getPortfolioItem(id),
    getCurrentProfile(),
    serverFetchOptional<PortfolioComment[]>(`/api/v1/portfolio/${id}/comments`),
  ]);

  if (!project) notFound();

  return (
    <ProjectDetailContent
      project={project}
      currentUserId={user?.id ?? ""}
      initialComments={comments ?? []}
    />
  );
}
