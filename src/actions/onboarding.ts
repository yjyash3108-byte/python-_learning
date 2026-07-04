"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { serverFetch } from "@/lib/api/server-client";
import { MAX_GRADE, MIN_GRADE } from "@/lib/constants";

export type OnboardingActionState = {
  error?: string;
};

export type OnboardingData = {
  fullName: string;
  schoolName: string;
  grade: number;
  city?: string;
  bio?: string;
  skills?: string[];
  interests?: string[];
  careerGoals?: string;
  username?: string;
};

export async function completeOnboarding(
  data: OnboardingData
): Promise<OnboardingActionState> {
  const fullName = data.fullName.trim();
  const schoolName = data.schoolName.trim();

  if (fullName.length < 2) {
    return { error: "Full name must be at least 2 characters" };
  }
  if (schoolName.length < 2) {
    return { error: "School name is required" };
  }
  if (data.grade < MIN_GRADE || data.grade > MAX_GRADE) {
    return { error: `Class must be between ${MIN_GRADE} and ${MAX_GRADE}` };
  }

  try {
    await serverFetch("/api/v1/users/me", {
      method: "PUT",
      body: JSON.stringify({
        full_name: fullName,
        school_name: schoolName,
        grade: data.grade,
        city: data.city?.trim() || null,
        bio: data.bio?.trim() || "",
        skills: data.skills ?? [],
        interests: data.interests ?? [],
        career_goals: data.careerGoals?.trim() || "",
        username: data.username?.trim().toLowerCase() || undefined,
        onboarding_completed: true,
      }),
    });
    revalidatePath("/feed");
    revalidatePath("/profile");
    revalidatePath("/onboarding");
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to save profile" };
  }

  redirect("/feed");
}
