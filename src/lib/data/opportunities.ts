import { serverFetch, serverFetchOptional } from "@/lib/api/server-client";
import type { Opportunity } from "@/types/opportunity";

export async function getOpportunities(q?: string): Promise<Opportunity[]> {
  const params = q?.trim() ? `?q=${encodeURIComponent(q.trim())}` : "";
  return serverFetch<Opportunity[]>(`/api/v1/opportunities${params}`);
}

export async function getRecommendedOpportunities(): Promise<Opportunity[]> {
  return serverFetch<Opportunity[]>("/api/v1/opportunities/recommended");
}

export async function getMyApplications(): Promise<Opportunity[]> {
  const data = await serverFetchOptional<Opportunity[]>("/api/v1/opportunities/my-applications");
  return data ?? [];
}

export async function getOpportunity(id: string): Promise<Opportunity | null> {
  return serverFetchOptional<Opportunity>(`/api/v1/opportunities/${id}`);
}

export async function getSimilarOpportunities(id: string): Promise<Opportunity[]> {
  const data = await serverFetchOptional<Opportunity[]>(`/api/v1/opportunities/${id}/similar`);
  return data ?? [];
}
