import { MessageSquare } from "lucide-react";
import { GlassPanel } from "@/components/ui/glass-panel";

export const metadata = {
  title: "Messages",
};

export default function MessagesPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-300/70">
          3D inbox
        </p>
        <h1 className="text-3xl font-bold text-white text-3d-glow">Messages</h1>
      </div>
      <GlassPanel depth="md" tilt className="p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-200 panel-3d-depth">
            <MessageSquare className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-semibold text-white">Direct messages</h2>
        </div>
        <p className="text-sm text-slate-300">
          Direct messaging will be added in phase 2, with the same moderation
          pipeline as posts so only connected students can chat.
        </p>
      </GlassPanel>
    </div>
  );
}
