import React from "react";

import { createRoot } from "react-dom/client";

import { CssVarsProvider } from "@mui/joy/styles";

import CssBaseline from "@mui/joy/CssBaseline";

import App from "./App";

export default function Index() {
  return (
    <CssVarsProvider defaultMode="system" disableTransitionOnChange>
      <CssBaseline />
      <App />
    </CssVarsProvider>
  );
}

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(
  <React.StrictMode>
    <Index />
  </React.StrictMode>,
);
