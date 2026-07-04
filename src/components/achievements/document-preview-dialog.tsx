"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { isPdfUrl } from "@/lib/achievements/constants";

type DocumentPreviewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  fileUrl: string;
};

export function DocumentPreviewDialog({
  open,
  onOpenChange,
  title,
  fileUrl,
}: DocumentPreviewDialogProps) {
  const isPdf = isPdfUrl(fileUrl);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-hidden border-white/15 bg-slate-900/95 text-slate-100 backdrop-blur-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-auto rounded-lg border border-white/10 bg-black/20">
          {isPdf ? (
            <iframe src={fileUrl} title={title} className="h-[70vh] w-full" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={fileUrl} alt={title} className="mx-auto max-h-[70vh] w-full object-contain" />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
