import React from "react";

import Moment from "react-moment";

import Avatar from "@mui/joy/Avatar";

import Card from "@mui/joy/Card";
import CardContent from "@mui/joy/CardContent";
import Typography from "@mui/joy/Typography";
import Divider from "@mui/joy/Divider";
import CardOverflow from "@mui/joy/CardOverflow";
import Box from "@mui/material/Box";
import Tooltip from "@mui/joy/Tooltip";
import Link from "@mui/joy/Link";
import Grid from "@mui/joy/Grid";

import PersonIcon from "@mui/icons-material/Person";
import MessageIcon from "@mui/icons-material/Message";
import ForumIcon from "@mui/icons-material/Forum";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";

import { ContentSkeleton, ContentError } from "./Display";
import CopyLink from "./CopyLink";

function InstanceCard({ instance }) {
  const [loadedBanner, setLoadedBanner] = React.useState(false);
  const [bannerError, setBannerError] = React.useState(false);

  // const [loadedIcon, setLoadedIcon] = React.useState(false);

  // const [iconError, setIconError] = React.useState(false);

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
            alt={instance.name}
            src={instance.icon}
            sx={{
              display: "flex",
              flex: "0 0 auto",
              marginRight: 1,
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
              <Link level="body1" variant="plain" color="neutral" href={instance.url} target="_blank">
                {instance.name} <OpenInNewIcon fontSize={"small"} sx={{ ml: 1 }} />
              </Link>
            </Typography>
            <Typography level="body3">
              <CopyLink
                copyText={instance.url.split("/")[2]}
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
          {!instance.banner && <ContentError message={"No Banner"} bgcolor={"#ff55fc21"} />}
          {instance.banner && bannerError && <ContentError />}
          {instance.banner && !bannerError && !loadedBanner && <ContentSkeleton />}
          <img
            src={instance.banner}
            srcSet={instance.banner}
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
          <div>
            <Typography level="body3">{instance.desc}</Typography>
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
            <Tooltip title="Total Users" variant="soft">
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
                <PersonIcon />
                {formatNumber(instance.usage.users.total)}
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
                  flexWrap: "nowrap",
                  gap: 0.5,
                }}
              >
                <MessageIcon />
                {formatNumber(instance.usage.localPosts)}
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
                  flexWrap: "nowrap",
                  gap: 0.5,
                }}
              >
                <ForumIcon />
                {formatNumber(instance.usage.localComments)}
              </Typography>
            </Tooltip>
            <Divider orientation="vertical" />

            <Tooltip
              title={
                <>
                  Uptime{" "}
                  {instance.uptime?.uptime_alltime ? (
                    <>
                      (First seen <Moment fromNow>{instance.uptime?.date_created}</Moment>)
                    </>
                  ) : (
                    <>(Unknown instance)</>
                  )}
                </>
              }
              variant="soft"
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
                {instance.uptime?.uptime_alltime && (
                  <>
                    <TrendingUpIcon />
                    {instance.uptime?.uptime_alltime}%
                  </>
                )}

                {!instance.uptime?.uptime_alltime && (
                  <>
                    <ThumbDownIcon />
                  </>
                )}
              </Typography>
            </Tooltip>
          </CardContent>
        </CardOverflow>
      </Card>
    </Grid>
  );
}

export default InstanceCard;
