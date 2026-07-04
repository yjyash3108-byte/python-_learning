import { serverFetchOptional } from "@/lib/api/server-client";

export type SchoolSummary = {
  name: string;
  slug: string;
  student_count: number;
  is_verified: boolean;
};

export type SchoolDetail = {
  name: string;
  slug: string;
  city: string | null;
  is_verified: boolean;
  student_count: number;
  students: Array<{ id: string; full_name: string; grade: number; username?: string | null }>;
  clubs: Array<{ id: string; name: string; emoji: string; member_count: number; is_verified: boolean }>;
  events: Array<{ id: string; title: string; starts_at: string; location: string | null }>;
  achievements: Array<{ id: string; title: string; level: string; user_id: string }>;
};

export async function getSchools(q?: string): Promise<SchoolSummary[]> {
  const query = q ? `?q=${encodeURIComponent(q)}` : "";
  return (await serverFetchOptional<SchoolSummary[]>(`/api/v1/schools${query}`)) ?? [];
}

export async function getSchool(slug: string): Promise<SchoolDetail | null> {
  return serverFetchOptional<SchoolDetail>(`/api/v1/schools/${encodeURIComponent(slug)}`, { auth: false });
}
