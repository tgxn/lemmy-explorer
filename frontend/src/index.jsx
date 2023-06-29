import React from "react";

import ReactDOM from "react-dom/client";

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
ReactDOM.createRoot(rootElement).render(<Index />);
