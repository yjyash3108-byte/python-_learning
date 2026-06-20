import { formatDistanceToNow } from "@/lib/format-date";
import type { Post } from "@/types/models";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { GlassPanel } from "@/components/ui/glass-panel";
import { POST_CATEGORIES } from "@/lib/constants";

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const author = post.author;
  const initials = author?.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() ?? "?";

  const categoryLabel =
    POST_CATEGORIES.find((c) => c.value === post.category)?.label ??
    post.category;

  return (
    <GlassPanel depth="sm" tilt className="overflow-hidden p-0">
      <div className="border-b border-white/8 bg-gradient-to-r from-indigo-500/10 to-cyan-500/5 p-5">
        <div className="flex items-start gap-3">
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
                <span className="text-xs text-slate-400">
                  Class {author.grade}
                </span>
              )}
              <Badge
                variant="secondary"
                className="border-white/10 bg-white/10 text-indigo-100"
              >
                {categoryLabel}
              </Badge>
            </div>
            <p className="text-xs text-slate-400">
              {author?.school_name} ·{" "}
              {formatDistanceToNow(new Date(post.created_at))}
            </p>
          </div>
        </div>
      </div>
      <div className="p-5">
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-200">
          {post.content}
        </p>
      </div>
    </GlassPanel>
  );
}
