"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Building2, Clock, Filter, Orbit, Search, Sparkles, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Skeleton } from "@/components/ui/skeleton";
import { apiGet } from "@/lib/api/client";
import { slugifySchool } from "@/lib/slug";
import type { UserProfile } from "@/types/models";

type GlobalSearchResult = {
  students: Array<Pick<UserProfile, "id" | "full_name" | "username" | "school_name" | "grade">>;
  schools: Array<{ name: string; count: number }>;
  clubs: Array<{ id: string; name: string; emoji: string; member_count: number }>;
  opportunities: Array<{ id: string; title: string; organization: string; opportunity_type: string }>;
};

type StudentResult = Pick<UserProfile, "id" | "full_name" | "username" | "school_name" | "grade">;

const RECENT_SEARCHES_KEY = "scholarnet_recent_searches";
const MAX_RECENT = 8;

function loadRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function saveRecentSearch(term: string) {
  const trimmed = term.trim();
  if (trimmed.length < 2) return;
  const prev = loadRecentSearches().filter((s) => s !== trimmed);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify([trimmed, ...prev].slice(0, MAX_RECENT)));
}

function studentHref(s: StudentResult) {
  return s.username ? `/@${s.username}` : `/profile/${s.id}`;
}

export function GlobalSearchPage() {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(initialQ);
  const [results, setResults] = useState<GlobalSearchResult | null>(null);
  const [trendingSchools, setTrendingSchools] = useState<Array<{ name: string; count: number }>>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [grade, setGrade] = useState("");
  const [school, setSchool] = useState("");
  const [city, setCity] = useState("");
  const [skill, setSkill] = useState("");
  const [interest, setInterest] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasStudentFilters = Boolean(grade || school || city || skill || interest);

  useEffect(() => {
    setRecentSearches(loadRecentSearches());
    apiGet<Array<{ name: string; count: number }>>("/search/trending/schools")
      .then(setTrendingSchools)
      .catch(() => setTrendingSchools([]));
  }, []);

  useEffect(() => {
    setQuery(initialQ);
  }, [initialQ]);

  useEffect(() => {
    const term = query.trim();
    if (term.length < 2 && !hasStudentFilters) {
      setResults(null);
      return;
    }

    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const studentParams = new URLSearchParams();
        if (term.length >= 2) studentParams.set("q", term);
        if (grade) studentParams.set("grade", grade);
        if (school) studentParams.set("school", school);
        if (city) studentParams.set("city", city);
        if (skill) studentParams.set("skill", skill);
        if (interest) studentParams.set("interest", interest);

        const studentsPromise =
          term.length >= 2 || hasStudentFilters
            ? apiGet<StudentResult[]>(`/search/students?${studentParams.toString()}`)
            : Promise.resolve([] as StudentResult[]);

        const globalPromise =
          term.length >= 2
            ? apiGet<GlobalSearchResult>(`/search/global?q=${encodeURIComponent(term)}`)
            : Promise.resolve({
                students: [],
                schools: [],
                clubs: [],
                opportunities: [],
              } as GlobalSearchResult);

        const [filteredStudents, global] = await Promise.all([studentsPromise, globalPromise]);

        setResults({
          students: hasStudentFilters ? filteredStudents : global.students.length ? global.students : filteredStudents,
          schools: global.schools,
          clubs: global.clubs,
          opportunities: global.opportunities,
        });

        if (term.length >= 2) {
          saveRecentSearch(term);
          setRecentSearches(loadRecentSearches());
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Search failed");
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => window.clearTimeout(timer);
  }, [query, grade, school, city, skill, interest, hasStudentFilters]);

  const empty =
    results &&
    !results.students.length &&
    !results.schools.length &&
    !results.clubs.length &&
    !results.opportunities.length;

  function clearFilters() {
    setGrade("");
    setSchool("");
    setCity("");
    setSkill("");
    setInterest("");
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-400">Discover</p>
        <h1 className="text-3xl font-bold tracking-tight text-3d-glow">Search ScholarNet</h1>
        <p className="max-w-lg text-sm leading-relaxed text-muted-foreground">
          Find students, schools, clubs, and opportunities in one place.
        </p>
      </div>

      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-indigo-300/70" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Try a name, school, club, or opportunity…"
            className="h-12 rounded-xl border-white/15 bg-white/[0.04] pl-12 text-base"
            autoFocus
          />
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="gap-2 border-white/15 bg-white/5"
          onClick={() => setShowFilters((v) => !v)}
        >
          <Filter className="h-4 w-4" />
          {showFilters ? "Hide student filters" : "Student filters"}
          {hasStudentFilters && (
            <span className="rounded-full bg-indigo-500 px-1.5 text-[10px] text-white">on</span>
          )}
        </Button>
        {showFilters && (
          <GlassPanel depth="sm" className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <Label htmlFor="filter-grade">Grade</Label>
              <Input id="filter-grade" value={grade} onChange={(e) => setGrade(e.target.value)} placeholder="e.g. 10" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="filter-school">School</Label>
              <Input id="filter-school" value={school} onChange={(e) => setSchool(e.target.value)} placeholder="School name" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="filter-city">City</Label>
              <Input id="filter-city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="filter-skill">Skill</Label>
              <Input id="filter-skill" value={skill} onChange={(e) => setSkill(e.target.value)} placeholder="Python, debate…" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="filter-interest">Interest</Label>
              <Input id="filter-interest" value={interest} onChange={(e) => setInterest(e.target.value)} placeholder="Robotics, music…" className="mt-1" />
            </div>
            {hasStudentFilters && (
              <div className="flex items-end">
                <Button type="button" size="sm" variant="ghost" onClick={clearFilters}>
                  Clear filters
                </Button>
              </div>
            )}
          </GlassPanel>
        )}
      </div>

      {loading && (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      {!query.trim() && !hasStudentFilters && !loading && (
        <div className="grid gap-8 lg:grid-cols-2">
          {recentSearches.length > 0 && (
            <section className="space-y-3">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <Clock className="h-5 w-5 text-indigo-400" />
                Recent searches
              </h2>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => setQuery(term)}
                    className="rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-sm transition hover:border-indigo-400/40 hover:bg-white/[0.08]"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </section>
          )}
          {trendingSchools.length > 0 && (
            <section className="space-y-3">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
                Trending schools
              </h2>
              {trendingSchools.map((s) => (
                <Link key={s.name} href={`/schools/${slugifySchool(s.name)}`}>
                  <GlassPanel depth="sm" className="p-4 transition hover:border-emerald-500/30">
                    <p className="font-medium">{s.name}</p>
                    <p className="text-sm text-muted-foreground">{s.count} students on ScholarNet</p>
                  </GlassPanel>
                </Link>
              ))}
            </section>
          )}
        </div>
      )}

      {empty && !loading && (query.trim().length >= 2 || hasStudentFilters) && (
        <GlassPanel depth="sm" className="p-6 text-sm text-muted-foreground">
          No results found. Try a different spelling, keyword, or filter.
        </GlassPanel>
      )}

      {results && !loading && (
        <div className="grid gap-8 lg:grid-cols-2">
          {results.students.length > 0 && (
            <section className="space-y-3">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <Users className="h-5 w-5 text-indigo-400" />
                Students
              </h2>
              {results.students.map((s) => (
                <Link key={s.id} href={studentHref(s)}>
                  <GlassPanel depth="sm" static className="p-4 transition hover:border-indigo-400/30 hover:bg-white/[0.06]">
                    <p className="font-medium">{s.full_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {s.username ? `@${s.username} · ` : ""}
                      {s.school_name} · Grade {s.grade}
                    </p>
                  </GlassPanel>
                </Link>
              ))}
            </section>
          )}
          {results.schools.length > 0 && (
            <section className="space-y-3">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <Building2 className="h-5 w-5 text-emerald-400" />
                Schools
              </h2>
              {results.schools.map((s) => (
                <Link key={s.name} href={`/schools/${slugifySchool(s.name)}`}>
                  <GlassPanel depth="sm" className="p-4 transition hover:border-emerald-500/30">
                    <p className="font-medium">{s.name}</p>
                    <p className="text-sm text-muted-foreground">{s.count} students</p>
                  </GlassPanel>
                </Link>
              ))}
            </section>
          )}
          {results.clubs.length > 0 && (
            <section className="space-y-3">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <Orbit className="h-5 w-5 text-violet-400" />
                Clubs
              </h2>
              {results.clubs.map((c) => (
                <Link key={c.id} href={`/clubs/${c.id}`}>
                  <GlassPanel depth="sm" className="p-4 transition hover:border-violet-500/30">
                    <p className="font-medium">
                      {c.emoji} {c.name}
                    </p>
                    <p className="text-sm text-muted-foreground">{c.member_count} members</p>
                  </GlassPanel>
                </Link>
              ))}
            </section>
          )}
          {results.opportunities.length > 0 && (
            <section className="space-y-3">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <Sparkles className="h-5 w-5 text-amber-400" />
                Opportunities
              </h2>
              {results.opportunities.map((o) => (
                <Link key={o.id} href={`/opportunities/${o.id}`}>
                  <GlassPanel depth="sm" className="p-4 transition hover:border-amber-500/30">
                    <p className="text-xs capitalize text-amber-400">{o.opportunity_type}</p>
                    <p className="font-medium">{o.title}</p>
                    <p className="text-sm text-muted-foreground">{o.organization}</p>
                  </GlassPanel>
                </Link>
              ))}
            </section>
          )}
        </div>
      )}
    </div>
  );
}
