import Link from "next/link";
import { ExternalLink, Hash } from "lucide-react";
import { formatDistanceToNow } from "@/lib/format-date";
import { isSafeHttpUrl } from "@/lib/posts/map-post";
import type { Post } from "@/types/models";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { GlassPanel } from "@/components/ui/glass-panel";
import { POST_CATEGORIES } from "@/lib/constants";
import { PostActions } from "@/components/feed/post-actions";

interface PostCardProps {
  post: Post;
  currentUserId?: string;
  onUpdate?: () => void;
  highlighted?: boolean;
}

export function PostCard({ post, currentUserId, onUpdate, highlighted }: PostCardProps) {
  const author = post.author;
  const initials = author?.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() ?? "?";

  const categoryLabel =
    POST_CATEGORIES.find((c) => c.value === post.category)?.label ?? post.category;

  const profileHref =
    post.author_id && post.author_id !== currentUserId ? `/profile/${post.author_id}` : null;

  const authorBlock = (
    <>
      <Avatar className="h-11 w-11 ring-2 ring-indigo-400/40">
        <AvatarImage src={author?.profile_picture_url ?? undefined} />
        <AvatarFallback className="bg-indigo-500/30 text-indigo-100">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-white">
            {author?.full_name ?? "Student"}
          </span>
          {author?.grade != null && (
            <span className="text-xs text-slate-400">Class {author.grade}</span>
          )}
          <Badge variant="secondary" className="chip border-indigo-400/20 bg-indigo-500/15 text-indigo-200">
            {categoryLabel}
          </Badge>
        </div>
        <p className="text-xs text-slate-400">
          {author?.school_name} · {formatDistanceToNow(new Date(post.created_at))}
        </p>
      </div>
    </>
  );

  return (
    <GlassPanel
      depth="sm"
      static
      className={`overflow-hidden p-0 transition-shadow ${highlighted ? "ring-2 ring-indigo-400/50 shadow-[0_0_32px_rgba(99,102,241,0.25)]" : ""}`}
      id={`post-${post.id}`}
    >
      <div className="border-b border-white/[0.06] bg-gradient-to-r from-indigo-500/[0.08] via-transparent to-cyan-500/[0.06] px-5 py-4">
        <div className="flex items-start gap-3">
          {profileHref ? (
            <Link
              href={profileHref}
              className="flex flex-1 items-start gap-3 transition hover:opacity-90"
            >
              {authorBlock}
            </Link>
          ) : (
            <div className="flex flex-1 items-start gap-3">{authorBlock}</div>
          )}
        </div>
      </div>
      <div className="space-y-4 p-5">
        <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-foreground/90">
          {post.content}
        </p>

        {post.image_urls?.length > 0 && (
          <div
            className={`grid gap-2 ${
              post.image_urls.length === 1 ? "grid-cols-1" : "grid-cols-2"
            }`}
          >
            {post.image_urls.map((url) => (
              <a
                key={url}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="block overflow-hidden rounded-xl ring-1 ring-white/10 transition hover:ring-indigo-400/30"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="max-h-72 w-full object-cover" />
              </a>
            ))}
          </div>
        )}

        {post.link_url && isSafeHttpUrl(post.link_url) && (
          <a
            href={post.link_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-indigo-300 transition hover:bg-white/10"
          >
            <ExternalLink className="h-4 w-4 shrink-0" />
            <span className="truncate">{post.link_url}</span>
          </a>
        )}

        {post.hashtags && post.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.hashtags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="gap-1 border-white/10 bg-indigo-500/10 text-indigo-200"
              >
                <Hash className="h-3 w-3" />
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
      <PostActions post={post} currentUserId={currentUserId} onUpdate={onUpdate} />
    </GlassPanel>
  );
}
