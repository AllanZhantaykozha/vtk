import { useMemo, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export interface FilterConfig<Item> {
  basePath: string;
  getSubject: (item: Item) => string;
  getInstructor: (item: Item) => string | null | undefined;
  getTopic: (item: Item) => string;
  getUploadDate: (item: Item) => string;
}

type Filters = Partial<{
  search: string;
  subject: string;
  instructor: string;
  topic: string;
  startDate: string;
  endDate: string;
}>;

export const useFilter = <Item extends { subject: { name: string } }>(
  items: Item[],
  config: FilterConfig<Item>
) => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const searchTerm = searchParams.get("search") || "";
  const selectedSubject = searchParams.get("subject") || "all";
  const selectedInstructor = searchParams.get("instructor") || "all";
  const selectedTopic = searchParams.get("topic") || "all";
  const startDate = searchParams.get("startDate") || "";
  const endDate = searchParams.get("endDate") || "";

  // Unique options for dropdowns
  const subjects = useMemo(
    () => [...new Set(items.map(config.getSubject))],
    [items, config.getSubject]
  );

  const instructors = useMemo(
    () => [...new Set(items.map(config.getInstructor).filter(Boolean))],
    [items, config.getInstructor]
  );

  const topics = useMemo(
    () => [...new Set(items.map(config.getTopic))],
    [items, config.getTopic]
  );

  // Function to update URL with new filter values
  const updateFilters = useCallback(
    (newFilters: Filters) => {
      const params = new URLSearchParams(searchParams.toString());

      if (newFilters.search !== undefined) {
        if (newFilters.search) {
          params.set("search", newFilters.search);
        } else {
          params.delete("search");
        }
      }

      if (newFilters.subject !== undefined) {
        if (newFilters.subject && newFilters.subject !== "all") {
          params.set("subject", newFilters.subject);
        } else {
          params.delete("subject");
        }
      }

      if (newFilters.instructor !== undefined) {
        if (newFilters.instructor && newFilters.instructor !== "all") {
          params.set("instructor", newFilters.instructor);
        } else {
          params.delete("instructor");
        }
      }

      if (newFilters.topic !== undefined) {
        if (newFilters.topic && newFilters.topic !== "all") {
          params.set("topic", newFilters.topic);
        } else {
          params.delete("topic");
        }
      }

      if (newFilters.startDate !== undefined) {
        if (newFilters.startDate) {
          params.set("startDate", newFilters.startDate);
        } else {
          params.delete("startDate");
        }
      }

      if (newFilters.endDate !== undefined) {
        if (newFilters.endDate) {
          params.set("endDate", newFilters.endDate);
        } else {
          params.delete("endDate");
        }
      }

      const queryString = params.toString();
      const newUrl = queryString
        ? `${config.basePath}?${queryString}`
        : config.basePath;
      router.push(newUrl, { scroll: false });
    },
    [searchParams, router, config.basePath]
  );

  // Filter items based on URL params
  const filteredItems = useMemo(
    () =>
      items.filter((item) => {
        const matchesSearch = config
          .getTopic(item)
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const matchesSubject =
          selectedSubject === "all" ||
          config.getSubject(item) === selectedSubject;
        const matchesInstructor =
          selectedInstructor === "all" ||
          config.getInstructor(item) === selectedInstructor;
        const matchesTopic =
          selectedTopic === "all" || config.getTopic(item) === selectedTopic;
        const itemDate = new Date(config.getUploadDate(item));
        const matchesStartDate = startDate
          ? itemDate >= new Date(startDate)
          : true;
        const matchesEndDate = endDate ? itemDate <= new Date(endDate) : true;

        return (
          matchesSearch &&
          matchesSubject &&
          matchesInstructor &&
          matchesTopic &&
          matchesStartDate &&
          matchesEndDate
        );
      }),
    [
      items,
      config.getSubject,
      config.getInstructor,
      config.getTopic,
      config.getUploadDate,
      searchTerm,
      selectedSubject,
      selectedInstructor,
      selectedTopic,
      startDate,
      endDate,
    ]
  );

  const resetFilters = useCallback(() => {
    router.push(config.basePath, { scroll: false });
  }, [router, config.basePath]);

  return {
    searchTerm,
    selectedSubject,
    selectedInstructor,
    selectedTopic,
    startDate,
    endDate,
    subjects,
    instructors,
    topics,
    filteredItems,
    updateFilters,
    resetFilters,
  };
};
