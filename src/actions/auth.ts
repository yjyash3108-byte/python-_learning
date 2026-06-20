"use server";

import { redirect } from "next/navigation";
import { setSession, clearSession } from "@/lib/auth/session";
import {
  authenticateUser,
  createUser,
} from "@/lib/store";
import { loginSchema, signUpSchema } from "@/lib/validation/grade";

export type AuthActionState = {
  error?: string;
  success?: string;
};

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
  const result = createUser({
    email,
    password,
    fullName,
    grade,
    schoolName,
  });

  if ("error" in result) {
    return { error: result.error };
  }

  await setSession(result.id);
  redirect("/feed");
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

  const user = authenticateUser(parsed.data.email, parsed.data.password);

  if (!user) {
    return { error: "Invalid email or password." };
  }

  await setSession(user.id);
  redirect("/feed");
}

export async function signOut() {
  await clearSession();
  redirect("/login");
}
