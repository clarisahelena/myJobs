"use client";

import { useEffect, useRef, useState } from "react";
import {
  SENIORITY_OPTIONS,
  STACK_OPTIONS,
  COUNTRY_OPTIONS,
} from "@/lib/types";

export interface FilterState {
  query: string;
  seniority: string[];
  stack: string;
  country: string[];
  remote: boolean;
}

interface FiltersProps {
  value: FilterState;
  onChange: (next: FilterState) => void;
  onSearch: () => void;
  loading: boolean;
}

export default function Filters({ value, onChange, onSearch, loading }: FiltersProps) {
  const [countryOpen, setCountryOpen] = useState(false);
  const countryRef = useRef<HTMLDivElement>(null);

  // Close country dropdown on outside click
  useEffect(() => {
    if (!countryOpen) return;
    const handler = (e: MouseEvent) => {
      if (countryRef.current && !countryRef.current.contains(e.target as Node)) {
        setCountryOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [countryOpen]);

  const toggleSeniority = (v: string) => {
    const next = value.seniority.includes(v)
      ? value.seniority.filter((s) => s !== v)
      : [...value.seniority, v];
    onChange({ ...value, seniority: next });
  };

  const toggleCountry = (v: string) => {
    const next = value.country.includes(v)
      ? value.country.filter((c) => c !== v)
      : [...value.country, v];
    onChange({ ...value, country: next });
  };

  const clearAll = () => {
    onChange({
      query: "",
      seniority: [],
      stack: "all",
      country: [],
      remote: false,
    });
  };

  const hasActive =
    value.query ||
    value.seniority.length > 0 ||
    value.stack !== "all" ||
    value.country.length > 0 ||
    value.remote;

  const selectedCountries = COUNTRY_OPTIONS.filter((c) =>
    value.country.includes(c.value)
  );

  return (
    <div className="space-y-5">
      {/* Search */}
      <div>
        <label
          htmlFor="search"
          className="block text-sm font-medium text-stone-700 mb-1.5"
        >
          Search
        </label>
        <input
          id="search"
          type="text"
          value={value.query}
          onChange={(e) => onChange({ ...value, query: e.target.value })}
          onKeyDown={(e) => e.key === "Enter" && onSearch()}
          placeholder="e.g. frontend, react, python…"
          className="w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-teal-700 focus:outline-none"
        />
      </div>

      {/* Stack */}
      <div>
        <span className="block text-sm font-medium text-stone-700 mb-1.5">
          Stack
        </span>
        <div className="flex flex-wrap gap-1.5">
          {STACK_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange({ ...value, stack: opt.value })}
              aria-pressed={value.stack === opt.value}
              className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                value.stack === opt.value
                  ? "bg-teal-700 text-white"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Level & Experience */}
      <div>
        <span className="block text-sm font-medium text-stone-700 mb-1.5">
          Level &amp; Experience
        </span>
        <div className="grid grid-cols-2 gap-1.5">
          {SENIORITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggleSeniority(opt.value)}
              aria-pressed={value.seniority.includes(opt.value)}
              className={`rounded-md px-3 py-2 text-left text-sm transition-colors ${
                value.seniority.includes(opt.value)
                  ? "bg-teal-700 text-white"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              <span className="block font-medium leading-tight">{opt.label}</span>
              <span
                className={`block text-xs mt-0.5 ${
                  value.seniority.includes(opt.value)
                    ? "text-teal-100"
                    : "text-stone-400"
                }`}
              >
                {opt.years}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Country */}
      <div className="relative" ref={countryRef}>
        <span className="block text-sm font-medium text-stone-700 mb-1.5">
          Country
        </span>
        <button
          type="button"
          onClick={() => setCountryOpen(!countryOpen)}
          aria-expanded={countryOpen}
          aria-haspopup="listbox"
          className="w-full flex items-center justify-between rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-left focus:border-teal-700 focus:outline-none"
        >
          <span
            className={
              selectedCountries.length ? "text-stone-900" : "text-stone-400"
            }
          >
            {selectedCountries.length === 0
              ? "Select countries…"
              : selectedCountries.length === 1
                ? selectedCountries[0].label
                : `${selectedCountries.length} countries selected`}
          </span>
          <svg
            className={`w-4 h-4 text-stone-400 transition-transform ${countryOpen ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {countryOpen && (
          <div
            role="listbox"
            className="absolute z-10 mt-1 w-full rounded-md border border-stone-200 bg-white shadow-lg max-h-60 overflow-auto"
          >
            {COUNTRY_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                role="option"
                aria-selected={value.country.includes(opt.value)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-stone-700 hover:bg-stone-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={value.country.includes(opt.value)}
                  onChange={() => toggleCountry(opt.value)}
                  className="rounded border-stone-300 text-teal-700 focus:ring-teal-700"
                />
                {opt.label}
                <span className="ml-auto text-stone-400 text-xs">
                  {opt.value}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Remote toggle */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={value.remote}
            onChange={(e) => onChange({ ...value, remote: e.target.checked })}
            className="rounded border-stone-300 text-teal-700 focus:ring-teal-700"
          />
          <span className="text-sm text-stone-700">Remote only</span>
        </label>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={onSearch}
          disabled={loading}
          className="flex-1 rounded-md bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-50 transition-colors"
        >
          {loading ? "Searching…" : "Search Jobs"}
        </button>
        {hasActive && (
          <button
            type="button"
            onClick={clearAll}
            className="rounded-md border border-stone-200 px-3 py-2 text-sm text-stone-600 hover:bg-stone-100 transition-colors"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
