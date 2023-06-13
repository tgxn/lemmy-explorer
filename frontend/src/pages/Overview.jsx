import React from "react";

import axios from "axios";

import { useQuery } from "@tanstack/react-query";

import Container from "@mui/joy/Container";

export default function Overview() {
  const { isLoading, error, data, isFetching } = useQuery({
    queryKey: ["overviewData"],
    queryFn: () =>
      axios.get("/overview.json").then((res) => {
        return res.data;
      }),
    refetchOnWindowFocus: false,
  });

  if (isLoading) return "Loading...";
  if (error) return "An error has occurred: " + error.message;

  return (
    <Container maxWidth={false} sx={{}}>
      Site Overview Data
    </Container>
  );
}
