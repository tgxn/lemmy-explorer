import React from "react";

import Avatar from "@mui/joy/Avatar";
import Link from "@mui/joy/Link";
import Box from "@mui/joy/Box";
import Card from "@mui/joy/Card";
import CardContent from "@mui/joy/CardContent";
import Typography from "@mui/joy/Typography";
import Divider from "@mui/joy/Divider";
import CardOverflow from "@mui/joy/CardOverflow";
import Grid from "@mui/joy/Grid";
import Tooltip from "@mui/joy/Tooltip";

import MessageIcon from "@mui/icons-material/Message";
import ForumIcon from "@mui/icons-material/Forum";
import RecordVoiceOverIcon from "@mui/icons-material/RecordVoiceOver";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

import { ContentSkeleton, ContentError } from "./Display";
import CopyLink from "./CopyLink";

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
        <CardContent
          orientation="horizontal"
          sx={{
            overflow: "hidden",
          }}
        >
          <Avatar
            alt={community.title}
            src={community.icon}
            sx={{
              display: "flex",
              flex: "0 0 auto",
              // marginRight: 0,
            }}
          />
          <Box
            sx={{
              flexShrink: 1,
            }}
          >
            <Typography
              level="body3"
              sx={{
                fontWeight: "bold",
                fontSize: "16px",
                overflow: "hidden",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
              }}
            >
              <Link level="body1" variant="plain" color="neutral" href={community.url} target="_blank">
                {community.title}
                <OpenInNewIcon fontSize={"small"} sx={{ ml: 1 }} />
              </Link>
            </Typography>
            <Typography level="body3">
              <CopyLink
                copyText={`!${community.name}@${community.url && community.url.split("/")[2]}`}
                linkProps={{
                  variant: "plain",
                  color: "neutral",
                }}
              />
            </Typography>
          </Box>
        </CardContent>

        <CardOverflow
          sx={{
            p: 0,
            minHeight: "120px",
            maxHeight: "200px",
            overflow: "hidden",
            borderRadius: 0,
          }}
        >
          {!community.banner && <ContentError message={"No Banner"} bgcolor={"#ff55fc21"} />}
          {community.banner && bannerError && <ContentError />}
          {community.banner && !bannerError && !loadedBanner && <ContentSkeleton />}
          <img
            src={community.banner}
            srcSet={community.banner}
            loading="lazy"
            width={"100%"}
            style={{
              display: loadedBanner ? "flex" : "none",
            }}
            onLoad={() => {
              setLoadedBanner(true);
              setBannerError(false);
            }}
            onError={() => setBannerError(true)}
          />
        </CardOverflow>
        <CardContent orientation="horizontal">
          <Typography
            level="body3"
            sx={{
              maxHeight: "90px",
              overflow: "hidden",
            }}
          >
            {community.desc ? community.desc.substring(0, 200) : ""}
          </Typography>
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
          </CardContent>
        </CardOverflow>
      </Card>
    </Grid>
  );
}

export default CommunityCard;
