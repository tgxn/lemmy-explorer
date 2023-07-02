import React from "react";

import { Routes, Route } from "react-router-dom";

import { useParams, useNavigate } from "react-router-dom";
import useQueryCache from "../hooks/useQueryCache";

import Badge from "@mui/joy/Badge";
import Tabs from "@mui/joy/Tabs";
import TabList from "@mui/joy/TabList";
import Tab from "@mui/joy/Tab";
import TabPanel from "@mui/joy/TabPanel";
import Breadcrumbs from "@mui/joy/Breadcrumbs";
import Link from "@mui/joy/Link";
import Container from "@mui/joy/Container";
import Box from "@mui/joy/Box";
import Typography from "@mui/joy/Typography";

import { SimpleNumberFormat, LinearValueLoader, PageError } from "../components/Shared/Display";

import InstanceDetail from "../components/InstanceView/InstanceDetail";
import InstanceOverview from "../components/InstanceView/InstanceOverview";
import InstanceUserGrowth from "../components/InstanceView/InstanceUserGrowth";
import InstanceVersions from "../components/InstanceView/InstanceVersions";
import InstanceCommunities from "../components/InstanceView/InstanceCommunities";

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

    if (path.endsWith("communities")) {
      setTabIndex(1);
    } else if (path.endsWith("version-history")) {
      setTabIndex(2);
    } else if (path.endsWith("version-history")) {
      setTabIndex(3);
    }
  }, []);

  const changeView = (index) => {
    setTabIndex(index);
    switch (index) {
      case 0:
        navigate(`/instance/${baseUrl}`);
        break;

      case 1:
        navigate("communities");
        break;

      case 2:
        navigate("user-growth");
        break;

      case 3:
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

        <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
          <Tabs
            value={tabIndex}
            onChange={(event, value) => changeView(value)}
            aria-label="tabs"
            defaultValue={0}
            sx={{
              bgcolor: "background.body",
              // width: "100%",
              // alignItems: "center",
            }}
          >
            <TabList
              variant="outlined"
              color="neutral"
              sx={{
                width: "fit-content",
              }}
            >
              <Tab variant={tabIndex === 0 ? "solid" : "soft"} color={tabIndex === 0 ? "primary" : "neutral"}>
                Overview
              </Tab>
              <Badge
                badgeContent={isSuccess && <SimpleNumberFormat value={metricsData.communityCount} />}
                max={9999}
                color="primary"
                variant={"solid"}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
              >
                <Tab
                  variant={tabIndex === 1 ? "solid" : "soft"}
                  color={tabIndex === 1 ? "primary" : "neutral"}
                >
                  Communities
                </Tab>
              </Badge>
              <Tab variant={tabIndex === 2 ? "solid" : "soft"} color={tabIndex === 2 ? "primary" : "neutral"}>
                User Growth
              </Tab>
              <Tab variant={tabIndex === 3 ? "solid" : "soft"} color={tabIndex === 3 ? "primary" : "neutral"}>
                Version History
              </Tab>
              {/* <Tab>Instance Debugger</Tab> */}
            </TabList>
          </Tabs>
          <Box
            sx={(theme) => ({
              //   width: "100%",
              py: 2,
              px: 1,
              //   display: "flex",
              //   // flexDirection: "row",
            })}
          >
            <Routes>
              <Route
                path="/"
                element={<InstanceOverview instance={metricsData.instance} userSeries={metricsData.users} />}
              />
              <Route path="/communities" element={<InstanceCommunities instance={metricsData.instance} />} />
              <Route path="/user-growth" element={<InstanceUserGrowth userSeries={metricsData.users} />} />
              <Route
                path="/version-history"
                element={
                  <InstanceVersions instance={metricsData.instance} versionSeries={metricsData.versions} />
                }
              />
            </Routes>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}
