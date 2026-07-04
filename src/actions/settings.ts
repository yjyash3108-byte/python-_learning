"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clearAccessToken } from "@/lib/auth/token";
import { serverFetch } from "@/lib/api/server-client";

export type SettingsActionState = { error?: string; success?: string };

export async function changePassword(
  _prev: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  const current = formData.get("currentPassword") as string;
  const next = formData.get("newPassword") as string;
  try {
    await serverFetch("/api/v1/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ current_password: current, new_password: next }),
    });
    revalidatePath("/settings");
    return { success: "Password updated" };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function changeEmail(
  _prev: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  try {
    await serverFetch("/api/v1/auth/change-email", {
      method: "POST",
      body: JSON.stringify({
        new_email: formData.get("newEmail"),
        password: formData.get("password"),
      }),
    });
    return { success: "Email updated" };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function deleteAccount(
  _prev: SettingsActionState,
  _formData: FormData
): Promise<SettingsActionState> {
  try {
    await serverFetch("/api/v1/auth/account", { method: "DELETE" });
    await clearAccessToken();
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to delete account" };
  }
  redirect("/login");
}
