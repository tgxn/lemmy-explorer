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

import { IconAvatar } from "../Shared/Avatar";

export default React.memo(function KBinCard({ magazine }) {
  return (
    <Card
      variant="outlined"
      sx={{
        height: "265px",
        gap: 0,
      }}
    >
      {/* Community Title */}
      <CardOverflow
        variant="outlined"
        orientation="horizontal"
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
          <IconAvatar alt={magazine.title} src={magazine.icon} />
        </Box>

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
            <ExtCommunityLink
              baseType="kbin"
              community={{
                baseurl: magazine.baseurl, // for link
                name: magazine.preferred, // for link
                title: magazine.name, // for display
              }}
            />
          </Typography>

          <Typography level="body3">
            <CopyLink
              copyText={`!${magazine.preferred}@${magazine.baseurl}`}
              linkProps={{
                variant: "plain",
                color: "neutral",
              }}
            />
          </Typography>
        </Box>
      </CardOverflow>

      {/* Community Banner */}
      {/* <CardOverflow
        sx={() => ({
          background: "linear-gradient(0deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 100%)",
          p: 0,
          height: "150px",
          overflow: "hidden",
          borderRadius: 0,
        })}
      >
        <BannerImage imageSrc={magazine.banner || false} />
      </CardOverflow> */}

      <CardContent orientation="horizontal">
        <Typography
          level="body3"
          sx={{
            maxHeight: "90px",
            overflow: "hidden",
          }}
        >
          {magazine.summary ? magazine.summary : ""}
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
          <Tooltip title="Followers" variant="soft">
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
              <TinyNumber value={magazine.followers} />
            </Typography>
          </Tooltip>
          {/* <Divider orientation="vertical" />
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
          </Tooltip> */}
        </CardContent>
      </CardOverflow>
    </Card>
    // </Grid>
  );
});
