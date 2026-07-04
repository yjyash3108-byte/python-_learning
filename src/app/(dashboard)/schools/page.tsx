import { SchoolsSearch } from "@/components/schools/schools-search";
import { getSchools } from "@/lib/data/schools";

export const metadata = { title: "Schools" };

export default async function SchoolsPage() {
  const schools = await getSchools();

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-400">Directory</p>
        <h1 className="mt-2 text-3xl font-bold text-3d-glow">School pages</h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Explore students, clubs, events, and achievements by school.
        </p>
      </div>
      <SchoolsSearch initialSchools={schools} />
    </div>
  );
}
