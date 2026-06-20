import { CreatePostDialog } from "@/components/feed/create-post-dialog";
import { Feed } from "@/components/feed/feed";
import { getFeedPosts } from "@/lib/data/posts";

export const metadata = {
  title: "Feed",
};

export default async function FeedPage() {
  const posts = await getFeedPosts();

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-300/70">
            3D feed
          </p>
          <h1 className="text-3xl font-bold text-white text-3d-glow">
            Achievement feed
          </h1>
          <p className="text-sm text-slate-400">
            Posts from your school and nearby grades, plus your connections.
          </p>
        </div>
        <CreatePostDialog />
      </div>
      <Feed posts={posts} />
    </div>
  );
}
