import React from "react";

import Avatar from "@mui/joy/Avatar";
import Box from "@mui/joy/Box";
import Card from "@mui/joy/Card";
import CardContent from "@mui/joy/CardContent";
import Typography from "@mui/joy/Typography";
import Divider from "@mui/joy/Divider";
import CardOverflow from "@mui/joy/CardOverflow";
import Tooltip from "@mui/joy/Tooltip";

import MessageIcon from "@mui/icons-material/Message";
import ForumIcon from "@mui/icons-material/Forum";
import RecordVoiceOverIcon from "@mui/icons-material/RecordVoiceOver";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

import { TinyNumber, BannerImage } from "../Shared/Display";

import { CopyLink, ExtCommunityLink } from "../Shared/Link";

export default function CommunityCard({ community }) {
  return (
    <Card
      variant="outlined"
      sx={{
        pt: 1,
        height: "350px",
        "& .MuiIconButton-root": {
          mt: 1,
        },
      }}
    >
      {/* Community Title */}
      <CardContent
        orientation="horizontal"
        sx={{ columnGap: 0, flexGrow: 0, justifyContent: "space-between" }}
      >
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
            <ExtCommunityLink community={community} />
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

      {/* Community Banner */}
      <CardOverflow
        sx={() => ({
          background: "linear-gradient(0deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 100%)",
          p: 0,
          height: "150px",
          overflow: "hidden",
          borderRadius: 0,
        })}
      >
        <BannerImage imageSrc={community.banner || false} />
      </CardOverflow>

      <CardContent orientation="horizontal">
        <Typography
          level="body3"
          sx={{
            maxHeight: "90px",
            overflow: "hidden",
          }}
        >
          {community.desc ? community.desc : ""}
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
    // </Grid>
  );
}
