import React from "react";
import { connect } from "react-redux";

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

import { ContentSkeleton, ContentError, TinyNumber } from "./Display";
import CopyLink from "./CopyLink";

function CommunityCard({ community, homeBaseUrl }) {
  const [loadedBanner, setLoadedBanner] = React.useState(false);
  const [bannerError, setBannerError] = React.useState(false);

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
              alt={community.title}
              src={community.icon}
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
              <Tooltip
                title={"Visit: " + community.title + (homeBaseUrl ? " inside " + homeBaseUrl : "")}
                variant="soft"
                placement="top-start"
              >
                <Link
                  level="body1"
                  variant="plain"
                  alt={community.title}
                  color="neutral"
                  href={
                    homeBaseUrl
                      ? `https://${homeBaseUrl}/c/${community.name}@${
                          community.url && community.url.split("/")[2]
                        }`
                      : community.url
                  }
                  target="_blank"
                >
                  {community.title}
                  <OpenInNewIcon fontSize={"small"} sx={{ ml: 1 }} />
                </Link>
              </Tooltip>
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
          sx={() => ({
            background: "linear-gradient(0deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 100%)",
            p: 0,
            height: "150px",
            overflow: "hidden",
            borderRadius: 0,
          })}
        >
          {!community.banner && <ContentError message={"No Banner"} bgcolor={"#ff55fc21"} />}
          {community.banner && bannerError && <ContentError />}
          {community.banner && !bannerError && !loadedBanner && <ContentSkeleton />}
          {community.banner && (
            <img
              src={community.banner}
              srcSet={community.banner}
              loading="lazy"
              width={"100%"}
              style={{
                display: !bannerError && loadedBanner ? "flex" : "none",
              }}
              onLoad={() => {
                setLoadedBanner(true);
                setBannerError(false);
              }}
              onError={() => setBannerError(true)}
            />
          )}
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
                <TinyNumber value={community.counts.subscribers} />
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
                <TinyNumber value={community.counts.posts} />
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
                <TinyNumber value={community.counts.comments} />
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
                <TinyNumber value={community.counts.users_active_week} />
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
export default connect(mapStateToProps)(CommunityCard);
