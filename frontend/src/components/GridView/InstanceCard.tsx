import React from "react";

import { useColorScheme } from "@mui/joy/styles";

import { useNavigate } from "react-router-dom";

import Card from "@mui/joy/Card";
import CardContent from "@mui/joy/CardContent";
import Typography from "@mui/joy/Typography";
import Divider from "@mui/joy/Divider";
import CardOverflow from "@mui/joy/CardOverflow";
import Box from "@mui/joy/Box";
import Tooltip from "@mui/joy/Tooltip";
import IconButton from "@mui/joy/IconButton";

import PersonIcon from "@mui/icons-material/Person";
import MessageIcon from "@mui/icons-material/Message";
import ForumIcon from "@mui/icons-material/Forum";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import InfoIcon from "@mui/icons-material/Info";

import { TinyNumber, BannerImage } from "../Shared/Display";

import { CopyLink, ExtInstanceLink } from "../Shared/Link";

import { InstanceAvatar } from "../Shared/Avatar";

import CardStatBox from "../Shared/CardStatBox";

function InstanceCard({ instance }) {
  const navigate = useNavigate();
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
          }}
        >
          <InstanceAvatar instance={instance} />
        </Box>

        {/* Title & Base URL */}
        <Box
          sx={{
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
            <ExtInstanceLink instance={instance} />
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
            flexShrink: 1,
            flexGrow: 1,
          }}
        />
        <Box
          sx={{
            flexShrink: 0,
          }}
        >
          <Tooltip title="View Instance" placement="top">
            <IconButton
              size="md"
              variant="outlined"
              color={"neutral"}
              // sx={{ ml: "auto", alignSelf: "flex-start", flexShrink: 1 }}
              onClick={() => {
                // dispatch(showInstanceModal(instance));
                navigate(`/instance/${instance.baseurl}`);
              }}
            >
              <InfoIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </CardOverflow>

      {/* Banner */}
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
        <BannerImage imageSrc={instance.banner || instance.icon || false} />
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
            height: "54px",
            maxHeight: "90px",
            overflow: "hidden",
            flexGrow: 1,
            flexShrink: 1,
            color: "text.primary",
          }}
        >
          {instance.desc}
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
          <CardStatBox name="Users" icon={<PersonIcon />} value={instance.usage.users.total} />

          <Divider orientation="vertical" />

          <CardStatBox name="Posts" icon={<MessageIcon />} value={instance.usage.localPosts} />

          <Divider orientation="vertical" />

          <CardStatBox name="Comments" icon={<ForumIcon />} value={instance.usage.localComments} />

          <Divider orientation="vertical" />

          <CardStatBox
            name="Uptime"
            icon={instance.uptime?.uptime_alltime ? <TrendingUpIcon /> : <ThumbDownIcon />}
            value={instance.uptime?.uptime_alltime ? `${instance.uptime?.uptime_alltime}%` : `~~`}
          />
        </CardContent>
      </CardOverflow>
    </Card>
  );
}

export default React.memo(InstanceCard);
