import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingNav } from "@/components/marketing/marketing-nav";

export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <>
      <MarketingNav />
      <main className="mx-auto max-w-3xl px-6 py-24">
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: June 2026</p>

        <div className="prose prose-invert mt-8 max-w-none space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-xl font-semibold text-foreground">Overview</h2>
            <p>
              ScholarNet helps students build portfolios, connect with peers, join clubs, and discover
              opportunities. We collect only the information needed to provide these services safely
              for students.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground">Information we collect</h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>Account details: name, email, school, grade, and profile information you provide</li>
              <li>Content you post: projects, achievements, club posts, and messages</li>
              <li>Usage data: how you interact with features to improve the platform</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground">How we use your data</h2>
            <p>
              We use your information to operate your account, personalize opportunities and
              connections, moderate content, and communicate important service updates. We do not sell
              student data to third parties.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground">Student safety</h2>
            <p>
              Direct messaging requires mutual follows. Content is moderated. Parents and schools may
              request account review by contacting{" "}
              <a href="mailto:privacy@scholarnet.app" className="text-indigo-400 hover:underline">
                privacy@scholarnet.app
              </a>
              .
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground">Your choices</h2>
            <p>
              You can update or delete profile information in Settings. You may request account
              deletion by emailing us. Some data may be retained as required by law.
            </p>
          </section>
        </div>
      </main>
      <MarketingFooter />
    </>
  );
}
