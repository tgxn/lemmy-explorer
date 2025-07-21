import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import Box from "@mui/joy/Box";
import Sheet from "@mui/joy/Sheet";
import Button from "@mui/joy/Button";
import Menu from "@mui/joy/Menu";
import MenuItem from "@mui/joy/MenuItem";
import Typography from "@mui/joy/Typography";

import SvgIcon from "@mui/material/SvgIcon";
import MBinIcon from "./MBinIcon";
import PiefedIcon from "./PiefedIcon";

import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

const brandRoutes = {
  lemmy: "/",
  mbin: "/mbin/magazines",
  piefed: "/piefed/communities",
};

function LemmyEntry() {
  return (
    <>
      <Box
        component="div"
        sx={{
          width: 30,
          height: 30,
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
          fontSize: "19px",
          display: { xs: "none", sm: "block" },
        }}
      >
        Lemmy Explorer
      </Typography>
    </>
  );
}

function MBinEntry() {
  return (
    <>
      {/* <Box
        component="div"
        sx={{
          width: 30,
          height: 30,
          flexShrink: 0,
          pr: 2,
          ml: 2,
          mr: 2,
          background: `url(/icons/Lemmy_Logo.svg) no-repeat center center`,
          backgroundSize: "contain",
        }}
      /> */}
      <SvgIcon
        sx={{
          width: 30,
          height: 30,
          flexShrink: 0,
          pr: 2,
          ml: 2,
          mr: 2,
          //   background: `url(/icons/Lemmy_Logo.svg) no-repeat center center`,
          //   backgroundSize: "contain",
        }}
        inheritViewBox={true}
        viewBox="0 0 8.467 8.467"
        component={MBinIcon}
      />
      <Typography
        sx={{
          fontSize: "19px",
          display: { xs: "none", sm: "block" },
        }}
      >
        MBin Explorer
      </Typography>
    </>
  );
}

function PiefedEntry() {
  return (
    <>
      {/* <Box
        component="div"
        sx={{
          width: 30,
          height: 30,
          flexShrink: 0,
          pr: 2,
          ml: 2,
          mr: 2,
          background: `url(/icons/Lemmy_Logo.svg) no-repeat center center`,
          backgroundSize: "contain",
        }}
      /> */}
      <SvgIcon
        sx={{
          width: 30,
          height: 30,
          flexShrink: 0,
          pr: 2,
          ml: 2,
          mr: 2,
          //   background: `url(/icons/Lemmy_Logo.svg) no-repeat center center`,
          //   backgroundSize: "contain",
        }}
        inheritViewBox={true}
        viewBox="0 0 8.467 8.467"
        component={PiefedIcon}
      />
      <Typography
        sx={{
          fontSize: "19px",
          display: { xs: "none", sm: "block" },
        }}
      >
        Piefed Explorer
      </Typography>
    </>
  );
}

export default function HeaderMainButton() {
  const navigate = useNavigate();
  const location = useLocation();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [menuOpen, setMenuOpen] = React.useState<boolean>(false);

  const selectedSoftware = React.useMemo(() => {
    if (location.pathname.startsWith("/mbin")) {
      return "mbin";
    } else if (location.pathname.startsWith("/piefed")) {
      return "piefed";
    } else {
      return "lemmy";
    }
  }, [location.pathname]);

  const handleOpenMenu = (event) => {
    if (menuOpen) return handleCloseMenu();

    setAnchorEl(event.currentTarget);
    setMenuOpen(true);
  };

  const handleCloseMenu = () => {
    setMenuOpen(false);
    setAnchorEl(null);
  };

  return (
    <Box
      component="header"
      sx={{
        p: 0,
        display: "flex",
        height: "80px",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Sheet
        aria-controls={menuOpen ? "left-side-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={menuOpen ? "true" : undefined}
        sx={{
          display: "flex",
          alignItems: "center",
          borderRadius: "8px",
          p: 1,
          backgroundColor: anchorEl ? "background.level2" : "background.level1",
          cursor: "pointer",
          //   ":hover"
          "&:hover": {
            backgroundColor: "background.level2",
          },
        }}
        onClick={handleOpenMenu}
      >
        {/* <LemmyEntry /> */}
        {selectedSoftware === "lemmy" && <LemmyEntry />}
        {selectedSoftware === "mbin" && <MBinEntry />}
        {selectedSoftware === "piefed" && <PiefedEntry />}
        <ArrowDropDownIcon
          sx={{
            color: "text.secondary",
            fontSize: "1.5rem",
            ml: 1,
            mr: 1,
          }}
        />
      </Sheet>
      {/* <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu} sx={{ mt: 1 }}> */}
      <Menu
        id="left-side-menu"
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleCloseMenu}
        placement="bottom-end"
      >
        <MenuItem
          onClick={() => {
            navigate(brandRoutes.lemmy);
            handleCloseMenu();
          }}
        >
          <LemmyEntry />
        </MenuItem>
        <MenuItem
          onClick={() => {
            navigate(brandRoutes.mbin);
            handleCloseMenu();
          }}
        >
          <MBinEntry />
        </MenuItem>
        <MenuItem
          onClick={() => {
            navigate(brandRoutes.piefed);
            handleCloseMenu();
          }}
        >
          <PiefedEntry />
        </MenuItem>
      </Menu>
    </Box>
  );
}
