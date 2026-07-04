"use client";

import { useState } from "react";
import { Check, Copy, Linkedin, MessageCircle, QrCode, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { publicProfileUrl } from "@/lib/slug";

type ProfileShareMenuProps = {
  userId: string;
  username?: string | null;
};

export function ProfileShareMenu({ userId, username }: ProfileShareMenuProps) {
  const [copied, setCopied] = useState(false);
  const handle = username ?? userId;
  const url =
    typeof window !== "undefined"
      ? username
        ? publicProfileUrl(username)
        : `${window.location.origin}/profile/${userId}`
      : "";
  const qrSrc = url
    ? `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(url)}`
    : "";

  async function copyLink() {
    if (!url) return;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function openShare(href: string) {
    window.open(href, "_blank", "noopener,noreferrer");
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline" className="gap-1.5 border-white/15 bg-white/5">
          <Share2 className="h-3.5 w-3.5" />
          Share profile
        </Button>
      </DialogTrigger>
      <DialogContent className="border-white/15 bg-slate-900/95 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share your portfolio</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {username && (
            <p className="text-sm text-indigo-300">
              Public link: <span className="font-mono">/@{handle}</span>
            </p>
          )}
          {qrSrc && (
            <div className="flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrSrc} alt="Profile QR code" className="rounded-lg border border-white/10" width={180} height={180} />
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
            <Button type="button" variant="outline" onClick={copyLink} className="gap-2">
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied!" : "Copy link"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              onClick={() => openShare(`https://wa.me/?text=${encodeURIComponent(`Check out my ScholarNet profile: ${url}`)}`)}
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </Button>
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              onClick={() => openShare(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`)}
            >
              <Linkedin className="h-4 w-4" />
              LinkedIn
            </Button>
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              onClick={() =>
                openShare(
                  `https://www.instagram.com/?url=${encodeURIComponent(url)}`
                )
              }
            >
              <QrCode className="h-4 w-4" />
              Instagram
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
