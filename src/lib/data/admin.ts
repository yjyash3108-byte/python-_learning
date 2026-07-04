import { serverFetchOptional } from "@/lib/api/server-client";
import type { Opportunity } from "@/types/opportunity";

export type AdminUser = {
  id: string;
  email: string;
  full_name: string;
  username?: string | null;
  school_name?: string;
  is_active: boolean;
  is_admin: boolean;
  is_verified?: boolean;
};

export type SystemStatus = {
  smtp_configured: boolean;
  razorpay_configured: boolean;
  cloudinary_configured: boolean;
  openai_configured: boolean;
  production_secret: boolean;
  email_from: string;
};

export async function getAdminUsers(): Promise<AdminUser[]> {
  const data = await serverFetchOptional<AdminUser[]>("/api/v1/admin/users");
  return data ?? [];
}

export async function getAdminOpportunities(): Promise<Opportunity[]> {
  const data = await serverFetchOptional<Opportunity[]>("/api/v1/admin/opportunities");
  return data ?? [];
}

export async function getSystemStatus(): Promise<SystemStatus | null> {
  return serverFetchOptional<SystemStatus>("/api/v1/admin/system-status");
}
