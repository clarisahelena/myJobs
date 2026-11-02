"use client";

import type { Job } from "@/lib/types";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days <= 0) return "today";
  if (days === 1) return "1 day ago";
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  if (weeks === 1) return "1 week ago";
  if (weeks < 5) return `${weeks} weeks ago`;
  const months = Math.floor(days / 30);
  return months <= 1 ? "1 month ago" : `${months} months ago`;
}

function formatSalary(job: Job): string | null {
  if (job.salary_string) return job.salary_string;
  if (job.min_annual_salary_usd && job.max_annual_salary_usd) {
    const fmt = (n: number) =>
      n >= 1000 ? `$${Math.round(n / 1000)}k` : `$${n}`;
    return `${fmt(job.min_annual_salary_usd)} – ${fmt(job.max_annual_salary_usd)}`;
  }
  if (job.min_annual_salary_usd) {
    const fmt = (n: number) =>
      n >= 1000 ? `$${Math.round(n / 1000)}k` : `$${n}`;
    return `From ${fmt(job.min_annual_salary_usd)}`;
  }
  return null;
}

const SENIORITY_BADGE: Record<string, string> = {
  entry: "Entry",
  entry_level: "Entry",
  intern: "Intern",
  junior: "Junior",
  mid: "Mid",
  mid_level: "Mid",
  middle: "Mid",
  senior: "Senior",
  senior_level: "Senior",
  lead: "Lead",
  staff: "Staff",
  principal: "Principal",
  director: "Director",
  executive: "Executive",
};

export default function JobCard({ job }: { job: Job }) {
  const applyUrl = job.url || job.source_url;
  const salary = formatSalary(job);
  const seniorityLabel = job.seniority
    ? SENIORITY_BADGE[job.seniority] || job.seniority
    : null;

  const topSkills = job.technology_slugs.slice(0, 6);
  const remainingSkills = job.technology_slugs.length - topSkills.length;

  return (
    <article className="group rounded-lg border border-stone-200 bg-white p-5 transition-colors hover:border-stone-300">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-xs text-stone-500 mb-1.5">
            <span>{job.company}</span>
            <span className="text-stone-300">·</span>
            <span>{timeAgo(job.date_posted)}</span>
          </div>
          <h3 className="text-base font-semibold text-stone-900 leading-snug group-hover:text-teal-800 transition-colors">
            <a href={applyUrl} target="_blank" rel="noopener noreferrer">
              {job.job_title}
            </a>
          </h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-stone-500">
            <span>{job.location || "Location not specified"}</span>
            {job.remote && (
              <span className="inline-flex items-center gap-1 text-teal-700">
                <span
                  className="w-1.5 h-1.5 rounded-full bg-teal-600"
                  aria-hidden
                />
                Remote
              </span>
            )}
            {salary && <span className="text-stone-700 font-medium">{salary}</span>}
          </div>
        </div>
        <div className="flex-shrink-0 flex flex-col items-end gap-2">
          {seniorityLabel && (
            <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-600">
              {seniorityLabel}
            </span>
          )}
        </div>
      </div>

      {topSkills.length > 0 && (
        <div className="mt-3.5 flex flex-wrap gap-1.5">
          {topSkills.map((skill) => (
            <span
              key={skill}
              className="rounded bg-stone-100 px-2 py-0.5 text-xs text-stone-600"
            >
              {skill}
            </span>
          ))}
          {remainingSkills > 0 && (
            <span className="rounded bg-stone-100 px-2 py-0.5 text-xs text-stone-400">
              +{remainingSkills}
            </span>
          )}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-stone-400">
          {job.country && job.country_code
            ? `${job.country} (${job.country_code})`
            : job.country || ""}
        </span>
        <a
          href={applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-md bg-teal-700 px-3.5 py-1.5 text-sm font-medium text-white hover:bg-teal-800 transition-colors"
        >
          Apply
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>
      </div>
    </article>
  );
}
