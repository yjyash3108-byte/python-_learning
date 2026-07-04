import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth/require-profile";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireProfile("/onboarding");

  if (profile.onboarding_completed) {
    redirect("/feed");
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 sm:p-6 lg:p-10">
      {children}
    </div>
  );
}
