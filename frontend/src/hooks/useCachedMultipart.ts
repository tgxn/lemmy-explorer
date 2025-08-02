import { useState } from "react";

import axios from "axios";
import { QueryKey, UseQueryResult, useQuery } from "@tanstack/react-query";

interface Metadata {
  count: number;
}

interface HookResult<T> {
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
): HookResult<T> {
  const [loadedChunks, setLoadedChunks] = useState(0);

  const metaQuery: UseQueryResult<Metadata, Error> = useQuery({
    queryKey: [queryKey, metadataPath, "meta"],
    queryFn: () =>
      axios
        .get<Metadata>(`/data/${metadataPath}.json`, {
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
            timeout: 15000,
          })
          .then((res) => {
            setLoadedChunks((c) => c + 1);
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

  const loadingPercent = metaQuery.data?.count ? (loadedChunks / metaQuery.data.count) * 100 : 0;

  // useEffect(() => {
  //   if (isMetaSuccess) {
  //     const dataFileCount = meta.count;

  //     const queries = [];

  //     for (let i = 0; i < dataFileCount; i++) {
  //       queries.push({
  //         queryKey: [queryKey, metadataPath, i],
  //         queryFn: () =>
  //           axios
  //             .get(`/data/${metadataPath}/${i}.json`, {
  //               timeout: 15000,
  //             })
  //             .then((res) => res.data),
  //         retry: 2,
  //         refetchOnWindowFocus: false,
  //         refetchOnMount: false,
  //         staleTime: Infinity,
  //         cacheTime: Infinity,
  //       });
  //     }

  //     // results.queries = queries;
  //     setPageQueries(queries);
  //   }
  // }, [isMetaSuccess]);

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

  // let loadingPercent = 0;
  // if (results.length > 0) {
  //   loadingPercent = results.filter((result) => result.isSuccess).length / results.length;
  //   loadingPercent = loadingPercent * 100;
  // }
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
