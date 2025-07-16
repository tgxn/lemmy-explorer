import React from "react";
import { useDispatch } from "react-redux";

import { useNavigate, useLocation, useSearchParams } from "react-router-dom";

import useQueryCache from "../../hooks/useQueryCache";

import Badge from "@mui/joy/Badge";
import Box from "@mui/joy/Box";
import Tabs from "@mui/joy/Tabs";
import TabList from "@mui/joy/TabList";
import Tab from "@mui/joy/Tab";
import Typography from "@mui/joy/Typography";

export default function HeaderMainButton() {
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
      >
        Lemmy Explorer
      </Typography>
    </Box>
  );
}
