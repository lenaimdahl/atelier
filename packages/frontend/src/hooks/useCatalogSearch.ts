import { useEffect, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "../api/client";

const SEARCH_DELAY_MS = 250;

export function useCatalogSearch(query: string) {
  const [debouncedQuery, setDebouncedQuery] = useState(query.trim());

  useEffect(() => {
    const timeout = setTimeout(
      () => setDebouncedQuery(query.trim()),
      SEARCH_DELAY_MS,
    );
    return () => clearTimeout(timeout);
  }, [query]);

  return useQuery({
    queryKey: ["catalog", debouncedQuery],
    queryFn: async () =>
      (await api.catalog.searchCatalog({ q: debouncedQuery })).data,
    placeholderData: keepPreviousData,
  });
}
