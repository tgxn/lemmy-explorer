import React from "react";

import useQueryCache from "../hooks/useQueryCache";

import Container from "@mui/joy/Container";

export default function Overview() {
  const {
    isLoading,
    isSuccess,
    isError,
    error,
    data: overviewData,
  } = useQueryCache("overviewData", "/overview.json");

  if (isLoading) return "Loading...";
  if (isError) return "An error has occurred: " + error.message;

  return (
    <Container maxWidth={false} sx={{}}>
      Site Overview Data
    </Container>
  );
}
