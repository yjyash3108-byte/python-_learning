import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import { FOOTER_LINKS } from "@/lib/marketing/landing-content";

export function MarketingFooter() {
  return (
    <footer className="relative border-t border-white/10 bg-background/80 py-16 backdrop-blur-xl">
      <div className="section-divider absolute inset-x-0 top-0" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-4 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 font-semibold">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 text-white">
                <GraduationCap className="h-5 w-5" />
              </span>
              <span className="text-lg text-3d-glow">{APP_NAME}</span>
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              Where students connect, build, and grow. The professional network for the next
              generation of learners.
            </p>
          </div>

          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Company
            </p>
            <ul className="space-y-2.5 text-sm">
              {FOOTER_LINKS.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground transition hover:text-indigo-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Legal
            </p>
            <ul className="space-y-2.5 text-sm">
              {FOOTER_LINKS.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground transition hover:text-indigo-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mb-4 mt-8 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Support
            </p>
            <ul className="space-y-2.5 text-sm">
              {FOOTER_LINKS.support.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground transition hover:text-indigo-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Social
            </p>
            <ul className="space-y-2.5 text-sm">
              {FOOTER_LINKS.social.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground transition hover:text-cyan-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-8 space-y-2">
              <Link
                href="/signup"
                className="block text-sm font-medium text-indigo-400 hover:text-indigo-300"
              >
                Create free account
              </Link>
              <Link
                href="/login"
                className="block text-sm text-muted-foreground hover:text-foreground"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground/70">
            For students in Classes 4–12 · Safe · Moderated · Parent-friendly
          </p>
        </div>
      </div>
    </footer>
  );
}
