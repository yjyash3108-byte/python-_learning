import type { Post } from "@/types/models";
import { PostCard } from "@/components/feed/post-card";
import { GlassPanel } from "@/components/ui/glass-panel";

interface FeedProps {
  posts: Post[];
}

export function Feed({ posts }: FeedProps) {
  if (posts.length === 0) {
    return (
      <GlassPanel depth="sm" tilt className="px-6 py-12 text-center">
        <p className="font-medium text-white">No posts yet</p>
        <p className="mt-2 text-sm text-slate-400">
          Share your first achievement, or check back when classmates post from
          your school.
        </p>
      </GlassPanel>
    );
  }

  return (
    <div className="space-y-5">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
