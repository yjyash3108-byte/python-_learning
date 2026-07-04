"use client";

import Link from "next/link";
import { useState } from "react";
import { apiGet } from "@/lib/api/client";
import { FollowButton } from "@/components/profile/follow-button";
import { MessageUserButton } from "@/components/messages/message-user-button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Student = {
  id: string;
  full_name: string;
  school_name: string;
  grade: number;
  skills: string[];
};

type School = { name: string; count: number };
type ClubSearchResult = {
  id: string;
  name: string;
  emoji: string;
  color: string;
  category: string;
  member_count: number;
  is_verified: boolean;
};

type Tab = "students" | "schools" | "skills" | "clubs";

export function ConnectionsSearch({
  initialFollowingIds = [],
  initialMutualIds = [],
  currentUserId,
}: {
  initialFollowingIds?: string[];
  initialMutualIds?: string[];
  currentUserId?: string;
}) {
  const [tab, setTab] = useState<Tab>("students");
  const [q, setQ] = useState("");
  const [grade, setGrade] = useState("");
  const [skill, setSkill] = useState("");
  const [school, setSchool] = useState("");
  const [city, setCity] = useState("");
  const [interest, setInterest] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [clubs, setClubs] = useState<ClubSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [following, setFollowing] = useState<Set<string>>(new Set(initialFollowingIds));
  const mutual = new Set(initialMutualIds);

  async function search() {
    setLoading(true);
    setError(null);
    try {
      if (tab === "students") {
        const params = new URLSearchParams();
        if (q) params.set("q", q);
        if (grade) params.set("grade", grade);
        if (skill) params.set("skill", skill);
        if (school) params.set("school", school);
        if (city) params.set("city", city);
        if (interest) params.set("interest", interest);
        const data = await apiGet<Student[]>(`/search/students?${params.toString()}`);
        setStudents(data);
      } else if (tab === "schools") {
        const data = await apiGet<School[]>(`/search/schools?q=${encodeURIComponent(q)}`);
        setSchools(data);
      } else if (tab === "skills") {
        const data = await apiGet<string[]>(`/search/skills?q=${encodeURIComponent(q)}`);
        setSkills(data);
      } else {
        const data = await apiGet<ClubSearchResult[]>(`/search/clubs?q=${encodeURIComponent(q)}`);
        setClubs(data);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Search failed");
    } finally {
      setLoading(false);
    }
  }

  function handleFollowChange(userId: string, isFollowing: boolean) {
    setFollowing((prev) => {
      const next = new Set(prev);
      if (isFollowing) next.add(userId);
      else next.delete(userId);
      return next;
    });
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "students", label: "Students" },
    { id: "schools", label: "Schools" },
    { id: "skills", label: "Skills" },
    { id: "clubs", label: "Clubs" },
  ];

  return (
    <GlassPanel depth="md" tilt className="space-y-4 p-6">
      <h2 className="font-semibold">Discover</h2>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <Button
            key={t.id}
            type="button"
            size="sm"
            variant={tab === t.id ? "default" : "outline"}
            onClick={() => setTab(t.id)}
            className={tab === t.id ? "btn-3d" : "border-white/15 bg-white/5"}
          >
            {t.label}
          </Button>
        ))}
      </div>
      {tab === "students" && (
        <div className="grid gap-2 sm:grid-cols-3">
          <Input value={grade} onChange={(e) => setGrade(e.target.value)} placeholder="Grade (e.g. 10)" />
          <Input value={skill} onChange={(e) => setSkill(e.target.value)} placeholder="Skill" />
          <Input value={school} onChange={(e) => setSchool(e.target.value)} placeholder="School" />
          <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" />
          <Input value={interest} onChange={(e) => setInterest(e.target.value)} placeholder="Interest" />
        </div>
      )}
      <div className="flex gap-2">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={
            tab === "students"
              ? "Search by name…"
              : tab === "schools"
                ? "Search schools…"
                : tab === "skills"
                  ? "Search skills…"
                  : "Search clubs…"
          }
          onKeyDown={(e) => e.key === "Enter" && search()}
        />
        <Button type="button" onClick={search} disabled={loading} className="btn-3d shrink-0">
          Search
        </Button>
      </div>

      {tab === "students" && (
        <ul className="space-y-3">
          {students.map((s) => (
            <li key={s.id} className="flex items-center justify-between gap-3 rounded-lg bg-white/5 p-3">
              <div className="min-w-0 flex-1">
                <Link
                  href={`/profile/${s.id}`}
                  className="font-medium hover:text-indigo-300"
                >
                  {s.full_name}
                </Link>
                <p className="text-xs text-muted-foreground">
                  Class {s.grade} · {s.school_name}
                </p>
                {s.skills?.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {s.skills.slice(0, 3).map((sk) => (
                      <Badge key={sk} variant="secondary" className="text-[10px]">
                        {sk}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              {currentUserId !== s.id ? (
                <div className="flex shrink-0 items-center gap-2">
                  {mutual.has(s.id) && following.has(s.id) && (
                    <MessageUserButton userId={s.id} />
                  )}
                  <FollowButton
                    userId={s.id}
                    initialIsFollowing={following.has(s.id)}
                    onFollowStateChange={(isFollowing) => handleFollowChange(s.id, isFollowing)}
                  />
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">You</span>
              )}
            </li>
          ))}
        </ul>
      )}

      {tab === "schools" && (
        <ul className="space-y-2">
          {schools.map((s) => (
            <li key={s.name} className="flex items-center justify-between rounded-lg bg-white/5 p-3">
              <Link href={`/schools/${encodeURIComponent(s.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""))}`} className="font-medium hover:text-indigo-300">
                {s.name}
              </Link>
              <span className="text-xs text-muted-foreground">{s.count} students</span>
            </li>
          ))}
        </ul>
      )}

      {tab === "skills" && (
        <div className="flex flex-wrap gap-2">
          {skills.map((s) => (
            <Badge key={s} variant="secondary" className="border-white/10 bg-white/10">
              {s}
            </Badge>
          ))}
        </div>
      )}

      {tab === "clubs" && (
        <ul className="space-y-2">
          {clubs.map((c) => (
            <li key={c.id} className="rounded-lg bg-white/5 p-3">
              <Link href={`/clubs/${c.id}`} className="flex items-center justify-between gap-3 hover:text-indigo-300">
                <span className="flex items-center gap-2 font-medium">
                  <span>{c.emoji}</span>
                  {c.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {c.member_count} members
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </GlassPanel>
  );
}
