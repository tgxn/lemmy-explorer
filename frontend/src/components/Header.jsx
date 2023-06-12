import React from "react";

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

  const navigate = useNavigate();

  const location = useLocation();
  console.log("location", location);

  React.useEffect(() => {
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
      <Typography
        fontWeight="lg"
        sx={{
          ml: 2,
        }}
        startDecorator={
          <Box
            component="div"
            sx={{
              width: 28,
              height: 28,
              background: `url(/icons/Lemmy_Logo.svg) no-repeat center center`,
              backgroundSize: "contain",
              //   borderRadius: "50%",
              //   boxShadow: (theme) => theme.shadow.md,
              //   "--joy-shadowChannel": (theme) => theme.vars.palette.primary.mainChannel,
            }}
          />
        }
      >
        Lemmy Explorer
      </Typography>
      <Box sx={{ flexGrow: 1 }} />
      <Tabs
        aria-label="Soft tabs"
        value={index}
        onChange={(event, value) => {
          setIndex(value);
          if (value === 0) {
            navigate("/");
          }
          if (value === 1) {
            navigate("/communities");
          }
        }}
        sx={{ borderRadius: "lg" }}
      >
        <TabList variant="soft">
          <Tab variant={index === 0 ? "solid" : "plain"} color={index === 0 ? "primary" : "neutral"}>
            Instances
          </Tab>
          <Tab variant={index === 1 ? "solid" : "plain"} color={index === 1 ? "primary" : "neutral"}>
            Communities
          </Tab>
        </TabList>
      </Tabs>
      <Box sx={{ flexGrow: 1 }} />
      <ColorSchemeToggle />
      <Tooltip title="View Code on GitHub" variant="soft">
        <IconButton
          size="sm"
          variant="outlined"
          color="neutral"
          sx={{ p: 1 }}
          // link to https://github.com/tgxn/lemmy-explorer
          onClick={() => {
            window.open("https://github.com/tgxn/lemmy-explorer", "_blank");
          }}
        >
          <GitHubIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
