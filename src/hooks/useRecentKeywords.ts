"use client";

import { useCallback, useState } from "react";

const STORAGE_KEY = "tiki:recent-keywords";
const MAX_KEYWORDS = 10;

function load(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function save(keywords: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(keywords));
}

export function useRecentKeywords() {
  // SSR 안전: 서버에서는 빈 배열, 클라이언트에서는 localStorage에서 읽기
  const [keywords, setKeywords] = useState<string[]>(() =>
    typeof window === "undefined" ? [] : load(),
  );

  const add = useCallback((keyword: string) => {
    const trimmed = keyword.trim();
    if (!trimmed) return;
    setKeywords((prev) => {
      // 중복 제거 후 앞에 추가, 최대 MAX_KEYWORDS 유지
      const next = [trimmed, ...prev.filter((k) => k !== trimmed)].slice(
        0,
        MAX_KEYWORDS,
      );
      save(next);
      return next;
    });
  }, []);

  const remove = useCallback((keyword: string) => {
    setKeywords((prev) => {
      const next = prev.filter((k) => k !== keyword);
      save(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    save([]);
    setKeywords([]);
  }, []);

  return { keywords, add, remove, clear };
}
