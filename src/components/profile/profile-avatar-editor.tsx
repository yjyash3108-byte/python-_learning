"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { apiPut, apiUpload } from "@/lib/api/client";
import {
  extractCoverThemeFromImage,
  type ProfileCoverTheme,
} from "@/lib/profile/cover-theme";
import { cn } from "@/lib/utils";

type ProfileAvatarEditorProps = {
  fullName: string;
  imageUrl?: string | null;
  editable?: boolean;
  className?: string;
  avatarClassName?: string;
  socialLinks?: Record<string, string>;
  onPhotoUpdated?: (url: string | null) => void;
  onCoverThemeSaved?: (theme: ProfileCoverTheme) => void;
};

export function ProfileAvatarEditor({
  fullName,
  imageUrl,
  editable = false,
  className,
  avatarClassName,
  socialLinks,
  onPhotoUpdated,
  onCoverThemeSaved,
}: ProfileAvatarEditorProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(imageUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPreview(imageUrl ?? null);
  }, [imageUrl]);

  const displayUrl = preview ?? imageUrl ?? null;

  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5 MB.");
      return;
    }

    setError(null);
    setUploading(true);

    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);
    onPhotoUpdated?.(localPreview);

    try {
      const fd = new FormData();
      fd.append("file", file);
      const updated = await apiUpload<{ profile_picture_url: string | null }>(
        "/users/me/avatar",
        fd
      );
      const url = updated.profile_picture_url;
      setPreview(url);
      onPhotoUpdated?.(url);

      if (url) {
        const theme = await extractCoverThemeFromImage(url);
        if (theme) {
          onCoverThemeSaved?.(theme);
          await apiPut("/users/me", {
            social_links: {
              ...(socialLinks ?? {}),
              profile_cover_primary: theme.primary,
              profile_cover_accent: theme.accent,
            },
          });
        }
      }

      router.refresh();
    } catch (err) {
      setPreview(imageUrl ?? null);
      onPhotoUpdated?.(imageUrl ?? null);
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      URL.revokeObjectURL(localPreview);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const avatar = (
    <Avatar
      className={cn(
        "h-24 w-24 border-4 border-background sm:h-28 sm:w-28",
        editable && "transition group-hover:brightness-90",
        avatarClassName
      )}
    >
      <AvatarImage src={displayUrl ?? undefined} alt={fullName} />
      <AvatarFallback className="bg-indigo-500/40 text-2xl font-bold text-white">
        {initials}
      </AvatarFallback>
    </Avatar>
  );

  if (!editable) {
    return <div className={className}>{avatar}</div>;
  }

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="group relative rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        aria-label={displayUrl ? "Change profile photo" : "Add profile photo"}
      >
        {avatar}
        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 transition group-hover:bg-black/40">
          {uploading ? (
            <Loader2 className="h-7 w-7 animate-spin text-white opacity-100" />
          ) : (
            <Camera className="h-7 w-7 text-white opacity-0 transition group-hover:opacity-100" />
          )}
        </span>
        <span className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-indigo-600 text-white shadow-lg transition group-hover:bg-indigo-500">
          <Camera className="h-4 w-4" />
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handleChange}
        disabled={uploading}
      />
      {error && (
        <p className="absolute left-0 top-full z-10 mt-2 max-w-[14rem] text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
