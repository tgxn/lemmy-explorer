import React from "react";
import { connect } from "react-redux";

import Moment from "react-moment";

import { useNavigate, useLocation } from "react-router-dom";
import { useColorScheme } from "@mui/joy/styles";
import useQueryCache from "../../hooks/useQueryCache";

import Box from "@mui/joy/Box";
import IconButton from "@mui/joy/IconButton";
import Tooltip from "@mui/joy/Tooltip";
import Menu from "@mui/joy/Menu";
import MenuItem from "@mui/joy/MenuItem";
import ListItemDecorator from "@mui/joy/ListItemDecorator";
import ListDivider from "@mui/joy/ListDivider";

// import SvgIcon from "@mui/material/SvgIcon";
// import MBinIcon from "./MBinIcon";
// import PiefedIcon from "./PiefedIcon";

import MenuIcon from "@mui/icons-material/Menu";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import GitHubIcon from "@mui/icons-material/GitHub";
import HistoryIcon from "@mui/icons-material/History";
import InfoIcon from "@mui/icons-material/Info";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import Face5Icon from "@mui/icons-material/Face5";
import DataObjectIcon from "@mui/icons-material/DataObject";

import HomeInstanceButton from "./HomeInstanceButton";

import { setFilterSuspicious } from "../../reducers/configReducer";

type IColorSchemeToggleProps = {
  onClick?: (event: React.MouseEvent) => void;
  variant?: "menu";
};

function ColorSchemeToggle({ onClick, variant, ...props }: IColorSchemeToggleProps) {
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
          onClick && onClick(event);
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

type IHeaderSideMenuProps = {
  filterSuspicious: boolean;
  dispatch: Function;
};

function HeaderSideMenu({ filterSuspicious, dispatch }: IHeaderSideMenuProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const { isLoading, isSuccess, isError, data: metaData } = useQueryCache("metaData", "meta");

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
      <Box>
        <HomeInstanceButton />
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
          aria-controls={menuOpen ? "right-side-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={menuOpen ? "true" : undefined}
          variant="outlined"
          color="neutral"
          onClick={handleClick}
          sx={{ p: 1 }}
        >
          <MenuIcon />
        </IconButton>
      </Tooltip>
      <Menu
        id="right-side-menu"
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleClose}
        placement="bottom-end"
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

        {/* <MenuItem
          // color={"info"}
          onClick={() => {
            handleClose();
            navigate("/mbin/magazines");
          }}
          {...(location.pathname === "/mbin/magazines" && { selected: true, variant: "soft" })}
        >
          <ListItemDecorator>
            <SvgIcon inheritViewBox={true} viewBox="0 0 8.467 8.467" component={MBinIcon} />
          </ListItemDecorator>
          MBin Magazines
        </MenuItem>

        <ListDivider />

        <MenuItem
          // color={"info"}
          onClick={() => {
            handleClose();
            navigate("/piefed/communities");
          }}
          {...(location.pathname === "/piefed/communities" && { selected: true, variant: "soft" })}
        >
          <ListItemDecorator>
            <SvgIcon inheritViewBox={true} viewBox="0 0 8.467 8.467" component={PiefedIcon} />
          </ListItemDecorator>
          Piefed Communities
        </MenuItem> */}

        <ListDivider />

        <MenuItem
          // color={"info"}
          onClick={() => {
            handleClose();
            navigate("/inspect");
          }}
          {...(location.pathname === "/inspect" && { selected: true, variant: "soft" })}
        >
          <ListItemDecorator>
            <TravelExploreIcon />
          </ListItemDecorator>
          Network Inspector
        </MenuItem>

        <ListDivider />

        <Box sx={showWhenSmall}>
          <ColorSchemeToggle variant="menu" />
        </Box>

        <MenuItem
          color={filterSuspicious ? "danger" : "success"}
          onClick={() => {
            if (filterSuspicious) {
              dispatch(setFilterSuspicious(false));
            } else {
              dispatch(setFilterSuspicious(true));
            }
          }}
        >
          <ListItemDecorator>
            <Face5Icon />
          </ListItemDecorator>
          {filterSuspicious ? "Include" : "Hide"} Suspicious
        </MenuItem>

        <ListDivider />
        <Box sx={showWhenSmall}>
          <MenuItem href="https://github.com/tgxn/lemmy-explorer" target="_lv_github" component="a">
            <ListItemDecorator>
              <GitHubIcon />
            </ListItemDecorator>
            Visit GitHub Project
          </MenuItem>
        </Box>

        <MenuItem
          onClick={() => {
            handleClose();
            navigate("/about");
          }}
          {...(location.pathname === "/about" && { selected: true, variant: "soft" })}
        >
          <ListItemDecorator>
            <InfoIcon />
          </ListItemDecorator>
          About / Info
        </MenuItem>

        <MenuItem href="https://data.lemmyverse.net" target="_lv_data" component="a">
          <ListItemDecorator>
            <DataObjectIcon />
          </ListItemDecorator>
          Data Access
        </MenuItem>
      </Menu>
    </>
  );
}
const mapStateToProps = (state) => ({
  filterSuspicious: state.configReducer.filterSuspicious,
});
export default connect(mapStateToProps)(HeaderSideMenu);
