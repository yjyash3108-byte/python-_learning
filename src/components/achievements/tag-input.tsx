"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type TagInputProps = {
  name: string;
  defaultTags?: string[];
  placeholder?: string;
};

export function TagInput({
  name,
  defaultTags = [],
  placeholder = "Type a skill and press Enter",
}: TagInputProps) {
  const [tags, setTags] = useState<string[]>(defaultTags);
  const [input, setInput] = useState("");

  function addTag(raw: string) {
    const value = raw.trim();
    if (!value || tags.includes(value) || tags.length >= 20) return;
    setTags((prev) => [...prev, value]);
    setInput("");
  }

  function removeTag(tag: string) {
    setTags((prev) => prev.filter((item) => item !== tag));
  }

  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={tags.join(",")} />
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addTag(input);
            }
          }}
          placeholder={placeholder}
        />
        <Button type="button" variant="outline" onClick={() => addTag(input)}>
          Add
        </Button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1 border-white/10 bg-white/10">
              {tag}
              <button type="button" onClick={() => removeTag(tag)} aria-label={`Remove ${tag}`}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
