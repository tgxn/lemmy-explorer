/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";

import Avatar from "@mui/joy/Avatar";

import Card from "@mui/joy/Card";
import CardContent from "@mui/joy/CardContent";
import IconButton from "@mui/joy/IconButton";
import Typography from "@mui/joy/Typography";
import Divider from "@mui/joy/Divider";
import CardOverflow from "@mui/joy/CardOverflow";
import Box from "@mui/material/Box";
import CardCover from "@mui/joy/CardCover";
import Tooltip from "@mui/joy/Tooltip";
import Link from "@mui/joy/Link";

import PersonIcon from "@mui/icons-material/Person";
import MessageIcon from "@mui/icons-material/Message";
import ForumIcon from "@mui/icons-material/Forum";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

import { ContentSkeleton, ContentError } from "./Display";
import CopyLink from "./CopyLink";

function InstanceCard({ instance }) {
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
            <Link
              level="body1"
              variant="plain"
              color="neutral"
              href={instance.url}
              target="_blank"
              // onClick={(e) => {
              //   e.preventDefault();
              //   window.open(instance.url, "_blank");
              //   // navigator.clipboard.writeText(copyText);
              //   // setCopied(true);
              // }}
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
            {/* <Tooltip title="Click to Copy" variant="soft" placement="top">
              <Link
                level="body3"
                variant="plain"
                color="neutral"
                onClick={(e) => {
                  e.preventDefault();
                  navigator.clipboard.writeText(instance.url.split("/")[2]);
                }}
              >
                {instance.url && instance.url.split("/")[2]}
              </Link>
            </Tooltip> */}
          </Typography>
        </Box>
        {/* </div>
        <IconButton
          sx={{
            marginLeft: "auto",
          }}
          color="neutral"
          onClick={() => {
            window.open(instance.url, "_blank");
          }}
        >
          <OpenInNewIcon fontSize={"small"} />
        </IconButton> */}
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
          {/* <Typography fontSize="lg" fontWeight="lg">
            $2,900
          </Typography> */}
        </div>
        {/* <Button
          variant="solid"
          size="sm"
          color="primary"
          aria-label="Explore Bahamas Islands"
          sx={{ ml: "auto", fontWeight: 600 }}
          onClick={() => {
            window.open(instance.url, "_blank");
          }}
        >
          Visit
        </Button> */}
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
                flexWrap: "wrap",
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
                flexWrap: "wrap",
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
                flexWrap: "wrap",
                gap: 0.5,
              }}
            >
              <ForumIcon />
              {formatNumber(instance.usage.localComments)}
            </Typography>
          </Tooltip>
          {/* <Divider orientation="vertical" />
          <Typography level="body3" fontWeight="md" textColor="text.secondary">
            {instance.date}
          </Typography> */}
        </CardContent>
      </CardOverflow>
    </Card>
  );
}

export default InstanceCard;
