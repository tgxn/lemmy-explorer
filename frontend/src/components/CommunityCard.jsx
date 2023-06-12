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
import Grid from "@mui/joy/Grid";
import Tooltip from "@mui/joy/Tooltip";

import PersonIcon from "@mui/icons-material/Person";
import MessageIcon from "@mui/icons-material/Message";
import ForumIcon from "@mui/icons-material/Forum";

import RecordVoiceOverIcon from "@mui/icons-material/RecordVoiceOver";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

import OpenInNewIcon from "@mui/icons-material/OpenInNew";

function CommunityCard({ community, hideNoBanner }) {
  const [loadedBanner, setLoadedBanner] = React.useState(false);
  const [loadedIcon, setLoadedIcon] = React.useState(false);

  const [iconError, setIconError] = React.useState(false);
  const [bannerError, setBannerError] = React.useState(false);

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
    <Grid xs={12} sm={6} md={4} lg={3} xl={2}>
      <Card variant="outlined">
        <CardContent orientation="horizontal">
          <Avatar
            alt={community.title}
            src={community.icon}
            sx={{
              display: "flex",
              flex: "0 0 auto",
              marginRight: 1,
            }}
          />
          <div>
            <Typography
              level="body3"
              sx={{
                fontWeight: "bold",
                fontSize: "16px",
              }}
            >
              {community.title}
            </Typography>
            <Typography level="body3">on {community.url && community.url.split("/")[2]}</Typography>
          </div>
          <IconButton
            sx={{
              marginLeft: "auto",
            }}
            color="neutral"
            onClick={() => {
              window.open(community.url, "_blank");
            }}
          >
            <OpenInNewIcon fontSize={"small"} />
          </IconButton>
        </CardContent>

        <CardOverflow>
          <AspectRatio
            sx={{
              borderRadius: 0,
            }}
            minHeight="120px"
            maxHeight="200px"
          >
            <img
              src={community.banner}
              srcSet={community.banner}
              loading="lazy"
              // alt={imageData.title}
              height={"100%"}
              // width={"100%"}
              style={{ display: loadedBanner ? "flex" : "none" }}
              onLoad={() => setLoadedBanner(true)}
              onError={() => setBannerError(true)}
              className={loadedBanner ? "loaded" : ""}
            />
          </AspectRatio>
        </CardOverflow>
        <CardContent orientation="horizontal">
          <div>
            <Typography level="body3">{community.desc ? community.desc.substring(0, 200) : ""}</Typography>
            {/* <Typography fontSize="lg" fontWeight="lg">
            $2,900
          </Typography> */}
          </div>
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
              justifyContent: "space-around",
            }}
          >
            <Tooltip title="Subscribers" variant="soft">
              <Typography
                level="body3"
                fontWeight="md"
                textColor="text.secondary"
                sx={{
                  cursor: "default",
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 0.5,
                }}
              >
                <RecordVoiceOverIcon />
                {formatNumber(community.counts.subscribers)}
              </Typography>
            </Tooltip>
            <Divider orientation="vertical" />
            <Tooltip title="Posts" variant="soft">
              <Typography
                level="body3"
                fontWeight="md"
                textColor="text.secondary"
                sx={{
                  cursor: "default",
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 0.5,
                }}
              >
                <MessageIcon />
                {formatNumber(community.counts.posts)}
              </Typography>
            </Tooltip>
            <Divider orientation="vertical" />
            <Tooltip title="Comments" variant="soft">
              <Typography
                level="body3"
                fontWeight="md"
                textColor="text.secondary"
                sx={{
                  cursor: "default",
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 0.5,
                }}
              >
                <ForumIcon />
                {formatNumber(community.counts.comments)}
              </Typography>
            </Tooltip>
            <Divider orientation="vertical" />
            <Tooltip title="Active Users (Week)" variant="soft">
              <Typography
                level="body3"
                fontWeight="md"
                textColor="text.secondary"
                sx={{
                  cursor: "default",
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 0.5,
                }}
              >
                <TrendingUpIcon />
                {formatNumber(community.counts.users_active_week)}
              </Typography>
            </Tooltip>
            {/* <Divider orientation="vertical" />
          <Typography level="body3" fontWeight="md" textColor="text.secondary">
            {instance.date}
          </Typography> */}
          </CardContent>
        </CardOverflow>
      </Card>
    </Grid>
  );
}

export default CommunityCard;
