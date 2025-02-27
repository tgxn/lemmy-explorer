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
import VersionChart from "../components/Inspector/VersionChart";

export default function Inspector() {
  const navigate = useNavigate();

  const [tabIndex, setTabIndex] = React.useState(0);

  const tabDefs = [
    {
      label: "Overview",
      nav: "/inspect",
      component: <Overview />,
    },
    {
      label: "Version Distribution",
      nav: "/inspect/versions",
      component: <Versions />,
    },
    {
      label: "Suspicious Instances",
      nav: "/inspect/sus",
      component: <Sus />,
    },
    // {
    //   label: "Instance Debugger",
    //   nav: "/inspect/debug",
    //   component: <Overview />,
    // },
    {
      label: "Version Chart",
      nav: "/inspect/version-chart",
      component: <VersionChart />,
    },
  ];

  // restore tab
  React.useEffect(() => {
    const path = window.location.pathname;

    tabDefs.forEach((tab, index) => {
      if (path === tab.nav) {
        setTabIndex(index);
      }
    });
  }, []);

  const changeView = (index) => {
    setTabIndex(index);
    navigate(tabDefs[index].nav);
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
          {tabDefs.map((tab, index) => (
            <Tab key={index} variant={"soft"} color={tabIndex === index ? "primary" : "neutral"}>
              {tab.label}
            </Tab>
          ))}
        </TabList>
        <Box
          sx={(theme) => ({
            bgcolor: "background.body",
            width: "100%",
            p: 2,
          })}
        >
          <Routes>
            {tabDefs.map((tab, index) => (
              <Route
                key={index}
                path={tab.nav.replace("/inspect", "")}
                element={<TabPanel value={index}>{tab.component}</TabPanel>}
              />
            ))}
          </Routes>
        </Box>
      </Tabs>
    </Container>
  );
}
