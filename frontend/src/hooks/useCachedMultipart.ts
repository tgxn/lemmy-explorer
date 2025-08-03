import { useState, useMemo } from "react";

import axios from "axios";
import { QueryKey, UseQueryResult, useQuery } from "@tanstack/react-query";

interface MultiPartMetadata {
  count: number;
}

interface CachedDataResult<T> {
  isLoading: boolean;
  loadingPercent: number;
  isSuccess: boolean;
  isError: boolean;
  error: any;
  data: T[] | null;
}

export default function useCachedMultipart<T = any>(
  queryKey: QueryKey | string,
  metadataPath: string,
): CachedDataResult<T> {
  const [loadedChunks, setLoadedChunks] = useState<number>(0);

  const metaQuery: UseQueryResult<MultiPartMetadata, Error> = useQuery({
    queryKey: [queryKey, metadataPath, "meta"],
    queryFn: () =>
      axios
        .get<MultiPartMetadata>(`/data/${metadataPath}.json`, {
          timeout: 15000,
        })
        .then((res) => res.data),
    retry: 2,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: Infinity,
    cacheTime: Infinity,
  });

  const dataQuery: UseQueryResult<T[], Error> = useQuery({
    queryKey: [queryKey, metadataPath, "data"],
    enabled: metaQuery.isSuccess,
    queryFn: async () => {
      const requests: Promise<T[]>[] = Array.from({ length: metaQuery.data?.count ?? 0 }, (_, i) =>
        axios
          .get<T[]>(`/data/${metadataPath}/${i}.json`, {
            timeout: 10000,
          })
          .then((res) => {
            setLoadedChunks((current: number) => current + 1);
            return res.data;
          }),
      );

      const results = await Promise.all(requests);
      return results.flat();
    },
    retry: 2,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: Infinity,
    cacheTime: Infinity,
  });

  if (dataQuery.isSuccess) {
    return {
      isLoading: false,
      loadingPercent: 100,
      isSuccess: true,
      isError: false,
      error: null,
      data: dataQuery.data,
    };
  }

  // error result
  if (dataQuery.isError) {
    console.log("some results are error");

    return {
      isLoading: false,
      loadingPercent: 100,
      isSuccess: false,
      isError: true,
      error: dataQuery.error,
      data: null,
    };
  }

  const loadingPercent = metaQuery.data?.count ? (loadedChunks / metaQuery.data.count) * 100 : 0;
  console.log("useCachedMultipart loadingPercent", loadingPercent);

  return {
    isLoading: true,
    loadingPercent,
    isSuccess: false,
    isError: false,
    error: false,
    data: null,
  };
}
