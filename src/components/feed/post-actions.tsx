"use client";



import { useEffect, useState } from "react";

import { Heart, MessageCircle, Pencil, Share2, Trash2 } from "lucide-react";

import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api/client";

import { formatDistanceToNow } from "@/lib/format-date";

import type { Post } from "@/types/models";

import { Button } from "@/components/ui/button";

import { Textarea } from "@/components/ui/textarea";

import { ReportBlockActions } from "@/components/moderation/report-block-actions";



type PostComment = {

  id: string;

  user_id: string;

  content: string;

  created_at: string;

  author?: { full_name: string; profile_picture_url?: string | null };

};



interface PostActionsProps {

  post: Post;

  currentUserId?: string;

  onUpdate?: () => void;

}



export function PostActions({ post, currentUserId, onUpdate }: PostActionsProps) {

  const [liked, setLiked] = useState(post.liked_by_me ?? false);

  const [likeCount, setLikeCount] = useState(post.like_count ?? 0);

  const [shareCount, setShareCount] = useState(post.share_count ?? 0);

  const [commentCount, setCommentCount] = useState(post.comment_count ?? 0);

  const [commentOpen, setCommentOpen] = useState(false);

  const [comments, setComments] = useState<PostComment[]>([]);

  const [commentsLoading, setCommentsLoading] = useState(false);

  const [comment, setComment] = useState("");

  const [editing, setEditing] = useState(false);

  const [editContent, setEditContent] = useState(post.content);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [shareCopied, setShareCopied] = useState(false);



  const isAuthor = currentUserId === post.author_id;



  useEffect(() => {

    if (!commentOpen) return;

    setCommentsLoading(true);

    apiGet<PostComment[]>(`/posts/${post.id}/comments`)

      .then(setComments)

      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load comments"))

      .finally(() => setCommentsLoading(false));

  }, [commentOpen, post.id]);



  async function toggleLike() {

    setLoading(true);

    setError(null);

    try {

      if (liked) {

        await apiDelete(`/posts/${post.id}/like`);

        setLiked(false);

        setLikeCount((c) => Math.max(0, c - 1));

      } else {

        await apiPost(`/posts/${post.id}/like`);

        setLiked(true);

        setLikeCount((c) => c + 1);

      }

    } catch (e) {

      setError(e instanceof Error ? e.message : "Failed");

    } finally {

      setLoading(false);

    }

  }



  async function handleShare() {

    try {

      const url = `${window.location.origin}/feed?post=${post.id}`;

      await navigator.clipboard.writeText(url);

      setShareCopied(true);

      window.setTimeout(() => setShareCopied(false), 2000);

      const res = await apiPost<{ share_count: number }>(`/posts/${post.id}/share`);

      setShareCount(res.share_count);

    } catch (e) {

      setError(e instanceof Error ? e.message : "Failed");

    }

  }



  async function submitComment() {

    if (!comment.trim()) return;

    setLoading(true);

    try {

      const created = await apiPost<PostComment>(`/posts/${post.id}/comments`, { content: comment });

      setComment("");

      setComments((prev) => [...prev, created]);

      setCommentCount((c) => c + 1);

    } catch (e) {

      setError(e instanceof Error ? e.message : "Failed");

    } finally {

      setLoading(false);

    }

  }



  async function handleDelete() {

    if (!confirm("Delete this post?")) return;

    setError(null);

    try {

      await apiDelete(`/posts/${post.id}`);

      onUpdate?.();

    } catch (e) {

      setError(e instanceof Error ? e.message : "Failed to delete");

    }

  }



  async function handleSaveEdit() {

    if (!editContent.trim()) return;

    setLoading(true);

    setError(null);

    try {

      await apiPut(`/posts/${post.id}`, { content: editContent.trim() });

      setEditing(false);

      onUpdate?.();

    } catch (e) {

      setError(e instanceof Error ? e.message : "Failed to update");

    } finally {

      setLoading(false);

    }

  }



  return (

    <div className="border-t border-white/8 px-5 py-3">

      {error && <p className="mb-2 text-xs text-destructive">{error}</p>}



      {editing && (

        <div className="mb-3 space-y-2">

          <Textarea

            value={editContent}

            onChange={(e) => setEditContent(e.target.value)}

            rows={3}

            maxLength={2000}

          />

          <div className="flex gap-2">

            <Button type="button" size="sm" disabled={loading} onClick={handleSaveEdit}>

              Save

            </Button>

            <Button

              type="button"

              size="sm"

              variant="outline"

              onClick={() => {

                setEditing(false);

                setEditContent(post.content);

              }}

            >

              Cancel

            </Button>

          </div>

        </div>

      )}



      <div className="flex items-center gap-2">

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

        <Button

          type="button"

          variant="ghost"

          size="sm"

          onClick={() => setCommentOpen(!commentOpen)}

          className="gap-1.5 text-muted-foreground"

        >

          <MessageCircle className="h-4 w-4" />

          {commentCount}

        </Button>

        <Button

          type="button"

          variant="ghost"

          size="sm"

          onClick={handleShare}

          className="gap-1.5 text-muted-foreground"

          title="Copy link to share"

        >

          <Share2 className="h-4 w-4" />

          {shareCopied ? "Copied!" : shareCount}

        </Button>

        {isAuthor && !editing && (

          <>

            <Button

              type="button"

              variant="ghost"

              size="sm"

              onClick={() => setEditing(true)}

              className="ml-auto text-muted-foreground"

            >

              <Pencil className="h-4 w-4" />

            </Button>

            <Button

              type="button"

              variant="ghost"

              size="sm"

              onClick={handleDelete}

              className="text-muted-foreground hover:text-destructive"

            >

              <Trash2 className="h-4 w-4" />

            </Button>

          </>

        )}

        {!isAuthor && (

          <div className="ml-auto">

            <ReportBlockActions

              targetType="post"

              targetId={post.id}

              targetLabel="this post"

              showBlock={false}

            />

          </div>

        )}

      </div>



      {commentOpen && (

        <div className="mt-3 space-y-3">

          {commentsLoading ? (

            <p className="text-xs text-muted-foreground">Loading comments…</p>

          ) : comments.length === 0 ? (

            <p className="text-xs text-muted-foreground">No comments yet. Be the first!</p>

          ) : (

            <ul className="space-y-2">

              {comments.map((c) => (

                <li key={c.id} className="rounded-lg bg-white/[0.03] px-3 py-2">

                  <p className="text-xs font-medium text-indigo-300">

                    {c.author?.full_name ?? "Student"}

                    <span className="ml-2 font-normal text-muted-foreground">

                      {formatDistanceToNow(new Date(c.created_at))}

                    </span>

                  </p>

                  <p className="mt-0.5 text-sm text-slate-200">{c.content}</p>

                </li>

              ))}

            </ul>

          )}

          <div className="flex gap-2">

            <input

              value={comment}

              onChange={(e) => setComment(e.target.value)}

              placeholder="Write a comment…"

              className="flex-1 rounded-md border border-input bg-transparent px-3 py-1.5 text-sm"

              onKeyDown={(e) => {

                if (e.key === "Enter" && !e.shiftKey) {

                  e.preventDefault();

                  submitComment();

                }

              }}

            />

            <Button type="button" size="sm" disabled={loading} onClick={submitComment}>

              Post

            </Button>

          </div>

        </div>

      )}

    </div>

  );

}

