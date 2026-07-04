import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { getCurrentProfile } from "@/lib/data/profile";

export const metadata = { title: "Set up your profile" };

export default async function OnboardingPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  return <OnboardingWizard profile={profile} />;
}
