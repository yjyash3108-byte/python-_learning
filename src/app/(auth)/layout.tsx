import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import { GlassPanel } from "@/components/ui/glass-panel";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center p-6 lg:p-10">
      <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-2 lg:items-center">
        <GlassPanel
          depth="lg"
          tilt
          className="hidden flex-col justify-between p-10 lg:flex min-h-[520px]"
        >
          <Link href="/" className="flex items-center gap-3 font-semibold text-white">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/30 text-indigo-200 panel-3d-depth">
              <GraduationCap className="h-6 w-6" />
            </div>
            <span className="text-xl text-3d-glow">{APP_NAME}</span>
          </Link>
          <div className="space-y-4">
            <h2 className="text-4xl font-bold leading-tight text-white text-3d-glow">
              Step into your 3D achievement world.
            </h2>
            <p className="text-lg text-slate-300">
              Connect with classmates, share projects and wins, and message peers —
              wrapped in a safe, immersive space built for students.
            </p>
          </div>
          <p className="text-sm text-slate-400">For students in Classes 4–12 only.</p>
        </GlassPanel>

        <GlassPanel depth="md" tilt className="p-8 sm:p-10">
          {children}
        </GlassPanel>
      </div>
    </div>
  );
}
