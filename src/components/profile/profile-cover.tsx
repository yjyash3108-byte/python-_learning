"use client";

import { useEffect, useState } from "react";
import {
  coverThemeStyle,
  extractCoverThemeFromImage,
  type ProfileCoverTheme,
} from "@/lib/profile/cover-theme";
import { cn } from "@/lib/utils";

type ProfileCoverProps = {
  imageUrl?: string | null;
  coverPrimary?: string | null;
  coverAccent?: string | null;
  className?: string;
};

export function ProfileCover({
  imageUrl,
  coverPrimary,
  coverAccent,
  className,
}: ProfileCoverProps) {
  const [theme, setTheme] = useState<ProfileCoverTheme | null>(
    coverPrimary && coverAccent ? { primary: coverPrimary, accent: coverAccent } : null
  );

  useEffect(() => {
    if (coverPrimary && coverAccent) {
      setTheme({ primary: coverPrimary, accent: coverAccent });
    }
  }, [coverPrimary, coverAccent]);

  useEffect(() => {
    if (!imageUrl) return;

    let cancelled = false;
    extractCoverThemeFromImage(imageUrl).then((extracted) => {
      if (cancelled || !extracted) return;
      setTheme(extracted);
    });

    return () => {
      cancelled = true;
    };
  }, [imageUrl]);

  return (
    <div
      className={cn("profile-cover relative h-36 sm:h-40", !theme && "profile-cover-default", className)}
      style={theme ? coverThemeStyle(theme) : undefined}
    />
  );
}
