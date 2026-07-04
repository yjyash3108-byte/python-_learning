"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Eye, ExternalLink, FileText, Pencil, Share2, Trash2 } from "lucide-react";
import { DocumentPreviewDialog } from "@/components/achievements/document-preview-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { isPdfUrl } from "@/lib/achievements/constants";
import type { Certificate } from "@/types/achievements";

type CertificateCardProps = {
  certificate: Certificate;
  onEdit: (certificate: Certificate) => void;
  onDelete: (id: string) => Promise<void>;
};

export function CertificateCard({ certificate, onEdit, onDelete }: CertificateCardProps) {
  const router = useRouter();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!window.confirm("Delete this certificate?")) return;
    setDeleting(true);
    try {
      await onDelete(certificate.id);
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  async function handleShare() {
    const text = `${certificate.title} — issued by ${certificate.issuer} on ScholarNet`;
    if (navigator.share) {
      await navigator.share({ title: certificate.title, text, url: window.location.href });
    } else {
      await navigator.clipboard.writeText(`${text}\n${window.location.href}`);
    }
  }

  const fileUrl = certificate.file_url;
  const isPdf = isPdfUrl(fileUrl);

  return (
    <>
      <GlassPanel
        depth="md"
        tilt
        className="group flex h-full flex-col overflow-hidden transition-transform duration-300 hover:-translate-y-1"
      >
        <div className="p-6">
          <div className="mb-4 flex h-24 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/10 ring-1 ring-white/10">
            {fileUrl && !isPdf ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={fileUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <FileText className="h-10 w-10 text-indigo-200" />
            )}
          </div>
          <h3 className="text-lg font-semibold text-foreground">{certificate.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{certificate.issuer}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="secondary" className="border-white/10 bg-white/10">
              Issued {new Date(certificate.issue_date).toLocaleDateString()}
            </Badge>
            {certificate.expiry_date && (
              <Badge variant="outline" className="border-white/10">
                Expires {new Date(certificate.expiry_date).toLocaleDateString()}
              </Badge>
            )}
          </div>
          {certificate.certificate_number && (
            <p className="mt-2 text-xs text-muted-foreground">No. {certificate.certificate_number}</p>
          )}
        </div>

        <div className="mt-auto flex flex-wrap gap-2 px-6 pb-6">
          {fileUrl && (
            <>
              <Button type="button" size="sm" variant="outline" onClick={() => setPreviewOpen(true)}>
                <Eye className="h-4 w-4" />
                Preview
              </Button>
              <Button type="button" size="sm" variant="outline" asChild>
                <a href={fileUrl} download target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4" />
                  Download
                </a>
              </Button>
            </>
          )}
          {certificate.credential_url && (
            <Button type="button" size="sm" variant="outline" asChild>
              <a href={certificate.credential_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
                Credential
              </a>
            </Button>
          )}
          <Button type="button" size="sm" variant="outline" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={() => onEdit(certificate)}>
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
          <Button
            type="button"
            size="sm"
            variant="destructive"
            disabled={deleting}
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </GlassPanel>

      {fileUrl && (
        <DocumentPreviewDialog
          open={previewOpen}
          onOpenChange={setPreviewOpen}
          title={certificate.title}
          fileUrl={fileUrl}
        />
      )}
    </>
  );
}
