import React from "react";

import { Routes, Route } from "react-router-dom";

import { useParams, useNavigate } from "react-router-dom";
import useQueryCache from "../hooks/useQueryCache";

import Tabs from "@mui/joy/Tabs";
import TabList from "@mui/joy/TabList";
import Tab from "@mui/joy/Tab";
import TabPanel from "@mui/joy/TabPanel";
import Breadcrumbs from "@mui/joy/Breadcrumbs";
import Link from "@mui/joy/Link";
import Container from "@mui/joy/Container";
import Box from "@mui/joy/Box";
import Typography from "@mui/joy/Typography";

import { LinearValueLoader, PageError } from "../components/Shared/Display";

import InstanceDetail from "../components/InstanceView/InstanceDetail";
import InstanceOverview from "../components/InstanceView/InstanceOverview";
import InstanceUserGrowth from "../components/InstanceView/InstanceUserGrowth";
import InstanceVersions from "../components/InstanceView/InstanceVersions";

export default function InstanceView() {
  const params = useParams();
  const navigate = useNavigate();

  const [tabIndex, setTabIndex] = React.useState(0);

  const baseUrl = params.baseUrl;

  const {
    isLoading,
    isSuccess,
    isError,
    data: metricsData,
  } = useQueryCache(`metrics.${baseUrl}`, `metrics/${baseUrl}.meta`);

  // restore tab
  React.useEffect(() => {
    const path = window.location.pathname;

    if (path.endsWith("user-growth")) {
      setTabIndex(1);
    } else if (path.endsWith("version-history")) {
      setTabIndex(2);
    }
  }, []);

  const changeView = (index) => {
    setTabIndex(index);
    switch (index) {
      case 0:
        navigate(`/instance/${baseUrl}`);
        break;

      case 1:
        navigate("user-growth");
        break;

      case 2:
        navigate("version-history");
        break;
    }
  };

  if (isLoading) return <LinearValueLoader />;
  if (isError) return <PageError />;

  return (
    <Container maxWidth={false}>
      {/* <pre>{JSON.stringify(metricsData, null, 4)}</pre> */}
      <Breadcrumbs separator="›" size="lg" aria-label="breadcrumbs">
        <Link
          // `preventDefault` is for demo purposes
          // and is generally not needed in your app
          onClick={(event) => event.preventDefault()}
          underline="hover"
          color="primary"
          fontSize="inherit"
          href="/"
        >
          {/* <PublicIcon sx={{ mr: 0.5 }} fontSize="inherit" /> */}
          Instances
        </Link>

        <Typography fontSize="inherit">{metricsData.instance.name}</Typography>
      </Breadcrumbs>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 2,
        }}
      >
        <Box
          sx={{
            // display: "flex",
            // flexDirection: "row",
            // flex: 1,
            flexGrow: 0,
            flexShrink: 0,
            width: { xs: "100%", md: "350px" },
            // maxWidth: "350px",
          }}
        >
          <InstanceDetail instance={metricsData.instance} />
        </Box>

        <Box sx={{ display: "flex", flexDirection: "row", flexGrow: 1, width: "100%" }}>
          <Tabs
            value={tabIndex}
            onChange={(event, value) => changeView(value)}
            aria-label="tabs"
            defaultValue={0}
            sx={{
              bgcolor: "background.body",
              width: "100%",
              // alignItems: "center",
            }}
          >
            <TabList
              variant="outlined"
              color="neutral"
              // sx={{
              //   width: "200px",
              // }}
            >
              <Tab variant={"soft"} color={tabIndex === 0 ? "primary" : "neutral"}>
                Overview
              </Tab>
              <Tab variant={"soft"} color={tabIndex === 1 ? "primary" : "neutral"}>
                User Growth
              </Tab>
              <Tab variant={"soft"} color={tabIndex === 2 ? "primary" : "neutral"}>
                Version History
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
                      <InstanceOverview instance={metricsData.instance} userSeries={metricsData.users} />
                    </TabPanel>
                  }
                />
                <Route
                  path="/user-growth"
                  element={
                    <TabPanel value={1}>
                      <InstanceUserGrowth userSeries={metricsData.users} />
                    </TabPanel>
                  }
                />
                <Route
                  path="/version-history"
                  element={
                    <TabPanel value={2}>
                      <InstanceVersions
                        instance={metricsData.instance}
                        versionSeries={metricsData.versions}
                      />
                    </TabPanel>
                  }
                />
                {/* <Route path="/debug" element={<Overview />} /> */}
              </Routes>
            </Box>
          </Tabs>
        </Box>
      </Box>
    </Container>
  );
}
