import { getCurrentProfile } from "@/lib/data/profile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { GlassPanel } from "@/components/ui/glass-panel";

export const metadata = {
  title: "Profile",
};

export default async function ProfilePage() {
  const profile = await getCurrentProfile();

  if (!profile) return null;

  const initials = profile.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-300/70">
          3D profile
        </p>
        <h1 className="text-3xl font-bold text-white text-3d-glow">Your profile</h1>
      </div>
      <GlassPanel depth="md" tilt className="p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <Avatar className="h-20 w-20 ring-4 ring-indigo-400/30">
            <AvatarImage src={profile.profile_picture_url ?? undefined} />
            <AvatarFallback className="bg-indigo-500/30 text-xl text-indigo-100">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-semibold text-white">{profile.full_name}</h2>
            <p className="text-slate-400">
              Class {profile.grade} · {profile.school_name}
            </p>
          </div>
        </div>
        <div className="mt-8 space-y-2">
          <p className="text-sm font-medium text-slate-400">Bio</p>
          <p className="text-slate-200">
            {profile.bio || "No bio yet. Tell classmates what you enjoy learning!"}
          </p>
        </div>
        <Badge
          variant="outline"
          className="mt-6 border-white/15 bg-white/5 text-slate-300"
        >
          Profile editing coming in phase 2
        </Badge>
      </GlassPanel>
    </div>
  );
}
