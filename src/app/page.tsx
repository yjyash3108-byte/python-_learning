import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAccessToken } from "@/lib/auth/token";
import { getSessionProfile } from "@/lib/auth/require-profile";
import { LandingPage } from "@/components/marketing/landing-page";

export const metadata: Metadata = {
  title: "ScholarNet — Professional Network for Students",
  description:
    "Build your portfolio, showcase projects, connect with students worldwide, and grow your future from age 5 to professional.",
  openGraph: {
    title: "ScholarNet — Start Your Professional Journey Early",
    description: "The LinkedIn for the next generation of learners.",
  },
};

export default async function HomePage() {
  const profile = await getSessionProfile();
  if (profile) {
    redirect(profile.onboarding_completed ? "/feed" : "/onboarding");
  }

  if (await getAccessToken()) {
    redirect("/api/auth/clear-session?next=%2Flogin%3Fexpired%3D1");
  }

  return <LandingPage />;
}
