import axios from "axios";
import { useQuery } from "@tanstack/react-query";

export default function useQueryCache(queryKey, filePath) {
  const { isSuccess, isLoading, isError, error, data, isFetching } = useQuery({
    queryKey: ["cache", queryKey], // single string key
    queryFn: () =>
      axios
        .get(filePath, {
          timeout: 15000,
        })
        .then((res) => {
          console.log(res.data);
          return res.data;
        }),
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: Infinity,
    cacheTime: Infinity,
  });

  return {
    isLoading,
    isSuccess,
    isError,
    error,
    data,
  };
}
