import React from "react";
import axios from "axios";
import Moment from "react-moment";

import { useNavigate, useLocation } from "react-router-dom";
import { useColorScheme } from "@mui/joy/styles";
import useQueryCache from "../hooks/useQueryCache";

import Badge from "@mui/joy/Badge";
import Box from "@mui/joy/Box";
import Tabs from "@mui/joy/Tabs";
import TabList from "@mui/joy/TabList";
import Tab from "@mui/joy/Tab";
import IconButton from "@mui/joy/IconButton";
import Typography from "@mui/joy/Typography";
import Tooltip from "@mui/joy/Tooltip";
import Menu from "@mui/joy/Menu";
import MenuItem from "@mui/joy/MenuItem";
import ListItemDecorator from "@mui/joy/ListItemDecorator";
import ListDivider from "@mui/joy/ListDivider";

import MoreVert from "@mui/icons-material/MoreVert";
import Edit from "@mui/icons-material/Edit";
import DeleteForever from "@mui/icons-material/DeleteForever";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import GitHubIcon from "@mui/icons-material/GitHub";
import HistoryIcon from "@mui/icons-material/History";
import PestControlIcon from "@mui/icons-material/PestControl";

function ColorSchemeToggle({ onClick, variant, ...props }) {
  const { mode, setMode } = useColorScheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) {
    return <IconButton size="sm" variant="plain" color="neutral" disabled />;
  }

  if (variant === "menu") {
    return (
      <MenuItem
        id="toggle-mode"
        color="neutral"
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
        <ListItemDecorator>
          {mode === "light" ? <DarkModeRoundedIcon /> : <LightModeRoundedIcon />}
        </ListItemDecorator>
        Toggle Color Scheme
      </MenuItem>
    );
  }

  return (
    <Tooltip title="Toggle Color Scheme" variant="soft">
      <IconButton
        id="toggle-mode"
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

function RightSideMenu() {
  const navigate = useNavigate();
  const location = useLocation();

  const { isLoading, isSuccess, isError, data: metaData } = useQueryCache("metaData", "/meta.json");

  const [anchorEl, setAnchorEl] = React.useState(null);
  const [menuOpen, setMenuOpen] = React.useState(false);

  const handleClick = (event) => {
    if (menuOpen) return handleClose();

    setAnchorEl(event.currentTarget);
    setMenuOpen(true);
  };
  const handleClose = () => {
    setMenuOpen(false);
    setAnchorEl(null);
  };

  const hideWhenSmall = {
    display: { xs: "none", md: "flex" },
  };

  const showWhenSmall = {
    display: { xs: "inline-flex", md: "none" },
  };

  return (
    <>
      <Box sx={hideWhenSmall}>
        <ColorSchemeToggle />
        <Tooltip title="View Code on GitHub" variant="soft">
          <IconButton
            variant="outlined"
            color="neutral"
            sx={{ mr: 2, p: 1 }}
            href="https://github.com/tgxn/lemmy-explorer"
            target="_lv_github"
            component="a"
          >
            <GitHubIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Tooltip title="Show Menu" variant="soft">
        <IconButton
          aria-controls={menuOpen ? "positioned-demo-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={menuOpen ? "true" : undefined}
          variant="outlined"
          color="neutral"
          onClick={handleClick}
          sx={{ p: 1 }}
        >
          <MoreVert />
        </IconButton>
      </Tooltip>
      <Menu
        id="positioned-demo-menu"
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleClose}
        aria-labelledby="positioned-demo-button"
        placement="bottom-end"
        MenuListProps={{
          sx: {
            "& .MuiMenuItem-root": {
              whiteSpace: "unset",
            },
          },
        }}
      >
        <MenuItem disabled>
          <ListItemDecorator>
            <HistoryIcon />
          </ListItemDecorator>
          {isSuccess && (
            <Box>
              <Box>Data Last Updated</Box>

              <Box
                sx={{
                  fontStyle: "italic",
                }}
              >
                <Moment fromNow>{metaData.time}</Moment>
              </Box>
            </Box>
          )}
        </MenuItem>

        <ListDivider />
        <MenuItem
          onClick={() => {
            handleClose();
            navigate("/about");
          }}
          {...(location.pathname === "/about" && { selected: true, variant: "soft" })}
        >
          <ListItemDecorator>
            <PestControlIcon />
          </ListItemDecorator>
          Crawler Info
        </MenuItem>

        <ListDivider sx={showWhenSmall} />
        <Box sx={showWhenSmall}>
          <ColorSchemeToggle variant="menu" />
        </Box>

        <ListDivider sx={showWhenSmall} />
        <Box sx={showWhenSmall}>
          <MenuItem href="https://github.com/tgxn/lemmy-explorer" target="_lv_github" component="a">
            <ListItemDecorator>
              <GitHubIcon />
            </ListItemDecorator>
            Visit GitHub Project
          </MenuItem>
        </Box>
      </Menu>
    </>
  );
}

export default function TabsVariants() {
  const [index, setIndex] = React.useState(0);

  const { isLoading, isSuccess, isError, data: metaData } = useQueryCache("metaData", "/meta.json");

  const navigate = useNavigate();

  const location = useLocation();
  console.log("location", location);

  React.useEffect(() => {
    if (location.pathname == "/") {
      setIndex(0);
    } else if (location.pathname == "/communities") {
      setIndex(1);
    } else {
      setIndex(null);
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
        value={index}
        onChange={(event, value) => {
          console.log("value", value);
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
          <Badge
            badgeContent={isSuccess && metaData.instances}
            max={999}
            color="info"
            variant={"solid"}
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
          >
            <Tab variant={index === 0 ? "solid" : "soft"} color={index === 0 ? "info" : "neutral"}>
              Instances
            </Tab>
          </Badge>

          <Badge
            badgeContent={isSuccess && metaData.communities}
            max={9999}
            variant={"solid"}
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
          >
            <Tab variant={index === 1 ? "solid" : "soft"} color={index === 1 ? "primary" : "neutral"}>
              Communities
            </Tab>
          </Badge>
        </TabList>
      </Tabs>
      <Box sx={{ flexGrow: 1 }} />

      <RightSideMenu />
    </Box>
  );
}
