import React from "react";

import ReactDOM from "react-dom/client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { CssVarsProvider } from "@mui/joy/styles";

import CssBaseline from "@mui/joy/CssBaseline";

import App from "./App";

const queryClient = new QueryClient();
export default function Index() {
  return (
    <CssVarsProvider defaultMode="system" disableTransitionOnChange>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} />
        <App />
      </QueryClientProvider>
    </CssVarsProvider>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.createRoot(rootElement).render(<Index />);
