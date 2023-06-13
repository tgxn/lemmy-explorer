import React from "react";

import axios from "axios";

import Moment from "react-moment";

import { useQuery } from "@tanstack/react-query";

import Badge from "@mui/joy/Badge";
import Box from "@mui/joy/Box";
import Tabs from "@mui/joy/Tabs";
import TabList from "@mui/joy/TabList";
import Tab from "@mui/joy/Tab";

import { useNavigate, useLocation } from "react-router-dom";

import { useColorScheme } from "@mui/joy/styles";

import IconButton from "@mui/joy/IconButton";
import Typography from "@mui/joy/Typography";
import Tooltip from "@mui/joy/Tooltip";

import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";

import GitHubIcon from "@mui/icons-material/GitHub";

function ColorSchemeToggle({ onClick, ...props }) {
  const { mode, setMode } = useColorScheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) {
    return <IconButton size="sm" variant="plain" color="neutral" disabled />;
  }
  return (
    <Tooltip title="Toggle Color Scheme" variant="soft">
      <IconButton
        id="toggle-mode"
        size="sm"
        variant="outlined"
        color="neutral"
        sx={{ mr: 2, p: 1 }}
        {...props}
        onClick={(event) => {
          if (mode === "light") {
            setMode("dark");
          } else {
            setMode("light");
          }
          onClick?.(event);
        }}
      >
        {mode === "light" ? <DarkModeRoundedIcon /> : <LightModeRoundedIcon />}
      </IconButton>
    </Tooltip>
  );
}

export default function TabsVariants() {
  const [index, setIndex] = React.useState(0);

  const { isLoading, error, data, isFetching } = useQuery({
    queryKey: ["metaData"],
    queryFn: () =>
      axios.get("/meta.json").then((res) => {
        console.log(res.data);
        return res.data;
      }),
    refetchOnWindowFocus: false,
  });

  const navigate = useNavigate();

  const location = useLocation();
  console.log("location", location);

  React.useEffect(() => {
    // if (location.pathname === "/instances") {
    //   setIndex(1);
    // }
    if (location.pathname === "/communities") {
      setIndex(1);
    }
  }, [location]);

  return (
    <Box
      component="header"
      sx={{
        p: 2,
        display: "flex",
        height: "80px",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Box
        component="div"
        sx={{
          width: 30,
          height: 30,
          // dont change item size on flex
          flexShrink: 0,
          pr: 2,
          ml: 2,
          mr: 2,
          background: `url(/icons/Lemmy_Logo.svg) no-repeat center center`,
          backgroundSize: "contain",
        }}
      />
      <Typography
        sx={{
          // ml: 1,
          fontSize: "19px",
          display: { xs: "none", sm: "block" },
        }}
        // startDecorator={

        // }
      >
        Lemmy Explorer
      </Typography>
      <Box sx={{ flexGrow: 1 }} />
      <Tabs
        aria-label="Soft tabs"
        value={index}
        onChange={(event, value) => {
          console.log("value", value);
          setIndex(value);

          if (value === 0) {
            navigate("/");
          }
          // if (value === 1) {
          //   navigate("/instances");
          // }
          if (value === 1) {
            navigate("/communities");
          }
        }}
        sx={{ borderRadius: "lg" }}
      >
        <TabList variant="soft">
          {/* <Tab variant={index === 0 ? "solid" : "plain"} color={index === 0 ? "primary" : "neutral"}>
            Overview
          </Tab> */}

          <Badge
            badgeContent={!isLoading && data.instances}
            max={999}
            color="info"
            variant={index === 0 ? "soft" : "solid"}
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
          >
            <Tab variant={index === 0 ? "solid" : "plain"} color={index === 0 ? "info" : "neutral"}>
              Instances
            </Tab>
          </Badge>

          <Badge
            badgeContent={!isLoading && data.communities}
            max={9999}
            variant={index === 1 ? "soft" : "solid"}
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
          >
            <Tab variant={index === 1 ? "solid" : "plain"} color={index === 1 ? "primary" : "neutral"}>
              Communities
            </Tab>
          </Badge>
        </TabList>
      </Tabs>
      <Box sx={{ flexGrow: 1 }} />

      <Box sx={{}}>
        {!isLoading && (
          <Tooltip title="All data was retrieved within 24 hours of this time" variant="soft">
            <Typography
              variant="caption"
              sx={{
                display: { xs: "none", sm: "block" },

                cursor: "help",
                textDecoration: "underline dotted",
                mr: 2,
                fontStyle: "italic",
              }}
            >
              updated <Moment fromNow>{data.time}</Moment>
            </Typography>
          </Tooltip>
        )}
      </Box>

      <ColorSchemeToggle />
      <Tooltip title="View Code on GitHub" variant="soft">
        <IconButton
          size="sm"
          variant="outlined"
          color="neutral"
          sx={{ p: 1 }}
          href="https://github.com/tgxn/lemmy-explorer"
          target="_blank"
          component="a"
        >
          <GitHubIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
