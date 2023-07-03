import React from "react";
import { connect } from "react-redux";

import Moment from "react-moment";

import { useNavigate } from "react-router-dom";

import Avatar from "@mui/joy/Avatar";
import Card from "@mui/joy/Card";
import CardContent from "@mui/joy/CardContent";
import Typography from "@mui/joy/Typography";
import Divider from "@mui/joy/Divider";
import CardCover from "@mui/joy/CardCover";
import CardOverflow from "@mui/joy/CardOverflow";
import Box from "@mui/joy/Box";
import Tooltip from "@mui/joy/Tooltip";
import Link from "@mui/joy/Link";
import IconButton from "@mui/joy/IconButton";
import ButtonGroup from "@mui/joy/ButtonGroup";
import Badge from "@mui/joy/Badge";
import Menu from "@mui/joy/Menu";
import MenuItem from "@mui/joy/MenuItem";

import MoreVertIcon from "@mui/icons-material/MoreVert";
import PersonIcon from "@mui/icons-material/Person";
import MessageIcon from "@mui/icons-material/Message";
import ForumIcon from "@mui/icons-material/Forum";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import InfoIcon from "@mui/icons-material/Info";

import { TinyNumber, BannerImage } from "../Shared/Display";

import { CopyLink, ExtInstanceLink } from "../Shared/Link";

import { setHomeInstance } from "../../reducers/configReducer";

import { InstanceAvatar } from "../Shared/Avatar";

export const CardWrapper = React.memo(function CardHeaderWrapper({ headerChildren, children }) {
  return (
    <Card
      variant="outlined"
      sx={{
        height: "350px",
        gap: 0,
      }}
    >
      <CardOverflow
        variant="outlined"
        orientation="horizontal"
        sx={{
          py: 1.25,
          px: 2,
          outline: 0,
          border: 0,
          columnGap: 0,
          flexGrow: 0,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {children}
      </CardOverflow>
    </Card>
  );
});
