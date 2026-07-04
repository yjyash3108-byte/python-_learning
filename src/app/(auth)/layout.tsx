import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import { AuthEntrance, AuthHeroEntrance } from "@/components/auth/auth-entrance";
import { GlassPanel } from "@/components/ui/glass-panel";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="auth-scene relative flex min-h-screen items-center justify-center overflow-hidden p-6 lg:p-10">
      {/* Full-screen ambient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-cyan-500/10 blur-[100px]" />
        <div className="absolute -right-24 top-1/3 h-72 w-72 rounded-full bg-violet-500/15 blur-[90px]" />
      </div>

      <div className="relative grid w-full max-w-6xl gap-8 lg:grid-cols-2 lg:items-center">
        <GlassPanel
          depth="lg"
          tilt
          className="glass-shine relative hidden min-h-[540px] flex-col justify-between overflow-hidden p-10 lg:flex"
        >
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-cyan-500/20 blur-3xl" />

          <AuthHeroEntrance>
            <Link href="/" className="relative flex items-center gap-3 font-semibold text-white">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 text-white shadow-[0_8px_24px_rgba(99,102,241,0.4)] panel-3d-depth">
                <GraduationCap className="h-6 w-6" />
              </div>
              <span className="text-xl text-3d-glow">{APP_NAME}</span>
            </Link>

            <div className="relative my-auto space-y-5 py-8">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-400/80">
                Welcome in
              </p>
              <h2 className="text-4xl font-bold leading-[1.1] tracking-tight text-white text-3d-glow xl:text-5xl">
                Step into your{" "}
                <span className="bg-gradient-to-r from-indigo-300 via-violet-300 to-cyan-300 bg-clip-text text-transparent">
                  3D achievement
                </span>{" "}
                world.
              </h2>
              <p className="max-w-md text-lg leading-relaxed text-slate-300">
                Connect with classmates, share projects and wins, and message peers —
                wrapped in a safe, immersive space built for students.
              </p>
              <ul className="space-y-2 text-sm text-slate-400">
                {["Portfolio & projects", "Clubs & communities", "Opportunities & messaging"].map(
                  (item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-indigo-400 to-cyan-400" />
                      {item}
                    </li>
                  )
                )}
              </ul>
            </div>

            <p className="relative text-sm text-slate-400">For students in Classes 4–12 only.</p>
          </AuthHeroEntrance>
        </GlassPanel>

        <GlassPanel depth="md" tilt className="glass-shine relative p-8 sm:p-10">
          {/* Mobile logo */}
          <Link
            href="/"
            className="mb-8 flex items-center justify-center gap-2.5 lg:hidden"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 text-white shadow-lg">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold text-3d-glow">{APP_NAME}</span>
          </Link>
          <AuthEntrance>{children}</AuthEntrance>
        </GlassPanel>
      </div>
    </div>
  );
}
