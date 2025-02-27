import React from "react";
import { createRoot } from "react-dom/client";
// import ReactDOM from "react-dom/client";

import { CssVarsProvider } from "@mui/joy/styles";

import GlobalStyles from "@mui/joy/GlobalStyles";
import CssBaseline from "@mui/joy/CssBaseline";

import customTheme from "./theme";

import App from "./App";

export default function Index() {
  return (
    <CssVarsProvider defaultMode="dark" disableTransitionOnChange theme={customTheme}>
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
