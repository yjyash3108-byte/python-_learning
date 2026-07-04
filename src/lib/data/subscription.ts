import { serverFetchOptional } from "@/lib/api/server-client";
import type { SubscriptionHistory, SubscriptionStatus } from "@/types/subscription";

export async function getSubscriptionStatus(): Promise<SubscriptionStatus | null> {
  return serverFetchOptional<SubscriptionStatus>("/api/v1/subscription/status");
}

export async function getSubscriptionHistory(): Promise<SubscriptionHistory | null> {
  return serverFetchOptional<SubscriptionHistory>("/api/v1/subscription/history");
}
