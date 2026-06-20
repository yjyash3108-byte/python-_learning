import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth/session";
import { APP_NAME } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";

export default async function HomePage() {
  const user = await getSessionUser();

  if (user) {
    redirect("/feed");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 py-16">
      <GlassPanel
        depth="lg"
        tilt
        className="mx-auto flex max-w-xl flex-col items-center gap-8 p-10 text-center"
      >
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-indigo-300/80">
            Immersive 3D campus
          </p>
          <h1 className="text-5xl font-bold tracking-tight text-3d-glow text-white">
            {APP_NAME}
          </h1>
          <p className="max-w-md text-slate-300">
            Float through a living achievement galaxy — connect with classmates,
            celebrate wins, and learn together in Classes 4–12.
          </p>
        </div>

        <GlassPanel depth="sm" className="w-full px-4 py-3 text-sm text-slate-300">
          Demo mode: no database. Data resets when the server restarts.
          <br />
          Try <strong className="text-white">demo@school.edu</strong> /{" "}
          <strong className="text-white">demo1234</strong>
        </GlassPanel>

        <div className="flex flex-wrap justify-center gap-4">
          <Button asChild size="lg" className="btn-3d min-w-[140px]">
            <Link href="/signup">Get started</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-white/20 bg-white/5 backdrop-blur-md hover:bg-white/10"
          >
            <Link href="/login">Sign in</Link>
          </Button>
        </div>

        <p className="max-w-sm text-xs text-slate-400">
          Parents or guardians should supervise account creation. We never display
          phone numbers or personal contact info in posts.
        </p>
      </GlassPanel>
    </main>
  );
}
