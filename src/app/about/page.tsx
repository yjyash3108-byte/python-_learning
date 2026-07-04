import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingNav } from "@/components/marketing/marketing-nav";

export const metadata = { title: "About — ScholarNet" };

export default function AboutPage() {
  return (
    <>
      <MarketingNav />
      <main className="mx-auto max-w-3xl px-4 py-24">
        <div className="mb-8 flex items-center gap-3">
          <GraduationCap className="h-8 w-8 text-indigo-400" />
          <h1 className="text-3xl font-bold">About ScholarNet</h1>
        </div>
        <div className="prose prose-invert max-w-none space-y-4 text-muted-foreground">
          <p>
            ScholarNet is a professional network built for school students in Classes 4–12. We help
            students showcase achievements, join clubs, discover opportunities, and build meaningful
            connections with classmates across India.
          </p>
          <p>
            From science fair wins to hackathon projects, ScholarNet turns student milestones into a
            living portfolio that colleges, mentors, and peers can discover.
          </p>
          <h2 className="text-xl font-semibold text-foreground">Our mission</h2>
          <p>
            Every student deserves a place to be seen — not just grades on a report card, but projects,
            leadership, creativity, and community impact.
          </p>
          <h2 className="text-xl font-semibold text-foreground">Safety first</h2>
          <p>
            ScholarNet includes moderation, parent controls, report &amp; block tools, and age-appropriate
            design. We never sell student data.
          </p>
        </div>
        <Link href="/signup" className="mt-8 inline-block rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white hover:bg-indigo-500">
          Get started free
        </Link>
      </main>
      <MarketingFooter />
    </>
  );
}
