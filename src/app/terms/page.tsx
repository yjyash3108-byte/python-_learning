import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingNav } from "@/components/marketing/marketing-nav";

export const metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <>
      <MarketingNav />
      <main className="mx-auto max-w-3xl px-6 py-24">
        <h1 className="text-3xl font-bold">Terms of Service</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: June 2026</p>

        <div className="prose prose-invert mt-8 max-w-none space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-xl font-semibold text-foreground">Acceptance</h2>
            <p>
              By using ScholarNet, you agree to these terms. If you are under 18, a parent or guardian
              should review these terms with you.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground">Acceptable use</h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>Be respectful to other students and schools</li>
              <li>Do not post harmful, harassing, or inappropriate content</li>
              <li>Do not impersonate others or share false achievements</li>
              <li>Do not attempt to access accounts or data that are not yours</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground">Your content</h2>
            <p>
              You retain ownership of content you upload. You grant ScholarNet a license to display
              it on the platform so other users can view your portfolio, posts, and club activity as
              you intend.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground">Pro subscriptions</h2>
            <p>
              Paid plans are billed according to the pricing shown at checkout. Refunds are handled
              per our support policy. Features may change as we improve the product.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground">Contact</h2>
            <p>
              Questions about these terms? Email{" "}
              <a href="mailto:legal@scholarnet.app" className="text-indigo-400 hover:underline">
                legal@scholarnet.app
              </a>
              .
            </p>
          </section>
        </div>
      </main>
      <MarketingFooter />
    </>
  );
}
