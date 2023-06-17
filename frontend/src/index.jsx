/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";

import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { Provider } from "react-redux";

import { Routes, Route, Navigate } from "react-router-dom";

import { BrowserRouter } from "react-router-dom";

import { CssVarsProvider } from "@mui/joy/styles";

import GlobalStyles from "@mui/joy/GlobalStyles";
import CssBaseline from "@mui/joy/CssBaseline";

import Box from "@mui/joy/Box";
import Container from "@mui/joy/Container";

const queryClient = new QueryClient();

import Header from "./components/Header";

import Overview from "./pages/Overview";
import Instances from "./pages/Instances";
import Communities from "./pages/Communities";
import About from "./pages/About";
import Join from "./pages/Join";

import customTheme from "./theme";

import AppStore from "./store";

export default function App() {
  return (
    <CssVarsProvider defaultMode="dark" disableTransitionOnChange theme={customTheme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} />
        <Provider store={AppStore}>
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
              <Header />
              <Box
                sx={{
                  // overflow: "auto",
                  height: "calc(100% - 80px)",
                }}
              >
                <Routes>
                  {/* <Route
                  index
                  //   path="/instances"
                  element={<Overview />}
                /> */}
                  <Route
                    index
                    // path="/instances"
                    element={<Instances />}
                  />
                  <Route path="/join" element={<Join />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/communities" element={<Communities />} />
                  <Route path="/communities/:instanceBaseUrl" element={<Communities />} />
                  {/* <Route path="*" element={<NoMatch />} /> */}
                </Routes>
              </Box>
            </BrowserRouter>
          </Container>
        </Provider>
      </QueryClientProvider>
    </CssVarsProvider>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.createRoot(rootElement).render(<App />);
