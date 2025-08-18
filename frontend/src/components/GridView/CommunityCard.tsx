import React from "react";

import { useColorScheme } from "@mui/joy/styles";

import Box from "@mui/joy/Box";
import Card from "@mui/joy/Card";
import CardContent from "@mui/joy/CardContent";
import Typography from "@mui/joy/Typography";
import Divider from "@mui/joy/Divider";
import CardOverflow from "@mui/joy/CardOverflow";

import MessageIcon from "@mui/icons-material/Message";
import ForumIcon from "@mui/icons-material/Forum";
import RecordVoiceOverIcon from "@mui/icons-material/RecordVoiceOver";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

import { BannerImage } from "../Shared/Display";

import { CopyLink, ExtCommunityLink } from "../Shared/Link";

import { IconAvatar } from "../Shared/Avatar";

import CardStatBox from "../Shared/CardStatBox";

function CommunityCard({ community }) {
  const { mode } = useColorScheme();

  return (
    <Card
      variant="outlined"
      sx={{
        height: "365px",
        gap: 0,
      }}
    >
      {/* Header */}
      <CardOverflow
        variant="outlined"
        sx={{
          py: 1.75,
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
        <Box
          sx={{
            flexShrink: 0,
            mr: 0.5,
          }}
        >
          <IconAvatar alt={community.title} src={community.icon} />
        </Box>

        {/* Title & Base URL */}
        <Box
          sx={{
            flexGrow: 1,
            flexShrink: 1,
            overflow: "hidden",
            mx: 1,
          }}
        >
          <Typography
            level="body3"
            sx={{
              fontWeight: "bold",
              fontSize: "14px",
              overflow: "hidden",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
              pb: 0.5,
            }}
          >
            <ExtCommunityLink community={community} />
          </Typography>

          <Typography level="body3">
            <CopyLink
              copyText={`!${community.name}@${community.baseurl}`}
              linkProps={{
                variant: "plain",
                color: "neutral",
              }}
            />
          </Typography>
        </Box>
      </CardOverflow>

      {/* Community Banner */}
      <CardOverflow
        sx={(theme) => ({
          background:
            mode == "dark"
              ? "linear-gradient(0deg, rgba(20,20,20,0.5) 0%, rgba(5,5,5,0.15) 100%)"
              : "linear-gradient(0deg, rgba(179, 179, 179, 0.5) 0%, rgba(202, 202, 202, 0.15) 100%)",
          p: 0,
          height: "125px",
          overflow: "hidden",
          borderRadius: 0,
        })}
      >
        <BannerImage imageSrc={community.banner || community.icon || false} />
        <Divider inset="context" />
      </CardOverflow>

      {/* Description */}
      <CardContent
        orientation="horizontal"
        sx={{
          py: 1,
        }}
      >
        <Typography
          level="body3"
          sx={{
            display: "-webkit-box",
            height: "90px",
            maxHeight: "100px",
            overflow: "hidden",
            flexGrow: 1,
            flexShrink: 1,
            color: "text.primary",
          }}
        >
          {community.desc ? community.desc : ""}
        </Typography>
      </CardContent>

      {/* Stats */}
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
            my: 0.75,
            padding: 0,
          }}
        >
          <CardStatBox
            name="Subscribers"
            icon={<RecordVoiceOverIcon />}
            value={community.counts.subscribers}
          />

          <Divider orientation="vertical" />

          <CardStatBox name="Posts" icon={<MessageIcon />} value={community.counts.posts} />

          <Divider orientation="vertical" />

          <CardStatBox name="Comments" icon={<ForumIcon />} value={community.counts.comments} />

          <Divider orientation="vertical" />

          <CardStatBox
            name="Active Users (Week)"
            icon={<TrendingUpIcon />}
            value={community.counts.users_active_week}
          />
        </CardContent>
      </CardOverflow>
    </Card>
  );
}

export default React.memo(CommunityCard);
