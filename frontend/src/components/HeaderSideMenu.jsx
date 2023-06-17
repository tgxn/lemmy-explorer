import React from "react";
import Moment from "react-moment";

import { useNavigate, useLocation } from "react-router-dom";
import { useColorScheme } from "@mui/joy/styles";
import useQueryCache from "../hooks/useQueryCache";

import Box from "@mui/joy/Box";
import IconButton from "@mui/joy/IconButton";
import Tooltip from "@mui/joy/Tooltip";
import Menu from "@mui/joy/Menu";
import MenuItem from "@mui/joy/MenuItem";
import ListItemDecorator from "@mui/joy/ListItemDecorator";
import ListDivider from "@mui/joy/ListDivider";

import MoreVert from "@mui/icons-material/MoreVert";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import GitHubIcon from "@mui/icons-material/GitHub";
import HistoryIcon from "@mui/icons-material/History";
import PestControlIcon from "@mui/icons-material/PestControl";

import ConnectInstanceButton from "./ConnectInstanceButton";

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

export default function HeaderSideMenu() {
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
      <Box
      //  sx={showWhenSmall}
      >
        <ConnectInstanceButton />
      </Box>
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
        // MenuListProps={{
        //   sx: {
        //     "& .MuiMenuItem-root": {
        //       whiteSpace: "unset",
        //     },
        //   },
        // }}
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
