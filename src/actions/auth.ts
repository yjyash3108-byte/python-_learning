"use server";

import { redirect } from "next/navigation";
import { clearAccessToken, setAccessToken } from "@/lib/auth/token";
import { serverFetch } from "@/lib/api/server-client";
import { loginSchema, signUpSchema } from "@/lib/validation/grade";

export type AuthActionState = {
  error?: string;
  success?: string;
};

type TokenResponse = { access_token: string; token_type: string };

function safeRedirectPath(raw: FormDataEntryValue | null): string {
  if (typeof raw !== "string" || !raw.startsWith("/") || raw.startsWith("//")) {
    return "/feed";
  }
  if (raw.startsWith("/login") || raw.startsWith("/signup")) {
    return "/feed";
  }
  return raw;
}

export async function signUp(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = signUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    fullName: formData.get("fullName"),
    grade: formData.get("grade"),
    schoolName: formData.get("schoolName"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  const { email, password, fullName, grade, schoolName } = parsed.data;

  try {
    const data = await serverFetch<TokenResponse>("/api/v1/auth/signup", {
      method: "POST",
      auth: false,
      body: JSON.stringify({
        email,
        password,
        full_name: fullName,
        school_name: schoolName,
        grade,
      }),
    });
    await setAccessToken(data.access_token);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Signup failed" };
  }

  redirect("/onboarding");
}

export async function signIn(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  try {
    const data = await serverFetch<TokenResponse>("/api/v1/auth/login", {
      method: "POST",
      auth: false,
      body: JSON.stringify(parsed.data),
    });
    await setAccessToken(data.access_token);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Login failed" };
  }

  redirect(safeRedirectPath(formData.get("redirect")));
}

export async function signOut() {
  try {
    await serverFetch("/api/v1/auth/logout", { method: "POST" });
  } catch {
    // ignore — clear local session regardless
  }
  await clearAccessToken();
  redirect("/login");
}
