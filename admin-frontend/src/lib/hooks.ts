"use client";

import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "./api";
import type { Paginated } from "./types";

export function usePaginatedList<T>(basePath: string) {
  const [items, setItems] = useState<T[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (targetPage: number) => {
      setLoading(true);
      setError(null);
      try {
        const sep = basePath.includes("?") ? "&" : "?";
        const data = await api.get<Paginated<T>>(`${basePath}${sep}page=${targetPage}`);
        setItems(data.results);
        setCount(data.count);
        setPage(targetPage);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Failed to load data.");
      } finally {
        setLoading(false);
      }
    },
    [basePath]
  );

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [basePath]);

  const pageSize = 50;
  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  return {
    items,
    count,
    page,
    totalPages,
    loading,
    error,
    reload: () => load(page),
    goToPage: (p: number) => load(p),
  };
}

export function useList<T>(path: string | null) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!path) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<T[]>(path);
      setItems(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load data.");
    } finally {
      setLoading(false);
    }
  }, [path]);

  useEffect(() => {
    load();
  }, [load]);

  return { items, loading, error, reload: load };
}
