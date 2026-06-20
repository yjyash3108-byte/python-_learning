import { Users } from "lucide-react";
import { GlassPanel } from "@/components/ui/glass-panel";

export const metadata = {
  title: "Connections",
};

export default function ConnectionsPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-300/70">
          3D network
        </p>
        <h1 className="text-3xl font-bold text-white text-3d-glow">Connections</h1>
      </div>
      <GlassPanel depth="md" tilt className="p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/25 text-indigo-200 panel-3d-depth">
            <Users className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-semibold text-white">Friend requests</h2>
        </div>
        <p className="text-sm text-slate-300">
          Mutual-accept friend requests will ship in phase 2. The app currently
          runs without a database — connections are not persisted yet.
        </p>
        <ul className="mt-4 list-inside list-disc space-y-1 text-sm text-slate-400">
          <li>Students send a request — status: pending</li>
          <li>Addressee accepts or declines — no one follows without consent</li>
          <li>Blocked users cannot interact</li>
        </ul>
      </GlassPanel>
    </div>
  );
}
