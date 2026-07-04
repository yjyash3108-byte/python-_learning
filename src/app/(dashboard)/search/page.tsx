import { Suspense } from "react";
import { GlobalSearchPage } from "@/components/search/global-search-page";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = { title: "Search" };

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-3">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-12 w-full" />
        </div>
      }
    >
      <GlobalSearchPage />
    </Suspense>
  );
}
