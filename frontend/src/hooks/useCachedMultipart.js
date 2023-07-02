import React, { useState, useEffect } from "react";

import axios from "axios";
import { useQuery, useQueries } from "@tanstack/react-query";

export default function useCachedMultipart(queryKey, metadataPath) {
  // load metadata
  const {
    isSuccess: isMetaSuccess,
    isLoading: isMetaLoading,
    isError: isMetaError,
    error: metaError,
    data: meta,
    isFetching: isMetaFetching,
  } = useQuery({
    queryKey: [queryKey], // single string key
    queryFn: () =>
      axios
        .get(`/data/${metadataPath}.json`, {
          timeout: 15000,
        })
        .then((res) => {
          // console.log(res.data);
          return res.data;
        }),
    retry: 2,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: Infinity,
    cacheTime: Infinity,
  });

  const [pageQueries, setPageQueries] = useState([]);

  const results = useQueries({
    queries: pageQueries,
    enabled: false,
  });

  useEffect(() => {
    if (isMetaSuccess) {
      const dataFileCount = meta.count;

      const queries = [];

      for (let i = 0; i < dataFileCount; i++) {
        queries.push({
          queryKey: [queryKey, i],
          queryFn: () =>
            axios
              .get(`/data/${metadataPath}/${i}.json`, {
                timeout: 15000,
              })
              .then((res) => {
                // console.log(res.data);
                return res.data;
              }),
          retry: 2,
          refetchOnWindowFocus: false,
          refetchOnMount: false,
          staleTime: Infinity,
          cacheTime: Infinity,
        });
      }

      // results.queries = queries;
      setPageQueries(queries);
    }
  }, [isMetaSuccess]);

  if (results.length > 0 && results.every((result) => result.isSuccess)) {
    console.log("useCachedMultipart useEffect", results);
    console.log("all results are success");

    // concat all the `data` key (which is an array) into one big array
    const resultsData = results.map((result) => result.data).flat();

    return {
      isLoading: false,
      loadingPercent: 100,
      isSuccess: true,
      isError: false,
      error: null,
      data: resultsData,
    };
  }

  // error result
  if (results.length > 0 && results.some((result) => result.isError)) {
    console.log("useCachedMultipart useEffect", results);
    console.log("some results are error");

    return {
      isLoading: false,
      loadingPercent: 100,
      isSuccess: false,
      isError: true,
      error: results.find((result) => result.isError).error.message,
      data: null,
    };
  }

  let loadingPercent = 0;
  if (results.length > 0) {
    loadingPercent = results.filter((result) => result.isSuccess).length / results.length;
    loadingPercent = loadingPercent * 100;
  }
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
