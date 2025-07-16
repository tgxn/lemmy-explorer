import React from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { Provider } from "react-redux";

import { Routes, Route } from "react-router-dom";

import { BrowserRouter } from "react-router-dom";

import Box from "@mui/joy/Box";
import Container from "@mui/joy/Container";

import Header from "./components/Header/Header";

import AppStore from "./store";

import Instances from "./pages/Instances";
import Communities from "./pages/Communities";
import About from "./pages/About";
import Join from "./pages/Join";
import Inspector from "./pages/Inspector";
import InstanceView from "./pages/InstanceView";
import MBinMagazines from "./pages/MBinMagazines";
import PiefedCommunities from "./pages/PiefedCommunities";

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
            </Box>
          </BrowserRouter>
        </Container>
      </Provider>
    </QueryClientProvider>
  );
}
