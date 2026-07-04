"use client";

import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

const client = axios.create({
  baseURL: "/api/backend/v1",
  timeout: 30000,
});

client.interceptors.response.use(
  (res) => res,
  (error: AxiosError<{ detail?: string }>) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      const path = window.location.pathname;
      if (!path.startsWith("/login") && !path.startsWith("/signup")) {
        const next = `/login?redirect=${encodeURIComponent(path)}&expired=1`;
        window.location.href = `/api/auth/clear-session?next=${encodeURIComponent(next)}`;
      }
    }
    const detail = error.response?.data?.detail;
    const message =
      (typeof detail === "string" ? detail : undefined) ??
      (error.response?.status === 502
        ? "Backend unavailable. Is the API server running on port 8000?"
        : error.message === "Network Error"
          ? "Network error. Check your connection."
          : error.message);
    return Promise.reject(new Error(message));
  }
);

export async function apiGet<T>(path: string, config?: InternalAxiosRequestConfig) {
  const { data } = await client.get<T>(path, config);
  return data;
}

export async function apiPost<T>(path: string, body?: unknown, config?: InternalAxiosRequestConfig) {
  const { data } = await client.post<T>(path, body, config);
  return data;
}

export async function apiPut<T>(path: string, body?: unknown, config?: InternalAxiosRequestConfig) {
  const { data } = await client.put<T>(path, body, config);
  return data;
}

export async function apiPatch<T>(path: string, body?: unknown, config?: InternalAxiosRequestConfig) {
  const { data } = await client.patch<T>(path, body, config);
  return data;
}

export async function apiDelete<T>(path: string, config?: InternalAxiosRequestConfig) {
  const { data } = await client.delete<T>(path, config);
  return data;
}

export async function apiUpload<T>(path: string, formData: FormData) {
  const { data } = await client.post<T>(path, formData);
  return data;
}

export default client;
