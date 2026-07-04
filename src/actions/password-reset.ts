"use server";

import { redirect } from "next/navigation";
import { serverFetch } from "@/lib/api/server-client";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/lib/validation/password";

export type PasswordResetActionState = {
  error?: string;
  success?: string;
  devResetUrl?: string;
  fieldErrors?: Record<string, string>;
};

type ForgotPasswordResponse = { message: string; dev_reset_url?: string | null };

export async function requestPasswordReset(
  _prev: PasswordResetActionState,
  formData: FormData
): Promise<PasswordResetActionState> {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]?.toString() ?? "form";
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { fieldErrors };
  }

  try {
    const data = await serverFetch<ForgotPasswordResponse>("/api/v1/auth/forgot-password", {
      method: "POST",
      auth: false,
      body: JSON.stringify({ email: parsed.data.email }),
    });
    return {
      success: data.message,
      devResetUrl: data.dev_reset_url ?? undefined,
    };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Could not send reset link. Please try again.",
    };
  }
}

type MessageResponse = { message: string };

export async function resetPassword(
  _prev: PasswordResetActionState,
  formData: FormData
): Promise<PasswordResetActionState> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]?.toString() ?? "form";
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { fieldErrors };
  }

  try {
    await serverFetch<MessageResponse>("/api/v1/auth/reset-password", {
      method: "POST",
      auth: false,
      body: JSON.stringify({
        token: parsed.data.token,
        new_password: parsed.data.password,
      }),
    });
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Could not reset password. Please try again.",
    };
  }

  redirect("/login?reset=success");
}
