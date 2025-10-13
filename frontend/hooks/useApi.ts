import { Route, ROUTES } from "@/lib/routes";
import { useState, useEffect, useCallback, useRef } from "react";

interface UseApiOptions<P extends Record<string, string> = {}> {
  params?: P;
  body?: any;
  enabled?: boolean;
}

export function useApi<
  TData,
  C extends keyof Route,
  A extends keyof Route[C],
  P extends Record<string, string> = {}
>(category: C, action: A, options: UseApiOptions<P> = {}) {
  const { params = {} as P, body, enabled = true } = options;

  const [data, setData] = useState<TData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3001";
  const route = ROUTES[category][action] as { path: string; method: string };

  // Сохраняем актуальные значения, чтобы не пересоздавался useCallback
  const paramsRef = useRef(params);
  const bodyRef = useRef(body);

  useEffect(() => {
    paramsRef.current = params;
    bodyRef.current = body;
  }, [params, body]);

  const fetchData = useCallback(
    async (customOptions?: Partial<UseApiOptions<P>>) => {
      const mergedParams = customOptions?.params ?? paramsRef.current;
      const mergedBody = customOptions?.body ?? bodyRef.current;

      const fullPath = route.path.replace(
        /{([^}]+)}/g,
        (match: string, key: string) =>
          mergedParams[key as keyof typeof mergedParams] ?? match
      );

      const url = `${BASE_URL}${fullPath}`;

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

        if (route.method !== "GET" && mergedBody) {
          fetchOptions.body = JSON.stringify(mergedBody);
        }

        const response = await fetch(url, fetchOptions);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const responseData = (await response.json()) as TData;
        setData(responseData);
        return responseData;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Произошла ошибка");
        setData(null);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [BASE_URL, route.path, route.method]
  );

  // Запускаем один раз при монтировании, если enabled = true
  useEffect(() => {
    if (enabled) fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  return { data, error, isLoading, refetch: fetchData };
}
