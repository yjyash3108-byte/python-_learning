import { GraduationCap } from "lucide-react";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { FaqSection } from "@/components/marketing/faq-section";

export const metadata = { title: "FAQ — ScholarNet" };

export default function FaqPage() {
  return (
    <>
      <MarketingNav />
      <main className="pt-8">
        <div className="mx-auto max-w-3xl px-4 pb-4">
          <div className="flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-cyan-400" />
            <h1 className="text-3xl font-bold">Help & FAQ</h1>
          </div>
          <p className="mt-2 text-muted-foreground">
            Answers about accounts, clubs, privacy, ScholarNet Pro, and student safety.
          </p>
        </div>
        <FaqSection />
      </main>
      <MarketingFooter />
    </>
  );
}
