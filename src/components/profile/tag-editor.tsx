"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type TagEditorProps = {
  items: string[];
  onSave: (items: string[]) => Promise<void>;
  placeholder: string;
  emptyHint: string;
  badgeVariant?: "secondary" | "outline";
};

export function TagEditor({
  items,
  onSave,
  placeholder,
  emptyHint,
  badgeVariant = "secondary",
}: TagEditorProps) {
  const [input, setInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function addItem() {
    const value = input.trim();
    if (!value) return;
    if (items.some((i) => i.toLowerCase() === value.toLowerCase())) {
      setError("Already added");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave([...items, value]);
      setInput("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function removeItem(item: string) {
    setSaving(true);
    setError(null);
    try {
      await onSave(items.filter((i) => i !== item));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <Badge
            key={item}
            variant={badgeVariant}
            className={`gap-1 pr-1 ${badgeVariant === "secondary" ? "border-white/10 bg-white/10" : "border-white/10"}`}
          >
            {item}
            <button
              type="button"
              onClick={() => removeItem(item)}
              disabled={saving}
              className="ml-0.5 rounded-full p-0.5 hover:bg-white/10 disabled:opacity-50"
              aria-label={`Remove ${item}`}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        {items.length === 0 && (
          <p className="text-sm text-muted-foreground">{emptyHint}</p>
        )}
      </div>
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setError(null);
          }}
          placeholder={placeholder}
          disabled={saving}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addItem();
            }
          }}
          className="h-9"
        />
        <Button
          type="button"
          size="sm"
          disabled={saving || !input.trim()}
          onClick={addItem}
          className="btn-3d shrink-0 gap-1"
        >
          <Plus className="h-3.5 w-3.5" />
          Add
        </Button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
