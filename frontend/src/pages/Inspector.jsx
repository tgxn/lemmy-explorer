import React from "react";

import { Routes, Route, useNavigate } from "react-router-dom";

import Tabs from "@mui/joy/Tabs";
import TabList from "@mui/joy/TabList";
import Tab, { tabClasses } from "@mui/joy/Tab";
import TabPanel from "@mui/joy/TabPanel";

import Container from "@mui/joy/Container";
import Box from "@mui/joy/Box";

import Overview from "../components/Inspector/Overview";
import Versions from "../components/Inspector/Versions";
import Sus from "../components/Inspector/Sus";

export default function Inspector() {
  const navigate = useNavigate();

  const [tabIndex, setTabIndex] = React.useState(0);

  // restore tab
  React.useEffect(() => {
    const path = window.location.pathname;

    switch (path) {
      case "/inspect":
        setTabIndex(0);
        break;

      case "/inspect/versions":
        setTabIndex(1);
        break;

      case "/inspect/sus":
        setTabIndex(2);
        break;

      case "/inspect/debug":
        setTabIndex(3);
        break;
    }
  }, []);

  const changeView = (index) => {
    setTabIndex(index);
    switch (index) {
      case 0:
        navigate("/inspect");
        break;

      case 1:
        navigate("versions");
        break;

      case 2:
        navigate("sus");
        break;

      case 3:
        navigate("debug");
        break;
    }
  };

  return (
    <Container maxWidth={false} sx={{}}>
      <Tabs
        value={tabIndex}
        onChange={(event, value) => changeView(value)}
        aria-label="tabs"
        defaultValue={0}
        sx={{
          bgcolor: "background.body",
          alignItems: "center",
        }}
      >
        <TabList variant="outlined" color="neutral">
          <Tab variant={"soft"} color={tabIndex === 0 ? "primary" : "neutral"}>
            Overview
          </Tab>
          <Tab variant={"soft"} color={tabIndex === 1 ? "primary" : "neutral"}>
            Version Distribution
          </Tab>
          <Tab variant={"soft"} color={tabIndex === 2 ? "primary" : "neutral"}>
            Suspicious Instances
          </Tab>
          {/* <Tab>Instance Debugger</Tab> */}
        </TabList>
        <Box
          sx={(theme) => ({
            bgcolor: "background.body",
            width: "100%",
            p: 2,
          })}
        >
          <Routes>
            <Route
              path="/"
              element={
                <TabPanel value={0}>
                  <Overview />
                </TabPanel>
              }
            />
            <Route
              path="/versions"
              element={
                <TabPanel value={1}>
                  <Versions />
                </TabPanel>
              }
            />
            <Route
              path="/sus"
              element={
                <TabPanel value={2}>
                  <Sus />
                </TabPanel>
              }
            />
            {/* <Route path="/debug" element={<Overview />} /> */}
          </Routes>
        </Box>
      </Tabs>
    </Container>
  );
}
