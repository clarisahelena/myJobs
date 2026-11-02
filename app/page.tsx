"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Filters, { FilterState } from "@/components/Filters";
import JobCard from "@/components/JobCard";
import type { Job, SearchResponse } from "@/lib/types";

const INITIAL_FILTERS: FilterState = {
  query: "",
  seniority: [],
  stack: "all",
  country: [],
  remote: false,
};

export default function Home() {
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const initialLoadDone = useRef(false);

  const fetchJobs = useCallback(
    async (append = false, cur: string | null = null) => {
      if (append) setLoadingMore(true);
      else setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/jobs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: filters.query,
            seniority: filters.seniority,
            stack: filters.stack,
            country: filters.country,
            remote: filters.remote || undefined,
            cursor: cur,
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || `Request failed (${res.status})`);
        }

        const data: SearchResponse = await res.json();
        setJobs((prev) => {
          if (!append) return data.data;
          const seen = new Set(prev.map((j) => j.id));
          return [...prev, ...data.data.filter((j) => !seen.has(j.id))];
        });
        setCursor(data.metadata?.next_cursor ?? null);
        setSearched(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong");
        if (!append) setJobs([]);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [filters]
  );

  // Initial load
  useEffect(() => {
    if (initialLoadDone.current) return;
    initialLoadDone.current = true;
    fetchJobs(false);
  }, [fetchJobs]);

  const handleSearch = () => {
    setCursor(null);
    fetchJobs(false);
    // Scroll to results on mobile
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleLoadMore = () => {
    if (cursor) fetchJobs(true, cursor);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-stone-200 bg-stone-50/95 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold tracking-tight text-stone-900">
              DevJob
            </span>
            <span className="hidden sm:inline text-xs text-stone-400">
              programmer job board
            </span>
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <a
              href="https://jobspipe.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-stone-500 hover:text-stone-900 transition-colors"
            >
              Powered by JobsPipe
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pt-10 pb-8 sm:pt-14 sm:pb-10">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-stone-900 max-w-xl leading-tight">
          Programming jobs, filtered the way you want.
        </h1>
        <p className="mt-3 text-base sm:text-lg text-stone-500 max-w-lg">
          Search by seniority, experience level, frontend or backend, and
          country. Apply directly on the source.
        </p>
      </section>

      {/* Main */}
      <main className="mx-auto max-w-6xl px-4 sm:px-6 pb-20">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar filters */}
          <aside className="lg:w-72 lg:flex-shrink-0">
            <div className="lg:sticky lg:top-20 rounded-lg border border-stone-200 bg-white p-5">
              <h2 className="text-sm font-semibold text-stone-900 mb-4">
                Filters
              </h2>
              <Filters
                value={filters}
                onChange={setFilters}
                onSearch={handleSearch}
                loading={loading}
              />
            </div>
          </aside>

          {/* Results */}
          <div ref={resultsRef} className="flex-1 min-w-0">
            {/* Result count */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-stone-500">
                {loading
                  ? "Searching…"
                  : searched
                    ? `${jobs.length} job${jobs.length === 1 ? "" : "s"} found`
                    : ""}
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 mb-4">
                {error}
                <button
                  type="button"
                  onClick={() => fetchJobs(false)}
                  className="ml-2 underline hover:no-underline"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Loading skeleton */}
            {loading && jobs.length === 0 && (
              <div className="space-y-4" aria-busy="true" aria-label="Loading jobs">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-stone-200 bg-white p-5 animate-pulse"
                  >
                    <div className="h-3 w-32 bg-stone-200 rounded mb-3" />
                    <div className="h-4 w-3/4 bg-stone-200 rounded mb-2" />
                    <div className="h-3 w-1/2 bg-stone-200 rounded mb-4" />
                    <div className="flex gap-2">
                      <div className="h-5 w-16 bg-stone-100 rounded" />
                      <div className="h-5 w-16 bg-stone-100 rounded" />
                      <div className="h-5 w-16 bg-stone-100 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Job list */}
            {!loading && jobs.length > 0 && (
              <>
                <div className="space-y-4">
                  {jobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>

                {cursor && (
                  <div className="mt-6 flex justify-center">
                    <button
                      type="button"
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="rounded-md border border-stone-200 bg-white px-5 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-100 disabled:opacity-50 transition-colors"
                    >
                      {loadingMore ? "Loading…" : "Load more jobs"}
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Empty state */}
            {!loading && searched && jobs.length === 0 && !error && (
              <div className="rounded-lg border border-stone-200 bg-white p-10 text-center">
                <p className="text-stone-600 font-medium">No jobs match your filters</p>
                <p className="mt-1.5 text-sm text-stone-400">
                  Try broadening your search or clearing some filters.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-stone-50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-stone-900">DevJob</span>
            <span className="text-sm text-stone-400">
              job data by JobsPipe
            </span>
          </div>
          <p className="text-sm text-stone-400">
            All apply links go to the original posting source.
          </p>
        </div>
      </footer>
    </div>
  );
}
