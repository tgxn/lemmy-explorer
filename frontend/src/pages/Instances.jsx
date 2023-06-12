import React from "react";

import axios from "axios";

import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import Container from "@mui/joy/Container";
import Box from "@mui/joy/Box";
import Grid from "@mui/joy/Grid";

import InstanceCard from "../components/InstanceCard";

export default function Instances() {
  const { isLoading, error, data, isFetching } = useQuery({
    queryKey: ["instanceData"],
    queryFn: () => axios.get("/instances.json").then((res) => res.data),
  });

  if (isLoading) return "Loading...";

  if (error) return "An error has occurred: " + error.message;

  return (
    <Container
      maxWidth="xl"
      sx={{
        overflow: "auto",
      }}
    >
      <ReactQueryDevtools initialIsOpen={false} />
      <Box sx={{ my: 4 }}>
        <div>{isFetching ? "Updating..." : ""}</div>

        <Grid container spacing={2}>
          {data.map((instance) => (
            <Grid xs={12} sm={6} md={4} lg={3} xl={2}>
              <InstanceCard instance={instance} />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
}
