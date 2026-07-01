"use client";

import { ChevronDown, ChevronUp } from "lucide-react";

export type SortDirection = "asc" | "desc";

export interface SortFilterOption<Key extends string> {
  key: Key;
  label: string;
  direction?: SortDirection;
}

interface SortFilterProps<Key extends string> {
  options: SortFilterOption<Key>[];
  value: Key;
  direction?: SortDirection;
  onChange: (key: Key) => void;
}

export default function SortFilter<Key extends string>({
  options,
  value,
  direction = "desc",
  onChange,
}: SortFilterProps<Key>) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = value === option.key;
        const optionDirection = option.direction ?? direction;
        const Chevron = optionDirection === "asc" ? ChevronUp : ChevronDown;

        return (
          <button
            key={option.key}
            type="button"
            onClick={() => onChange(option.key)}
            className={`flex w-fit cursor-pointer items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              active
                ? "border-accent-500 bg-search-background-pink text-accent-800 dark:border-gray-500 dark:bg-[#303134] dark:text-gray-100"
                : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50 dark:border-[#3c4043] dark:bg-[#2a2b2f] dark:text-gray-400 dark:hover:bg-[#303134]"
            }`}
          >
            <span>{option.label}</span>
            <Chevron
              className={`h-5 w-5 ${active ? "" : "opacity-30"}`}
              aria-hidden="true"
            />
          </button>
        );
      })}
    </div>
  );
}
