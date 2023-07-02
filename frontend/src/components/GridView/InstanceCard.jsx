import React from "react";
import { connect } from "react-redux";

import Moment from "react-moment";

import Avatar from "@mui/joy/Avatar";
import Card from "@mui/joy/Card";
import CardContent from "@mui/joy/CardContent";
import Typography from "@mui/joy/Typography";
import Divider from "@mui/joy/Divider";
import CardOverflow from "@mui/joy/CardOverflow";
import Box from "@mui/joy/Box";
import Tooltip from "@mui/joy/Tooltip";
import Link from "@mui/joy/Link";
import IconButton from "@mui/joy/IconButton";

import PersonIcon from "@mui/icons-material/Person";
import MessageIcon from "@mui/icons-material/Message";
import ForumIcon from "@mui/icons-material/Forum";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import HomeIcon from "@mui/icons-material/Home";

import { TinyNumber, BannerImage } from "../Shared/Display";

import { CopyLink, ExtInstanceLink } from "../Shared/Link";

import { setHomeInstance } from "../../reducers/configReducer";

function InstanceCard({ instance, homeBaseUrl, dispatch }) {
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
      {/* Instance Name */}
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
        sx={() => ({
          background: "linear-gradient(0deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 100%)",
          p: 0,
          height: "150px",
          overflow: "hidden",
          borderRadius: 0,
        })}
      >
        <BannerImage imageSrc={instance.banner || false} />
      </CardOverflow>

      <CardContent orientation="horizontal">
        <Typography
          level="body3"
          sx={{
            maxHeight: "90px",
            overflow: "hidden",
          }}
        >
          {instance.desc}
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

const mapStateToProps = (state) => ({
  homeBaseUrl: state.configReducer.homeBaseUrl,
});
export default connect(mapStateToProps)(InstanceCard);
