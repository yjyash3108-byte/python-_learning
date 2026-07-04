"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { apiDelete } from "@/lib/api/client";
import { Button } from "@/components/ui/button";

export function PortfolioDeleteButton({
  itemId,
  redirectTo,
}: {
  itemId: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!confirm("Delete this item?")) return;
    setError(null);
    try {
      await apiDelete(`/portfolio/${itemId}`);
      if (redirectTo) router.push(redirectTo);
      else router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete");
    }
  }

  return (
    <>
      {error && <p className="text-xs text-destructive">{error}</p>}
    <Button
      type="button"
      size="sm"
      variant="ghost"
      onClick={handleDelete}
      className="text-muted-foreground hover:text-destructive"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
    </>
  );
}
