/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";

import Avatar from "@mui/joy/Avatar";

import AspectRatio from "@mui/joy/AspectRatio";
import Button from "@mui/joy/Button";
import Card from "@mui/joy/Card";
import CardContent from "@mui/joy/CardContent";
import IconButton from "@mui/joy/IconButton";
import Typography from "@mui/joy/Typography";
import Divider from "@mui/joy/Divider";
import CardOverflow from "@mui/joy/CardOverflow";
import CardHeader from "@mui/material/CardHeader";
import CardCover from "@mui/joy/CardCover";

import PersonIcon from "@mui/icons-material/Person";
import MessageIcon from "@mui/icons-material/Message";
import ForumIcon from "@mui/icons-material/Forum";

import RecordVoiceOverIcon from "@mui/icons-material/RecordVoiceOver";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

function CommunityCard({ community }) {
  function formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "m";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k";
    }
    return num;
  }
  return (
    <Card variant="outlined">
      <CardHeader
        sx={{ p: 0 }}
        avatar={<Avatar alt={community.title} src={community.icon} />}
        title={community.name}
      />

      <CardOverflow>
        <AspectRatio
          sx={{
            borderRadius: 0,
          }}
          minHeight="120px"
          maxHeight="200px"
        >
          <img src={community.banner} srcSet={community.banner} loading="lazy" alt="" />
        </AspectRatio>
      </CardOverflow>
      <CardContent orientation="horizontal">
        <div>
          <Typography level="body3">{community.desc}</Typography>
          {/* <Typography fontSize="lg" fontWeight="lg">
            $2,900
          </Typography> */}
        </div>
        <Button
          variant="solid"
          size="sm"
          color="primary"
          aria-label="Explore Bahamas Islands"
          sx={{ ml: "auto", fontWeight: 600 }}
          onClick={() => {
            window.open(community.url, "_blank");
          }}
        >
          Visit
        </Button>
      </CardContent>
      <CardOverflow
        variant="soft"
        sx={{
          bgcolor: "background.level1",
        }}
      >
        <Divider inset="context" />
        <CardContent
          orientation="horizontal"
          sx={{
            justifyContent: "space-between",
          }}
        >
          <Typography
            level="body3"
            fontWeight="md"
            textColor="text.secondary"
            sx={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 0.5,
            }}
          >
            <RecordVoiceOverIcon />
            {formatNumber(community.counts.subscribers)}
          </Typography>
          <Divider orientation="vertical" />
          <Typography
            level="body3"
            fontWeight="md"
            textColor="text.secondary"
            sx={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 0.5,
            }}
          >
            <MessageIcon />
            {formatNumber(community.counts.posts)}
          </Typography>
          <Divider orientation="vertical" />
          <Typography
            level="body3"
            fontWeight="md"
            textColor="text.secondary"
            sx={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 0.5,
            }}
          >
            <ForumIcon />
            {formatNumber(community.counts.comments)}
          </Typography>
          <Divider orientation="vertical" />
          <Typography
            level="body3"
            fontWeight="md"
            textColor="text.secondary"
            sx={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 0.5,
            }}
          >
            <TrendingUpIcon />
            {formatNumber(community.counts.users_active_week)}
          </Typography>
          {/* <Divider orientation="vertical" />
          <Typography level="body3" fontWeight="md" textColor="text.secondary">
            {instance.date}
          </Typography> */}
        </CardContent>
      </CardOverflow>
    </Card>
  );
}

export default CommunityCard;
