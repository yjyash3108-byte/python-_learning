"use client";

import Link from "next/link";
import { useState } from "react";
import { BadgeCheck, Building2 } from "lucide-react";
import { apiGet } from "@/lib/api/client";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { SchoolSummary } from "@/lib/data/schools";

export function SchoolsSearch({ initialSchools }: { initialSchools: SchoolSummary[] }) {
  const [schools, setSchools] = useState(initialSchools);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  async function search() {
    setLoading(true);
    try {
      const data = await apiGet<SchoolSummary[]>(`/schools?q=${encodeURIComponent(q)}`);
      setSchools(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search schools…" />
        <Button type="button" onClick={search} disabled={loading}>Search</Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {schools.map((s) => (
          <Link key={s.slug} href={`/schools/${s.slug}`}>
            <GlassPanel depth="sm" tilt className="flex items-center gap-3 p-4 transition hover:border-indigo-400/30">
              <Building2 className="h-8 w-8 text-indigo-400" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{s.name}</p>
                <p className="text-sm text-muted-foreground">{s.student_count} students</p>
              </div>
              {s.is_verified && <BadgeCheck className="h-5 w-5 shrink-0 text-cyan-400" aria-label="Verified school" />}
            </GlassPanel>
          </Link>
        ))}
      </div>
    </div>
  );
}
