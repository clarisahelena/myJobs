export type Seniority = "entry" | "junior" | "mid" | "senior" | "lead" | "director" | "executive";

export interface Job {
  id: string;
  job_title: string;
  company: string;
  url: string;
  source_url: string;
  date_posted: string;
  location: string;
  country: string;
  country_code: string;
  remote: boolean;
  seniority: string | null;
  employment_statuses: string[];
  technology_slugs: string[];
  keyword_slugs: string[];
  salary_string: string | null;
  min_annual_salary_usd: number | null;
  max_annual_salary_usd: number | null;
  description?: string;
}

export interface SearchResponse {
  metadata: {
    total_results: number | null;
    truncated_results: number;
    next_cursor: string | null;
    credits_remaining?: number;
  };
  data: Job[];
}

export interface SearchFilters {
  seniority?: string[];
  experience?: string;
  stack?: string;
  country?: string[];
  remote?: boolean;
  query?: string;
  cursor?: string | null;
}

const SENIORITY_MAP: Record<string, string[]> = {
  entry: ["entry", "entry_level", "intern", "junior"],
  junior: ["entry", "entry_level", "intern", "junior"],
  mid: ["mid", "mid_level", "middle"],
  senior: ["senior", "senior_level"],
  lead: ["lead", "staff", "principal", "director", "executive"],
  director: ["director", "executive"],
  executive: ["executive", "director"],
};

const FRONTEND_SKILLS = [
  "react", "vue", "angular", "svelte", "next.js", "html", "css",
  "javascript", "typescript", "tailwind", "webpack", "vite",
];

const BACKEND_SKILLS = [
  "python", "java", "node.js", "go", "rust", "c#", "php", "ruby",
  "django", "spring", "fastapi", "express", "postgresql", "mysql",
  "mongodb", "redis", "graphql", "kubernetes", "docker",
];

const FULLSTACK_SKILLS = [...FRONTEND_SKILLS, ...BACKEND_SKILLS];

export function buildRequestBody(filters: SearchFilters): Record<string, unknown> {
  const body: Record<string, unknown> = {
    limit: 24,
    include_unlabeled_seniority: true,
  };

  // Query search
  if (filters.query && filters.query.trim()) {
    body.job_title_or = filters.query
      .split(/[\s,]+/)
      .filter((t) => t.length > 1)
      .slice(0, 10);
  } else {
    body.job_title_or = [
      "software engineer", "software developer", "frontend", "backend",
      "full stack", "fullstack", "devops", "data engineer", "mobile developer",
      "programmer", "web developer",
    ];
  }

  // Seniority filter
  if (filters.seniority && filters.seniority.length > 0) {
    const mapped = filters.seniority.flatMap((s) => SENIORITY_MAP[s] || [s]);
    body.job_seniority_or = [...new Set(mapped)];
    body.include_unlabeled_seniority = false;
  }

  // Stack filter (frontend / backend / fullstack)
  if (filters.stack && filters.stack !== "all") {
    const skills =
      filters.stack === "frontend"
        ? FRONTEND_SKILLS
        : filters.stack === "backend"
          ? BACKEND_SKILLS
          : FULLSTACK_SKILLS;
    body.skills_or = skills;
  }

  // Country filter
  if (filters.country && filters.country.length > 0) {
    body.job_country_code_or = filters.country;
  }

  // Remote filter
  if (filters.remote !== undefined) {
    body.remote = filters.remote;
  }

  // Cursor pagination
  if (filters.cursor) {
    body.cursor = filters.cursor;
  }

  return body;
}

export const EXPERIENCE_OPTIONS = [
  { value: "entry", label: "Entry (0–2 yrs)", seniorities: ["entry", "junior"] },
  { value: "mid", label: "Mid (2–5 yrs)", seniorities: ["mid"] },
  { value: "senior", label: "Senior (5+ yrs)", seniorities: ["senior", "lead"] },
];

export const SENIORITY_OPTIONS = [
  { value: "entry", label: "Entry", years: "0–1 yrs" },
  { value: "junior", label: "Junior", years: "0–2 yrs" },
  { value: "mid", label: "Mid", years: "2–5 yrs" },
  { value: "senior", label: "Senior", years: "5–10 yrs" },
  { value: "lead", label: "Lead", years: "10+ yrs" },
  { value: "director", label: "Director", years: "10+ yrs" },
];

export const STACK_OPTIONS = [
  { value: "all", label: "All Stacks" },
  { value: "frontend", label: "Frontend" },
  { value: "backend", label: "Backend" },
  { value: "fullstack", label: "Full Stack" },
];

export const COUNTRY_OPTIONS = [
  { value: "US", label: "United States" },
  { value: "GB", label: "United Kingdom" },
  { value: "DE", label: "Germany" },
  { value: "CA", label: "Canada" },
  { value: "AU", label: "Australia" },
  { value: "NL", label: "Netherlands" },
  { value: "SG", label: "Singapore" },
  { value: "IN", label: "India" },
  { value: "JP", label: "Japan" },
  { value: "BR", label: "Brazil" },
  { value: "PL", label: "Poland" },
  { value: "ES", label: "Spain" },
  { value: "FR", label: "France" },
  { value: "ID", label: "Indonesia" },
  { value: "MY", label: "Malaysia" },
  { value: "PH", label: "Philippines" },
  { value: "AE", label: "UAE" },
];
