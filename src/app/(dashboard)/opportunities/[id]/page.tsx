import { notFound } from "next/navigation";
import { OpportunityDetail } from "@/components/opportunities/opportunity-detail";
import { getOpportunity, getSimilarOpportunities } from "@/lib/data/opportunities";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const opp = await getOpportunity(id);
  return {
    title: opp ? `${opp.title} · Opportunities` : "Opportunity",
    description: opp?.description?.slice(0, 160) ?? "ScholarNet opportunity",
  };
}

export default async function OpportunityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [opportunity, similar] = await Promise.all([
    getOpportunity(id),
    getSimilarOpportunities(id),
  ]);
  if (!opportunity) notFound();

  return <OpportunityDetail opportunity={opportunity} similar={similar} />;
}
