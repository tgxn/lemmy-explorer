import React from "react";
import { connect } from "react-redux";

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
import IconButton from "@mui/joy/IconButton";

import PersonIcon from "@mui/icons-material/Person";
import MessageIcon from "@mui/icons-material/Message";
import ForumIcon from "@mui/icons-material/Forum";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import HomeIcon from "@mui/icons-material/Home";

import { ContentSkeleton, ContentError } from "./Display";
import CopyLink from "./CopyLink";

import { setHomeInstance } from "../reducers/configReducer";

// import InstanceModal from "./InstanceModal";

function InstanceCard({ instance, homeBaseUrl, dispatch }) {
  const [loadedBanner, setLoadedBanner] = React.useState(false);
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
      <Card
        variant="outlined"
        sx={{
          pt: 1,
          "& .MuiIconButton-root": {
            mt: 1,
          },
        }}
      >
        {/* Instance Name */}
        <CardContent orientation="horizontal" sx={{ columnGap: 0, justifyContent: "space-between" }}>
          <Box
            sx={{
              flexShrink: 0,
              pt: 1.5,
              px: 0.25,
              pr: 1,
            }}
          >
            <Avatar
              alt={instance.name}
              src={instance.icon}
              sx={{
                display: "flex",
              }}
            />
          </Box>

          <Box
            sx={{
              p: 0.5,
              flexGrow: 1,
              overflow: "hidden",
            }}
          >
            <Typography level="body3" sx={{ pb: 0.4, whiteSpace: "nowrap" }}>
              <Link
                level="body1"
                variant="plain"
                color="neutral"
                href={instance.url}
                target="_blank"
                sx={{
                  fontWeight: "bold",
                  fontSize: "16px",
                  textOverflow: "ellipsis",
                }}
              >
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

          <Box
            sx={{
              flexShrink: 0,
              pt: 0.5,
            }}
          >
            <Tooltip title="Set home instance" variant="soft">
              <IconButton
                size="md"
                variant="outlined"
                color={homeBaseUrl == instance.url.split("/")[2] ? "success" : "neutral"}
                sx={{ ml: "auto", alignSelf: "flex-start", flexShrink: 1 }}
                onClick={() => {
                  dispatch(setHomeInstance(instance.url.split("/")[2]));
                }}
              >
                <HomeIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </CardContent>

        {/* Instance Banner */}
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
          <Typography level="body3">{instance.desc}</Typography>
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

const mapStateToProps = (state) => ({
  homeBaseUrl: state.configReducer.homeBaseUrl,
});
export default connect(mapStateToProps)(InstanceCard);
