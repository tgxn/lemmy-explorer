import React from "react";
import { connect } from "react-redux";

import Moment from "react-moment";

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

function InstanceCard({ instance }) {
  const navigate = useNavigate();

  return (
    <Card
      variant="outlined"
      sx={{
        height: "350px",
        gap: 0,
      }}
    >
      {/* Header */}
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
          background: "linear-gradient(0deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.15) 100%)",
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
            // "-webkit-box-orient": "vertical",
            // "-webkit-line-clamp": "3",
            height: "54px",
            maxHeight: "90px",
            overflow: "hidden",
            flexGrow: 1,
            flexShrink: 1,
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
              <TinyNumber value={instance.usage.users.total} />
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
              <TinyNumber value={instance.usage.localPosts} />
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
              <TinyNumber value={instance.usage.localComments} />
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
  );
}
export default InstanceCard;
