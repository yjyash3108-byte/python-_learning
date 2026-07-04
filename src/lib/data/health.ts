import { API_URL } from "@/lib/api/config";

type HealthResponse = {
  status: string;
  config?: {
    smtp?: boolean;
  };
};

export async function getEmailConfigStatus(): Promise<{ smtpConfigured: boolean }> {
  try {
    const res = await fetch(`${API_URL}/health`, { cache: "no-store" });
    if (!res.ok) return { smtpConfigured: false };
    const data = (await res.json()) as HealthResponse;
    return { smtpConfigured: data.config?.smtp ?? false };
  } catch {
    return { smtpConfigured: false };
  }
}
