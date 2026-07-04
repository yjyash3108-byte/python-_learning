import { notFound } from "next/navigation";
import Link from "next/link";
import { GraduationCap, Trophy, FolderKanban, MessageSquare, Award } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { getPublicProfile } from "@/lib/data/public-profile";
import { publicProfileUrl } from "@/lib/slug";
import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://scholarnet.in";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const profile = await getPublicProfile(username);
  if (!profile) {
    return { title: "Student portfolio" };
  }
  const title = `${profile.full_name} (@${profile.username}) · ScholarNet`;
  const description =
    profile.bio?.slice(0, 160) ||
    `Class ${profile.grade} at ${profile.school_name} — student portfolio on ScholarNet`;
  const url = `${SITE_URL}/@${profile.username ?? username}`;
  const image = profile.profile_picture_url ?? `${SITE_URL}/og-default.svg`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: "ScholarNet",
      type: "profile",
      images: [{ url: image, width: 400, height: 400, alt: profile.full_name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function PublicPortfolioPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const profile = await getPublicProfile(username.toLowerCase());
  if (!profile) notFound();

  const initials = profile.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const certificates = profile.certificates ?? [];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2 font-semibold text-indigo-300">
            <GraduationCap className="h-5 w-5" />
            ScholarNet
          </Link>
          <Button asChild size="sm" className="btn-3d">
            <Link href="/signup">Join ScholarNet</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-8 px-4 py-10">
        <GlassPanel depth="lg" static className="overflow-hidden p-0">
          <div className="profile-cover relative h-36" />
          <div className="px-6 pb-8">
            <div className="avatar-ring -mt-14 w-fit rounded-full">
              <Avatar className="h-28 w-28 border-4 border-background">
                <AvatarImage src={profile.profile_picture_url ?? undefined} />
                <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
              </Avatar>
            </div>
            <h1 className="mt-4 text-3xl font-bold">{profile.full_name}</h1>
            <p className="text-lg text-indigo-300">@{profile.username}</p>
            <p className="mt-1 text-muted-foreground">
              Class {profile.grade} · {profile.school_name}
              {profile.city ? ` · ${profile.city}` : ""}
            </p>
            {profile.is_verified && (
              <Badge className="mt-3 bg-cyan-500/20 text-cyan-300">Verified student</Badge>
            )}
            {profile.bio && <p className="mt-4 max-w-2xl text-muted-foreground">{profile.bio}</p>}

            {(profile.skills.length > 0 || profile.interests.length > 0) && (
              <div className="mt-6 flex flex-wrap gap-2">
                {profile.skills.map((s) => (
                  <Badge key={`s-${s}`} variant="secondary">{s}</Badge>
                ))}
                {profile.interests.map((s) => (
                  <Badge key={`i-${s}`} variant="outline">{s}</Badge>
                ))}
              </div>
            )}

            {profile.career_goals && (
              <div className="mt-6 rounded-xl bg-white/[0.04] p-4">
                <p className="flex items-center gap-2 font-semibold">
                  <Trophy className="h-4 w-4 text-amber-400" />
                  Career goals
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{profile.career_goals}</p>
              </div>
            )}
          </div>
        </GlassPanel>

        {profile.achievements.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Achievements</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {profile.achievements.map((a) => (
                <GlassPanel key={a.id} depth="sm" static className="p-4">
                  <p className="text-xs capitalize text-amber-400">{a.level} · {a.category}</p>
                  <p className="mt-1 font-semibold">{a.title}</p>
                  {a.organization && (
                    <p className="text-sm text-muted-foreground">{a.organization}</p>
                  )}
                </GlassPanel>
              ))}
            </div>
          </section>
        )}

        {profile.projects.length > 0 && (
          <section className="space-y-4">
            <h2 className="flex items-center gap-2 text-xl font-semibold">
              <FolderKanban className="h-5 w-5 text-indigo-400" />
              Projects
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {profile.projects.map((p) => (
                <GlassPanel key={p.id} depth="sm" static className="p-4">
                  <p className="text-xs capitalize text-muted-foreground">{p.item_type}</p>
                  <p className="mt-1 font-semibold">{p.title}</p>
                  {p.description && (
                    <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{p.description}</p>
                  )}
                  {p.link_url && (
                    <a
                      href={p.link_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block text-sm text-indigo-400 hover:underline"
                    >
                      View project →
                    </a>
                  )}
                </GlassPanel>
              ))}
            </div>
          </section>
        )}

        {certificates.length > 0 && (
          <section className="space-y-4">
            <h2 className="flex items-center gap-2 text-xl font-semibold">
              <Award className="h-5 w-5 text-violet-400" />
              Certificates
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {certificates.map((c) => (
                <GlassPanel key={c.id} depth="sm" static className="p-4">
                  <p className="font-semibold">{c.title}</p>
                  <p className="text-sm text-muted-foreground">{c.issuer}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Issued {new Date(c.issue_date).toLocaleDateString(undefined, { month: "short", year: "numeric" })}
                  </p>
                  {c.credential_url && (
                    <a
                      href={c.credential_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block text-sm text-indigo-400 hover:underline"
                    >
                      View credential →
                    </a>
                  )}
                </GlassPanel>
              ))}
            </div>
          </section>
        )}

        {profile.posts.length > 0 && (
          <section className="space-y-4">
            <h2 className="flex items-center gap-2 text-xl font-semibold">
              <MessageSquare className="h-5 w-5 text-cyan-400" />
              Recent posts
            </h2>
            <div className="space-y-3">
              {profile.posts.map((post) => (
                <GlassPanel key={post.id} depth="sm" static className="p-4">
                  <p className="text-xs capitalize text-indigo-300">{post.category}</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm">{post.content}</p>
                </GlassPanel>
              ))}
            </div>
          </section>
        )}

        <GlassPanel depth="md" static className="border-indigo-500/30 bg-indigo-500/10 p-6 text-center">
          <p className="font-semibold">Build your own student portfolio on ScholarNet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Free for students in Classes 4–12 across India.
          </p>
          <Button asChild className="btn-3d mt-4">
            <Link href="/signup">Create your portfolio</Link>
          </Button>
        </GlassPanel>

        <p className="text-center text-xs text-muted-foreground">
          {publicProfileUrl(profile.username ?? username, "")}
        </p>
      </main>
    </div>
  );
}
