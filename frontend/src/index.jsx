/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import axios from "axios";

import { CssVarsProvider, useColorScheme } from "@mui/joy/styles";

import GlobalStyles from "@mui/joy/GlobalStyles";
import CssBaseline from "@mui/joy/CssBaseline";

import Container from "@mui/joy/Container";
// import Typography from "@mui/material/Typography";
import Box from "@mui/joy/Box";
// import Link from "@mui/material/Link";
import Avatar from "@mui/joy/Avatar";
import List from "@mui/joy/List";
import ListItem from "@mui/joy/ListItem";
import Typography from "@mui/joy/Typography";
import ListItemContent from "@mui/joy/ListItemContent";
import ListItemDecorator from "@mui/joy/ListItemDecorator";

import Sheet from "@mui/joy/Sheet";
import Grid from "@mui/joy/Grid";
import Card from "@mui/joy/Card";

import AspectRatio from "@mui/joy/AspectRatio";
import Button from "@mui/joy/Button";
import CardContent from "@mui/joy/CardContent";
import IconButton from "@mui/joy/IconButton";
import Divider from "@mui/joy/Divider";
import CardOverflow from "@mui/joy/CardOverflow";
const queryClient = new QueryClient();

import Header from "./components/Header";
import Instances from "./pages/Instances";

import customTheme from "./theme";

export default function App() {
  return (
    <CssVarsProvider defaultMode="dark" disableTransitionOnChange theme={customTheme}>
      <CssBaseline />
      <GlobalStyles
        styles={{
          ":root": {
            // "--Collapsed-breakpoint": "769px", // form will stretch when viewport is below `769px`
            // "--Cover-width": "40vw", // must be `vw` only
            // "--Form-maxWidth": "700px",
            // "--Transition-duration": "0.4s", // set to `none` to disable transition
          },
        }}
      />
      <QueryClientProvider client={queryClient}>
        <Header />
        <Instances />
      </QueryClientProvider>{" "}
    </CssVarsProvider>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.createRoot(rootElement).render(<App />);
