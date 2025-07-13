import React, { Suspense, lazy } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { Provider } from "react-redux";

import { Routes, Route } from "react-router-dom";

import { BrowserRouter } from "react-router-dom";

import Box from "@mui/joy/Box";
import Container from "@mui/joy/Container";

import Header from "./components/Header/Header";
import { PageLoading } from "./components/Shared/Display";

const Instances = lazy(() => import("./pages/Instances"));
const Communities = lazy(() => import("./pages/Communities"));
const About = lazy(() => import("./pages/About"));
const Join = lazy(() => import("./pages/Join"));
const Inspector = lazy(() => import("./pages/Inspector"));
const InstanceView = lazy(() => import("./pages/InstanceView"));
const MBinMagazines = lazy(() => import("./pages/MBinMagazines"));
const PiefedCommunities = lazy(() => import("./pages/PiefedCommunities"));

import AppStore from "./store";

const queryClient = new QueryClient();
export default function App() {
  return (
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
              <Suspense fallback={<PageLoading />}>
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
                  <Route path="/inspect/*" element={<Inspector />} />
                  <Route path="/instance/:baseUrl/*" element={<InstanceView />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/communities" element={<Communities />} />
                  <Route path="/communities/:instanceBaseUrl" element={<Communities />} />

                  <Route path="/mbin/magazines" element={<MBinMagazines />} />
                  <Route path="/piefed/communities" element={<PiefedCommunities />} />
                  {/* <Route path="*" element={<NoMatch />} /> */}
                </Routes>
              </Suspense>
            </Box>
          </BrowserRouter>
        </Container>
      </Provider>
    </QueryClientProvider>
  );
}
