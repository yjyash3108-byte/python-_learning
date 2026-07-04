"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, ExternalLink, Heart, MessageCircle } from "lucide-react";
import { apiDelete, apiPost } from "@/lib/api/client";
import type { PortfolioComment, PortfolioDetail } from "@/lib/data/portfolio";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Input } from "@/components/ui/input";
import { PortfolioEditDialog } from "@/components/portfolio/portfolio-edit-dialog";
import { PortfolioDeleteButton } from "@/components/portfolio/portfolio-delete-button";

type ProjectDetailContentProps = {
  project: PortfolioDetail;
  currentUserId: string;
  initialComments: PortfolioComment[];
};

export function ProjectDetailContent({
  project: initialProject,
  currentUserId,
  initialComments,
}: ProjectDetailContentProps) {
  const router = useRouter();
  const [project, setProject] = useState(initialProject);
  const [comments, setComments] = useState(initialComments);
  const [liked, setLiked] = useState(project.liked_by_me);
  const [likeCount, setLikeCount] = useState(project.like_count);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOwner = project.user_id === currentUserId;

  async function toggleLike() {
    setLoading(true);
    setError(null);
    try {
      if (liked) {
        await apiDelete(`/portfolio/${project.id}/like`);
        setLiked(false);
        setLikeCount((c) => Math.max(0, c - 1));
      } else {
        await apiPost(`/portfolio/${project.id}/like`);
        setLiked(true);
        setLikeCount((c) => c + 1);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  async function submitComment() {
    if (!comment.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const newComment = await apiPost<PortfolioComment>(`/portfolio/${project.id}/comments`, {
        content: comment,
      });
      setComments((prev) => [...prev, newComment]);
      setComment("");
      setProject((p) => ({ ...p, comment_count: p.comment_count + 1 }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to post comment");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Link
        href="/projects"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to projects
      </Link>

      <GlassPanel depth="md" className="overflow-hidden p-0">
        {project.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={project.image_url} alt={project.title} className="h-48 w-full object-cover" />
        )}
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase text-cyan-400">{project.item_type}</span>
              <h1 className="mt-1 text-2xl font-bold">{project.title}</h1>
              {project.author_name && (
                <p className="mt-1 text-sm text-muted-foreground">
                  by{" "}
                  <Link href={`/profile/${project.user_id}`} className="text-indigo-400 hover:underline">
                    {project.author_name}
                  </Link>
                  {project.author_grade ? ` · Class ${project.author_grade}` : ""}
                  {project.author_school ? ` · ${project.author_school}` : ""}
                </p>
              )}
            </div>
            {isOwner && (
              <div className="flex shrink-0 gap-2">
                <PortfolioEditDialog item={project} onUpdated={() => router.refresh()} />
                <PortfolioDeleteButton itemId={project.id} redirectTo="/projects" />
              </div>
            )}
          </div>

          {project.description && (
            <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {project.description}
            </p>
          )}

          {project.tags?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-white/10 px-2 py-0.5 text-xs">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {project.link_url && (
            <Button size="sm" variant="outline" asChild className="mt-4 gap-1 border-white/15 bg-white/5">
              <a href={project.link_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3.5 w-3.5" />
                {project.link_url.includes("github.com") ? "View on GitHub" : "View project"}
              </a>
            </Button>
          )}

          <div className="mt-6 flex items-center gap-2 border-t border-white/8 pt-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={loading}
              onClick={toggleLike}
              className={`gap-1.5 ${liked ? "text-pink-400" : "text-muted-foreground"}`}
            >
              <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
              {likeCount}
            </Button>
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MessageCircle className="h-4 w-4" />
              {project.comment_count}
            </span>
          </div>
        </div>
      </GlassPanel>

      <GlassPanel depth="sm" className="p-5">
        <h2 className="font-semibold">Comments</h2>
        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
        <div className="mt-3 flex gap-2">
          <Input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write a comment…"
            onKeyDown={(e) => e.key === "Enter" && submitComment()}
          />
          <Button type="button" size="sm" disabled={loading} onClick={submitComment} className="btn-3d shrink-0">
            Post
          </Button>
        </div>
        <ul className="mt-4 space-y-3">
          {comments.map((c) => (
            <li key={c.id} className="rounded-lg bg-white/5 p-3 text-sm">
              <p className="font-medium">{c.author_name ?? "Student"}</p>
              <p className="mt-1 text-muted-foreground">{c.content}</p>
              <p className="mt-1 text-xs text-muted-foreground/70">
                {new Date(c.created_at).toLocaleString()}
              </p>
            </li>
          ))}
          {comments.length === 0 && (
            <p className="text-sm text-muted-foreground">No comments yet. Be the first!</p>
          )}
        </ul>
      </GlassPanel>
    </div>
  );
}
