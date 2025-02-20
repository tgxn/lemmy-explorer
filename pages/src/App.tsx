import React from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { Routes, Route, Navigate } from "react-router-dom";

import { BrowserRouter } from "react-router-dom";

import Container from "@mui/joy/Container";

import Main from "./pages/Main";

const queryClient = new QueryClient();
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />

      <Container
        maxWidth={false}
        disableGutters={true}
        sx={{
          height: "100%",
          width: "100%",
          position: "absolute",
          bottom: 0,
          top: 0,
          left: 0,
          right: 0,
          display: "block",
        }}
      >
        <BrowserRouter>
          <Routes>
            <Route index element={<Main />} />
          </Routes>
        </BrowserRouter>
      </Container>
    </QueryClientProvider>
  );
}
