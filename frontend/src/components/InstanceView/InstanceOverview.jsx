import React from "react";

import moment from "moment";

import Alert from "@mui/joy/Alert";
import Typography from "@mui/joy/Typography";
import Box from "@mui/joy/Box";

import PersonIcon from "@mui/icons-material/Person";
import MessageIcon from "@mui/icons-material/Message";
import ForumIcon from "@mui/icons-material/Forum";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import InfoIcon from "@mui/icons-material/Info";

import { SimpleNumberFormat, BannerImage } from "../Shared/Display";

export default function InstanceOverview({ instance, userSeries }) {
  const userWeekChange = React.useMemo(() => {
    const sortedUsers = userSeries.sort((a, b) => a.time - b.time);

    const latestValue = sortedUsers[sortedUsers.length - 1].value;

    const tsWeekAgo = moment().subtract(7, "days").unix();

    let users = sortedUsers.filter((u) => u.time >= tsWeekAgo);

    const maxOneWeekValue = users[0];

    return latestValue - maxOneWeekValue.value;
  }, [userSeries]);

  return (
    <Box>
      <Alert
        sx={{ alignItems: "flex-start" }}
        startDecorator={<InfoIcon sx={{ mt: "2px", mx: "4px" }} fontSize="xl2" />}
        variant="soft"
        color={"primary"}
      >
        <Typography fontSize="sm" sx={{ opacity: 0.8 }}>
          Current Version: {instance.version}
        </Typography>
      </Alert>

      <Typography
        level="body1"
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
        Users <SimpleNumberFormat value={instance.usage.users.total} />
      </Typography>

      <Typography
        level="body1"
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
        Week Change: <SimpleNumberFormat value={userWeekChange} />
      </Typography>

      <Typography
        level="body1"
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
        Posts: <SimpleNumberFormat value={instance.usage.localPosts} />
      </Typography>

      <Typography
        level="body1"
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
        Comments: <SimpleNumberFormat value={instance.usage.localComments} />
      </Typography>

      <Typography
        level="body1"
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
            Uptime: {instance.uptime?.uptime_alltime}%
          </>
        )}

        {!instance.uptime?.uptime_alltime && (
          <>
            Uptime: <ThumbDownIcon />
          </>
        )}
      </Typography>
    </Box>
  );
}
