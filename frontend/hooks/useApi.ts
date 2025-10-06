import { Route, ROUTES } from "@/lib/routes";
import { useState, useEffect, useCallback } from "react";

interface UseApiOptions<P extends Record<string, string> = {}> {
  params?: P;
  body?: any;
  enabled?: boolean;
}

export function useApi<TData, C extends keyof Route, A extends keyof Route[C]>(
  category: C,
  action: A,
  options: UseApiOptions = {}
) {
  const { params = {}, body, enabled = true } = options;

  const [data, setData] = useState<TData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3001";

  // явно говорим TS, что у route есть path и method
  const route = ROUTES[category][action] as {
    path: string;
    method: string;
  };

  const fullPath = route.path.replace(
    /{([^}]+)}/g,
    (match: string, key: string) => params[key as keyof typeof params] ?? match
  );

  const url = `${BASE_URL}${fullPath}`;

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      let token: string | null = null;
      if (typeof window !== "undefined") {
        token = localStorage.getItem("token");
      }

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) headers.Authorization = `Bearer ${token}`;

      const fetchOptions: RequestInit = {
        method: route.method,
        headers,
      };

      if (route.method !== "GET" && body) {
        fetchOptions.body = JSON.stringify(body);
      }

      const response = await fetch(url, fetchOptions);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const responseData = (await response.json()) as TData;

      setData(responseData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Произошла ошибка");
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [url, route.method, body, enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, error, isLoading, refetch: fetchData };
}
