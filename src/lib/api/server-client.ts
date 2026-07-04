import { cookies } from "next/headers";
import { API_URL, TOKEN_COOKIE } from "@/lib/api/config";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function parseResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  let data: { detail?: string | { msg?: string }[] } | null = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      if (!res.ok) {
        throw new ApiError(text || "Request failed", res.status);
      }
      throw new ApiError("Invalid response from server", res.status);
    }
  }
  if (!res.ok) {
    const detail =
      typeof data?.detail === "string"
        ? data.detail
        : Array.isArray(data?.detail)
          ? data.detail[0]?.msg
          : "Request failed";
    throw new ApiError(detail ?? "Request failed", res.status, data);
  }
  return data as T;
}

export async function serverFetch<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {}
): Promise<T> {
  const { auth = true, ...init } = options;
  const headers = new Headers(init.headers);

  if (auth) {
    const cookieStore = await cookies();
    const token = cookieStore.get(TOKEN_COOKIE)?.value;
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  if (init.body && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers,
      cache: "no-store",
    });
  } catch {
    throw new ApiError(
      "Cannot reach the API. Make sure the backend is running on port 8000.",
      0
    );
  }

  return parseResponse<T>(res);
}

export async function serverFetchOptional<T>(
  path: string,
  options?: RequestInit & { auth?: boolean }
): Promise<T | null> {
  try {
    return await serverFetch<T>(path, options);
  } catch (e) {
    if (e instanceof ApiError && (e.status === 401 || e.status === 0)) return null;
    throw e;
  }
}
