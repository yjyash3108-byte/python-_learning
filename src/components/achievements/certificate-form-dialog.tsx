"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { uploadDocument, validateDocumentFile } from "@/lib/achievements/upload";
import { apiPost, apiPut } from "@/lib/api/client";
import type { Certificate } from "@/types/achievements";

type CertificateFormDialogProps = {
  certificate?: Certificate;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode | null;
};

export function CertificateFormDialog({
  certificate,
  open: controlledOpen,
  onOpenChange,
  trigger,
}: CertificateFormDialogProps) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setError(null);
      setSuccess(null);
    }
  }, [open]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const file = (form.querySelector("#certificate-file") as HTMLInputElement)?.files?.[0];
      const fileError = validateDocumentFile(file);
      if (fileError) throw new Error(fileError);

      let file_url = certificate?.file_url ?? undefined;
      if (file) file_url = await uploadDocument(file);

      const issueDate = String(formData.get("issue_date"));
      const expiryRaw = String(formData.get("expiry_date") || "");
      if (expiryRaw && expiryRaw < issueDate) {
        throw new Error("Expiry date cannot be before issue date");
      }

      const payload = {
        title: String(formData.get("title")),
        issuer: String(formData.get("issuer")),
        certificate_number: String(formData.get("certificate_number") || "") || null,
        issue_date: issueDate,
        expiry_date: expiryRaw || null,
        credential_url: String(formData.get("credential_url") || "") || null,
        file_url: file_url ?? null,
      };

      if (certificate) {
        await apiPut(`/certificates/${certificate.id}`, payload);
        setSuccess("Certificate updated!");
      } else {
        await apiPost("/certificates", payload);
        setSuccess("Certificate added!");
      }

      form.reset();
      router.refresh();
      window.setTimeout(() => setOpen(false), 600);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save certificate");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger === null ? null : trigger !== undefined ? (
        trigger
      ) : !certificate ? (
        <DialogTrigger asChild>
          <Button variant="outline" className="gap-2 border-white/15 bg-white/5">
            <Plus className="h-4 w-4" />
            Add Certificate
          </Button>
        </DialogTrigger>
      ) : null}
      <DialogContent className="max-h-[90vh] overflow-y-auto border-white/15 bg-slate-900/95 text-slate-100 backdrop-blur-2xl sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{certificate ? "Edit Certificate" : "Add Certificate"}</DialogTitle>
        </DialogHeader>
        <form key={certificate?.id ?? "new"} onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          {success && (
            <p className="rounded-md bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300" role="status">
              {success}
            </p>
          )}

          <div>
            <Label htmlFor="certificate-title">Certificate title *</Label>
            <Input
              id="certificate-title"
              name="title"
              defaultValue={certificate?.title}
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="certificate-issuer">Issuing organization *</Label>
            <Input
              id="certificate-issuer"
              name="issuer"
              defaultValue={certificate?.issuer}
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="certificate-number">Certificate number</Label>
            <Input
              id="certificate-number"
              name="certificate_number"
              defaultValue={certificate?.certificate_number ?? ""}
              className="mt-1"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="certificate-issue-date">Issue date *</Label>
              <Input
                id="certificate-issue-date"
                name="issue_date"
                type="date"
                required
                defaultValue={certificate?.issue_date?.slice(0, 10)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="certificate-expiry-date">Expiry date</Label>
              <Input
                id="certificate-expiry-date"
                name="expiry_date"
                type="date"
                defaultValue={certificate?.expiry_date?.slice(0, 10) ?? ""}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="certificate-credential-url">Credential URL</Label>
            <Input
              id="certificate-credential-url"
              name="credential_url"
              type="url"
              defaultValue={certificate?.credential_url ?? ""}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="certificate-file">Certificate file (PDF/JPG/PNG, max 10 MB)</Label>
            <Input
              id="certificate-file"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
              className="mt-1"
            />
          </div>

          <Button type="submit" disabled={loading} className="btn-3d w-full">
            {loading ? "Saving…" : certificate ? "Update certificate" : "Save certificate"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
