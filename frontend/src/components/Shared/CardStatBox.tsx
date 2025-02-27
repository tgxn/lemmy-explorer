import React from "react";
import { connect } from "react-redux";

import Moment from "react-moment";

import { useNavigate } from "react-router-dom";

import Card from "@mui/joy/Card";
import CardContent from "@mui/joy/CardContent";
import Typography from "@mui/joy/Typography";
import Divider from "@mui/joy/Divider";
import CardOverflow from "@mui/joy/CardOverflow";
import Box from "@mui/joy/Box";
import Tooltip from "@mui/joy/Tooltip";
import IconButton from "@mui/joy/IconButton";

import PersonIcon from "@mui/icons-material/Person";
import MessageIcon from "@mui/icons-material/Message";
import ForumIcon from "@mui/icons-material/Forum";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import InfoIcon from "@mui/icons-material/Info";

import { TinyNumber, BannerImage } from "../Shared/Display";

import { CopyLink, ExtInstanceLink } from "../Shared/Link";

import { InstanceAvatar } from "../Shared/Avatar";

export default function CardStatBox({ name, icon = <PersonIcon />, value }) {
  return (
    <Tooltip title={name} variant="soft">
      <Box
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          flexWrap: "nowrap",
          gap: 1,
        }}
      >
        <Typography
          level="body3"
          fontWeight="md"
          textColor="text.secondary"
          sx={{
            cursor: "default",
            display: "flex",
            alignItems: "center",
            flexWrap: "nowrap",
            gap: 0.5,
          }}
        >
          {icon}
        </Typography>
        <Typography
          level="body3"
          fontWeight="md"
          textColor="text.secondary"
          sx={{
            cursor: "default",
            display: "flex",
            alignItems: "center",
            flexWrap: "nowrap",
            gap: 0.5,
          }}
        >
          <TinyNumber value={value} />
        </Typography>
      </Box>
    </Tooltip>
  );
}
